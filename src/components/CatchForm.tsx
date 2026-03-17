'use client';

import { useState, useEffect } from 'react';
import { Spot } from '@/types';

interface CatchFormProps {
  spots: Spot[];
  onSuccess: () => void;
}

// Faktoren für Gewichtsberechnung (Länge³ / Faktor = Gewicht in kg)
// Korrektur: Faktoren angepasst für realistische Gewichte
// Beispiel: 60cm Zander = ~2.2kg, 60cm Hecht = ~2.5kg
const WEIGHT_FACTORS: Record<string, number> = {
  // Raubfische (schlanke, muskulöse Fische)
  'Hecht': 85,
  'Zander': 95,
  'Barsch': 90,
  'Flussbarsch': 90,
  'Döbel': 100,
  'Rapfen': 95,
  'Wels': 120,      // Wels ist dicklicher
  'Waller': 120,
  'Silberwels': 120,
  'Ziege': 100,
  // Karpfenarten (dickere, rundere Fische)
  'Karpfen': 110,
  'Spiegelkarpfen': 110,
  'Schuppenkarpfen': 110,
  'Graskarpfen': 130,
  'Silberkarpfen': 110,
  // Friedfische
  'Schleie': 100,
  'Giebel': 95,
  'Brachse': 85,
  'Brasse': 85,
  'Rotauge': 75,
  'Rotfeder': 75,
  'Alver': 90,
  'Ukelei': 90,
  'Laube': 90,
  'Gustergarn': 90,
  // Salmoniden (schlanke, sportliche Fische)
  'Regenbogenforelle': 70,
  'Bachforelle': 70,
  'Seeforelle': 75,
  'Huchen': 85,
  'Äsche': 75,
  'Seesaibling': 70,
  'Bachsaibling': 70,
  'Kernling': 70,
  'Strömer': 70,
  // Sonstige
  'Aal': 100,       // Aal ist sehr lang und schlank
  'Flussaal': 100,
  'Neunaugen': 150,
  'Stör': 140,      // Stör ist sehr dick
  'Sterlet': 140,
  'Lachs': 80,
  'Meerforelle': 75,
  // Meeresfische
  'Dorsch': 90,
  'Seehecht': 95,
  'Pollack': 90,
  'Kohler': 90,
  'Hering': 70,
  'Makrele': 80,
  'Sardine': 60,
};

// Deutsche Fischarten (umfangreiche Liste)
const GERMAN_FISH_SPECIES = [
  // Raubfische
  'Hecht', 'Zander', 'Barsch', 'Flussbarsch', 'Döbel', 'Rapfen', 'Wels', 'Waller',
  'Silberwels', 'Ziege', 'Bachsaibling (Raub)', 
  // Karpfenarten
  'Karpfen', 'Spiegelkarpfen', 'Schuppenkarpfen', 'Graskarpfen', 'Silberkarpfen',
  // Friedfische
  'Schleie', 'Giebel', 'Brachse', 'Brasse', 'Rotauge', 'Rotfeder', 'Alver',
  'Ukelei', 'Laube', 'Gustergarn', 'Schtschegolewsky-Karausche', 'Karausche',
  'Giebel-Karausche', 'Goldorfe', 'Aland', 'Güster', 'Hasel', 'Schneider',
  // Salmoniden
  'Regenbogenforelle', 'Bachforelle', 'Seeforelle', 'Huchen', 'Äsche',
  'Seesaibling', 'Bachsaibling', 'Kernling', 'Strömer',
  // Sonstige
  'Aal', 'Flussaal', 'Neunaugen', 'Stör', 'Sterlet', 'Lachs', 'Meerforelle',
  // Meeresfische (optional)
  'Dorsch', 'Seehecht', 'Pollack', 'Kohler', 'Hering', 'Makrele', 'Sardine',
];

// Sortiere alphabetisch
GERMAN_FISH_SPECIES.sort();

