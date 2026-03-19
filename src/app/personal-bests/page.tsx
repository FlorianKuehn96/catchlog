'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Catch } from '@/types';

interface PersonalBest {
  species: string;
  biggest: Catch | null;
  heaviest: Catch | null;
}

export default function PersonalBestsPage() {
  const { data: session } = useSession();
  const [catches, setCatches] = useState<Catch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'biggest' | 'heaviest'>('biggest');

  useEffect(() => {
    loadCatches();
  }, []);

  const loadCatches = async () => {
    try {
      const res = await fetch('/api/catches');
      if (!res.ok) throw new Error('Fehler beim Laden');
      const data = await res.json();
      setCatches(data.catches || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Berechne Personal Bests
  const personalBests: PersonalBest[] = (() => {
    const bySpecies: Record<string, { biggest: Catch | null; heaviest: Catch | null }> = {};

    catches.forEach((c) => {
      if (!bySpecies[c.species]) {
        bySpecies[c.species] = { biggest: null, heaviest: null };
      }

      // Größter Fisch
      if (c.length) {
        if (!bySpecies[c.species].biggest || c.length > bySpecies[c.species].biggest!.length!) {
          bySpecies[c.species].biggest = c;
        }
      }

      // Schwerster Fisch
      if (c.weight) {
        if (!bySpecies[c.species].heaviest || c.weight > bySpecies[c.species].heaviest!.weight!) {
          bySpecies[c.species].heaviest = c;
        }
      }
    });

    return Object.entries(bySpecies)
      .map(([species, data]) => ({
        species,
        biggest: data.biggest,
        heaviest: data.heaviest,
      }))
      .filter(pb => pb.biggest || pb.heaviest)
      .sort((a, b) => a.species.localeCompare(b.species));
  })();

  // Gesamtstatistik
  const totalPBs = personalBests.length;
  const totalBiggest = personalBests.filter(pb => pb.biggest).length;
  const totalHeaviest = personalBests.filter(pb => pb.heaviest).length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Zurück
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">🏆 Meine Rekorde</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
        ) : personalBests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🎣</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Noch keine Rekorde
            </h2>
            <p className="text-gray-600 mb-4">
              Fange deine ersten Fische und erstelle hier deine Best-Liste!
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Zum Dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{totalPBs}</div>
                <div className="text-sm text-gray-600">Fischarten</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{totalBiggest}</div>
                <div className="text-sm text-gray-600">Längen-Rekorde</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{totalHeaviest}</div>
                <div className="text-sm text-gray-600">Gewichts-Rekorde</div>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setViewMode('biggest')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  viewMode === 'biggest'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                📏 Größte Fische
              </button>
              <button
                onClick={() => setViewMode('heaviest')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  viewMode === 'heaviest'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                ⚖️ Schwerste Fische
              </button>
            </div>

            {/* Records List */}
            <div className="space-y-4">
              {personalBests.map((pb) => {
                const record = viewMode === 'biggest' ? pb.biggest : pb.heaviest;
                const otherRecord = viewMode === 'biggest' ? pb.heaviest : pb.biggest;
                
                if (!record) return null;

                return (
                  <div
                    key={pb.species}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Trophy Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
                          🏆
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {pb.species}
                        </h3>

                        <div className="mt-2 space-y-1">
                          {viewMode === 'biggest' ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-blue-600">
                                  {record.length} cm
                                </span>
                                <span className="text-sm text-gray-500">Länge</span>
                              </div>
                              {record.weight && (
                                <div className="text-sm text-gray-600">
                                  auch: {record.weight} kg
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-orange-600">
                                  {record.weight} kg
                                </span>
                                <span className="text-sm text-gray-500">Gewicht</span>
                              </div>
                              {record.length && (
                                <div className="text-sm text-gray-600">
                                  auch: {record.length} cm
                                </div>
                              )}
                            </>
                          )}

                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                            <span>📅 {formatDate(record.date)}</span>
                            <span>·</span>
                            <span>🎣 {record.bait}</span>
                            {record.spot && (
                              <>
                                <span>·</span>
                                <span>💧 {record.spot.name}</span>
                              </>
                            )}
                          </div>

                          {/* Other record indicator */}
                          {viewMode === 'biggest' && otherRecord && (
                            <div className="mt-2 text-xs text-gray-400">
                              ⚖️ Gewichts-Rekord: {otherRecord.weight} kg
                            </div>
                          )}
                          {viewMode === 'heaviest' && otherRecord && (
                            <div className="mt-2 text-xs text-gray-400">
                              📏 Längen-Rekord: {otherRecord.length} cm
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Photo */}
                      {record.photoUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={record.photoUrl}
                            alt={`${pb.species} Fang`}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
