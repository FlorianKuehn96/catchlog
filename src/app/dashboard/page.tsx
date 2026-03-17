'use client';

import { useState, useEffect } from 'react';
import { CatchForm } from '@/components/CatchForm';
import { Recommend } from '@/components/Recommend';
import { Spot, Catch } from '@/types';

export default function Dashboard() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'catches' | 'spots' | 'recommend'>('catches');
  const [showAddSpot, setShowAddSpot] = useState(false);
  const [newSpotName, setNewSpotName] = useState('');
  const [newSpotType, setNewSpotType] = useState<Spot['type']>('lake');

  const loadData = async () => {
    try {
      const [spotsRes, catchesRes] = await Promise.all([
        fetch('/api/spots'),
        fetch('/api/catches'),
      ]);

      if (!spotsRes.ok || !catchesRes.ok) {
        throw new Error('Fehler beim Laden');
      }

      const spotsData = await spotsRes.json();
      const catchesData = await catchesRes.json();

      setSpots(spotsData.spots || []);
      setCatches(catchesData.catches || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpotName) return;

    // Get current location
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

          setNewSpotName('');
          setShowAddSpot(false);
          loadData();
        } catch (err: any) {
          setError(err.message);
        }
      },
      () => {
        setError('Standort konnte nicht ermittelt werden');
      }
    );
  };

  const handleDeleteCatch = async (id: string) => {
    if (!confirm('Fang wirklich löschen?')) return;
    
    try {
      const res = await fetch(`/api/catches?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Fehler beim Löschen');
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">🎣 CatchLog</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              Ausloggen
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-1">
            <CatchForm spots={spots} onSuccess={loadData} />
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
              {[
                { key: 'catches', label: `Meine Fänge (${catches.length})` },
                { key: 'spots', label: `Gewässer (${spots.length})` },
                { key: 'recommend', label: 'Empfehlung' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'catches' && (
              <div className="space-y-4">
                {catches.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Noch keine Fänge eingetragen. Fang an!
                  </p>
                ) : (
                  catches.map((c) => (
                    <div key={c.id} className="bg-white p-4 rounded-lg shadow flex gap-4">
                      {c.photoUrl && (
                        <img
                          src={c.photoUrl}
                          alt={c.species}
                          className="w-24 h-24 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{c.species}</h4>
                            <p className="text-sm text-gray-500">
                              {c.spot?.name} • {new Date(c.timestamp).toLocaleDateString('de-DE')}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {c.length && `${c.length}cm `}
                              {c.weight && `${c.weight}kg `}
                              {c.bait && `• ${c.bait}`}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteCatch(c.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Löschen
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'spots' && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowAddSpot(true)}
                  className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  + Neues Gewässer hinzufügen
                </button>

                {showAddSpot && (
                  <form onSubmit={handleAddSpot} className="bg-white p-4 rounded-lg shadow">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newSpotName}
                        onChange={(e) => setNewSpotName(e.target.value)}
                        placeholder="Gewässername"
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                      <select
                        value={newSpotType}
                        onChange={(e) => setNewSpotType(e.target.value as Spot['type'])}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="lake">See</option>
                        <option value="river">Fluss</option>
                        <option value="pond">Teich</option>
                        <option value="canal">Kanal</option>
                        <option value="sea">Meer</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-blue-600 text-white rounded-md"
                        >
                          Speichern
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddSpot(false)}
                          className="flex-1 py-2 bg-gray-200 rounded-md"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {spots.map((spot) => (
                  <div key={spot.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{spot.name}</h4>
                        <p className="text-sm text-gray-500">
                          {spot.type === 'lake' ? 'See' : 
                           spot.type === 'river' ? 'Fluss' :
                           spot.type === 'pond' ? 'Teich' :
                           spot.type === 'canal' ? 'Kanal' : 'Meer'}
                          {' '}• {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'recommend' && (
              <Recommend spots={spots} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
