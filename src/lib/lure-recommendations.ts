// Lure recommendation knowledge base for CatchTracker
// Based on common angling knowledge for German freshwater fish

import { LureRecommendation } from '@/types';

export interface LureRecommendationInput {
  fishType: string;
  season?: string;      // 'spring' | 'summer' | 'autumn' | 'winter'
  weather?: string;     // 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'foggy'
  waterType?: string;   // 'lake' | 'river' | 'pond' | 'canal'
  timeOfDay?: string;   // 'morning' | 'day' | 'evening' | 'night'
  temperature?: number; // Water temp in Celsius
}

// Main knowledge base - ordered by specificity (most specific first)
export const LURE_KNOWLEDGE_BASE: Array<{
  conditions: Partial<LureRecommendationInput>;
  recommendation: Omit<LureRecommendation, 'confidence' | 'reasoning'>;
  priority: number; // Higher = more specific/more important
}> = [
  // === HECHT ===
  {
    conditions: { fishType: 'Hecht', season: 'spring', weather: 'cloudy', timeOfDay: 'morning' },
    recommendation: {
      lureType: 'Gummifisch',
      lureSize: '12-15cm',
      lureColor: 'weiß/silber oder rot/weiß',
      technique: 'Langsam retrieve mit Pausen',
      retrieveSpeed: 'langsam (1 Umdrehung alle 3 Sekunden)',
      depth: 'flach bis mittel (1-3m)',
      extras: ['Alle 5-10m kurze Pause (2 Sekunden)', 'Dann sanfter Twitch'],
    },
    priority: 100,
  },
  {
    conditions: { fishType: 'Hecht', season: 'summer', weather: 'sunny', timeOfDay: 'day' },
    recommendation: {
      lureType: 'Wobbler',
      lureSize: '8-12cm',
      lureColor: 'natürlich (Rotfeder, Barsch)',
      technique: 'Tief geführt mit Stops',
      retrieveSpeed: 'sehr langsam',
      depth: 'tief (3-6m)',
      extras: ['Hechte stehen im Sommer tagüber tief', 'Lange Pausen am Boden'],
    },
    priority: 95,
  },
  {
    conditions: { fishType: 'Hecht', season: 'autumn', weather: 'rainy', timeOfDay: 'evening' },
    recommendation: {
      lureType: 'Spinnerbait',
      lureSize: 'Größe 4-5',
      lureColor: 'gelb/schwarz oder orange',
      technique: 'Aggressives Jerken',
      retrieveSpeed: 'schnell bis variabel',
      depth: 'mittel (2-4m)',
      extras: ['Herbsthechte sind aktiv und hungrig', 'Große Profile bevorzugen'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Hecht', season: 'winter', weather: 'cloudy' },
    recommendation: {
      lureType: 'Gummifisch',
      lureSize: '8-10cm',
      lureColor: 'dunkel (schwarz, dunkelgrün)',
      technique: 'Extrem langsam am Boden',
      retrieveSpeed: 'sehr langsam',
      depth: 'tief (4-8m)',
      extras: ['Kleine Bewegungen', 'Lange Pausen (5-10 Sekunden)'],
    },
    priority: 85,
  },

  // === ZANDER ===
  {
    conditions: { fishType: 'Zander', season: 'spring', weather: 'cloudy', timeOfDay: 'evening' },
    recommendation: {
      lureType: 'Gummifisch',
      lureSize: '7-10cm',
      lureColor: 'rot/weiß oder natürlich (Aal)',
      technique: 'Bounce am Boden',
      retrieveSpeed: 'mittel mit Pausen',
      depth: 'mittel bis tief (3-5m)',
      extras: ['Am Boden entlangführen', 'Bei Steinen und Kanten'],
    },
    priority: 100,
  },
  {
    conditions: { fishType: 'Zander', season: 'summer', timeOfDay: 'night' },
    recommendation: {
      lureType: 'Wobbler',
      lureSize: '8-12cm',
      lureColor: 'dunkel (schwarz, dunkelrot)',
      technique: 'Langsam cranken',
      retrieveSpeed: 'sehr langsam',
      depth: 'flach (1-2m)',
      extras: ['Nachts stehen Zander flacher', 'Leise arbeiten'],
    },
    priority: 95,
  },
  {
    conditions: { fishType: 'Zander', weather: 'windy' },
    recommendation: {
      lureType: 'Spinner',
      lureSize: 'Größe 3-4',
      lureColor: 'silber/kupfer',
      technique: 'Kontinuierlich',
      retrieveSpeed: 'mittel',
      depth: 'mittel',
      extras: ['Bei Wind ist Zander aktiv', 'Geräusche durch Spinner helfen'],
    },
    priority: 80,
  },

  // === BARSCH ===
  {
    conditions: { fishType: 'Barsch', season: 'summer', weather: 'sunny', timeOfDay: 'morning' },
    recommendation: {
      lureType: 'Wobbler',
      lureSize: '4-6cm',
      lureColor: 'feurig (rot/orange/gelb)',
      technique: 'Stopp-and-Go',
      retrieveSpeed: 'variabel',
      depth: 'flach (0,5-2m)',
      extras: ['Aggressiv führen', 'Kurze Pausen machen Barsch neugierig'],
    },
    priority: 95,
  },
  {
    conditions: { fishType: 'Barsch', season: 'autumn', weather: 'cloudy' },
    recommendation: {
      lureType: 'Gummifisch',
      lureSize: '5-8cm',
      lureColor: 'natürlich (Barsch, Rotfeder)',
      technique: 'Drop Shot',
      retrieveSpeed: 'sehr langsam',
      depth: 'mittel (2-4m)',
      extras: ['Schüchterne Fische im Herbst', 'Feinste Präsentation nötig'],
    },
    priority: 90,
  },

  // === KARPFEN ===
  {
    conditions: { fishType: 'Karpfen', season: 'spring', weather: 'sunny' },
    recommendation: {
      lureType: 'Boilie',
      lureSize: '15-20mm',
      lureColor: 'fruchtig (pink, gelb) oder natürlich (braun)',
      technique: 'Am Boden liegen lassen',
      retrieveSpeed: 'keine Bewegung',
      depth: 'tief (2-5m)',
      extras: ['Haarmontage verwenden', 'PVA-Bag für Attraktivität'],
    },
    priority: 95,
  },
  {
    conditions: { fishType: 'Karpfen', season: 'summer', weather: 'cloudy' },
    recommendation: {
      lureType: 'Pop-Up Boilie',
      lureSize: '10-15mm',
      lureColor: 'hell (weiß, gelb, pink)',
      technique: 'Hoch präsentiert',
      retrieveSpeed: 'keine Bewegung',
      depth: 'oberhalb des Bodens (10-30cm)',
      extras: ['Sichtbarkeit bei trübem Wasser', 'Messer-Konfiguration'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Karpfen', season: 'autumn' },
    recommendation: {
      lureType: 'Boilie',
      lureSize: '20-24mm',
      lureColor: 'fett (Fischmehl, Krill)',
      technique: 'Futterplatz anlegen',
      retrieveSpeed: 'keine Bewegung',
      depth: 'tief (3-6m)',
      extras: ['Große Boilies für große Fische', 'Viel füttern vor dem Fischen'],
    },
    priority: 85,
  },

  // === FORELLE ===
  {
    conditions: { fishType: 'Regenbogenforelle', season: 'spring', weather: 'cloudy' },
    recommendation: {
      lureType: 'Spoon',
      lureSize: '2-4g',
      lureColor: 'silber/kupfer',
      technique: 'Kreuz-und-quer',
      retrieveSpeed: 'mittel',
      depth: 'flach bis mittel',
      extras: ['Stromschnellen erkunden', 'Aktiv führen'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Regenbogenforelle', weather: 'sunny' },
    recommendation: {
      lureType: 'Blinker',
      lureSize: '1-2g',
      lureColor: 'klein und unauffällig',
      technique: 'Sehr langsam',
      retrieveSpeed: 'sehr langsam',
      depth: 'tief',
      extras: ['Sonnige Tage = vorsichtige Forellen', 'Leise und natürlich'],
    },
    priority: 80,
  },

  // === ALLGEMEINE FALLBACKS ===
  {
    conditions: { fishType: 'Hecht' },
    recommendation: {
      lureType: 'Gummifisch',
      lureSize: '10-12cm',
      lureColor: 'weiß/silber',
      technique: 'Langsam retrieve',
      retrieveSpeed: 'mittel',
      depth: 'mittel',
      extras: ['Standard für Hechte', 'Bei Unsicherheit verwenden'],
    },
    priority: 10,
  },
  {
    conditions: { fishType: 'Zander' },
    recommendation: {
      lureType: 'Gummifisch',
      lureSize: '8-10cm',
      lureColor: 'natürlich (Aal, Barsch)',
      technique: 'Bounce am Boden',
      retrieveSpeed: 'langsam',
      depth: 'tief',
      extras: ['Zander halten am Boden', 'Geduld ist wichtig'],
    },
    priority: 10,
  },
  {
    conditions: { fishType: 'Barsch' },
    recommendation: {
      lureType: 'Wobbler',
      lureSize: '5-7cm',
      lureColor: 'natürlich',
      technique: 'Stopp-and-Go',
      retrieveSpeed: 'variabel',
      depth: 'flach',
      extras: ['Barsch lieben Bewegung', 'Experimentieren mit Geschwindigkeit'],
    },
    priority: 10,
  },
  {
    conditions: { fishType: 'Karpfen' },
    recommendation: {
      lureType: 'Boilie',
      lureSize: '15mm',
      lureColor: 'natürlich (braun, beige)',
      technique: 'Statisch am Boden',
      retrieveSpeed: 'keine',
      depth: 'tief',
      extras: ['Geduld ist Schlüssel', 'Futterplatz vorbereiten'],
    },
    priority: 10,
  },
];

// Helper to get current season from date
export function getCurrentSeason(date: Date = new Date()): string {
  const month = date.getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// Helper to get time of day
export function getTimeOfDay(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// Normalize weather conditions
export function normalizeWeather(conditions: string): string {
  const lower = conditions.toLowerCase();
  if (lower.includes('sun') || lower.includes('clear')) return 'sunny';
  if (lower.includes('cloud') || lower.includes('overcast')) return 'cloudy';
  if (lower.includes('rain') || lower.includes('drizzle')) return 'rainy';
  if (lower.includes('wind') || lower.includes('gust')) return 'windy';
  if (lower.includes('fog') || lower.includes('mist')) return 'foggy';
  return 'cloudy'; // default
}
