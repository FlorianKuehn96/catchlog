'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Catch } from '@/types';

export default function GalleryPage() {
  const { data: session } = useSession();
  const [catches, setCatches] = useState<Catch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  
  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  // Lightbox Navigation
  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredCatches.length - 1));
  }, [filteredCatches.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < filteredCatches.length - 1 ? prev + 1 : 0));
  }, [filteredCatches.length]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, goToPrevious, goToNext]);

  // Scroll lock when lightbox open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const currentCatch = filteredCatches[currentIndex];

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
              {filteredCatches.map((c, index) => (
                <div
                  key={c.id}
                  onClick={() => openLightbox(index)}
                  className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
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
                    {/* Click Indicator */}
                    <div className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
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

      {/* Lightbox */}
      {lightboxOpen && currentCatch && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Button */}
          {filteredCatches.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 z-10"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next Button */}
          {filteredCatches.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 z-10"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image Container */}
          <div 
            className="max-w-5xl max-h-[80vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentCatch.photoUrl}
              alt={`${currentCatch.species} Fang`}
              className="w-full h-full object-contain max-h-[70vh]"
            />
            
            {/* Info Bar */}
            <div className="mt-4 text-center text-white">
              <h2 className="text-2xl font-bold">{currentCatch.species}</h2>
              <div className="flex items-center justify-center gap-4 mt-2 text-gray-300">
                {currentCatch.length && <span>📏 {currentCatch.length} cm</span>}
                {currentCatch.weight && <span>⚖️ {currentCatch.weight} kg</span>}
                <span>📅 {formatDate(currentCatch.date)}</span>
                {currentCatch.spot && <span>💧 {currentCatch.spot.name}</span>}
              </div>              
              <div className="mt-2 text-sm text-gray-400">
                {currentIndex + 1} / {filteredCatches.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
