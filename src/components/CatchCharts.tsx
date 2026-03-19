'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Catch, Spot } from '@/types';

interface CatchChartsProps {
  catches: Catch[];
  spots: Spot[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function CatchCharts({ catches, spots }: CatchChartsProps) {
  // Catches over time (last 12 months)
  const timeData = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
      months[key] = 0;
    }
    
    // Count catches per month
    catches.forEach((c) => {
      const date = new Date(c.date || c.timestamp);
      const key = date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
      if (months.hasOwnProperty(key)) {
        months[key]++;
      }
    });
    
    return Object.entries(months).map(([month, count]) => ({ month, count }));
  }, [catches]);

  // Species distribution
  const speciesData = useMemo(() => {
    const counts: Record<string, number> = {};
    catches.forEach((c) => {
      counts[c.species] = (counts[c.species] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 species
  }, [catches]);

  // Top spots
  const spotData = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    catches.forEach((c) => {
      const spot = spots.find((s) => s.id === c.spotId);
      if (spot) {
        if (!counts[spot.id]) {
          counts[spot.id] = { name: spot.name, count: 0 };
        }
        counts[spot.id].count++;
      }
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 spots
  }, [catches, spots]);

  // Seasonal data (catches by month across all years)
  const seasonalData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    const counts = new Array(12).fill(0);
    
    catches.forEach((c) => {
      const date = new Date(c.date || c.timestamp);
      counts[date.getMonth()]++;
    });
    
    return months.map((month, i) => ({ month, count: counts[i] }));
  }, [catches]);

  // Stats
  const stats = useMemo(() => {
    if (catches.length === 0) return null;
    
    const totalCatches = catches.length;
    const totalWeight = catches.reduce((sum, c) => sum + (c.weight || 0), 0);
    const avgWeight = totalWeight / totalCatches;
    
    // PB by weight
    const biggestByWeight = catches.reduce((max, c) => 
      (c.weight || 0) > (max.weight || 0) ? c : max, catches[0]);
    
    // PB by length
    const biggestByLength = catches.reduce((max, c) => 
      (c.length || 0) > (max.length || 0) ? c : max, catches[0]);
    
    const uniqueSpecies = new Set(catches.map((c) => c.species)).size;
    
    return {
      totalCatches,
      totalWeight: totalWeight.toFixed(2),
      avgWeight: avgWeight.toFixed(2),
      biggestWeightSpecies: biggestByWeight.species,
      biggestWeight: biggestByWeight.weight?.toFixed(2) || '-',
      biggestLengthSpecies: biggestByLength.species,
      biggestLength: biggestByLength.length?.toFixed(0) || '-',
      uniqueSpecies,
    };
  }, [catches]);

  if (catches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Noch keine Daten für Statistiken verfügbar.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">{stats.totalCatches}</p>
            <p className="text-xs text-gray-600">Gesamtfänge</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{stats.totalWeight}kg</p>
            <p className="text-xs text-gray-600">Gesamtgewicht</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-amber-700">{stats.avgWeight}kg</p>
            <p className="text-xs text-gray-600">Ø Gewicht</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-purple-700">{stats.uniqueSpecies}</p>
            <p className="text-xs text-gray-600">Fischarten</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-lg font-bold text-red-700">{stats.biggestWeight}kg</p>
            <p className="text-xs text-gray-600">PB Gewicht: {stats.biggestWeightSpecies}</p>
          </div>
          <div className="bg-cyan-50 p-4 rounded-lg">
            <p className="text-lg font-bold text-cyan-700">{stats.biggestLength}cm</p>
            <p className="text-xs text-gray-600">PB Länge: {stats.biggestLengthSpecies}</p>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catches over time */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Fänge über Zeit (letzte 12 Monate)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Species distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Fischarten-Verteilung</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={speciesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {speciesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top spots */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Gewässer</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spotData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonal pattern */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Saisonale Verteilung (alle Jahre)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
