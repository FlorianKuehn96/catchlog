'use client';

import { useState } from 'react';

interface UpgradeButtonProps {
  isPro: boolean;
}

export function UpgradeButton({ isPro }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current', email: 'current' }),
      });
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isPro) {
    return (
      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
        Pro
      </span>
    );
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
    >
      {loading ? 'Lade...' : 'Upgrade auf Pro'}
    </button>
  );
}
