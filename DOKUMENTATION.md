# CatchLog - Projekt-Dokumentation

## Überblick

**CatchLog** ist eine PWA (Progressive Web App) für Angler zum Dokumentieren von Fängen.

- **Live URL:** https://catchlog-omega.vercel.app
- **Repo:** https://github.com/FlorianKuehn96/catchlog
- **Tech Stack:** Next.js 16.1.7 + TypeScript + Tailwind CSS + Upstash Redis + NextAuth.js

---

## Architektur

```
/src
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth.js Konfiguration
│   │   ├── catches/       # CRUD für Fänge
│   │   ├── recommend/     # KI-Empfehlungen (deaktiviert für MVP)
│   │   ├── spots/         # Gewässer-Verwaltung
│   │   └── stats/         # Statistiken
│   ├── dashboard/         # Hauptseite (geschützt)
│   ├── login/            # Login-Seite
│   └── page.tsx          # Landing Page
├── components/            # React Komponenten
│   ├── CatchForm.tsx     # Fang-Formular (neu/bearbeiten)
│   ├── CatchList.tsx     # Liste der Fänge
│   ├── CatchMap.tsx      # Karte mit Leaflet
│   ├── StatsPanel.tsx     # Statistik-Panel
│   └── RecommendPanel.tsx # KI-Empfehlungen
├── lib/                   # Utilities
│   ├── env.ts            # Zod Schema für Env-Variablen
│   ├── redis.ts          # Redis Client (lazy init)
│   ├── sunposition.ts    # Sonnenstand-Berechnung
│   └── utils.ts          # Hilfsfunktionen
└── types/                 # TypeScript Interfaces
    └── index.ts          # Catch, Spot, User, etc.
```

---

## Datenmodell

### Catch (Fang)
```typescript
{
  id: string;           // UUID
  userId: string;        // User-ID
  spotId: string;        // Gewässer-ID
  lat: number;           // Kopie vom Spot (für Karte)
  lng: number;           // Kopie vom Spot (für Karte)
  species: string;       // Fischart
  length?: number;       // Länge in cm
  weight?: number;        // Gewicht in kg
  bait: string;          // Köder
  technique?: string;     // Technik
  weather: Weather;      // Wetterdaten
  timestamp: string;     // ISO Datetime
  date: string;          // YYYY-MM-DD (Filter)
  time: string;          // HH:MM (Anzeige)
  sunPosition?: SunPosition; // Sonnenstand
  notes?: string;        // Notizen
  photoUrl?: string;     // (deaktiviert für MVP)
}
```

### Spot (Gewässer)
```typescript
{
  id: string;
  userId: string;
  name: string;
  lat: number;
  lng: number;
  type: 'lake' | 'river' | 'pond' | 'canal' | 'sea';
  createdAt: string;
}
```

---

## Gewichtsberechnung

Standard-Formel für deutsche Süßwasserfische:
```
Gewicht (kg) = (Länge(cm)³) / Faktor
```

**Faktoren** (in `CatchForm.tsx`):
- Hecht: 3500
- Zander: 3000
- Barsch: 2700
- Karpfen: 3200
- Schleie: 3100
- Aal: 3000
- Forelle: 2800
- Wels: 4000
- (und weitere...)

---

## Redis Keys

```javascript
user:${email}           // User Daten
spot:${id}              // Einzelnes Gewässer
spots:${userId}         // Alle Gewässer eines Users
catch:${id}             // Einzelner Fang
catches:${userId}       // Alle Fang-IDs eines Users
catches:${spotId}       // Alle Fang-IDs eines Gewässers
```

**Wichtig:** Upstash Redis gibt bereits geparste Objekte zurück - kein doppeltes `JSON.parse()`!

```typescript
// Richtig:
const data = await redis.get(key);
const obj = typeof data === 'string' ? JSON.parse(data) : data;

// Oder einfach:
const obj = data as Catch; // Upstash gibt schon Objekte zurück
```

---

## Environment Variables

Siehe `.env.example`:

```bash
# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# NextAuth
NEXTAUTH_URL=https://catchlog-omega.vercel.app
NEXTAUTH_SECRET=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Cloudinary (deaktiviert für MVP)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## Features

### Aktiviert (MVP)
- ✅ Fang dokumentieren (mit/b ohne Gewicht, Foto deaktiviert)
- ✅ Gewässer anlegen (inkl. GPS-Erkennung)
- ✅ Letztes Gewässer vorausfüllen
- ✅ Automatische Gewichtsberechnung
- ✅ Karte mit Leaflet (alle Fänge anzeigen)
- ✅ Statistiken (gesamt, pro Art, pro Gewässer)
- ✅ PWA (offline-fähig)
- ✅ Editieren/Löschen von Fängen
- ✅ Sonnenstand-Berechnung

### Deaktiviert (post-MVP)
- ⏸️ Stripe-Zahlungen (Pro-Tier)
- ⏸️ KI-Empfehlungen (`/api/recommend` existiert aber ist nicht verlinkt)
- ⏸️ Foto-Upload (UI zeigt "temporär deaktiviert")

---

## Deployment

**Vercel:**
```bash
vercel --prod
```

**Environment in Vercel:**
- Alle Secrets müssen in Vercel Dashboard gesetzt werden
- `NEXTAUTH_URL` muss auf Produktions-URL zeigen

---

## Bekannte Issues

1. **Foto-Upload deaktiviert** - Cloudinary Integration existiert aber ist nicht aktiv
2. **Keine echten Zahlungen** - Stripe Code existiert, ist aber nicht verlinkt
3. **KI-Empfehlungen** - API Route existiert, wird aber nicht genutzt

---

## Roadmap

### Phase 1 (MVP) - Aktuell
- [x] Grundfunktionen
- [x] PWA
- [x] Karte
- [x] Offline-Modus

### Phase 2
- [ ] Foto-Upload aktivieren
- [ ] KI-Empfehlungen verlinken
- [ ] Export-Funktion (CSV/JSON)
- [ ] Filter/Suche in Fang-Liste

### Phase 3
- [ ] Stripe-Zahlungen
- [ ] Pro-Tier mit Limits
- [ ] Soziale Features (Teilen)
- [ ] Mobile App (Capacitor)

---

## Commands

```bash
# Dev
npm run dev

# Build
npm run build

# Production deploy
vercel --prod

# Git
git add -A
git commit -m "..."
git push origin main
```

---

## Wichtige Dateien

| Datei | Zweck |
|-------|-------|
| `src/app/dashboard/page.tsx` | Haupt-Dashboard mit Tabs |
| `src/components/CatchForm.tsx` | Fang-Formular (komplex!) |
| `src/components/CatchMap.tsx` | Leaflet-Karte |
| `src/lib/redis.ts` | Redis Initialisierung |
| `src/types/index.ts` | TypeScript Interfaces |
| `public/sw.js` | Service Worker (PWA) |
| `public/manifest.json` | PWA Manifest |

---

## Last Updated

2026-03-17 - PWA aktiviert, Textfarben gefixt

## Kontext für Agent

- Nutzer: Florian (Angler, Deutschland)
- Projekt: CatchLog MVP
- Kein Stripe für MVP
- Foto-Upload ist deaktiviert (technisch vorhanden)
- Gewicht wird automatisch berechnet
- Letztes Gewässer wird vorausgefüllt
- App ist als PWA installierbar
