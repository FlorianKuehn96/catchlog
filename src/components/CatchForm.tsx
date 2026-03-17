'use client';

import { useState } from 'react';
import { Spot } from '@/types';

interface CatchFormProps {
  spots: Spot[];
  onSuccess: () => void;
}

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

  const commonSpecies = [
    'Hecht', 'Zander', 'Barsch', 'Forelle', 'Karpfen', 
    'Schleie', 'Aal', 'Döbel', 'Rapfen', 'Wels'
  ];

  const commonBaits = [
    'Gummifisch', 'Wobbler', 'Spinner', 'Jerkbait', 
    'Jig', 'Köderfisch', 'Maden', 'Wurm'
  ];

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
          {commonSpecies.map((s) => (
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
