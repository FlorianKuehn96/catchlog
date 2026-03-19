"use client";

import { useEffect, useState } from "react";

interface Feedback {
  id: string;
  rating: number;
  category: string;
  feedback: string;
  userEmail: string;
  timestamp: string;
}

interface Stats {
  total: number;
  categories: { category: string; count: number }[];
  ratings: { rating: number; count: number }[];
  averageRating: number;
}

export default function FeedbackDashboard() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ category?: string; rating?: number }>({});

  useEffect(() => {
    loadFeedback();
  }, [filter]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.category) params.append("category", filter.category);
      if (filter.rating) params.append("rating", filter.rating.toString());

      const response = await fetch(`/api/feedback?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setFeedbacks(data.feedbacks);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error loading feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      bug: "🐛",
      feature: "✨",
      improvement: "💡",
      general: "💬",
    };
    return emojis[category] || "💬";
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      bug: "Fehler",
      feature: "Feature",
      improvement: "Verbesserung",
      general: "Sonstiges",
    };
    return labels[category] || category;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Feedback Dashboard</h1>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Gesamt</p>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Durchschnitt</p>
              <p className="text-3xl font-bold text-yellow-500">
                {stats.averageRating} ★
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Features</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.categories.find((c) => c.category === "feature")?.count || 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Bugs</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.categories.find((c) => c.category === "bug")?.count || 0}
              </p>
            </div>
          </div>
        )}

        {/* Rating Distribution */}
        {stats && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bewertungs-Verteilung</h2>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count =
                  stats.ratings.find((r) => r.rating === rating)?.count || 0;
                const percentage =
                  stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-4">
                    <span className="w-12 text-sm font-medium">
                      {rating} ★
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-yellow-400 h-4 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-16 text-sm text-gray-600 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategorie
              </label>
              <select
                value={filter.category || ""}
                onChange={(e) =>
                  setFilter({ ...filter, category: e.target.value || undefined })
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Alle</option>
                <option value="bug">🐛 Fehler</option>
                <option value="feature">✨ Feature</option>
                <option value="improvement">💡 Verbesserung</option>
                <option value="general">💬 Sonstiges</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bewertung
              </label>
              <select
                value={filter.rating || ""}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    rating: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Alle</option>
                <option value="5">5 ★</option>
                <option value="4">4 ★</option>
                <option value="3">3 ★</option>
                <option value="2">2 ★</option>
                <option value="1">1 ★</option>
              </select>
            </div>

            <button
              onClick={() => setFilter({})}
              className="self-end bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-gray-600">Lade Feedback...</p>
          ) : feedbacks.length === 0 ? (
            <p className="text-gray-600">Noch kein Feedback vorhanden.</p>
          ) : (
            feedbacks.map((fb) => (
              <div key={fb.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getCategoryEmoji(fb.category)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        fb.category === "bug"
                          ? "bg-red-100 text-red-800"
                          : fb.category === "feature"
                          ? "bg-blue-100 text-blue-800"
                          : fb.category === "improvement"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getCategoryLabel(fb.category)}
                    </span>
                    <span className="text-yellow-500">
                      {"★".repeat(fb.rating)}
                      {"☆".repeat(5 - fb.rating)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(fb.timestamp)}
                  </span>
                </div>

                <p className="text-gray-700 mb-2 whitespace-pre-wrap">{fb.feedback}</p>

                <p className="text-sm text-gray-500">
                  Von: {fb.userEmail === "anonymous" ? "Gast" : fb.userEmail}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
