# CatchLog 🎣

Dein digitaler Fangbericht. Speichere deine Angelerfolge mit Standort, Wetter und Foto. KI-Empfehlungen für den perfekten Fang.

## Features

- 📸 **Fang-Logging** mit Foto, GPS, Wetter-Daten
- 📍 **Spot-Verwaltung** mit Geo-Suche in der Nähe
- 🤖 **KI-Köder-Empfehlung** basierend auf Wetter & Spot
- 📊 **Statistiken** - Fangrate, beste Zeiten, erfolgreichste Spots
- 📱 **PWA** - Installierbar als Mobile App

## Tech Stack

- Next.js 16 + TypeScript + Tailwind CSS
- NextAuth.js (Google OAuth)
- Upstash Redis (Datenbank)
- Cloudinary (Bild-Upload)
- Open-Meteo API (Wetter)

## Quick Start

### 1. Repository klonen

```bash
git clone https://github.com/FlorianKuehn96/catchlog.git
cd catchlog
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 4. Development Server starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Empfohlen)

1. Push zu GitHub
2. Importiere bei [vercel.com](https://vercel.com)
3. Füge Environment Variables hinzu
4. Deploy 🚀

## Environment Variables

| Variable | Beschreibung | Woher? |
|----------|--------------|--------|
| `UPSTASH_REDIS_REST_URL` | Redis URL | [Upstash](https://upstash.com) |
| `UPSTASH_REDIS_REST_TOKEN` | Redis Token | [Upstash](https://upstash.com) |
| `NEXTAUTH_SECRET` | Auth Secret | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth | [Google Cloud](https://console.cloud.google.com) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Name | [Cloudinary](https://cloudinary.com) |

## API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/catches` | GET/POST/DELETE | Fang-Logbuch |
| `/api/spots` | GET/POST/DELETE | Gewässer-Verwaltung |
| `/api/spots/nearby` | GET | Spots in der Nähe |
| `/api/recommend` | GET | KI-Köder-Empfehlung |
| `/api/stats` | GET | Statistiken |

## Lizenz

MIT © Florian