export function CatchForm({ spots, onSuccess }: CatchFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSpot, setSelectedSpot] = useState('');
  const [species, setSpecies] = useState('');
  const [length, setLength] = useState('');
  const [weight, setWeight] = useState('');
  const [bait, setBait] = useState('');
  const [technique, setTechnique] = useState('');
  const [notes, setNotes] = useState('');

  // Automatische Gewichtsberechnung
  useEffect(() => {
    if (length && species) {
      const len = parseFloat(length);
      if (len > 0) {
        const factor = WEIGHT_FACTORS[species] || 3000; // Default-Faktor
        const calculatedWeight = Math.pow(len, 3) / factor / 1000;
        // Nur aktualisieren wenn Gewicht leer oder sehr nah am berechneten
        const currentWeight = parseFloat(weight);
        if (!weight || Math.abs(currentWeight - calculatedWeight) < 0.5) {
          setWeight(calculatedWeight.toFixed(2));
        }
      }
    }
  }, [length, species]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpot || !species || !bait) {
      setError('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // NOTE: Photo upload disabled for MVP - Cloudinary not configured
      const res = await fetch('/api/catches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotId: selectedSpot,
          species,
          length: length ? parseFloat(length) : undefined,
          weight: weight ? parseFloat(weight) : undefined,
          bait,
          technique,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fehler beim Speichern');
      }

      // Reset form
      setSelectedSpot('');
      setSpecies('');
      setLength('');
      setWeight('');
      setBait('');
      setTechnique('');
      setNotes('');
      
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const commonBaits = [
    'Gummifisch', 'Wobbler', 'Spinner', 'Jerkbait', 
    'Jig', 'Köderfisch', 'Maden', 'Wurm', 'Boilie',
    'Pellet', 'Mais', 'Brot', 'Teig', 'Spinnerbait',
    'Crankbait', 'Softbait', 'Spoon', 'Blinker',
    'Kunstköder', 'Natürköder', 'Fliege', 'Nymphe',
  ];

  // Get calculated weight for display
  const getCalculatedWeight = () => {
    if (length && species) {
      const len = parseFloat(length);
      if (len > 0) {
        const factor = WEIGHT_FACTORS[species] || 3000;
        return (Math.pow(len, 3) / factor / 1000).toFixed(2);
      }
    }
    return null;
  };

  const calculatedWeight = getCalculatedWeight();

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900">Neuen Fang eintragen</h3>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gewässer *
        </label>
        <select
          value={selectedSpot}
          onChange={(e) => setSelectedSpot(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Gewässer wählen...</option>
          {spots.map((spot) => (
            <option key={spot.id} value={spot.id}>{spot.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fischart *
        </label>
        <input
          type="text"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          list="species-list"
          placeholder="z.B. Hecht"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <datalist id="species-list">
          {GERMAN_FISH_SPECIES.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Länge (cm)
          </label>
          <input
            type="number"
            step="0.1"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder="60"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gewicht (kg)
            {calculatedWeight && (
              <span className="ml-2 text-xs text-blue-600 font-normal">
                (ca. {calculatedWeight} kg berechnet)
              </span>
            )}
          </label>
          <input
            type="number"
            step="0.01"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="2.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Köder *
        </label>
        <input
          type="text"
          value={bait}
          onChange={(e) => setBait(e.target.value)}
          list="bait-list"
          placeholder="z.B. Gummifisch"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <datalist id="bait-list">
          {commonBaits.map((b) => (
            <option key={b} value={b} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Technik
        </label>
        <input
          type="text"
          value={technique}
          onChange={(e) => setTechnique(e.target.value)}
          placeholder="z.B. Schleppend"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">
          Foto
        </label>
        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600">
          📷 Foto-Upload temporär deaktiviert
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notizen
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Besonderheiten, Wasserstand, etc."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Speichern...' : 'Fang speichern'}
      </button>
    </form>
  );
}
