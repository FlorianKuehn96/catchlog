'use client';

import { useEffect, useRef, useState } from 'react';
import type { Catch } from '@/types';

// Dynamischer Import für Leaflet (Client-only)
let L: any = null;

interface CatchMapProps {
  catches: Catch[];
  height?: string;
}

export function CatchMap({ catches, height = '400px' }: CatchMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Nur auf Client rendern
    if (typeof window === 'undefined') return;

    const initMap = async () => {
      try {
        // Dynamischer Import
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

        // Karte initialisieren
        const map = L.map(mapRef.current).setView([51.1657, 10.4515], 6); // Deutschland Zentrum

        // OpenStreetMap Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        leafletMap.current = map;
        setIsLoading(false);
      } catch (err) {
        console.error('Map init error:', err);
        setError('Karte konnte nicht geladen werden');
        setIsLoading(false);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Marker aktualisieren wenn sich catches ändern
  useEffect(() => {
    console.log('CatchMap: catches updated:', catches.length, 'catches');
    
    if (!L || !leafletMap.current) {
      console.log('CatchMap: Map not ready yet');
      return;
    }

    // Alte Marker entfernen
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Catches mit Koordinaten filtern
    const catchesWithCoords = catches.filter(
      (c) => typeof c.lat === 'number' && typeof c.lng === 'number' && c.lat !== 0 && c.lng !== 0
    );
    
    console.log('CatchMap: catches with coords:', catchesWithCoords.length);

    if (catchesWithCoords.length === 0) {
      console.log('CatchMap: No catches with valid coordinates');
      return;
    }

    // Marker erstellen
    const bounds = L.latLngBounds();

    catchesWithCoords.forEach((catchItem) => {
      const { lat, lng, spot, species, length, weight, date, time } = catchItem;
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

    // Karte auf alle Marker zoomen
    if (catchesWithCoords.length > 1) {
      leafletMap.current.fitBounds(bounds, { padding: [50, 50] });
    } else if (catchesWithCoords.length === 1) {
      const { lat, lng } = catchesWithCoords[0];
      leafletMap.current.setView([lat, lng], 13);
    }
  }, [catches]);

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
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <p className="text-gray-500">Karte wird geladen...</p>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
