'use client';

import { useEffect, useRef, useState } from 'react';
import type { Catch, Spot } from '@/types';

// Dynamischer Import für Leaflet (Client-only)
let L: any = null;

interface CatchMapProps {
  catches: Catch[];
  spots?: Spot[];
  height?: string;
}

export function CatchMap({ catches, spots = [], height = '400px' }: CatchMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Karte initialisieren (einmalig)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initMap = async () => {
      try {
        const leaflet = await import('leaflet');
        L = leaflet.default;

        // Leaflet CSS laden
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        if (!mapRef.current || leafletMap.current) return;

        const map = L.map(mapRef.current).setView([51.1657, 10.4515], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        leafletMap.current = map;
        setIsMapReady(true);
      } catch (err) {
        console.error('Map init error:', err);
        setError('Karte konnte nicht geladen werden');
      }
    };

    initMap();

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Marker aktualisieren wenn Map ready ODER catches sich ändern
  useEffect(() => {
    console.log('CatchMap: isMapReady:', isMapReady, 'catches:', catches.length);
    
    if (!L || !leafletMap.current || !isMapReady) {
      console.log('CatchMap: waiting for map to be ready...');
      return;
    }

    // Alte Marker entfernen
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Gewässer als blaue Pins hinzufügen
    const spotsWithCoords = spots.filter(
      (s) => typeof s.lat === 'number' && typeof s.lng === 'number' && s.lat !== 0 && s.lng !== 0
    );
    
    // Blaues Icon für Gewässer
    const blueIcon = L.divIcon({
      className: 'custom-spot-marker',
      html: `<div style="
        width: 24px;
        height: 24px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
      ">💧</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    spotsWithCoords.forEach((spot) => {
      const { lat, lng, name, type } = spot;
      if (lat == null || lng == null) return;

      const marker = L.marker([lat, lng], { icon: blueIcon })
        .addTo(leafletMap.current)
        .bindPopup(`
          <div class="p-2">
            <h4 class="font-bold text-blue-600">${name}</h4>
            <p class="text-sm text-gray-600">${type === 'river' ? 'Fluss' : type === 'lake' ? 'See' : 'Gewässer'}</p>
          </div>
        `);

      markersRef.current.push(marker);
    });

    // Catches mit gültigen Koordinaten filtern (bevorzuge Fang-Koordinaten)
    const catchesWithCoords = catches.filter(
      (c) => {
        // Bevorzuge catchLat/catchLng, sonst fallback zu spot lat/lng
        const lat = c.catchLat ?? c.lat;
        const lng = c.catchLng ?? c.lng;
        return typeof lat === 'number' && typeof lng === 'number' && lat !== 0 && lng !== 0;
      }
    );
    
    console.log('CatchMap: catches with valid coords:', catchesWithCoords.length);

    if (catchesWithCoords.length === 0) {
      console.log('CatchMap: no catches with coordinates');
      return;
    }

    // Marker erstellen
    const bounds = L.latLngBounds();

    catchesWithCoords.forEach((catchItem) => {
      // Bevorzuge Fang-Koordinaten, sonst Spot-Koordinaten
      const lat = catchItem.catchLat ?? catchItem.lat;
      const lng = catchItem.catchLng ?? catchItem.lng;
      const { spot, species, length, weight, date, time } = catchItem;
      if (lat == null || lng == null) return;

      const marker = L.marker([lat, lng])
        .addTo(leafletMap.current)
        .bindPopup(`
          <div class="p-2">
            <h4 class="font-bold text-gray-900">${species}</h4>
            <p class="text-sm text-gray-600">${spot?.name || 'Unbekanntes Gewässer'}</p>
            <hr class="my-2">
            ${length ? `<p class="text-sm">📏 ${length} cm</p>` : ''}
            ${weight ? `<p class="text-sm">⚖️ ${weight} kg</p>` : ''}
            <p class="text-xs text-gray-500 mt-2">📅 ${date} ${time}</p>
          </div>
        `);

      markersRef.current.push(marker);
      bounds.extend([lat, lng]);
    });

    console.log('CatchMap: created', markersRef.current.length, 'markers');

    // Karte auf alle Marker zoomen (Spots + Catches)
    if (spotsWithCoords.length > 0 || catchesWithCoords.length > 0) {
      if (spotsWithCoords.length > 0) {
        spotsWithCoords.forEach((s) => bounds.extend([s.lat, s.lng]));
      }
      if (catchesWithCoords.length > 0) {
        catchesWithCoords.forEach((c) => bounds.extend([c.lat, c.lng]));
      }
      leafletMap.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [catches, spots, isMapReady]);

  // Standort abrufen
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation wird nicht unterstützt');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        if (leafletMap.current && L) {
          // Alten User-Marker entfernen
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }
          
          // Grünes Icon für eigenen Standort
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `<div style="
              width: 20px;
              height: 20px;
              background: #22c55e;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(leafletMap.current)
            .bindPopup('<div class="p-2"><p class="font-semibold text-green-600">📍 Dein Standort</p></div>');

          // Auf Standort zoomen
          leafletMap.current.setView([latitude, longitude], 14);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Standort konnte nicht ermittelt werden');
      }
    );
  };

  if (error) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden" style={{ height }}>
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <p className="text-gray-500">Karte wird geladen...</p>
        </div>
      )}
      
      {/* Standort-Button */}
      {isMapReady && (
        <button
          onClick={getUserLocation}
          className="absolute top-3 right-3 z-[1000] bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 active:scale-95 transition-all border border-gray-200"
          title="Meinen Standort anzeigen"
          style={{ position: 'absolute' }}
        >
          <span className="text-2xl">📍</span>
        </button>
      )}
      
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
