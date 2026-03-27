// Recommendation engine for lure recommendations
import {
  LURE_KNOWLEDGE_BASE,
  LureRecommendationInput,
  getCurrentSeason,
  getTimeOfDay,
  normalizeWeather,
} from './lure-recommendations';
import { LureRecommendation } from '@/types';

export interface RecommendationInput {
  fishType: string;
  season?: string;
  weather?: string;
  waterType?: string;
  timeOfDay?: string;
  temperature?: number;
  // Optional: use current values
  useCurrentTime?: boolean;
  currentWeatherConditions?: string;
}

export function getLureRecommendation(input: RecommendationInput): LureRecommendation {
  // Normalize inputs
  const normalizedInput: Partial<LureRecommendationInput> = {
    fishType: input.fishType,
  };

  // Use current season if not provided
  if (input.season) {
    normalizedInput.season = input.season;
  } else {
    normalizedInput.season = getCurrentSeason();
  }

  // Use current time of day if requested or not provided
  if (input.useCurrentTime || !input.timeOfDay) {
    normalizedInput.timeOfDay = getTimeOfDay();
  } else {
    normalizedInput.timeOfDay = input.timeOfDay;
  }

  // Normalize weather
  if (input.weather) {
    normalizedInput.weather = input.weather;
  } else if (input.currentWeatherConditions) {
    normalizedInput.weather = normalizeWeather(input.currentWeatherConditions);
  } else {
    normalizedInput.weather = 'cloudy'; // default
  }

  // Water type
  if (input.waterType) {
    normalizedInput.waterType = input.waterType;
  }

  // Temperature
  if (input.temperature !== undefined) {
    normalizedInput.temperature = input.temperature;
  }

  // Score all recommendations
  const scored = LURE_KNOWLEDGE_BASE.map((rule) => {
    let score = 0;
    let matchedConditions = 0;
    let totalConditions = 0;

    // Check each condition
    for (const [key, value] of Object.entries(rule.conditions)) {
      totalConditions++;
      const inputValue = (normalizedInput as any)[key];
      
      if (inputValue && inputValue.toString().toLowerCase() === value.toString().toLowerCase()) {
        score += rule.priority;
        matchedConditions++;
      }
    }

    return {
      rule,
      score,
      matchedConditions,
      totalConditions,
      matchRatio: matchedConditions / totalConditions,
    };
  });

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  // Get best match
  const bestMatch = scored[0];

  if (!bestMatch || bestMatch.score === 0) {
    // Fallback: return a generic recommendation
    return {
      lureType: 'Spinner',
      lureSize: 'Mittel',
      lureColor: 'Silber',
      technique: 'Standard-Retrieve',
      retrieveSpeed: 'mittel',
      depth: 'mittel',
      confidence: 0,
      reasoning: 'Keine spezifische Empfehlung verfügbar. Versuchen Sie verschiedene Köder und beobachten Sie, worauf der Fisch anspringt.',
    };
  }

  // Calculate confidence based on match ratio and score
  const confidence = Math.min(
    1,
    (bestMatch.matchRatio * 0.5) + (Math.min(bestMatch.score, 100) / 100 * 0.5)
  );

  // Build reasoning
  const reasons: string[] = [];
  
  if (normalizedInput.fishType) {
    reasons.push(`${normalizedInput.fishType}`);
  }
  if (normalizedInput.season) {
    const seasonNames: Record<string, string> = {
      spring: 'Frühling',
      summer: 'Sommer',
      autumn: 'Herbst',
      winter: 'Winter',
    };
    reasons.push(seasonNames[normalizedInput.season] || normalizedInput.season);
  }
  if (normalizedInput.weather) {
    const weatherNames: Record<string, string> = {
      sunny: 'Sonnig',
      cloudy: 'Bewölkt',
      rainy: 'Regen',
      windy: 'Wind',
      foggy: 'Nebel',
    };
    reasons.push(weatherNames[normalizedInput.weather] || normalizedInput.weather);
  }
  if (normalizedInput.timeOfDay) {
    const timeNames: Record<string, string> = {
      morning: 'Morgen',
      day: 'Tag',
      evening: 'Abend',
      night: 'Nacht',
    };
    reasons.push(timeNames[normalizedInput.timeOfDay] || normalizedInput.timeOfDay);
  }

  const reasoning = reasons.length > 0 
    ? `Optimal für ${reasons.join(' • ')}`
    : 'Basierend auf allgemeiner Erfahrung';

  return {
    ...bestMatch.rule.recommendation,
    confidence,
    reasoning,
  };
}

// Helper to get multiple recommendations (top 3)
export function getTopLureRecommendations(
  input: RecommendationInput, 
  count: number = 3
): LureRecommendation[] {
  const normalizedInput: Partial<LureRecommendationInput> = {
    fishType: input.fishType,
    season: input.season || getCurrentSeason(),
    timeOfDay: input.useCurrentTime || !input.timeOfDay 
      ? getTimeOfDay() 
      : input.timeOfDay,
    weather: input.weather || (input.currentWeatherConditions 
      ? normalizeWeather(input.currentWeatherConditions) 
      : 'cloudy'),
    waterType: input.waterType,
    temperature: input.temperature,
  };

  // Score all
  const scored = LURE_KNOWLEDGE_BASE.map((rule) => {
    let score = 0;
    let matchedConditions = 0;
    let totalConditions = 0;

    for (const [key, value] of Object.entries(rule.conditions)) {
      totalConditions++;
      const inputValue = (normalizedInput as any)[key];
      
      if (inputValue && inputValue.toString().toLowerCase() === value.toString().toLowerCase()) {
        score += rule.priority;
        matchedConditions++;
      }
    }

    return {
      rule,
      score,
      matchedConditions,
      totalConditions,
      matchRatio: totalConditions > 0 ? matchedConditions / totalConditions : 0,
    };
  });

  // Sort and take top
  scored.sort((a, b) => b.score - a.score);
  const topMatches = scored.slice(0, count).filter(m => m.score > 0);

  if (topMatches.length === 0) {
    return [getLureRecommendation(input)];
  }

  return topMatches.map((match, index) => {
    const confidence = Math.min(
      1,
      (match.matchRatio * 0.5) + (Math.min(match.score, 100) / 100 * 0.5)
    ) * (1 - index * 0.2); // Reduce confidence for lower ranks

    const reasons: string[] = [];
    for (const [key, value] of Object.entries(match.rule.conditions)) {
      const inputValue = (normalizedInput as any)[key];
      if (inputValue && inputValue.toString().toLowerCase() === value.toString().toLowerCase()) {
        const translations: Record<string, string> = {
          fishType: 'Fisch',
          season: 'Jahreszeit',
          weather: 'Wetter',
          timeOfDay: 'Tageszeit',
          waterType: 'Gewässer',
        };
        reasons.push(translations[key] || key);
      }
    }

    const reasoning = reasons.length > 0 
      ? `Passend für ${reasons.join(', ')}`
      : 'Alternative Empfehlung';

    return {
      ...match.rule.recommendation,
      confidence,
      reasoning,
    };
  });
}
