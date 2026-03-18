'use client';

import { useState, useEffect } from 'react';
import { Spot, Catch } from '@/types';
import { SpotPickerMap } from '@/components/SpotPickerMap';

interface CatchFormProps {
  spots: Spot[];
  catches: Catch[];
  initialCatch?: Catch;
  onSuccess: () => void;
  onCancel?: () => void;
}

// Faktoren für Gewichtsberechnung: Gewicht(kg) = (Länge(cm)³) / Faktor
// Basierend auf realistischen Durchschnittswerten für deutsche Fische
const WEIGHT_FACTORS: Record<string, number> = {
  // Raubfische (durchschnittlich schwerer)
  'Hecht': 73500,        // 50cm ≈ 1.7kg
  'Zander': 96000,       // 50cm ≈ 1.3kg
  'Barsch': 67500,       // 30cm ≈ 0.4kg
  'Flussbarsch': 67500,
  'Döbel': 78000,
  'Rapfen': 80000,
  'Wels': 125000,        // 50cm ≈ 1.0kg (Welse werden sehr lang und schwer)
  'Waller': 125000,
  'Silberwels': 125000,
  'Ziege': 85000,
  // Karpfenarten
  'Karpfen': 65000,      // 50cm ≈ 1.9kg
  'Spiegelkarpfen': 65000,
  'Schuppenkarpfen': 65000,
  'Graskarpfen': 75000,
  'Silberkarpfen': 65000,
  // Friedfische
  'Schleie': 48000,
  'Giebel': 42000,
  'Brachse': 35000,      // 30cm ≈ 0.77kg
  'Brasse': 35000,
  'Rotauge': 28000,
  'Rotfeder': 28000,
  'Alver': 32000,
  'Ukelei': 32000,
  'Laube': 32000,
  'Gustergarn': 32000,
  // Salmoniden
  'Regenbogenforelle': 115000, // 50cm ≈ 1.1kg
  'Bachforelle': 110000,
  'Seeforelle': 120000,
  'Huchen': 90000,
  'Äsche': 70000,
  'Seesaibling': 100000,
  'Bachsaibling': 100000,
  'Kernling': 100000,
  'Strömer': 100000,
  // Sonstige
  'Aal': 85000,
  'Flussaal': 85000,
  'Neunaugen': 60000,
  'Stör': 200000,
  'Sterlet': 200000,
  'Lachs': 95000,
  'Meerforelle': 120000,
  // Meeresfische
  'Dorsch': 85000,
  'Seehecht': 90000,
  'Pollack': 85000,
  'Kohler': 85000,
  'Hering': 40000,
  'Makrele': 75000,
  'Sardine': 35000,
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
  const [newSpotLat, setNewSpotLat] = useState<number | null>(null);
  const [newSpotLng, setNewSpotLng] = useState<number | null>(null);
  const [showSpotMapPicker, setShowSpotMapPicker] = useState(false);
  
  // Verhindert erneute Berechnung nach manueller Eingabe
  const [hasCalculatedWeight, setHasCalculatedWeight] = useState(false);
  const [hasCalculatedLength, setHasCalculatedLength] = useState(false);
  
  // Debounce für Berechnung (erst nach 800ms Inaktivität)
  const [lengthDebounce, setLengthDebounce] = useState<string>('');
  const [weightDebounce, setWeightDebounce] = useState<string>('');

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
    if (spots.length === 0 || !navigator.geolocation) {
      setError('Keine Gewässer vorhanden oder GPS nicht verfügbar');
      return;
    }
    
    setError('');
    
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
        
        if (nearestSpot) {
          // Entfernung in Metern berechnen (ca. 111km pro Grad)
          const distanceMeters = Math.round(minDistance * 111000);
          
          setSelectedSpot((nearestSpot as Spot).id);
          
          // Erfolgsmeldung anzeigen
          if (distanceMeters < 1000) {
            setError(`✅ ${(nearestSpot as Spot).name} ausgewählt (${distanceMeters}m entfernt)`);
          } else {
            setError(`✅ ${(nearestSpot as Spot).name} ausgewählt (${(distanceMeters / 1000).toFixed(1)}km entfernt)`);
          }
          
          // Nach 3 Sekunden Erfolgsmeldung löschen
          setTimeout(() => setError(''), 3000);
        }
      },
      (err) => {
        setError('GPS-Standort konnte nicht ermittelt werden. Bitte erlaube den Zugriff auf deinen Standort.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Debounce für Länge
  useEffect(() => {
    const timer = setTimeout(() => {
      setLengthDebounce(length);
    }, 800);
    return () => clearTimeout(timer);
  }, [length]);

  // Debounce für Gewicht
  useEffect(() => {
    const timer = setTimeout(() => {
      setWeightDebounce(weight);
    }, 800);
    return () => clearTimeout(timer);
  }, [weight]);

  // Automatische Gewichtsberechnung (Länge → Gewicht) - nur beim ersten Mal nach Debounce
  useEffect(() => {
    if (lengthDebounce && species && !isEditing && !weight && !hasCalculatedWeight) {
      const len = parseFloat(lengthDebounce);
      if (len > 0) {
        const factor = WEIGHT_FACTORS[species] || 100000;
        const calculatedWeight = Math.pow(len, 3) / factor;
        setWeight(calculatedWeight.toFixed(2));
        setHasCalculatedWeight(true);
      }
    }
  }, [lengthDebounce, species, isEditing, weight, hasCalculatedWeight]);

  // Automatische Längenberechnung (Gewicht → Länge) - nur beim ersten Mal nach Debounce
  useEffect(() => {
    if (weightDebounce && species && !isEditing && !length && !hasCalculatedLength) {
      const w = parseFloat(weightDebounce);
      if (w > 0) {
        const factor = WEIGHT_FACTORS[species] || 100000;
        const calculatedLength = Math.pow(w * factor, 1/3);
        setLength(calculatedLength.toFixed(0));
        setHasCalculatedLength(true);
      }
    }
  }, [weightDebounce, species, isEditing, length, hasCalculatedLength]);

  // Reset calculation flags when species changes
  useEffect(() => {
    setHasCalculatedWeight(false);
    setHasCalculatedLength(false);
  }, [species]);

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
        const factor = WEIGHT_FACTORS[species] || 100000;
        return (Math.pow(len, 3) / factor).toFixed(2);
      }
    }
    return null;
  };

  const getCalculatedLength = () => {
    if (weight && species) {
      const w = parseFloat(weight);
      if (w > 0) {
        const factor = WEIGHT_FACTORS[species] || 100000;
        return Math.pow(w * factor, 1/3).toFixed(0);
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
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
            
            {/* Koordinaten-Anzeige */}
            {(newSpotLat !== null && newSpotLng !== null) && (
              <p className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                📍 {newSpotLat.toFixed(5)}, {newSpotLng.toFixed(5)}
              </p>
            )}
            
            <button
              type="button"
              onClick={() => setShowSpotMapPicker(true)}
              className="w-full py-2 px-4 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
            >
              {(newSpotLat !== null) ? '📍 Standort ändern' : '🗺️ Standort auf Karte wählen'}
            </button>
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

      {/* Karten-Picker für Gewässer */}
      {showSpotMapPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Standort wählen</h3>
              <button
                onClick={() => setShowSpotMapPicker(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-2">
                Klicke auf die Karte, um den Standort zu wählen
              </p>
              <SpotPickerMap
                onLocationSelect={(lat, lng) => {
                  setNewSpotLat(lat);
                  setNewSpotLng(lng);
                  setShowSpotMapPicker(false);
                }}
                height="400px"
              />
            </div>
          </div>
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
            {getCalculatedLength() && !isEditing && (
              <span className="ml-2 text-xs text-blue-600 font-normal">
                (ca. {getCalculatedLength()} cm)
              </span>
            )}
          </label>
          <input
            type="number"
            step="0.1"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder="60"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gewicht (kg)
            {calculatedWeight && !isEditing && !weight && (
              <span className="ml-2 text-xs text-blue-600 font-normal">
                (ca. {calculatedWeight} kg)
              </span>
            )}
            {getCalculatedLength() && !isEditing && !length && (
              <span className="ml-2 text-xs text-blue-600 font-normal">
                (ca. {getCalculatedLength()} cm)
              </span>
            )}
          </label>
          <input
            type="number"
            step="0.01"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="2.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Foto
        </label>
        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700">
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
