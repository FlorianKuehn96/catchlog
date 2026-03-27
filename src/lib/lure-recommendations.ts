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

  // === ROTAUGE / ROTFEDER ===
  {
    conditions: { fishType: 'Rotauge', season: 'summer', weather: 'sunny' },
    recommendation: {
      lureType: 'Teig',
      lureSize: 'Erbsengroß',
      lureColor: 'weiß/hellgelb',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine Bewegung',
      depth: 'tief (2-4m)',
      extras: ['Sonnige Tage = Rotauge tief', 'Sehr empfindliches Futter'],
    },
    priority: 95,
  },
  {
    conditions: { fishType: 'Rotauge', season: 'spring', weather: 'cloudy' },
    recommendation: {
      lureType: 'Maden',
      lureSize: '2-3 Maden',
      lureColor: 'weiß/natürlich',
      technique: 'Paternoster',
      retrieveSpeed: 'keine Bewegung',
      depth: 'mittel (1-3m)',
      extras: ['Bei Bewölkung höher im Wasser', 'Sanft anziehen bei Biss'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Rotauge', weather: 'rainy' },
    recommendation: {
      lureType: 'Wurm',
      lureSize: 'Halber Tauwurm',
      lureColor: 'dunkelrot/braun',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine Bewegung',
      depth: 'flach (0,5-2m)',
      extras: ['Bei Regen flacher', 'Naturköder besonders effektiv'],
    },
    priority: 85,
  },
  {
    conditions: { fishType: 'Rotauge' },
    recommendation: {
      lureType: 'Maden oder Teig',
      lureSize: 'Klein',
      lureColor: 'weiß/hell',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine',
      depth: 'mittel',
      extras: ['Rotauge schwimmt oft in Schwärmen', 'Feine Montage verwenden'],
    },
    priority: 10,
  },

  // === BRASSE / BRACHSE ===
  {
    conditions: { fishType: 'Brasse', season: 'spring', weather: 'cloudy' },
    recommendation: {
      lureType: 'Wurm',
      lureSize: 'Ganzer Tauwurm',
      lureColor: 'dunkelrot',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine Bewegung',
      depth: 'mittel (1-3m)',
      extras: ['Frühjahr: Brassen aktiv', 'Naturköder bevorzugen'],
    },
    priority: 95,
  },
  {
    conditions: { fishType: 'Brasse', season: 'summer', weather: 'sunny' },
    recommendation: {
      lureType: 'Teig',
      lureSize: 'Haselnussgroß',
      lureColor: 'gelb/weiß',
      technique: 'Futterkorb',
      retrieveSpeed: 'keine Bewegung',
      depth: 'tief (3-5m)',
      extras: ['Sonnige Tage = tiefe Schichten', 'Futterplatz anlegen hilft'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Brasse', season: 'autumn' },
    recommendation: {
      lureType: 'Mais',
      lureSize: '2-3 Körner',
      lureColor: 'gelb/natürlich',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine Bewegung',
      depth: 'tief (2-4m)',
      extras: ['Herbst: Brassen fressen viel', 'Mais sehr effektiv'],
    },
    priority: 85,
  },
  {
    conditions: { fishType: 'Brasse' },
    recommendation: {
      lureType: 'Wurm oder Mais',
      lureSize: 'Mittel',
      lureColor: 'natürlich',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine',
      depth: 'mittel',
      extras: ['Brasse liebt Naturköder', 'Geduld ist wichtig'],
    },
    priority: 10,
  },

  // === SCHLEIE ===
  {
    conditions: { fishType: 'Schleie', season: 'summer', timeOfDay: 'night' },
    recommendation: {
      lureType: 'Wurm',
      lureSize: '2-3 Tauwürmer',
      lureColor: 'dunkelrot',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine Bewegung',
      depth: 'flach bis mittel (1-2m)',
      extras: ['Schleien sind nachtaktiv', 'Ruhiges Angeln wichtig'],
    },
    priority: 100,
  },
  {
    conditions: { fishType: 'Schleie', season: 'spring' },
    recommendation: {
      lureType: 'Teig',
      lureSize: 'Haselnussgroß',
      lureColor: 'dunkelbraun',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine Bewegung',
      depth: 'mittel (1-3m)',
      extras: ['Laichzeit: Schleien hungrig', 'Nähe von Pflanzen suchen'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Schleie', weather: 'rainy' },
    recommendation: {
      lureType: 'Wurm',
      lureSize: 'Ganzer Tauwurm',
      lureColor: 'dunkelrot',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine Bewegung',
      depth: 'flach (0,5-1,5m)',
      extras: ['Bei Regen flacher und aktiver', 'Futterstelle anlegen'],
    },
    priority: 85,
  },
  {
    conditions: { fishType: 'Schleie' },
    recommendation: {
      lureType: 'Wurm oder Teig',
      lureSize: 'Groß',
      lureColor: 'dunkel',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine',
      depth: 'flach bis mittel',
      extras: ['Schleien sind scheu', 'Sehr leise agieren'],
    },
    priority: 10,
  },

  // === GIESEL / GUSTERGARN ===
  {
    conditions: { fishType: 'Giebel' },
    recommendation: {
      lureType: 'Teig',
      lureSize: 'Klein',
      lureColor: 'weiß/gelb',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine',
      depth: 'flach',
      extras: ['Giebel mögen feine Köder', 'Kleine Haken verwenden'],
    },
    priority: 10,
  },

  // === ALVER / UKELEI ===
  {
    conditions: { fishType: 'Ukelei' },
    recommendation: {
      lureType: 'Maden',
      lureSize: 'Winzig',
      lureColor: 'weiß',
      technique: 'Feinste Grundmontage',
      retrieveSpeed: 'keine',
      depth: 'flach',
      extras: ['Sehr kleine Haken (Gr. 22-24)', 'Dünne Schnur verwenden'],
    },
    priority: 10,
  },

  // === AAL ===
  {
    conditions: { fishType: 'Aal', season: 'summer', timeOfDay: 'night' },
    recommendation: {
      lureType: 'Wurm',
      lureSize: 'Mehrere Tauwürmer',
      lureColor: 'dunkelrot',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine Bewegung',
      depth: 'tief (3-6m)',
      extras: ['Aale sind nachtaktiv', 'Tiefes Wasser suchen'],
    },
    priority: 95,
  },
  {
    conditions: { fishType: 'Aal', weather: 'rainy' },
    recommendation: {
      lureType: 'Fischfleisch',
      lureSize: 'Streifen',
      lureColor: 'weiß/natürlich',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine Bewegung',
      depth: 'tief',
      extras: ['Bei Regen besonders aktiv', 'Aalruten verwenden'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Aal' },
    recommendation: {
      lureType: 'Wurm',
      lureSize: 'Mehrere Stück',
      lureColor: 'dunkelrot',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine',
      depth: 'tief',
      extras: ['Aale mögen es tief und dunkel', 'Nachts am besten'],
    },
    priority: 10,
  },

  // === WELS / WALLER ===
  {
    conditions: { fishType: 'Wels', season: 'summer', timeOfDay: 'night' },
    recommendation: {
      lureType: 'Waller-Jauche',
      lureSize: 'Großer Köder',
      lureColor: 'natürlich',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine Bewegung',
      depth: 'tief (5-10m)',
      extras: ['Welse sind nachtaktiv', 'Große Ruten und starke Schnur'],
    },
    priority: 100,
  },
  {
    conditions: { fishType: 'Wels', season: 'spring' },
    recommendation: {
      lureType: 'Aal',
      lureSize: '10-15cm',
      lureColor: 'natürlich',
      technique: 'Wallerpose',
      retrieveSpeed: 'keine Bewegung',
      depth: 'tief',
      extras: ['Frühling: Laichzeit = hungrig', 'Großes Futter'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Wels' },
    recommendation: {
      lureType: 'Wurm oder Fisch',
      lureSize: 'Groß',
      lureColor: 'natürlich',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine',
      depth: 'sehr tief',
      extras: ['Welse brauchen große Köder', 'Geduld und starke Ausrüstung'],
    },
    priority: 10,
  },

  // === DÖBEL / RAPFEN ===
  {
    conditions: { fishType: 'Döbel', season: 'spring' },
    recommendation: {
      lureType: 'Spinner',
      lureSize: 'Größe 2-3',
      lureColor: 'silber',
      technique: 'Schnell führen',
      retrieveSpeed: 'schnell',
      depth: 'oberflächennah (0-1m)',
      extras: ['Frühjahr: Döbel aktiv', 'Schnelle Köder bevorzugen'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Döbel' },
    recommendation: {
      lureType: 'Spinner',
      lureSize: 'Klein bis mittel',
      lureColor: 'silber',
      technique: 'Kontinuierlich schnell',
      retrieveSpeed: 'schnell',
      depth: 'flach',
      extras: ['Döbel lieben schnelle Köder', 'Oberflächennah führen'],
    },
    priority: 10,
  },

  // === STÖR ===
  {
    conditions: { fishType: 'Stör' },
    recommendation: {
      lureType: 'Teig oder Wurm',
      lureSize: 'Groß',
      lureColor: 'dunkel',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine',
      depth: 'tief',
      extras: ['Störe fressen am Boden', 'Naturköder verwenden'],
    },
    priority: 10,
  },

  // === NORDSEE FISCHARTEN ===

  // === DORSCH (NORDSEE) ===
  {
    conditions: { fishType: 'Dorsch', season: 'autumn', weather: 'cloudy' },
    recommendation: {
      lureType: 'Pilker',
      lureSize: '200-400g',
      lureColor: 'silber/weiß oder rot/weiß',
      technique: 'Up-and-Down am Grund',
      retrieveSpeed: 'schnelle Hubbewegungen',
      depth: 'tief (15-50m)',
      extras: ['🐟 Herbst: Große Dorschschwärme an Küste', '⏰ Beste Zeit: Tide-Wechsel', '🎣 Gute Plätze: Steinhaufen, Wracks, Muschelbänke', '📏 Dorsch mindestens 38cm (EU)'],
    },
    priority: 100,
  },
  {
    conditions: { fishType: 'Dorsch', season: 'winter' },
    recommendation: {
      lureType: 'Gummifisch',
      lureSize: '18-22cm',
      lureColor: 'weiß/pink oder rot/weiß',
      technique: 'Langsam am Grund',
      retrieveSpeed: 'sehr langsam mit Pausen',
      depth: 'tief (20-80m)',
      extras: ['❄️ Winter: Dorsch sucht tiefes Wasser', '🌊 Starke Strömung = schwerer Pilker nötig', '⏰ Morgens und abends aktiv'],
    },
    priority: 95,
  },
  {
    conditions: { fishType: 'Dorsch', season: 'spring' },
    recommendation: {
      lureType: 'Pilker',
      lureSize: '150-250g',
      lureColor: 'silber/gelb',
      technique: 'Up-and-Down',
      retrieveSpeed: 'mittel',
      depth: 'mittel (10-30m)',
      extras: ['🌸 Frühjahr: Dorsch wandert näher zur Küste', '🌙 Abendstunden besonders gut', '📍 Plätze: Steinhaufen, Hafenmolen'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Dorsch', timeOfDay: 'morning' },
    recommendation: {
      lureType: 'Pilker',
      lureSize: '200-300g',
      lureColor: 'silber/weiß',
      technique: 'Up-and-Down am Grund',
      retrieveSpeed: 'schnell',
      depth: 'tief (15-40m)',
      extras: ['🌅 Morgens: Dorsch frisst aktiv', '🎯 Schneller Pilker-Rhythmus', '📏 Dorsch mindestens 38cm'],
    },
    priority: 85,
  },
  {
    conditions: { fishType: 'Dorsch' },
    recommendation: {
      lureType: 'Pilker oder Gummifisch',
      lureSize: '200-300g',
      lureColor: 'silber/weiß',
      technique: 'Up-and-Down',
      retrieveSpeed: 'variabel',
      depth: 'tief (15-40m)',
      extras: ['🌊 Nordsee-Dorsch liebt Pilker', '🌙 Tide-Wechsel nutzen', '💪 Starke Schnur (0.30mm+)', '📏 Mindestmaß 38cm'],
    },
    priority: 10,
  },

  // === SEEHECHT / KÖHLER ===
  {
    conditions: { fishType: 'Seehecht', season: 'summer' },
    recommendation: {
      lureType: 'Wobbler',
      lureSize: '12-18cm',
      lureColor: 'silber/blau oder weiß',
      technique: 'Oberfläche bis Mittelwasser',
      retrieveSpeed: 'schnell mit Stops',
      depth: 'flach bis mittel (2-15m)',
      extras: ['Sommer: Seehecht jagt an Oberfläche', 'Aggressive Führung', 'Harte Schnelle'],
    },
    priority: 95,
  },
  {
    conditions: { fishType: 'Seehecht', season: 'autumn' },
    recommendation: {
      lureType: 'Gummifisch',
      lureSize: '15-20cm',
      lureColor: 'silber/weiß',
      technique: 'Mittlere Wasserschicht',
      retrieveSpeed: 'schnell',
      depth: 'mittel (10-20m)',
      extras: ['Herbst: Große Exemplare', 'Schnelle Retrieve bevorzugen'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Seehecht' },
    recommendation: {
      lureType: 'Wobbler oder Gummifisch',
      lureSize: '15cm',
      lureColor: 'silber/blau',
      technique: 'Schnell führen',
      retrieveSpeed: 'schnell',
      depth: 'flach bis mittel',
      extras: ['Seehecht ist Jäger', 'Schnelle Köder bevorzugen', 'Vorsicht: Zähne!'],
    },
    priority: 10,
  },

  // === MAKRELE ===
  {
    conditions: { fishType: 'Makrele', season: 'summer', timeOfDay: 'morning' },
    recommendation: {
      lureType: 'Blinker',
      lureSize: 'Größe 2-4',
      lureColor: 'silber/blau',
      technique: 'Schnell einholen',
      retrieveSpeed: 'schnell',
      depth: 'flach (0-5m)',
      extras: ['Morgens: Makrelen nah am Ufer', 'Schwarmfisch - viele Fänge möglich', 'Kleine Haken (Gr. 6-10)'],
    },
    priority: 95,
  },
  {
    conditions: { fishType: 'Makrele', season: 'summer' },
    recommendation: {
      lureType: 'Sabiki-Rig',
      lureSize: 'Klein',
      lureColor: 'silber/weiß',
      technique: 'Mehrfachhakensystem',
      retrieveSpeed: 'langsam ziehen',
      depth: 'mittel (5-15m)',
      extras: ['Sabiki-Rig = mehrere Makrelen auf einmal', 'Perfekt für Köderfisch'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Makrele' },
    recommendation: {
      lureType: 'Blinker oder Sabiki',
      lureSize: 'Klein',
      lureColor: 'silber',
      technique: 'Schnell',
      retrieveSpeed: 'schnell',
      depth: 'flach',
      extras: ['Makrele schwimmt im Schwarm', 'Sommer-Hauptsaison', 'Gut als Köderfisch'],
    },
    priority: 10,
  },

  // === HERING ===
  {
    conditions: { fishType: 'Hering', season: 'autumn' },
    recommendation: {
      lureType: 'Sabiki-Rig',
      lureSize: 'Sehr klein',
      lureColor: 'silber/weiß',
      technique: 'Vorfach mit mehreren Haken',
      retrieveSpeed: 'sehr langsam',
      depth: 'flach bis mittel',
      extras: ['Herbst: Heringszug', 'Früh Morgens beste Zeit', 'Perfekter Köderfisch'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Hering', season: 'winter' },
    recommendation: {
      lureType: 'Paternoster',
      lureSize: 'Klein',
      lureColor: 'silber',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine',
      depth: 'tief',
      extras: ['Winter: Hering tief', 'Sehr empfindlicher Biss'],
    },
    priority: 85,
  },
  {
    conditions: { fishType: 'Hering' },
    recommendation: {
      lureType: 'Sabiki oder feine Montage',
      lureSize: 'Klein',
      lureColor: 'silber',
      technique: 'Köderfisch-Technik',
      retrieveSpeed: 'keine',
      depth: 'variabel',
      extras: ['Hering schwimmt in riesigen Schwärmen', 'Herbst-Winter Saison', 'Klassischer Köderfisch'],
    },
    priority: 10,
  },

  // === HORNHECHT ===
  {
    conditions: { fishType: 'Hornhecht', season: 'spring' },
    recommendation: {
      lureType: 'Gummifisch',
      lureSize: '10-15cm',
      lureColor: 'grün/silber',
      technique: 'Schnell am Boden',
      retrieveSpeed: 'schnell mit kurzen Pausen',
      depth: 'flach (2-8m)',
      extras: ['Frühjahr: Hornhecht laicht', 'Sehr aggressiv beißen', 'Vorsicht: Schnabel!'],
    },
    priority: 95,
  },
  {
    conditions: { fishType: 'Hornhecht', season: 'summer' },
    recommendation: {
      lureType: 'Pilker',
      lureSize: '80-120g',
      lureColor: 'silber/rot',
      technique: 'Up-and-Down',
      retrieveSpeed: 'schnell',
      depth: 'mittel (8-20m)',
      extras: ['Sommer: Tiefer als Seehecht', 'Aggressive Führung nötig'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Hornhecht' },
    recommendation: {
      lureType: 'Pilker oder Gummi',
      lureSize: 'Mittel',
      lureColor: 'silber',
      technique: 'Schnell',
      retrieveSpeed: 'schnell',
      depth: 'mittel',
      extras: ['Hornhecht = "Nordsee-Hecht"', 'Sehr räuberisch', 'Frühling-Hauptsaison'],
    },
    priority: 10,
  },

  // === SCHELLFISCH ===
  {
    conditions: { fishType: 'Schellfisch' },
    recommendation: {
      lureType: 'Paternoster',
      lureSize: 'Mittel',
      lureColor: 'weiß/rot',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine',
      depth: 'tief (20-50m)',
      extras: ['Schellfisch = reiner Grundfisch', 'Tiefe Gebiete', 'Fester Boden bevorzugt'],
    },
    priority: 10,
  },

  // === SEELACHS (KÖHLER) ===
  {
    conditions: { fishType: 'Seelachs', season: 'summer' },
    recommendation: {
      lureType: 'Gummifisch',
      lureSize: '15-20cm',
      lureColor: 'silber/blau',
      technique: 'Mittlere Schicht',
      retrieveSpeed: 'mittel bis schnell',
      depth: 'mittel (10-25m)',
      extras: ['Seelachs = "Köhler"', 'Sommer: Aktiv im Freiwasser', 'Gutes Essen'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Seelachs' },
    recommendation: {
      lureType: 'Pilker',
      lureSize: '100-150g',
      lureColor: 'silber',
      technique: 'Up-and-Down',
      retrieveSpeed: 'mittel',
      depth: 'mittel bis tief',
      extras: ['Seelachs mag Bewegung', 'Auch vom Ufer möglich'],
    },
    priority: 10,
  },

  // === LENG ===
  {
    conditions: { fishType: 'Leng' },
    recommendation: {
      lureType: 'Paternoster',
      lureSize: 'Groß',
      lureColor: 'weiß/pink',
      technique: 'Tiefe Grundmontage',
      retrieveSpeed: 'keine',
      depth: 'sehr tief (40-80m)',
      extras: ['Leng = Tiefseefisch', 'Nur bei Tiefseeangeln', 'Winter-Hauptsaison'],
    },
    priority: 10,
  },

  // === OSTSEE FISCHARTEN (BRACKWASSER) ===

  // === DORSCH (OSTSEE) ===
  {
    conditions: { fishType: 'Ostsee-Dorsch', season: 'autumn' },
    recommendation: {
      lureType: 'Gummifisch',
      lureSize: '12-18cm',
      lureColor: 'silber/weiß',
      technique: 'Mittlere Schicht',
      retrieveSpeed: 'mittel mit Pausen',
      depth: 'mittel (8-20m)',
      extras: ['Ostsee-Dorsch kleiner als Nordsee', 'Brackwasser verändert Verhalten', 'Wobbler auch effektiv'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Ostsee-Dorsch' },
    recommendation: {
      lureType: 'Gummifisch oder Wobbler',
      lureSize: '12-15cm',
      lureColor: 'natürlich',
      technique: 'Mittlere Schicht',
      retrieveSpeed: 'mittel',
      depth: 'mittel',
      extras: ['Ostsee = Brackwasser', 'Dorsch oft flacher als in Nordsee'],
    },
    priority: 10,
  },

  // === OSTSEE-FLOUNDER ===
  {
    conditions: { fishType: 'Flunder', season: 'summer' },
    recommendation: {
      lureType: 'Wurm oder Garnelen',
      lureSize: 'Klein',
      lureColor: 'natürlich',
      technique: 'Paternoster am Grund',
      retrieveSpeed: 'keine',
      depth: 'sehr flach (1-5m)',
      extras: ['☀️ Sommer: Flunder nah am Ufer', '🏖️ Sandige oder schlammige Böden', '📍 Gute Plätze: Flussmündungen, Häfen', '🪱 Wattwürmer besonders effektiv'],
    },
    priority: 95,
  },
  {
    conditions: { fishType: 'Flunder', season: 'autumn' },
    recommendation: {
      lureType: 'Wurm oder Seeringelwurm',
      lureSize: 'Klein',
      lureColor: 'dunkel/rot',
      technique: 'Grundmontage mit Buttlöffel',
      retrieveSpeed: 'keine',
      depth: 'flach (2-6m)',
      extras: ['🍂 Herbst: Große Flunder vor Laichzeit', '🌊 Nach Stürmen: aufgewühltes Wasser', '📏 Flunder mindestens 25cm (EU)'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Flunder', season: 'spring' },
    recommendation: {
      lureType: 'Wurm oder Krebse',
      lureSize: 'Klein',
      lureColor: 'natürlich',
      technique: 'Paternoster',
      retrieveSpeed: 'keine',
      depth: 'flach (1-4m)',
      extras: ['🌸 Frühjahr: Flunder kommt in flache Gewässer', '🌡️ Warmere Bereiche bevorzugen', '🦀 Strandkrabben als Köder'],
    },
    priority: 85,
  },
  {
    conditions: { fishType: 'Flunder', timeOfDay: 'morning' },
    recommendation: {
      lureType: 'Wurm',
      lureSize: 'Klein',
      lureColor: 'natürlich',
      technique: 'Kurze Würfe am Ufer',
      retrieveSpeed: 'keine',
      depth: 'sehr flach (1-3m)',
      extras: ['🌅 Morgens: Flunder frisst aktiv', '📏 Nur 5-50m vom Ufer nötig', '🏖️ Sandige Unterwasserstrukturen suchen'],
    },
    priority: 80,
  },
  {
    conditions: { fishType: 'Flunder' },
    recommendation: {
      lureType: 'Wurm oder kleiner Fisch',
      lureSize: 'Klein',
      lureColor: 'natürlich',
      technique: 'Grundmontage',
      retrieveSpeed: 'keine',
      depth: 'flach (1-5m)',
      extras: ['🐟 Flunder = klassischer Ostsee-Fisch', '🏖️ Brackwasser-Fach', '📏 Mindestmaß 25cm', '🦐 Naturköder: Wattwürmer, Garnelen'],
    },
    priority: 10,
  },

  // === SPROTTE ===
  {
    conditions: { fishType: 'Sprotte' },
    recommendation: {
      lureType: 'Sabiki-Rig',
      lureSize: 'Sehr klein',
      lureColor: 'silber',
      technique: 'Mehrfachhaken',
      retrieveSpeed: 'sehr langsam',
      depth: 'flach',
      extras: ['Sprotte = kleiner Hering', 'Schwarmfisch', 'Perfekter Köderfisch'],
    },
    priority: 10,
  },

  // === STINT ===
  {
    conditions: { fishType: 'Stint', season: 'winter' },
    recommendation: {
      lureType: 'Stint-Doll',
      lureSize: 'Klein',
      lureColor: 'silber',
      technique: 'Spezialmontage',
      retrieveSpeed: 'keine',
      depth: 'flach',
      extras: ['Winter: Stint-Saison', 'Brackwasser-Klassiker', 'Abendstunden'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Stint' },
    recommendation: {
      lureType: 'Spezial-Stintköder',
      lureSize: 'Klein',
      lureColor: 'silber',
      technique: 'Feinste Montage',
      retrieveSpeed: 'keine',
      depth: 'flach',
      extras: ['Stint = Ostsee-Spezialität', 'Winter-Hauptsaison', 'Brackwasser'],
    },
    priority: 10,
  },

  // === OSTSEE-LACHS ===
  {
    conditions: { fishType: 'Ostsee-Lachs', season: 'autumn' },
    recommendation: {
      lureType: 'Spinner',
      lureSize: 'Größe 4-6',
      lureColor: 'silber/blau oder kupfer',
      technique: 'Mittlere Schicht',
      retrieveSpeed: 'schnell',
      depth: 'mittel (5-15m)',
      extras: ['Herbst: Lachs wandert', 'Auch vom Ufer möglich', 'Starke Rute nötig'],
    },
    priority: 95,
  },
  {
    conditions: { fishType: 'Ostsee-Lachs' },
    recommendation: {
      lureType: 'Wobbler oder Spinner',
      lureSize: 'Mittel',
      lureColor: 'silber/kupfer',
      technique: 'Schnell',
      retrieveSpeed: 'schnell',
      depth: 'mittel',
      extras: ['Ostsee-Lachs wandert', 'Herbst-Hauptsaison', 'Starke Schnur nötig'],
    },
    priority: 10,
  },

  // === OSTSEE-HECHT (Brackwasser) ===
  {
    conditions: { fishType: 'Ostsee-Hecht', season: 'spring' },
    recommendation: {
      lureType: 'Gummifisch',
      lureSize: '18-25cm',
      lureColor: 'weiß/silber oder rosa',
      technique: 'Langsam am Grund mit Pausen',
      retrieveSpeed: 'langsam (1 Umdrehung alle 3-4 Sekunden)',
      depth: 'flach bis mittel (1-5m)',
      extras: ['🌸 Frühjahr: Ostsee-Hecht laicht', '🐟 Große Exemplare möglich (bis 15kg!)', '📍 Beste Plätze: Flussmündungen, Häfen', '🌊 Salzgehalt 0,5-1,5% optimal'],
    },
    priority: 95,
  },
  {
    conditions: { fishType: 'Ostsee-Hecht', season: 'summer' },
    recommendation: {
      lureType: 'Wobbler',
      lureSize: '12-16cm',
      lureColor: 'natürlich (Rotfeder, silber)',
      technique: 'Mittlere Schicht mit Stops',
      retrieveSpeed: 'mittel',
      depth: 'mittel (2-6m)',
      extras: ['☀️ Sommer: Hecht sucht kühlere Bereiche', '📍 Tiefe Steinhaufen, Hafenmolen', '📏 Mindestmaß 45cm'],
    },
    priority: 90,
  },
  {
    conditions: { fishType: 'Ostsee-Hecht', season: 'autumn' },
    recommendation: {
      lureType: 'Gummifisch',
      lureSize: '15-20cm',
      lureColor: 'weiß/silber',
      technique: 'Am Grund entlang',
      retrieveSpeed: 'langsam mit Pausen',
      depth: 'mittel (3-8m)',
      extras: ['🍂 Herbst: Fressphase vor Winter', '🌊 Brackwasser konzentriert Fische', '🎯 Große Gummifische (18cm+)'],
    },
    priority: 85,
  },
  {
    conditions: { fishType: 'Ostsee-Hecht' },
    recommendation: {
      lureType: 'Gummifisch oder Wobbler',
      lureSize: '15-20cm',
      lureColor: 'weiß/silber',
      technique: 'Mittel',
      retrieveSpeed: 'mittel',
      depth: 'flach bis mittel',
      extras: ['🐟 Ostsee-Hecht = besondere Rasse', '🌊 Brackwasser bevorzugt (0,5-2% Salz)', '📏 Mindestmaß 45cm', '🏆 Große Exemplare: 100cm+ möglich!'],
    },
    priority: 10,
  },

  // === OSTSEE-ZANDER (Brackwasser) ===
  {
    conditions: { fishType: 'Ostsee-Zander' },
    recommendation: {
      lureType: 'Gummifisch',
      lureSize: '10-15cm',
      lureColor: 'weiß/silber',
      technique: 'Am Grund entlang',
      retrieveSpeed: 'langsam',
      depth: 'mittel (3-8m)',
      extras: ['Ostsee-Zander im Brackwasser', 'Salzwasser verändert Farbe', 'Meerforellen-Köder funktionieren'],
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
