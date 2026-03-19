'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Initialize edit states when session loads
  useEffect(() => {
    if (session?.user) {
      setEditName(session.user.name || '');
      setEditImage((session.user as any).image || '');
    }
  }, [session]);

  const handleSaveProfile = async () => {
    setEditLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim() || null,
          image: editImage.trim() || null,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Update local session
        await updateSession();
        setIsEditing(false);
        setMessage('✓ Profil erfolgreich aktualisiert');
      } else {
        setMessage(`Fehler: ${data.error || 'Aktualisierung fehlgeschlagen'}`);
      }
    } catch (err: any) {
      setMessage(`Netzwerkfehler: ${err.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(session?.user?.name || '');
    setEditImage((session?.user as any)?.image || '');
    setIsEditing(false);
  };

  const handleUpgrade = async () => {
    setLoading(true);
    setMessage('Upgrade wird vorbereitet... (Stripe Integration folgt)');
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!confirm('Möchtest du dein Abo wirklich kündigen?')) return;
    
    setLoading(true);
    setMessage('Abo-Kündigung wird verarbeitet... (Stripe Integration folgt)');
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('ACHTUNG: Dein Account wird unwiderruflich gelöscht. Alle Daten gehen verloren. Fortfahren?')) return;
    
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/user/delete', { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json().catch(() => ({ error: 'Unbekannter Fehler' }));
      
      if (res.ok) {
        await signOut({ callbackUrl: '/' });
      } else {
        setMessage(`Fehler: ${data.error || res.statusText} (${res.status})`);
      }
    } catch (err: any) {
      setMessage(`Netzwerkfehler: ${err.message}`);
    }
    setLoading(false);
  };

  const isPro = (session?.user as any)?.subscription === 'pro';
  const userImage = (session?.user as any)?.image;

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="text-xl">←</span>
          <span className="hidden sm:inline">Zurück</span>
        </Link>
        <h1 className="text-2xl font-bold">Profil</h1>
      </div>
      
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.startsWith('Fehler:') || message.startsWith('Netzwerkfehler:')
            ? 'bg-red-50 text-red-700'
            : 'bg-green-50 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold">Profil-Informationen</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded hover:bg-blue-50"
            >
              ✏️ Bearbeiten
            </button>
          )}
        </div>

        {!isEditing ? (
          // View Mode
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {userImage ? (
                <img
                  src={userImage}
                  alt="Profilbild"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(session?.user?.name || '?')}
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 space-y-3">
              <div>
                <label className="text-sm text-gray-500">Anzeige-Name</label>
                <p className="font-medium text-lg">{session?.user?.name || '–'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">E-Mail</label>
                <p className="font-medium text-gray-700">{session?.user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Aktueller Plan</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isPro ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {isPro ? 'Pro' : 'Free'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-4">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4">
              {editImage ? (
                <img
                  src={editImage}
                  alt="Vorschau"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(editName || '?')}
                </div>
              )}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profilbild URL
                </label>
                <input
                  type="url"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  placeholder="https://example.com/bild.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bild-URL eingeben oder leer lassen für Initialen-Avatar
                </p>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anzeige-Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Dein Name"
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            {/* E-Mail (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail (nicht änderbar)
              </label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={editLoading}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {editLoading ? 'Speichern...' : '💾 Speichern'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={editLoading}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
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
