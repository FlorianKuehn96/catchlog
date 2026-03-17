import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getRedis, keys } from '@/lib/redis';
import { fetchWeather } from '@/lib/weather';
import type { User, Catch, Spot, Recommendation } from '@/types';

// GET /api/recommend?spotId=xxx - Get bait recommendation
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const redis = getRedis();
  const userData = await redis.get(keys.user(session.user.email));
  if (!userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const user = userData as User;
  
  // Check subscription
  if (user.subscription !== 'pro') {
    return NextResponse.json(
      { error: 'Pro subscription required' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const spotId = searchParams.get('spotId');

  if (!spotId) {
    return NextResponse.json({ error: 'Missing spot ID' }, { status: 400 });
  }

  const spotData = await redis.get(keys.spot(spotId));
  if (!spotData) {
    return NextResponse.json({ error: 'Spot not found' }, { status: 404 });
  }
  const spot = spotData as Spot;

  // Get current weather
  let currentWeather;
  try {
    currentWeather = await fetchWeather(spot.lat, spot.lng);
  } catch {
    return NextResponse.json(
      { error: 'Weather data unavailable' },
      { status: 500 }
    );
  }

  // Get user's historical catches for this spot
  const catchIds = await redis.lrange(keys.catchesByUser(user.id), 0, -1);
  const catches: Catch[] = [];
  for (const catchId of catchIds) {
    const catchData = await redis.get(keys.catch(catchId));
    if (catchData && (catchData as Catch).spotId === spotId) {
      catches.push(catchData as Catch);
    }
  }

  // Generate recommendation based on rules + history
  const recommendation = generateRecommendation(catches, currentWeather, spot);

  return NextResponse.json({ recommendation });
}

function generateRecommendation(
  catches: Catch[],
  weather: { temp: number; pressure: number; windSpeed: number; conditions: string },
  spot: Spot
): Recommendation {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const season = month < 2 || month > 10 ? 'winter' : 
                month < 5 ? 'spring' : 
                month < 8 ? 'summer' : 'autumn';

  // Analyze historical success
  const baitSuccess: Record<string, { count: number; total: number } > = {};
  
  catches.forEach(c => {
    if (!baitSuccess[c.bait]) {
      baitSuccess[c.bait] = { count: 0, total: 0 };
    }
    baitSuccess[c.bait].total++;
    // Success if caught within last 12 hours of similar conditions
    const catchDate = new Date(c.timestamp);
    const catchMonth = catchDate.getMonth();
    const catchSeason = catchMonth < 2 || catchMonth > 10 ? 'winter' : 
                       catchMonth < 5 ? 'spring' : 
                       catchMonth < 8 ? 'summer' : 'autumn';
    
    if (catchSeason === season && 
        Math.abs(c.weather.pressure - weather.pressure) < 10) {
      baitSuccess[c.bait].count++;
    }
  });

  // Rule-based recommendations
  const rules: { bait: string; technique: string; depth: string; score: number }[] = [];

  // Season rules
  if (season === 'winter') {
    rules.push(
      { bait: 'Gummifisch', technique: 'Schleppend, sehr langsam', depth: 'Tiefe Stellen 4-6m', score: 8 },
      { bait: 'Jig', technique: 'Vertical Jigging', depth: 'Grund', score: 7 },
    );
  } else if (season === 'spring') {
    rules.push(
      { bait: 'Spinner', technique: 'Mittel schnell', depth: 'Flachwasser 1-2m', score: 9 },
      { bait: 'Wobbler', technique: 'Stopp-and-Go', depth: 'Mittlere Tiefe 2-4m', score: 8 },
    );
  } else if (season === 'summer') {
    rules.push(
      { bait: 'Gummifisch', technique: 'Texas/Carolina Rig', depth: 'Mittlere Tiefe 2-5m', score: 8 },
      { bait: 'Topwater', technique: 'Oberflächenköder', depth: 'Flach', score: 7 },
    );
  } else { // autumn
    rules.push(
      { bait: 'Jerkbait', technique: 'Aggressives Jerken', depth: 'Mittlere Tiefe 2-4m', score: 9 },
      { bait: 'Spinnerbait', technique: 'Kontaktangeln', depth: 'Struktur', score: 8 },
    );
  }

  // Weather rules
  if (weather.pressure < 1005) {
    rules.forEach(r => r.score += 2); // Low pressure = active fish
  } else if (weather.pressure > 1025) {
    rules.forEach(r => r.score -= 1); // High pressure = lazy fish
  }

  if (weather.conditions.includes('Regen')) {
    rules.push(
      { bait: 'Spinner', technique: 'Schnell', depth: 'Oberfläche', score: 9 },
    );
  }

  if (weather.windSpeed > 20) {
    rules.forEach(r => {
      if (r.depth === 'Tiefe') r.score += 1;
    });
  }

  // Spot type rules
  if (spot.type === 'river') {
    rules.push(
      { bait: 'Spinner', technique: 'Quer zum Strom', depth: 'Strömungskante', score: 8 },
    );
  } else if (spot.type === 'lake') {
    rules.push(
      { bait: 'Gummifisch', technique: 'Searchbait', depth: 'Wechselnd', score: 7 },
    );
  }

  // Boost score based on historical success
  Object.entries(baitSuccess).forEach(([bait, stats]) => {
    if (stats.total >= 3) {
      const successRate = stats.count / stats.total;
      const matchingRule = rules.find(r => r.bait.includes(bait) || bait.includes(r.bait));
      if (matchingRule) {
        matchingRule.score += successRate * 5;
      }
    }
  });

  // Sort by score and return best
  rules.sort((a, b) => b.score - a.score);
  const best = rules[0] || { bait: 'Gummifisch', technique: 'Verschiedene', depth: 'Testen', score: 5 };

  const reasoningParts: string[] = [];
  reasoningParts.push(`${season === 'winter' ? 'Winter' : season === 'spring' ? 'Frühling' : season === 'summer' ? 'Sommer' : 'Herbst'}`);
  if (weather.pressure < 1005) reasoningParts.push('Tiefdruck - aktive Fische');
  if (weather.pressure > 1025) reasoningParts.push('Hochdruck - träge Fische');
  if (catches.length > 0) reasoningParts.push(`${catches.length} historische Fänge analysiert`);

  return {
    confidence: Math.min(best.score / 10, 1),
    bait: {
      id: 'recommendation',
      name: best.bait,
      type: 'other',
      bestConditions: {
        seasons: [season],
        weather: [weather.conditions],
      },
    },
    technique: best.technique,
    depth: best.depth,
    reasoning: reasoningParts.join(' | '),
  };
}
