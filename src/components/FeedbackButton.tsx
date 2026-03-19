"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function FeedbackButton() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: "bug", label: "🐛 Fehler gefunden", color: "bg-red-100 text-red-800" },
    { id: "feature", label: "✨ Feature-Idee", color: "bg-blue-100 text-blue-800" },
    { id: "improvement", label: "💡 Verbesserung", color: "bg-green-100 text-green-800" },
    { id: "general", label: "💬 Sonstiges", color: "bg-gray-100 text-gray-800" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !category || !feedback.trim()) return;

    setLoading(true);
    
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          category,
          feedback,
          userEmail: session?.user?.email || "anonymous",
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
          setRating(0);
          setCategory("");
          setFeedback("");
        }, 3000);
      }
    } catch (error) {
      console.error("Feedback error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50 flex items-center gap-2"
        title="Feedback geben"
      >
        <span className="text-2xl">💬</span>
        <span className="hidden sm:inline font-medium">Feedback</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {submitted ? "Danke! 🎉" : "Dein Feedback"}
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🙏</div>
              <p className="text-gray-700 mb-2">
                Dein Feedback hilft uns, CatchLog besser zu machen!
              </p>
              <p className="text-sm text-gray-500">
                Bei Fragen melde dich gerne: florian@catchlog.app
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wie gefällt dir CatchLog?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-all hover:scale-110 ${
                        rating >= star ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {rating === 1 && "😞 Braucht Arbeit"}
                  {rating === 2 && "😐 Geht so"}
                  {rating === 3 && "🙂 Gut"}
                  {rating === 4 && "😊 Sehr gut"}
                  {rating === 5 && "🤩 Perfekt"}
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Was möchtest du uns sagen?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2 rounded-lg text-sm font-medium transition-all ${
                        category === cat.id
                          ? `${cat.color} ring-2 ring-offset-2 ring-blue-500`
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deine Nachricht
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder={
                    category === "bug"
                      ? "Beschreibe den Fehler... Was hast du gemacht? Was ist passiert?"
                      : category === "feature"
                      ? "Welche Funktion wünschst du dir?"
                      : category === "improvement"
                      ? "Was können wir besser machen?"
                      : "Dein Feedback..."
                  }
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!rating || !category || !feedback.trim() || loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Wird gesendet..." : "Feedback senden"}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Beta-Phase: Danke für deine Hilfe bei CatchLog! 🎣
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
