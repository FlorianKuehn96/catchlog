'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    // TODO: Stripe Checkout Session erstellen
    setMessage('Upgrade wird vorbereitet... (Stripe Integration folgt)');
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!confirm('Möchtest du dein Abo wirklich kündigen?')) return;
    
    setLoading(true);
    // TODO: Stripe Subscription canceln
    setMessage('Abo-Kündigung wird verarbeitet... (Stripe Integration folgt)');
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('ACHTUNG: Dein Account wird unwiderruflich gelöscht. Alle Daten gehen verloren. Fortfahren?')) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' });
      if (res.ok) {
        await signOut({ callbackUrl: '/' });
      } else {
        setMessage('Fehler beim Löschen des Accounts');
      }
    } catch (err) {
      setMessage('Ein Fehler ist aufgetreten');
    }
    setLoading(false);
  };

  const isPro = (session?.user as any)?.subscription === 'pro';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profil</h1>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg">
          {message}
        </div>
      )}

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Account-Informationen</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-500">Name</label>
            <p className="font-medium">{session?.user?.name || '–'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">E-Mail</label>
            <p className="font-medium">{session?.user?.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Aktueller Plan</label>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isPro ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {isPro ? 'Pro' : 'Free'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Management */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Abonnement</h2>
        
        {!isPro ? (
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">Upgrade auf Pro</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Unbegrenzte Fänge, KI-Empfehlungen, Wetter-Prognose, Export
                </p>
              </div>
              <span className="text-2xl font-bold text-blue-600">€4.99</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>✓ Unbegrenzte Fänge</li>
              <li>✓ KI-Empfehlungen</li>
              <li>✓ Wetter-Prognose</li>
              <li>✓ Export-Funktion</li>
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Lädt...' : 'Jetzt upgraden'}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              (Stripe-Integration folgt in Phase 2)
            </p>
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold">Pro-Abo aktiv</h3>
                <p className="text-sm text-gray-600">Monatlich €4.99</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                Aktiv
              </span>
            </div>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="w-full py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
            >
              {loading ? 'Lädt...' : 'Abo kündigen'}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              (Stripe-Integration folgt in Phase 2)
            </p>
          </div>
        )}
      </div>

      {/* Account Deletion */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-red-600">Gefahrenzone</h2>
        
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
          >
            Account löschen
          </button>
        ) : (
          <div className="border border-red-300 rounded-lg p-4 bg-red-50">
            <p className="text-red-700 mb-4">
              ⚠️ Diese Aktion kann nicht rückgängig gemacht werden!
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {loading ? 'Löschen...' : 'Ja, Account löschen'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 border rounded-lg"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-gray-500 hover:text-gray-700"
        >
          Ausloggen
        </button>
      </div>
    </div>
  );
}
