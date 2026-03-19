# CatchLog 🎣

Dein digitaler Fangbericht für Angler. Speichere deine Angelerfolge mit Standort, Wetterdaten und Fotos. Erhalte KI-basierte Empfehlungen für den perfekten Fang.

**Live:** https://catchlog-omega.vercel.app

---

## 📋 Inhaltsverzeichnis

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architektur](#architektur)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [API Dokumentation](#api-dokumentation)
- [Datenmodell](#datenmodell)
- [Troubleshooting](#troubleshooting)
- [Changelog](#changelog)

---

## ✨ Features

### Core Features
- 📸 **Fang-Logging** mit Foto, GPS-Koordinaten, Wetter-Daten
- 📍 **Spot-Verwaltung** mit Geo-Suche in der Nähe
- 🤖 **KI-Köder-Empfehlung** basierend auf Wetter, Spot & Uhrzeit
- 📊 **Statistiken** - Fangrate, beste Zeiten, erfolgreichste Spots
- 🗺️ **Kartenansicht** mit allen Fängen und Spots
- 🏆 **Personal Bests** - Deine größten Fänge pro Art
- 📤 **CSV-Export** - Backup deiner Daten
- 📱 **PWA** - Installierbar als Mobile App

### DSGVO-Konform
- ✅ Datenschutzerklärung
- ✅ Cookie-Hinweis
- ✅ Impressum
- ✅ Account-Löschung

---

## 🛠 Tech Stack

| Layer | Technologie |
|-------|-------------|
| **Framework** | Next.js 16.1.7 + React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Auth** | NextAuth.js v5 (Google OAuth) |
| **Database** | Upstash Redis |
| **Images** | Cloudinary |
| **Maps** | Leaflet + OpenStreetMap |
| **Weather** | Open-Meteo API |
| **Validation** | Zod |
| **Hosting** | Vercel |

---

## 🏗 Architektur

```
┌─────────────────┐
│   Next.js App   │
│  (App Router)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐   ┌─▼──────────┐
│ Redis │   │ Cloudinary │
│(Data) │   │  (Images)  │
└───────┘   └────────────┘
    │
┌───▼───────────┐
│ Open-Meteo API│
│  (Weather)    │
└───────────────┘
```

### Datenfluss
1. **Auth:** Google OAuth → NextAuth → Redis (User-Session)
2. **Fang erstellen:** Form → API → Redis + Cloudinary (Foto)
3. **Wetter:** Spot-Koordinaten → Open-Meteo → Redis (Cache)
4. **Empfehlung:** Wetter + Spot + Uhrzeit → Algorithmus → Köder-Vorschlag

---

## 🚀 Quick Start

### Voraussetzungen
- Node.js 20+
- npm oder yarn
- Git

### 1. Repository klonen

```bash
git clone https://github.com/FlorianKuehn96/catchlog.git
cd catchlog
```

### 2. Dependencies installieren

```bash
npm install
# oder
yarn install
```

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Bearbeite `.env.local`:

```env
# Upstash Redis (Required)
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# NextAuth (Required)
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (Required for Auth)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Cloudinary (Required for Photos)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=catchlog_uploads
```

### 4. Development Server starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

---

## 📦 Deployment

### Vercel (Empfohlen)

1. **Push zu GitHub**
   ```bash
   git push origin main
   ```

2. **Vercel Projekt erstellen**
   - Gehe zu [vercel.com](https://vercel.com)
   - "Add New Project"
   - Importiere von GitHub

3. **Environment Variables hinzufügen**
   - Settings → Environment Variables
   - Füge alle Variablen aus `.env.example` hinzu

4. **Deploy**
   - Vercel baut automatisch bei jedem Push
   - URL: `https://your-project.vercel.app`

### Manuelles Deployment

```bash
# Build
npm run build

# Start production server
npm start
```

---

## 📚 API Dokumentation

### Authentication
Alle API-Endpunkte (außer Auth) erfordern eine gültige Session. Der Benutzer wird über NextAuth identifiziert.

### Endpoints

#### GET /api/catches
Liste aller Fänge des eingeloggten Users.

**Response:**
```json
{
  "catches": [
    {
      "id": "uuid",
      "species": "Hecht",
      "length": 65,
      "weight": 2.5,
      "bait": "Gummifisch",
      "timestamp": "2026-03-19T14:30:00Z",
      "photoUrl": "https://...",
      "spot": { ... }
    }
  ]
}
```

#### POST /api/catches
Neuen Fang erstellen.

**Body:**
```json
{
  "spotId": "uuid",
  "species": "Hecht",
  "length": 65,
  "weight": 2.5,
  "bait": "Gummifisch",
  "technique": "Spinnfischen",
  "notes": "Guter Tag",
  "imageUrl": "https://..."  // Optional
}
```

**Validation:**
- `spotId`: UUID (required)
- `species`: 1-100 Zeichen (required)
- `length`: Positive Zahl (optional)
- `weight`: Positive Zahl (optional)
- `bait`: 1-100 Zeichen (required)

#### PUT /api/catches
Fang aktualisieren.

**Body:**
```json
{
  "id": "uuid",
  "species": "Zander",
  "weight": 3.2
}
```

#### DELETE /api/catches?id=xxx
Fang löschen (inkl. Foto aus Cloudinary).

---

## 🗄 Datenmodell

### User
```typescript
{
  id: string (UUID)
  email: string
  name: string
  image?: string
  createdAt: string (ISO)
}
```

### Spot (Gewässer)
```typescript
{
  id: string (UUID)
  userId: string
  name: string
  type: 'lake' | 'river' | 'pond' | 'canal' | 'coast' | 'other'
  lat: number
  lng: number
  createdAt: string
}
```

### Catch (Fang)
```typescript
{
  id: string (UUID)
  userId: string
  spotId: string
  species: string
  length?: number
  weight?: number
  bait: string
  technique?: string
  notes?: string
  photoUrl?: string
  timestamp: string
  date: string
  time: string
  weather: {
    temp: number
    pressure: number
    windSpeed: number
    windDirection: number
    conditions: string
  }
  sunPosition: {
    hoursFromSunrise: number
    hoursFromSunset: number
    phase: 'night' | 'dawn' | 'day' | 'dusk'
  }
  catchLat?: number
  catchLng?: number
}
```

---

## 🔧 Troubleshooting

### Build-Fehler: "The 'url' property is missing"
**Lösung:** Environment Variables in Vercel prüfen. `UPSTASH_REDIS_REST_URL` muss gesetzt sein.

### Login funktioniert nicht
**Lösung:** 
- `NEXTAUTH_SECRET` und `NEXTAUTH_URL` prüfen
- Google OAuth Callback URL: `https://your-domain/api/auth/callback/google`

### Bild-Upload fehlschlägt
**Lösung:**
- Cloudinary Upload Preset auf "Unsigned" stellen
- `CLOUDINARY_UPLOAD_PRESET` muss existieren

### API langsam
**Lösung:** N+1 Query Problem wurde gefixt. Bei vielen Fängen: Pagination implementieren.

---

## 📝 Changelog

### 2026-03-19
- ✅ Input-Validierung mit Zod
- ✅ N+1 Query Optimierung
- ✅ Cloudinary Foto-Löschung
- ✅ Code Review (Score: 75/100)

### 2026-03-18
- ✅ Fang-Galerie mit Lightbox
- ✅ Formular-Reset Fix
- ✅ DSGVO Compliance (Privacy, Cookies, Impressum)

### 2026-03-17
- ✅ MVP Release
- ✅ Google OAuth
- ✅ Redis Integration
- ✅ Wetter-API

---

## 📄 Lizenz

MIT © Florian

---

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/amazing`)
3. Committe deine Änderungen (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing`)
5. Öffne einen Pull Request

---

**Fragen oder Probleme?** Erstelle ein Issue auf GitHub.
