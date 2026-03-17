'use client';

import { useState, useEffect } from 'react';
import { Spot, Recommendation } from '@/types';

interface RecommendProps {
  spots: Spot[];
}

export function Recommend({ spots }: RecommendProps) {
  const [selectedSpot, setSelectedSpot] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [error, setError] = useState('');

  const getRecommendation = async () => {
    if (!selectedSpot) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/recommend?spotId=${selectedSpot}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Fehler bei der Empfehlung');
      }
      
      setRecommendation(data.recommendation);
    } catch (err: any) {
      setError(err.message);
      setRecommendation(null);
    } finally {
      setLoading(false);
    }
  };

  const selectedSpotData = spots.find(s => s.id === selectedSpot);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🎯 KI-Köder-Empfehlung
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gewässer wählen
          </label>
          <select
            value={selectedSpot}
            onChange={(e) => {
              setSelectedSpot(e.target.value);
              setRecommendation(null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Gewässer auswählen...</option>
            {spots.map((spot) => (
              <option key={spot.id} value={spot.id}>{spot.name}</option>
            ))}
          </select>
        </div>

        {selectedSpot && (
          <button
            onClick={getRecommendation}
            disabled={loading}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Analysiere...' : 'Empfehlung abrufen'}
          </button>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {recommendation && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Konfidenz</span>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${recommendation.confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {Math.round(recommendation.confidence * 100)}%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Empfohlener Köder</span>
                <p className="text-lg font-semibold text-gray-900">
                  {recommendation.bait.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Technik</span>
                  <p className="font-medium text-gray-900">{recommendation.technique}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Tiefe</span>
                  <p className="font-medium text-gray-900">{recommendation.depth}</p>
                </div>
              </div>

              {recommendation.reasoning && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                  <span className="text-sm text-blue-600">
                    📊 {recommendation.reasoning}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
