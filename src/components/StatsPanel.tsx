'use client';

import { useEffect, useState } from 'react';
import { Stats } from '@/types';

export function StatsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data.stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8">Lade Statistiken...</div>;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-3xl font-bold text-blue-600">{stats.totalCatches}</p>
        <p className="text-sm text-gray-500">Gesamtfänge</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-3xl font-bold text-green-600">{stats.totalSpots}</p>
        <p className="text-sm text-gray-500">Gewässer</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-3xl font-bold text-purple-600">{stats.successRate}%</p>
        <p className="text-sm text-gray-500">Gemessene Fänge</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-3xl font-bold text-orange-600">{stats.topSpecies[0]?.species || '-'}</p>
        <p className="text-sm text-gray-500">Lieblingsfisch</p>
      </div>

      {stats.topSpecies.length > 0 && (
        <div className="col-span-2 bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold mb-3">Top Fischarten</h4>
          <div className="space-y-2">
            {stats.topSpecies.map(({ species, count }) => (
              <div key={species} className="flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full"
                    style={{
                      width: `${(count / stats.totalCatches) * 100}%`,
                    }}
                  />
                </div>
                <span className="ml-3 text-sm">{species} ({count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.topBaits.length > 0 && (
        <div className="col-span-2 bg-white p-4 rounded-lg shadow">
          <h4 className="font-semibold mb-3">Top Köder</h4>
          <div className="flex flex-wrap gap-2">
            {stats.topBaits.map(({ bait, count }) => (
              <span
                key={bait}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {bait} ({count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
