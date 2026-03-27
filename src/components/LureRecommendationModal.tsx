'use client';

import { useState, useEffect } from 'react';
import { getLureRecommendation, getTopLureRecommendations, RecommendationInput } from '@/lib/recommendation-engine';
import { Weather, LureRecommendation } from '@/types';

interface LureRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  fishType: string;
  weather?: Weather;
  waterType?: string;
  onApply?: (recommendation: LureRecommendation) => void;
}

export default function LureRecommendationModal({
  isOpen,
  onClose,
  fishType,
  weather,
  waterType,
  onApply,
}: LureRecommendationModalProps) {
  const [recommendations, setRecommendations] = useState<LureRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && fishType) {
      setLoading(true);
      
      const input: RecommendationInput = {
        fishType,
        useCurrentTime: true,
        currentWeatherConditions: weather?.conditions,
        waterType,
        temperature: weather?.waterTemp,
      };

      const tops = getTopLureRecommendations(input, 3);
      setRecommendations(tops);
      setLoading(false);
    }
  }, [isOpen, fishType, weather, waterType]);

  if (!isOpen) return null;

  const handleApply = (rec: LureRecommendation) => {
    onApply?.(rec);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">💡 Köderempfehlung</h2>
              <p className="text-sm text-gray-500 mt-1">
                Für {fishType}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : recommendations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Keine Empfehlung verfügbar.</p>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-xl p-4 ${
                    index === 0
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  {index === 0 && (
                    <div className="flex items-center gap-1 text-blue-700 font-medium mb-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Beste Empfehlung
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Köder</p>
                      <p className="font-semibold text-gray-900">
                        {rec.lureType} • {rec.lureSize}
                      </p>
                      <p className="text-sm text-gray-600">{rec.lureColor}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Technik</p>
                      <p className="font-medium text-gray-900">{rec.technique}</p>
                      <p className="text-sm text-gray-600">
                        Tempo: {rec.retrieveSpeed}
                      </p>
                      <p className="text-sm text-gray-600">
                        Tiefe: {rec.depth}
                      </p>
                    </div>

                    {rec.extras && rec.extras.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Tipps</p>
                        <ul className="text-sm text-gray-600 space-y-1 mt-1">
                          {rec.extras.map((extra, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-blue-500">•</span>
                              {extra}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-600">
                      <p>{rec.reasoning}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.round(rec.confidence * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(rec.confidence * 100)}% Match
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApply(rec)}
                      className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Übernehmen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
