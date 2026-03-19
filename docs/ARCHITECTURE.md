# CatchLog Architektur

## Übersicht

CatchLog ist eine moderne Web-App für Angler, gebaut mit dem Next.js App Router und einer serverless Architektur.

## System-Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Browser   │  │    PWA      │  │  Mobile (optional)  │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          └────────────────┴────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Next.js App (Vercel)                     │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                   App Router                         │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │  │
│  │  │  Pages   │ │   API    │ │ Middleware│            │  │
│  │  │ (RSC/SC) │ │ Routes   │ │  (Auth)   │            │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘            │  │
│  │       └─────────────┴─────────────┘                  │  │
│  │                      │                               │  │
│  │  ┌───────────────────▼───────────────────┐         │  │
│  │  │         Server Components              │         │  │
│  │  │  - Dashboard, Profile, Gallery       │         │  │
│  │  │  - Server-side Data Fetching         │         │  │
│  │  └───────────────────┬───────────────────┘         │  │
│  │                      │                               │  │
│  │  ┌───────────────────▼───────────────────┐         │  │
│  │  │         Client Components              │         │  │
│  │  │  - CatchForm, CatchMap, ImageUpload  │         │  │
│  │  │  - Interaktive UI, State Management  │         │  │
│  │  └───────────────────────────────────────┘         │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────────┬────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
┌──────────▼─────┐ ┌───────▼────────┐ ┌───▼──────────────┐
│    Upstash     │ │   Cloudinary   │ │   Open-Meteo     │
│    Redis       │ │   (Images)     │ │   (Weather)      │
│                │ │                │ │                  │
│  ┌──────────┐  │ │  ┌──────────┐  │ │  ┌──────────┐   │
│  │  Users   │  │ │  │  Photos  │  │ │  │  Weather │   │
│  │  Spots   │  │ │  │  (CDN)   │  │ │  │   Data   │   │
│  │ Catches  │  │ │  └──────────┘  │ │  └──────────┘   │
│  └──────────┘  │ │                │ │                  │
└────────────────┘ └────────────────┘ └──────────────────┘
```

## Datenfluss

### 1. Authentifizierung

```
User → Google OAuth → NextAuth → Session Cookie
                              ↓
                        Redis (User-Daten)
```

**Ablauf:**
1. User klickt "Mit Google anmelden"
2. Google OAuth Redirect
3. NextAuth validiert Token
4. User wird in Redis gespeichert (falls neu)
5. Session-Cookie wird gesetzt

### 2. Fang erstellen

```
User → CatchForm → POST /api/catches
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │  Zod    │    │  Redis  │    │Weather  │
    │Validate │    │  Save   │    │  API    │
    └────┬────┘    └────┬────┘    └────┬────┘
         │               │               │
         └───────────────┴───────────────┘
                         │
                    Response (201)
```

**Ablauf:**
1. User füllt Formular aus
2. Client validiert (Zod)
3. POST an `/api/catches`
4. Server validiert (Zod)
5. Wetter wird abgefragt (Open-Meteo)
6. Sonnenstand wird berechnet
7. Daten werden in Redis gespeichert
8. Response mit vollständigem Fang-Objekt

### 3. Bild-Upload

```
User → ImageUpload → GET /api/upload-signature
                            │
                     ┌──────▼──────┐
                     │  Generate   │
                     │  Signature  │
                     └──────┬──────┘
                            │
User ←── Signature ─────────┘
  │
  │  POST to Cloudinary
  │  (Client-side)
  │
  ▼
Cloudinary → Returns URL
  │
  ▼
User → Save Catch with photoUrl
```

**Ablauf:**
1. User wählt Bild aus
2. Client holt Signatur vom Server
3. Client lädt direkt zu Cloudinary hoch
4. Cloudinary gibt URL zurück
5. URL wird im Fang-Formular gespeichert
6. Beim Submit wird URL mitgesendet

### 4. Fang-Liste laden

```
User → Dashboard → GET /api/catches
                         │
                    ┌────▼────┐
                    │  Auth   │
                    │  Check  │
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │ Pipeline│
                    │  Query  │
                    │ (Batch) │
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │  Redis  │
                    │  Data   │
                    └────┬────┘
                         │
                    Response (200)
```

**Ablauf:**
1. Dashboard lädt
2. GET an `/api/catches`
3. Auth-Check
4. Alle Catch-IDs werden geladen
5. **Batch-Query** (Pipeline) für alle Catches
6. **Batch-Query** für alle Spots
7. Daten werden gemerged
8. Response mit angereicherten Daten

## Komponenten-Architektur

### Server Components (RSC)

```typescript
// Direkter Datenbankzugriff möglich
// Kein Client-JS, kleinere Bundle-Size

async function DashboardPage() {
  const catches = await getCatches(); // Server-side
  return <CatchList catches={catches} />;
}
```

**Verwendet für:**
- Landing Page
- Dashboard (initial load)
- Profile Page
- Privacy/Cookies/Impressum

### Client Components

```typescript
'use client';

// Interaktive Komponenten
// useState, useEffect, Event Handler

