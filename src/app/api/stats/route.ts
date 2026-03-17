import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getRedis, keys } from '@/lib/redis';
import type { User, Catch } from '@/types';

// GET /api/stats - Get user statistics
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
  const catchIds = await redis.lrange(keys.catchesByUser(user.id), 0, -1);
  
  const catches: Catch[] = [];
  for (const catchId of catchIds) {
    const catchData = await redis.get(keys.catch(catchId));
    if (catchData) {
      catches.push(catchData as Catch);
    }
  }

  // Calculate stats
  const totalCatches = catches.length;
  const totalSpots = await redis.scard(keys.spotsByUser(user.id));
  
  // Top species
  const speciesCount: Record<string, number> = {};
  catches.forEach(c => {
    speciesCount[c.species] = (speciesCount[c.species] || 0) + 1;
  });
  const topSpecies = Object.entries(speciesCount)
    .map(([species, count]) => ({ species, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top baits
  const baitCount: Record<string, number> = {};
  catches.forEach(c => {
    baitCount[c.bait] = (baitCount[c.bait] || 0) + 1;
  });
  const topBaits = Object.entries(baitCount)
    .map(([bait, count]) => ({ bait, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Monthly catches (last 12 months)
  const monthlyCatches: Record<string, number> = {};
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyCatches[key] = 0;
  }
  
  catches.forEach(c => {
    const date = new Date(c.timestamp);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyCatches[key] !== undefined) {
      monthlyCatches[key]++;
    }
  });

  const monthlyData = Object.entries(monthlyCatches)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Success rate (catches with weight/length vs total)
  const measuredCatches = catches.filter(c => c.length || c.weight).length;
  const successRate = totalCatches > 0 ? (measuredCatches / totalCatches) * 100 : 0;

  return NextResponse.json({
    stats: {
      totalCatches,
      totalSpots,
      topSpecies,
      topBaits,
      monthlyCatches: monthlyData,
      successRate: Math.round(successRate),
    },
  });
}
