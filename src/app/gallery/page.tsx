'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Catch } from '@/types';

export default function GalleryPage() {
  const { data: session } = useSession();
  const [catches, setCatches] = useState<Catch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');

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

  // Nur Fänge mit Fotos
  const catchesWithPhotos = catches.filter((c) => c.photoUrl);

  // Nach Fischart filtern
  const filteredCatches = selectedSpecies === 'all'
    ? catchesWithPhotos
    : catchesWithPhotos.filter((c) => c.species === selectedSpecies);

  // Eindeutige Fischarten für Filter
  const speciesList = [...new Set(catchesWithPhotos.map((c) => c.species))].sort();

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
            <h1 className="text-2xl font-bold text-gray-900">📸 Fang-Galerie</h1>
          </div>
          <div className="text-sm text-gray-500">
            {catchesWithPhotos.length} Fotos
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
        ) : catchesWithPhotos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📷</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Noch keine Fotos
            </h2>
            <p className="text-gray-600 mb-4">
              Fange deine ersten Fische mit Fotos und erstelle hier deine Galerie!
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
            {/* Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nach Fischart filtern
              </label>
              <select
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Alle Fischarten</option>
                {speciesList.map((species) => (
                  <option key={species} value={species}>
                    {species}
                  </option>
                ))}
              </select>
            </div>

            {/* Galerie Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCatches.map((c) => (
                <div
                  key={c.id}
                  className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Bild */}
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={c.photoUrl}
                      alt={`${c.species} Fang`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Overlay mit Info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <p className="font-semibold">{c.species}</p>
                        <p className="text-sm text-gray-200">
                          {c.length && `${c.length}cm `}
                          {c.weight && `${c.weight}kg`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info unter dem Bild */}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {c.species}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(c.date)}
                    </p>
                    {c.spot && (
                      <p className="text-xs text-gray-400 truncate">
                        💧 {c.spot.name}
                      </p>
                    )}
                    {(c.length || c.weight) && (
                      <p className="text-sm text-gray-600 mt-1">
                        {c.length && `📏 ${c.length}cm `}
                        {c.weight && `⚖️ ${c.weight}kg`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Ergebnis-Anzahl */}
            <div className="mt-6 text-center text-sm text-gray-500">
              {filteredCatches.length} von {catchesWithPhotos.length} Fotos angezeigt
            </div>
          </>
        )}
      </main>
    </div>
  );
}
