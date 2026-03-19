# CatchLog Code Review
**Datum:** 19.03.2026  
**Reviewer:** Assistant

---

## 🚨 P0 - Kritische Issues

### 1. Security: Keine Input-Validierung in API-Routen
**Datei:** `src/app/api/catches/route.ts` (und andere API-Routen)

**Problem:** Body-Parameter werden nicht validiert - potenzielle Injection/DoS-Anfälligkeit.

```typescript
// Aktuell (unsicher):
const body = await request.json();
const { spotId, species, length, weight, ... } = body;
// Keine Validierung!
```

**Empfohlener Fix:**
```typescript
import { z } from 'zod';

const catchSchema = z.object({
  spotId: z.string().uuid(),
  species: z.string().min(1).max(100),
  length: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  bait: z.string().min(1).max(100),
  // ...
});

const body = await request.json();
const result = catchSchema.safeParse(body);
if (!result.success) {
  return NextResponse.json({ error: 'Invalid input', details: result.error }, { status: 400 });
}
```

---

### 2. Performance: N+1 Query Problem in GET /api/catches
**Datei:** `src/app/api/catches/route.ts:35-50`

**Problem:** Für jeden Catch wird separat das Spot aus Redis geladen.

```typescript
// Aktuell (ineffizient):
for (const catchId of catchIds) {
  const catchData = await redis.get(keys.catch(catchId));
  if (catchData) {
    const c = catchData as Catch;
    const spotData = await redis.get(keys.spot(c.spotId)); // ← N+1!
    // ...
  }
}
```

**Empfohlener Fix:**
```typescript
// Batch-Loading mit Pipeline
const pipeline = redis.pipeline();
catchIds.forEach(id => pipeline.get(keys.catch(id)));
const catchesData = await pipeline.exec();

// Sammle alle Spot-IDs
const spotIds = [...new Set(catchesData.map(c => c?.spotId).filter(Boolean))];
const spotPipeline = redis.pipeline();
spotIds.forEach(id => spotPipeline.get(keys.spot(id)));
const spotsData = await spotPipeline.exec();
const spotsMap = new Map(spotsData.map(s => [s.id, s]));
```

---

### 3. Security: Cloudinary Delete ohne Retry-Limit
**Datei:** `src/app/api/catches/route.ts:270-320`

**Problem:** Netzwerk-Fehler werden geloggt aber nicht gehandhabt; kein Retry.

**Status:** ✅ Akzeptabel für MVP, aber sollte verbessert werden.

---

## ⚠️ P1 - Wichtige Issues

### 4. Type Safety: `any` Usage
**Datei:** Mehrere Dateien

**Problem:** Zu viele `as any` Casts untergraben TypeScript.

```typescript
// Beispiele:
const spot = spotData as any;  // src/app/api/catches/route.ts:88
const user = userData as User; // Sollte validiert werden
```

**Fix:** Entweder ordentliche Typen oder Zod-Validierung.

---

### 5. Memory Leak: Event Listener in CatchMap
**Datei:** `src/components/CatchMap.tsx`

**Problem:** Keyboard-Event-Listener werden nicht immer aufgeräumt.

**Status:** ✅ Aktuell okay, aber bei Erweiterung beachten.

---

### 6. Error Handling: Catch-All Blöcke
**Datei:** `src/app/api/catches/route.ts`

```typescript
// Zu allgemein:
} catch {
  // Fallback...
}
```

**Sollte sein:**
```typescript
} catch (error) {
  console.error('Specific error:', error);
  // Dann Fallback
}
```

---

## 📝 P2 - Verbesserungen

### 7. Code Duplikation: Auth-Check
**Datei:** Alle API-Routen

**Problem:** Gleicher Auth-Check wiederholt sich.

**Lösung:** Middleware oder Helper-Funktion.

---

### 8. Magic Numbers
**Datei:** `src/components/CatchForm.tsx`

```typescript
const DEBOUNCE_DELAY = 800; // Besser als inline "800"
```

---

### 9. Kommentar vs. Code
**Datei:** `src/app/api/catches/route.ts:65`

```typescript
// Create catch (without photo for MVP)
// ↑ Kommentar veraltet - photoUrl wird jetzt gespeichert!
```

---

## ✅ Gute Praktiken (Was gut ist)

1. **Lazy Initialization** für Redis/Stripe ✅
2. **Environment Validation** mit Zod ✅
3. **Debouncing** für Weight-Calculation ✅
4. **Cloudinary Retry-Logic** ✅
5. **DSGVO Compliance** (Privacy, Cookies, Impressum) ✅
6. **Form Reset** mit key-Prop ✅

---

## 📊 Gesamtbewertung

| Kategorie | Score | Bemerkung |
|-----------|-------|-----------|
| **Sicherheit** | 6/10 | Auth okay, aber Input-Validierung fehlt |
| **Performance** | 7/10 | N+1 Problem, sonst okay |
| **Maintainability** | 7/10 | Klare Struktur, aber viele `any` casts |
| **Type Safety** | 6/10 | TypeScript genutzt, aber zu viele Assertions |
| **Fehlerbehandlung** | 7/10 | Grundlegend okay, aber könnte spezifischer sein |

**Gesamt:** 33/50 (66%) - Akzeptabel für MVP, Verbesserungspotenzial für Production.

---

## 🎯 Empfohlene Prioritäten

### Sofort (vor Production):
1. Input-Validierung mit Zod einbauen
2. N+1 Query Problem fixen
3. Veraltete Kommentare entfernen

### Bald:
4. `any` casts reduzieren
5. Auth-Check in Middleware auslagern
6. Logging konsistenter machen

### Optional:
7. Tests hinzufügen (aktuell keine Tests?)
8. Rate Limiting für API

---

*Review abgeschlossen.*
