# CatchLog API Dokumentation

## Base URL

```
Production: https://catchlog-omega.vercel.app
Local: http://localhost:3000
```

## Authentication

Alle API-Endpunkte erfordern eine gültige NextAuth-Session. Der Benutzer wird automatisch über den Session-Cookie identifiziert.

**Fehler:**
- `401 Unauthorized` - Keine Session vorhanden
- `403 Forbidden` - Session vorhanden, aber keine Berechtigung für diese Ressource

---

## Endpoints

### Catches

#### GET /api/catches

Liste aller Fänge des eingeloggten Users.

**Response:**
```json
{
  "catches": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user-uuid",
      "spotId": "spot-uuid",
      "species": "Hecht",
      "length": 65,
      "weight": 2.5,
      "bait": "Gummifisch",
      "technique": "Spinnfischen",
      "notes": "Guter Tag am See",
      "photoUrl": "https://res.cloudinary.com/.../image.jpg",
      "timestamp": "2026-03-19T14:30:00.000Z",
      "date": "2026-03-19",
      "time": "14:30",
      "weather": {
        "temp": 18,
        "pressure": 1013,
        "windSpeed": 12,
        "windDirection": 180,
        "conditions": "Sonnig"
      },
      "sunPosition": {
        "hoursFromSunrise": 4,
        "hoursFromSunset": 8,
        "phase": "day"
      },
      "spot": {
        "id": "spot-uuid",
        "name": "Müggelsee",
        "type": "lake",
        "lat": 52.4,
        "lng": 13.6
      }
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Erfolgreich
- `401 Unauthorized` - Nicht eingeloggt
- `404 Not Found` - User nicht gefunden

---

#### POST /api/catches

Neuen Fang erstellen.

**Request Body:**
```json
{
  "spotId": "550e8400-e29b-41d4-a716-446655440000",
  "species": "Hecht",
  "length": 65,
  "weight": 2.5,
  "bait": "Gummifisch",
  "technique": "Spinnfischen",
  "notes": "Guter Tag",
  "timestamp": "2026-03-19T14:30:00.000Z",
  "catchLat": 52.4,
  "catchLng": 13.6,
  "imageUrl": "https://res.cloudinary.com/.../image.jpg"
}
```

**Validation (Zod):**
| Feld | Typ | Required | Constraints |
|------|-----|----------|-------------|
| `spotId` | string | ✅ | UUID Format |
| `species` | string | ✅ | 1-100 Zeichen |
| `length` | number/string | ❌ | Positive Zahl oder leer |
| `weight` | number/string | ❌ | Positive Zahl oder leer |
| `bait` | string | ✅ | 1-100 Zeichen |
| `technique` | string | ❌ | Max 100 Zeichen |
| `notes` | string | ❌ | Max 2000 Zeichen |
| `timestamp` | string | ❌ | ISO 8601 Datetime |
| `catchLat` | number | ❌ | -90 bis 90 |
| `catchLng` | number | ❌ | -180 bis 180 |
| `imageUrl` | string | ❌ | URL oder leer |

**Response (201 Created):**
```json
{
  "catch": {
    "id": "new-uuid",
    "userId": "user-uuid",
    "spotId": "spot-uuid",
    "species": "Hecht",
    "length": 65,
    "weight": 2.5,
    "bait": "Gummifisch",
    "technique": "Spinnfischen",
    "notes": "Guter Tag",
    "photoUrl": "https://res.cloudinary.com/.../image.jpg",
    "timestamp": "2026-03-19T14:30:00.000Z",
    "date": "2026-03-19",
    "time": "14:30",
    "weather": { ... },
    "sunPosition": { ... }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid input",
  "details": [
    {
      "field": "species",
      "message": "Fischart ist erforderlich"
    },
    {
      "field": "spotId",
      "message": "Ungültige Spot-ID"
    }
  ]
}
```

**Status Codes:**
- `201 Created` - Fang erstellt
- `400 Bad Request` - Ungültige Eingabe
- `401 Unauthorized` - Nicht eingeloggt
- `404 Not Found` - Spot nicht gefunden

---

#### PUT /api/catches

Fang aktualisieren.

**Request Body:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "species": "Zander",
  "weight": 3.2,
  "notes": "Korrigiert"
}
```

**Validation:**
- `id`: UUID (required)
- Alle anderen Felder: Optional, gleiche Constraints wie POST

**Response:**
```json
{
  "catch": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "species": "Zander",
    "weight": 3.2,
    "notes": "Korrigiert",
    ...
  }
}
```

**Status Codes:**
- `200 OK` - Erfolgreich aktualisiert
- `400 Bad Request` - Ungültige Eingabe
- `401 Unauthorized` - Nicht eingeloggt
- `403 Forbidden` - Fang gehört nicht dem User
- `404 Not Found` - Fang nicht gefunden

---

#### DELETE /api/catches?id={id}

Fang löschen (inkl. Foto aus Cloudinary).

**Query Parameters:**
- `id` (required): UUID des Fangs

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200 OK` - Erfolgreich gelöscht
- `400 Bad Request` - Fehlende ID
- `401 Unauthorized` - Nicht eingeloggt
- `403 Forbidden` - Fang gehört nicht dem User
- `404 Not Found` - Fang nicht gefunden

---

### Spots

#### GET /api/spots

Liste aller Gewässer des eingeloggten Users.

**Response:**
```json
{
  "spots": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user-uuid",
      "name": "Müggelsee",
      "type": "lake",
      "lat": 52.4,
      "lng": 13.6,
      "createdAt": "2026-03-19T10:00:00.000Z"
    }
  ]
}
```

---

#### POST /api/spots

Neues Gewässer erstellen.

**Request Body:**
```json
{
  "name": "Müggelsee",
  "type": "lake",
  "lat": 52.4,
  "lng": 13.6
}
```

**Validation:**
| Feld | Typ | Required | Constraints |
|------|-----|----------|-------------|
| `name` | string | ✅ | 1-100 Zeichen |
| `type` | enum | ✅ | lake, river, pond, canal, coast, other |
| `lat` | number | ✅ | -90 bis 90 |
| `lng` | number | ✅ | -180 bis 180 |

---

#### DELETE /api/spots?id={id}

Gewässer löschen.

**Query Parameters:**
- `id` (required): UUID des Spots

---

### Spots Nearby

#### GET /api/spots/nearby?lat={lat}&lng={lng}

Spots in der Nähe eines Punktes finden.

**Query Parameters:**
- `lat` (required): Breitengrad
- `lng` (required): Längengrad

**Response:**
```json
{
  "spots": [
    {
      "id": "spot-uuid",
      "name": "Müggelsee",
      "type": "lake",
      "lat": 52.4,
      "lng": 13.6,
      "distance": 0.5  // km
    }
  ]
}
```

---

### Recommendations

#### GET /api/recommend?spotId={spotId}

KI-basierte Köder-Empfehlung.

**Query Parameters:**
- `spotId` (required): UUID des Gewässers

**Response:**
```json
{
  "recommendation": {
    "bait": "Gummifisch",
    "technique": "Spinnfischen",
    "confidence": 0.85,
    "reason": "Sonniges Wetter, Wind aus Süden, Tageszeit optimal"
  }
}
```

---

### Statistics

#### GET /api/stats

Statistiken für den eingeloggten User.

**Response:**
```json
{
  "totalCatches": 42,
  "totalSpots": 5,
  "speciesCount": 8,
  "bestMonth": "Juni",
  "bestTime": "06:00-09:00",
  "topSpot": {
    "name": "Müggelsee",
    "catches": 15
  },
  "personalBests": [
    {
      "species": "Hecht",
      "length": 85,
      "weight": 4.2
    }
  ]
}
```

---

### Export

#### GET /api/export/csv

Alle Fänge als CSV exportieren.

**Response:**
```csv
Date,Time,Species,Length,Weight,Bait,Technique,Spot,Latitude,Longitude,Temperature,Pressure,Wind Speed,Notes
2026-03-19,14:30,Hecht,65,2.5,Gummifisch,Spinnfischen,Müggelsee,52.4,13.6,18,1013,12,Guter Tag
```

**Headers:**
- `Content-Type: text/csv`
- `Content-Disposition: attachment; filename="catches.csv"`

---

### Upload Signature

#### GET /api/upload-signature

Signatur für Cloudinary-Upload generieren.

**Response:**
```json
{
  "signature": "abc123...",
  "timestamp": 1710854400,
  "cloudName": "your-cloud",
  "apiKey": "your-api-key"
}
```

**Verwendung:**
```javascript
const { signature, timestamp, cloudName, apiKey } = await fetch('/api/upload-signature').then(r => r.json());