function CatchForm() {
  const [species, setSpecies] = useState('');
  // ...
}
```

**Verwendet für:**
- CatchForm (State, Validation)
- CatchMap (Leaflet, Browser APIs)
- ImageUpload (File API)
- Lightbox (Keyboard Events)

### Hybrid Pattern

```typescript
// Server Component
async function Dashboard() {
  const spots = await getSpots();
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Client Component mit Server-Daten */}
      <CatchForm spots={spots} />
    </div>
  );
}
```

## Datenbank-Schema (Redis)

### Key Patterns

```
user:{email}           → User object
user:{id}              → User object (lookup)
catch:{id}             → Catch object
spot:{id}              → Spot object
catches:user:{userId}  → List of catch IDs
catches:spot:{spotId}  → List of catch IDs
spots:user:{userId}    → List of spot IDs
```

### Beispiel-Daten

```json
// user:florian@example.com
{
  "id": "user-uuid",
  "email": "florian@example.com",
  "name": "Florian",
  "image": "https://...",
  "createdAt": "2026-03-19T10:00:00Z"
}

// catch:catch-uuid
{
  "id": "catch-uuid",
  "userId": "user-uuid",
  "spotId": "spot-uuid",
  "species": "Hecht",
  "length": 65,
  "weight": 2.5,
  "bait": "Gummifisch",
  "timestamp": "2026-03-19T14:30:00Z",
  "weather": {
    "temp": 18,
    "pressure": 1013,
    "windSpeed": 12,
    "conditions": "Sonnig"
  },
  "sunPosition": {
    "hoursFromSunrise": 4,
    "hoursFromSunset": 8,
    "phase": "day"
  }
}

// catches:user:user-uuid
["catch-uuid-1", "catch-uuid-2", "catch-uuid-3"]
```

## Sicherheits-Architektur

### Authentifizierung

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  NextAuth   │────▶│   Google    │
│             │◀────│  (Session)  │◀────│   OAuth     │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       │ Session Cookie
       ▼
┌─────────────┐
│  API Route  │
│  (Verify)   │
└─────────────┘
```

### Autorisierung

Jede API-Route prüft:
1. Session vorhanden?
2. User existiert in DB?
3. Ressource gehört dem User?

```typescript
// Pattern in allen API-Routen
const session = await getServerSession(authOptions);
if (!session?.user?.email) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const user = await getUser(session.user.email);
if (catch.userId !== user.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Input-Validierung

```
Client (Zod) → Server (Zod) → Database
     │              │
     └──────┬───────┘
            ▼
     Error Response (400)
```

## Performance-Optimierungen

### 1. Redis Pipeline

```typescript
// Vorher: N+1 Queries
for (const id of ids) {
  await redis.get(key(id)); // N Queries
}

// Nachher: Batch
const pipeline = redis.pipeline();
ids.forEach(id => pipeline.get(key(id)));
const results = await pipeline.exec(); // 1 Query
```

### 2. Lazy Initialization

```typescript
// Module-Level: ❌ Baut bei Import
const redis = new Redis({ url: process.env.REDIS_URL });

// Lazy: ✅ Baut erst bei erstem Zugriff
let redisInstance: Redis | null = null;
export function getRedis() {
  if (!redisInstance) {
    redisInstance = new Redis({ url: process.env.REDIS_URL });
  }
  return redisInstance;
}
```

### 3. Dynamic Imports

```typescript
// Server: Kein Leaflet
// Client: Leaflet laden
const CatchMap = dynamic(() => import('./CatchMap'), { ssr: false });
```

### 4. Image Optimization

```typescript
// Cloudinary Transformations
const optimizedUrl = url.replace(
  '/upload/',
  '/upload/c_limit,w_1200,h_1200,q_auto/'
);
```

## Deployment-Architektur

### Vercel (Production)

```
Git Push → Vercel Build → Edge Network
                              │
                    ┌────────┼────────┐
                    │        │        │
               ┌────▼───┐ ┌──▼───┐ ┌─▼────┐
               │  CDN   │ │Functions│ │  KV   │
               │(Static)│ │(Server) │ │(Redis)│
               └────────┘ └───────┘ └──────┘
```

### Environment-Variablen

| Environment | Variablen |
|-------------|-----------|
| Development | `.env.local` |
| Preview | Vercel Project Settings |
| Production | Vercel Project Settings |

## Monitoring & Debugging

### Logging

```typescript
// Server-side
console.error('Error creating catch:', error);

// Client-side
console.log('Form submitted:', data);
```

### Vercel Logs

- Build Logs: `vercel --logs`
- Runtime Logs: Vercel Dashboard → Logs

### Error Tracking

Empfohlen für Production:
- Sentry
- LogRocket
- Vercel Analytics

## Zukünftige Erweiterungen

### Mögliche Architektur-Änderungen

1. **GraphQL** statt REST
   - Flexible Queries
   - Weniger Overfetching

2. **Edge Functions**
   - Näher am User
   - Schnellere Response-Zeiten

3. **WebSockets**
   - Real-time Updates
   - Collaborative Features

4. **Caching Layer**
   - Redis für API-Responses
   - Stale-while-revalidate

5. **Microservices**
   - Weather Service
   - Image Processing Service
   - Notification Service

---

**Letzte Aktualisierung:** 2026-03-19
