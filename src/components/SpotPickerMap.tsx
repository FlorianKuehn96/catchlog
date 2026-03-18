'use client';

import { useEffect, useRef, useState } from 'react';

// Dynamischer Import für Leaflet (Client-only)
let L: any = null;

interface SpotPickerMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
}

export function SpotPickerMap({ onLocationSelect, height = '400px' }: SpotPickerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [error, setError] = useState('');

  // Karte initialisieren
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

        // Klick-Handler für Standort-Auswahl
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          
          // Marker aktualisieren oder erstellen
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            const redIcon = L.divIcon({
              className: 'spot-picker-marker',
              html: `<div style="
                width: 24px;
                height: 24px;
                background: #ef4444;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              "></div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });
            
            markerRef.current = L.marker([lat, lng], { icon: redIcon }).addTo(map);
          }
          
          // Kurze Verzögerung, dann zurückgeben
          setTimeout(() => {
            onLocationSelect(lat, lng);
          }, 300);
        });

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
  }, [onLocationSelect]);

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
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