const formData = new FormData();
formData.append('file', file);
formData.append('api_key', apiKey);
formData.append('timestamp', timestamp);
formData.append('signature', signature);
formData.append('folder', 'catchlog/catches');

const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
  method: 'POST',
  body: formData,
});
```

---

## Error Handling

Alle Fehler folgen diesem Format:

```json
{
  "error": "Beschreibung des Fehlers",
  "details": [  // Optional, bei Validation Errors
    {
      "field": "feldname",
      "message": "Fehlermeldung"
    }
  ]
}
```

**HTTP Status Codes:**
- `200` - Erfolgreich
- `201` - Erstellt
- `400` - Ungültige Anfrage
- `401` - Nicht authentifiziert
- `403` - Nicht autorisiert
- `404` - Nicht gefunden
- `500` - Serverfehler

---

## Rate Limiting

Aktuell kein Rate Limiting implementiert. Für Production empfohlen:
- 100 Requests/Minute pro User
- 10 Uploads/Minute pro User

---

## TypeScript Types

```typescript
// src/types/index.ts

interface Catch {
  id: string;
  userId: string;
  spotId: string;
  species: string;
  length?: number;
  weight?: number;
  bait: string;
  technique?: string;
  notes?: string;
  photoUrl?: string;
  timestamp: string;
  date: string;
  time: string;
  weather: Weather;
  sunPosition: SunPosition;
  catchLat?: number;
  catchLng?: number;
  spot?: Spot;
}

interface Spot {
  id: string;
  userId: string;
  name: string;
  type: 'lake' | 'river' | 'pond' | 'canal' | 'coast' | 'other';
  lat: number;
  lng: number;
  createdAt: string;
}

interface Weather {
  temp: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  conditions: string;
}

interface SunPosition {
  hoursFromSunrise: number;
  hoursFromSunset: number;
  phase: 'night' | 'dawn' | 'day' | 'dusk';
}
```
