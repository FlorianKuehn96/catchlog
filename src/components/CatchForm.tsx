'use client';

import { useState, useEffect } from 'react';
import { Spot, Catch } from '@/types';

interface CatchFormProps {
  spots: Spot[];
  catches: Catch[];
  initialCatch?: Catch;
  onSuccess: () => void;
  onCancel?: () => void;
}

// Faktoren für Gewichtsberechnung
const WEIGHT_FACTORS: Record<string, number> = {
  'Hecht': 85, 'Zander': 95, 'Barsch': 90, 'Flussbarsch': 90, 'Döbel': 100,
  'Rapfen': 95, 'Wels': 120, 'Waller': 120, 'Silberwels': 120, 'Ziege': 100,
  'Karpfen': 110, 'Spiegelkarpfen': 110, 'Schuppenkarpfen': 110, 'Graskarpfen': 130,
  'Silberkarpfen': 110, 'Schleie': 100, 'Giebel': 95, 'Brachse': 85, 'Brasse': 85,
  'Rotauge': 75, 'Rotfeder': 75, 'Alver': 90, 'Ukelei': 90, 'Laube': 90,
  'Gustergarn': 90, 'Regenbogenforelle': 70, 'Bachforelle': 70, 'Seeforelle': 75,
  'Huchen': 85, 'Äsche': 75, 'Seesaibling': 70, 'Bachsaibling': 70, 'Kernling': 70,
  'Strömer': 70, 'Aal': 100, 'Flussaal': 100, 'Neunaugen': 150, 'Stör': 140,
  'Sterlet': 140, 'Lachs': 80, 'Meerforelle': 75, 'Dorsch': 90, 'Seehecht': 95,
  'Pollack': 90, 'Kohler': 90, 'Hering': 70, 'Makrele': 80, 'Sardine': 60,
};

const GERMAN_FISH_SPECIES = [
  'Hecht', 'Zander', 'Barsch', 'Flussbarsch', 'Döbel', 'Rapfen', 'Wels', 'Waller',
  'Silberwels', 'Ziege', 'Karpfen', 'Spiegelkarpfen', 'Schuppenkarpfen', 'Graskarpfen',
  'Silberkarpfen', 'Schleie', 'Giebel', 'Brachse', 'Brasse', 'Rotauge', 'Rotfeder',
  'Alver', 'Ukelei', 'Laube', 'Gustergarn', 'Regenbogenforelle', 'Bachforelle',
  'Seeforelle', 'Huchen', 'Äsche', 'Seesaibling', 'Bachsaibling', 'Kernling',
  'Strömer', 'Aal', 'Flussaal', 'Neunaugen', 'Stör', 'Sterlet', 'Lachs', 'Meerforelle',
  'Dorsch', 'Seehecht', 'Pollack', 'Kohler', 'Hering', 'Makrele', 'Sardine',
].sort();

