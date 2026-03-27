'use client';

import { useState, useEffect } from 'react';
import { Spot, LureRecommendation } from '@/types';
import { getLureRecommendation, getTopLureRecommendations } from '@/lib/recommendation-engine';

interface RecommendProps {
  spots: Spot[];
}

const GERMAN_FISH_SPECIES = [
  // Süßwasser
  'Hecht', 'Zander', 'Barsch', 'Karpfen', 'Regenbogenforelle', 'Bachforelle',
  'Wels', 'Schleie', 'Brasse', 'Rotauge', 'Aal', 'Döbel', 'Stör',
  'Barbe', 'Aland', 'Äsche',  // Neue Fischarten
  // Nordsee
  'Dorsch', 'Seehecht', 'Makrele', 'Hering', 'Hornhecht', 'Schellfisch',
  'Seelachs', 'Leng',
  // Ostsee (Brackwasser)
  'Ostsee-Dorsch', 'Ostsee-Hecht', 'Ostsee-Zander', 'Ostsee-Lachs',
  'Flunder', 'Sprotte', 'Stint',
].sort();

export function Recommend({ spots }: RecommendProps) {
  const [selectedSpot, setSelectedSpot] = useState('');
  const [selectedFish, setSelectedFish] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<LureRecommendation[]>([]);
  const [error, setError] = useState('');

  const selectedSpotData = spots.find(s => s.id === selectedSpot);

  const getRecommendations = () => {
    if (!selectedFish) {
      setError('Bitte wähle eine Fischart aus');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate async for UX
    setTimeout(() => {
      const input = {
        fishType: selectedFish,
        useCurrentTime: true,
        waterType: selectedSpotData?.type,
      };

      const tops = getTopLureRecommendations(input, 3);
      setRecommendations(tops);
      setLoading(false);
    }, 500);
  };

  // Auto-load on fish type change
  useEffect(() => {
    if (selectedFish) {
      getRecommendations();
    }
  }, [selectedFish, selectedSpot]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-lg shadow mb-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">💡 Köder-Empfehlung</h2>
          <p className="text-sm text-gray-600 mt-1">
            Welchen Köder solltest du heute mitnehmen?
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🎯 Fischart *
            </label>
            <select
              value={selectedFish}
              onChange={(e) => setSelectedFish(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Fischart wählen...</option>
              {GERMAN_FISH_SPECIES.map((fish) => (
                <option key={fish} value={fish}>{fish}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📍 Gewässer (optional)
            </label>
            <select
              value={selectedSpot}
              onChange={(e) => {
                setSelectedSpot(e.target.value);
                setRecommendations([]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Alle Gewässer...</option>
              {spots.map((spot) => (
                <option key={spot.id} value={spot.id}>{spot.name}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Analysiere beste Strategie...</p>
          </div>
        </div>
      )}

      {!loading && recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 px-2">
            🎣 Empfohlene Strategien
          </h3>

          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`border-2 rounded-xl p-5 ${
                index === 0
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {index === 0 && (
                <div className="flex items-center gap-2 text-blue-700 font-semibold mb-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Beste Empfehlung
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">🎣 Köder</p>
                    <p className="font-bold text-lg text-gray-900">{rec.lureType}</p>
                    <p className="text-sm text-gray-600">{rec.lureSize}</p>
                    <p className="text-sm text-gray-500 mt-1">{rec.lureColor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">🔄 Führung</p>
                    <p className="font-bold text-gray-900">{rec.technique}</p>
                    <p className="text-sm text-gray-600">{rec.retrieveSpeed}</p>
                    <p className="text-sm text-gray-500 mt-1">Tiefe: {rec.depth}</p>
                  </div>
                </div>

                {rec.extras && rec.extras.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-xs text-yellow-800 font-medium mb-2">💡 Pro-Tipps</p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {rec.extras.map((extra, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-yellow-600">•</span>
                          {extra}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-600">{rec.reasoning}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.round(rec.confidence * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {Math.round(rec.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !selectedFish && (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-lg">Wähle eine Fischart für deine Empfehlung</p>
        </div>
      )}
    </div>
  );
}
