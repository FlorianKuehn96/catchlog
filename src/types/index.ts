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

export interface Catch {
  id: string;
  userId: string;
  spotId: string;
  spot?: Spot;
  species: string;
  length?: number;
  weight?: number;
  photoUrl?: string;
  bait: string;
  technique?: string;
  weather: Weather;
  timestamp: string;
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