export function CatchForm({ spots, catches, initialCatch, onSuccess, onCancel }: CatchFormProps) {
  const isEditing = !!initialCatch;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSpot, setSelectedSpot] = useState(initialCatch?.spotId || '');
  const [species, setSpecies] = useState(initialCatch?.species || '');
  const [length, setLength] = useState(initialCatch?.length?.toString() || '');
  const [weight, setWeight] = useState(initialCatch?.weight?.toString() || '');
  const [bait, setBait] = useState(initialCatch?.bait || '');
  const [technique, setTechnique] = useState(initialCatch?.technique || '');
  const [notes, setNotes] = useState(initialCatch?.notes || '');
  
  // Zeitstempel
  const [date, setDate] = useState(() => {
    if (initialCatch?.date) return initialCatch.date;
    return new Date().toISOString().split('T')[0];
  });
  const [time, setTime] = useState(() => {
    if (initialCatch?.time) return initialCatch.time;
    return new Date().toTimeString().slice(0, 5);
  });

  // Neues Gewässer Modal
  const [showNewSpot, setShowNewSpot] = useState(false);
  const [newSpotName, setNewSpotName] = useState('');
  const [newSpotType, setNewSpotType] = useState<Spot['type']>('lake');
  const [newSpotLoading, setNewSpotLoading] = useState(false);

  // Letztes Gewässer vorausfüllen (nur bei neuen Fängen)
  useEffect(() => {
    if (!isEditing && catches.length > 0 && !selectedSpot) {
      // Neuesten Fang finden
      const sorted = [...catches].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      if (sorted[0]?.spotId) {
        setSelectedSpot(sorted[0].spotId);
      }
    }
  }, [catches, isEditing, selectedSpot]);

  // GPS-basierte Gewässer-Erkennung
  const detectNearestSpot = () => {
    if (spots.length === 0 || !navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Nächstgelegenes Gewässer finden
        let nearestSpot: Spot | null = null;
        let minDistance = Infinity;
        
        spots.forEach((spot: Spot) => {
          const dist = Math.sqrt(
            Math.pow(spot.lat - latitude, 2) + Math.pow(spot.lng - longitude, 2)
          );
          if (dist < minDistance) {
            minDistance = dist;
            nearestSpot = spot;
          }
        });
        
        // Nur wenn innerhalb von ~500m (ca. 0.005 Grad)
        if (nearestSpot && minDistance < 0.005) {
          setSelectedSpot((nearestSpot as Spot).id);
        }
      },
      () => {
        // GPS Fehler - ignorieren
      }
    );
  };

  // Automatische Gewichtsberechnung
  useEffect(() => {
    if (length && species && !isEditing) {
      const len = parseFloat(length);
      if (len > 0) {
        const factor = WEIGHT_FACTORS[species] || 3000;
        const calculatedWeight = Math.pow(len, 3) / factor / 1000;
        const currentWeight = parseFloat(weight);
        if (!weight || Math.abs(currentWeight - calculatedWeight) < 0.5) {
          setWeight(calculatedWeight.toFixed(2));
        }
      }
    }
  }, [length, species, isEditing, weight]);

  const handleNewSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpotName) return;

    setNewSpotLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch('/api/spots', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: newSpotName,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              type: newSpotType,
            }),
          });

          if (!res.ok) throw new Error('Fehler beim Speichern');

          const data = await res.json();
          setSelectedSpot(data.spot.id);
          setNewSpotName('');
          setShowNewSpot(false);
          onSuccess(); // Liste neu laden
        } catch (err: any) {
          setError(err.message);
        } finally {
          setNewSpotLoading(false);
        }
      },
      () => {
        setError('Standort konnte nicht ermittelt werden');
        setNewSpotLoading(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpot || !species || !bait) {
      setError('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const timestamp = `${date}T${time}:00`;
      
      const payload = {
        ...(isEditing && { id: initialCatch!.id }),
        spotId: selectedSpot,
        species,
        length: length ? parseFloat(length) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        bait,
        technique,
        notes,
        timestamp,
      };

      const res = await fetch('/api/catches', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fehler beim Speichern');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const commonBaits = [
    'Gummifisch', 'Wobbler', 'Spinner', 'Jerkbait', 'Jig', 'Köderfisch',
    'Maden', 'Wurm', 'Boilie', 'Pellet', 'Mais', 'Brot', 'Teig',
    'Spinnerbait', 'Crankbait', 'Softbait', 'Spoon', 'Blinker',
    'Kunstköder', 'Natürköder', 'Fliege', 'Nymphe',
  ];

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
      <h3 className="text-lg font-semibold text-gray-900">
        {isEditing ? 'Fang bearbeiten' : 'Neuen Fang eintragen'}
      </h3>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Datum *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Uhrzeit *
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gewässer *
        </label>
        <div className="flex gap-2">
          <select
            value={selectedSpot}
            onChange={(e) => setSelectedSpot(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Gewässer wählen...</option>
            {spots.map((spot) => (
              <option key={spot.id} value={spot.id}>{spot.name}</option>
            ))}
          </select>
          
          <button
            type="button"
            onClick={() => setShowNewSpot(true)}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm whitespace-nowrap"
            title="Neues Gewässer anlegen"
          >
            + Neu
          </button>
          
          <button
            type="button"
            onClick={detectNearestSpot}
            className="px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm whitespace-nowrap"
            title="Nächstgelegenes Gewässer per GPS finden"
          >
            📍 GPS
          </button>
        </div>
        
        {!isEditing && selectedSpot && (
          <p className="text-xs text-gray-500 mt-1">
            Letztes Gewässer vorausgefüllt
          </p>
        )}
      </div>

      {/* Neues Gewässer Modal */}
      {showNewSpot && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">🌊 Neues Gewässer anlegen</h4>
          <form onSubmit={handleNewSpot} className="space-y-3">
            <input
              type="text"
              value={newSpotName}
              onChange={(e) => setNewSpotName(e.target.value)}
              placeholder="Name des Gewässers"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <select
              value={newSpotType}
              onChange={(e) => setNewSpotType(e.target.value as Spot['type'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="lake">See</option>
              <option value="river">Fluss</option>
              <option value="pond">Teich</option>
              <option value="canal">Kanal</option>
              <option value="sea">Meer</option>
            </select>
            <p className="text-xs text-gray-600">
              📍 Aktueller Standort wird automatisch gespeichert
            </p>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={newSpotLoading}
                className="flex-1 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
              >
                {newSpotLoading ? 'Speichern...' : 'Gewässer speichern'}
              </button>
              <button
                type="button"
                onClick={() => setShowNewSpot(false)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

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
            {calculatedWeight && !isEditing && (
              <span className="ml-2 text-xs text-blue-600 font-normal">
                (ca. {calculatedWeight} kg)
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

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Speichern...' : isEditing ? 'Änderungen speichern' : 'Fang speichern'}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
}
