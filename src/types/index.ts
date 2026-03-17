// Types for CatchLog

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  subscription: 'free' | 'pro';
  stripeCustomerId?: string;
  createdAt: string;
}

export interface Spot {
  id: string;
  userId: string;
  name: string;
  lat: number;
  lng: number;
  type: 'river' | 'lake' | 'pond' | 'sea' | 'canal';
  notes?: string;
  createdAt: string;
}

export interface Weather {
  temp: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  conditions: string;
  waterTemp?: number;
}

export interface SunPosition {
  hoursFromSunrise: number;  // z.B. -2.5 = 2.5h vor Sonnenaufgang
  hoursFromSunset: number;   // z.B. 1.5 = 1.5h nach Sonnenuntergang
  phase: 'night' | 'dawn' | 'day' | 'dusk' | 'night';
}

export interface Catch {
  id: string;
  userId: string;
  spotId: string;
  spot?: Spot;
  lat: number;            // Kopie vom Spot für Karte
  lng: number;            // Kopie vom Spot für Karte
  species: string;
  length?: number;
  weight?: number;
  photoUrl?: string;
  bait: string;
  technique?: string;
  weather: Weather;
  timestamp: string;      // ISO Datetime
  date: string;           // YYYY-MM-DD für Filter
  time: string;           // HH:MM für Anzeige
  sunPosition?: SunPosition;
  notes?: string;
}

export interface Bait {
  id: string;
  name: string;
  type: 'spinner' | 'jerkbait' | 'rubber' | 'natural' | 'fly' | 'jig' | 'other';
  color?: string;
  size?: string;
  bestConditions: {
    seasons: string[];
    weather: string[];
    waterTemp?: { min: number; max: number };
    targetSpecies?: string[];
  };
}

export interface Recommendation {
  confidence: number;
  bait: Bait;
  technique: string;
  depth: string;
  hotspots?: string[];
  reasoning: string;
}

export interface Stats {
  totalCatches: number;
  totalSpots: number;
  topSpecies: { species: string; count: number }[];
  topBaits: { bait: string; count: number }[];
  monthlyCatches: { month: string; count: number }[];
  successRate: number;
}
