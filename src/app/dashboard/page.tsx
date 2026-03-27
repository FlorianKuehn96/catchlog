'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { CatchForm } from '@/components/CatchForm';
import { Recommend } from '@/components/Recommend';
import { CatchMap } from '@/components/CatchMap';
import { SpotPickerMap } from '@/components/SpotPickerMap';
import { CatchCharts } from '@/components/CatchCharts';
import { Spot, Catch } from '@/types';
import { useOfflineCatches, useOfflineSpots, useSync, useNetworkStatus } from '@/lib/offline';

// Extended catch type with spot data
interface CatchWithSpot extends Catch {
  spot?: Spot;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const { isOnline } = useNetworkStatus();
  const { catches: offlineCatches, loading: catchesLoading, error: catchesError, refresh: refreshCatches, createCatch, deleteCatch } = useOfflineCatches();
  const { spots: offlineSpots, loading: spotsLoading, error: spotsError, refresh: refreshSpots, createSpot, deleteSpot } = useOfflineSpots();
  const { sync, isSyncing, pendingCount } = useSync();
  
  // Local state
  const [spots, setSpots] = useState<Spot[]>([]);
  const [catches, setCatches] = useState<CatchWithSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'catches' | 'spots' | 'map' | 'recommend' | 'stats'>('catches');
  const [showAddSpot, setShowAddSpot] = useState(false);
  const [newSpotName, setNewSpotName] = useState('');
  const [newSpotType, setNewSpotType] = useState<Spot['type']>('lake');
  const [newSpotLat, setNewSpotLat] = useState<number | ''>('');
  const [newSpotLng, setNewSpotLng] = useState<number | ''>('');
  const [showSpotMapPicker, setShowSpotMapPicker] = useState(false);
  const [editingCatch, setEditingCatch] = useState<Catch | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Filter states
  const [filterSpecies, setFilterSpecies] = useState<string>('');
  const [filterSpot, setFilterSpot] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [useOfflineFallback, setUseOfflineFallback] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load data - try offline hooks first, fallback to original method
  const loadData = async () => {
    try {
      // Try to use offline hooks
      const localSpots = offlineSpots;
      const localCatches = offlineCatches;
      
      // Enrich catches with spot data
      const catchesWithSpots: CatchWithSpot[] = localCatches.map(c => ({
        ...c,
        spot: localSpots.find(s => s.id === c.spotId),
        // Ensure required weather property exists
        weather: c.weather || {
          temp: 15,
          pressure: 1013,
          windSpeed: 10,
          windDirection: 180,
          conditions: 'Unbekannt',
        },
      }));

      setSpots(localSpots);
      setCatches(catchesWithSpots);
      
      // If offline hooks are empty and we're online, try server
      if (isOnline && localCatches.length === 0 && localSpots.length === 0) {
        // Fallback to server fetch
        try {
          const [spotsRes, catchesRes] = await Promise.all([
            fetch('/api/spots'),
            fetch('/api/catches'),
          ]);

          if (spotsRes.ok && catchesRes.ok) {
            const spotsData = await spotsRes.json();
            const catchesData = await catchesRes.json();
            
            setSpots(spotsData.spots || []);
            setCatches((catchesData.catches || []).map((c: Catch) => ({
              ...c,
              spot: spotsData.spots?.find((s: Spot) => s.id === c.spotId),
            })));
          }
        } catch (err) {
          console.log('Server fetch failed, using offline data');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [offlineCatches, offlineSpots, isOnline]);

  const handleAddSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpotName) return;

    // Wenn Koordinaten manuell gesetzt wurden, verwende diese
    if (newSpotLat !== '' && newSpotLng !== '') {
      try {
        await createSpot({
          name: newSpotName,
          lat: Number(newSpotLat),
          lng: Number(newSpotLng),
          type: newSpotType,
        });

        setNewSpotName('');
        setNewSpotLat('');
        setNewSpotLng('');
        setShowAddSpot(false);
        await refreshSpots();
      } catch (err: any) {
        setError(err.message);
      }
      return;
    }

    // Sonst GPS-Standort verwenden
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await createSpot({
            name: newSpotName,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            type: newSpotType,
          });

          setNewSpotName('');
          setNewSpotLat('');
          setNewSpotLng('');
          setShowAddSpot(false);
          await refreshSpots();
        } catch (err: any) {
          setError(err.message);
        }
      },
      () => {
        setError('Standort konnte nicht ermittelt werden. Bitte wähle einen Standort auf der Karte.');
      }
    );
  };

  const handleDeleteCatch = async (id: string) => {
    if (!confirm('Fang wirklich löschen?')) return;
    
    try {
      await deleteCatch(id);
      await refreshCatches();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteSpot = async (id: string) => {
    if (!confirm('Gewässer wirklich löschen?')) return;
    
    try {
      await deleteSpot(id);
      await refreshSpots();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditCatch = (c: Catch) => {
    setEditingCatch(c);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditSuccess = () => {
    setEditingCatch(undefined);
    refreshCatches();
  };

  // Filter logic
  const filteredCatches = catches.filter((c) => {
    // Species filter
    if (filterSpecies && c.species !== filterSpecies) return false;
    
    // Spot filter
    if (filterSpot && c.spotId !== filterSpot) return false;
    
    // Date range filter
    if (filterDateFrom && c.date && c.date < filterDateFrom) return false;
    if (filterDateTo && c.date && c.date > filterDateTo) return false;
    
    // Search query (species, spot name, bait, technique)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const spotName = spots.find(s => s.id === c.spotId)?.name || '';
      const searchableText = [
        c.species,
        spotName,
        c.bait,
        c.technique,
        c.notes,
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) return false;
    }
    
    return true;
  });

  // Get unique species for filter dropdown
  const uniqueSpecies = Array.from(new Set(catches.map(c => c.species))).sort();

  // Format sun position for display
  const formatSunPosition = (sunPos?: Catch['sunPosition']) => {
    if (!sunPos) return null;
    
    const { hoursFromSunrise, hoursFromSunset, phase } = sunPos;
    
    if (phase === 'dawn') return '🌅 Morgendämmerung';
    if (phase === 'dusk') return '🌆 Abenddämmerung';
    if (phase === 'night') return '🌙 Nacht';
    
    // Daytime
    if (hoursFromSunrise >= 0 && hoursFromSunrise < 1) return '🌅 Direkt nach Sonnenaufgang';
    if (hoursFromSunset <= 0 && hoursFromSunset > -1) return '🌆 Direkt vor Sonnenuntergang';
    
    if (hoursFromSunrise >= 0) {
      return `☀️ ${Math.round(hoursFromSunrise * 10) / 10}h nach Sonnenaufgang`;
    } else {
      return `☀️ ${Math.round(Math.abs(hoursFromSunrise) * 10) / 10}h vor Sonnenaufgang`;
    }
  };

  if (loading || catchesLoading || spotsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">🎣 CatchLog</h1>
          
          {/* Offline status indicator in header */}
          <div className="flex items-center gap-4">
            {!isOnline && (
              <span className="text-sm text-amber-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Offline
              </span>
            )}
            {pendingCount > 0 && (
              <button
                onClick={sync}
                disabled={isSyncing}
                className="text-sm text-blue-600 flex items-center gap-1 hover:text-blue-700 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {pendingCount} ausstehend
              </button>
            )}
            <div className="flex items-center gap-2" ref={menuRef}>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl">👤</span>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {session?.user?.name || 'Menu'}
                  </span>
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                        {session?.user?.image ? (
                          <img 
                            src={session.user.image} 
                            alt="" 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          '👤'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {session?.user?.name || 'Profil'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {session?.user?.email || ''}
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/privacy"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>🛡️</span>
                      <span>Datenschutz</span>
                    </Link>

                    <Link
                      href="/impressum"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>📋</span>
                      <span>Impressum</span>
                    </Link>

                    <Link
                      href="/cookies"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>🍪</span>
                      <span>Cookies</span>
                    </Link>

                    <Link
                      href="/faq"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>❓</span>
                      <span>FAQ</span>
                    </Link>

                    <Link
                      href="/personal-bests"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>🏆</span>
                      <span>Meine Rekorde</span>
                    </Link>

                    <Link
                      href="/gallery"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      <span>📸</span>
                      <span>Fang-Galerie</span>
                    </Link>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        window.location.href = '/';
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span>🚪</span>
                      <span>Ausloggen</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {(error || catchesError || spotsError) && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error || catchesError || spotsError}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-1">
            {editingCatch ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800 font-medium mb-2">
                  ✏️ Bearbeite Fang: {editingCatch.species}
                </p>
                <CatchForm
                  spots={spots}
                  catches={catches}
                  initialCatch={editingCatch}
                  onSuccess={handleEditSuccess}
                  onCancel={() => setEditingCatch(undefined)}
                />
              </div>
            ) : (
              <CatchForm 
                key={formKey}
                spots={spots} 
                catches={catches} 
                onSuccess={async () => {
                  await refreshCatches();
                  setFormKey(prev => prev + 1);
                }} 
              />
            )}
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 flex-wrap">
              {[
                { key: 'catches', label: `Meine Fänge (${catches.length})` },
                { key: 'spots', label: `Gewässer (${spots.length})` },
                { key: 'map', label: '🗺️ Karte' },
                { key: 'stats', label: '📊 Statistik' },
                { key: 'recommend', label: '💡 Empfehlung' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'catches' && (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-lg shadow space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="🔍 Suche nach Fisch, Gewässer, Köder..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  {/* Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <span>{showFilters ? '▼' : '▶'}</span>
                    <span>Filter {showFilters ? 'ausblenden' : 'anzeigen'}</span>
                    {(filterSpecies || filterSpot || filterDateFrom || filterDateTo) && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                        Aktiv
                      </span>
                    )}
                  </button>
                  
                  {/* Filter Panel */}
                  {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Fischart</label>
                        <select
                          value={filterSpecies}
                          onChange={(e) => setFilterSpecies(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Alle Fischarten</option>
                          {uniqueSpecies.map((species) => (
                            <option key={species} value={species}>{species}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Gewässer</label>
                        <select
                          value={filterSpot}
                          onChange={(e) => setFilterSpot(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Alle Gewässer</option>
                          {spots.map((spot) => (
                            <option key={spot.id} value={spot.id}>{spot.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Von Datum</label>
                        <input
                          type="date"
                          value={filterDateFrom}
                          onChange={(e) => setFilterDateFrom(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Bis Datum</label>
                        <input
                          type="date"
                          value={filterDateTo}
                          onChange={(e) => setFilterDateTo(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Clear Filters */}
                  {(filterSpecies || filterSpot || filterDateFrom || filterDateTo || searchQuery) && (
                    <button
                      onClick={() => {
                        setFilterSpecies('');
                        setFilterSpot('');
                        setFilterDateFrom('');
                        setFilterDateTo('');
                        setSearchQuery('');
                      }}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      ❌ Alle Filter zurücksetzen
                    </button>
                  )}
                  
                  {/* Results count */}
                  <p className="text-sm text-gray-500">
                    {filteredCatches.length} von {catches.length} Fängen angezeigt
                  </p>
                </div>
                
                {filteredCatches.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {catches.length === 0 
                      ? 'Noch keine Fänge eingetragen. Fang an!' 
                      : 'Keine Fänge mit diesen Filtern gefunden.'}
                  </p>
                ) : (
                  filteredCatches.map((c) => (
                    <div key={c.id} className="bg-white p-4 rounded-lg shadow">
                      <div className="flex gap-4">
                        {c.photoUrl && (
                          <img
                            src={c.photoUrl}
                            alt={c.species}
                            className="w-24 h-24 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{c.species}</h4>
                              <p className="text-sm text-gray-500">
                                {c.spot?.name} • {c.date || new Date(c.timestamp).toLocaleDateString('de-DE')} {c.time}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {c.length && `📏 ${c.length}cm `}
                                {c.weight && `⚖️ ${c.weight}kg `}
                                {c.bait && `• ${c.bait}`}
                              </p>
                              {c.sunPosition && (
                                <p className="text-xs text-amber-600 mt-1">
                                  {formatSunPosition(c.sunPosition)}
                                </p>
                              )}
                              {c.notes && (
                                <p className="text-sm text-gray-500 mt-1 italic">
                                  „{c.notes}"
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditCatch(c)}
                                className="text-blue-500 hover:text-blue-700 text-sm px-2 py-1"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteCatch(c.id)}
                                className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'spots' && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowAddSpot(true)}
                  className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  + Neues Gewässer hinzufügen
                </button>

                {showAddSpot && (
                  <form onSubmit={handleAddSpot} className="bg-white p-4 rounded-lg shadow">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newSpotName}
                        onChange={(e) => setNewSpotName(e.target.value)}
                        placeholder="Gewässername"
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                      <select
                        value={newSpotType}
                        onChange={(e) => setNewSpotType(e.target.value as Spot['type'])}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="lake">See</option>
                        <option value="river">Fluss</option>
                        <option value="pond">Teich</option>
                        <option value="canal">Kanal</option>
                        <option value="sea">Meer</option>
                      </select>
                      
                      {(newSpotLat !== '' || newSpotLng !== '') && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          📍 {newSpotLat !== '' ? Number(newSpotLat).toFixed(5) : '?'}, {newSpotLng !== '' ? Number(newSpotLng).toFixed(5) : '?'}
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => setShowSpotMapPicker(true)}
                        className="w-full py-2 px-4 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                      >
                        {newSpotLat !== '' ? '📍 Standort ändern' : '🗺️ Standort auf Karte wählen'}
                      </button>
                      
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-blue-600 text-white rounded-md"
                        >
                          Speichern
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddSpot(false);
                            setNewSpotLat('');
                            setNewSpotLng('');
                          }}
                          className="flex-1 py-2 bg-gray-200 rounded-md"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {spots.map((spot) => (
                  <div key={spot.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{spot.name}</h4>
                        <p className="text-sm text-gray-500">
                          {spot.type === 'lake' ? 'See' : 
                           spot.type === 'river' ? 'Fluss' :
                           spot.type === 'pond' ? 'Teich' :
                           spot.type === 'canal' ? 'Kanal' : 'Meer'}
                          {' '}• {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteSpot(spot.id)}
                        className="text-red-600 hover:text-red-800 text-sm px-2 py-1 hover:bg-red-50 rounded"
                        title="Gewässer löschen"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Karten-Picker für Gewässer */}
            {showSpotMapPicker && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Standort wählen</h3>
                    <button
                      onClick={() => setShowSpotMapPicker(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Klicke auf die Karte, um den Standort zu wählen
                    </p>
                    <SpotPickerMap
                      onLocationSelect={(lat, lng) => {
                        setNewSpotLat(lat);
                        setNewSpotLng(lng);
                        setShowSpotMapPicker(false);
                      }}
                      height="400px"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'map' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    🗺️ Fang-Karte
                  </h3>
                  <CatchMap catches={catches} spots={spots} height="500px" />
                  <div className="mt-4 flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
                      <span className="text-gray-600">Gewässer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
                      <span className="text-gray-600">Fänge</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => window.open('/api/export/csv', '_blank')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    CSV Exportieren
                  </button>
                </div>
                <CatchCharts catches={catches} spots={spots} />
              </div>
            )}

            {activeTab === 'recommend' && (
              <Recommend spots={spots} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}