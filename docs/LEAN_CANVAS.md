# CatchLog Lean Canvas

## Problem

### Top 3 Probleme
1. Papier-Fangbücher gehen verloren, werden nass, sind unpraktisch
2. Angler vergessen, wo/wann sie erfolgreich waren (keine Systematik)
3. Gewichtsschätzung ist ungenau/schwierig

### Existierende Alternativen
- Papier-Fangbücher (traditionell, unpraktisch)
- Generische Notizen-Apps (keine Angel-spezifischen Features)
- Excel (kompliziert, keine Mobile-Optimierung)
- US-Apps (FishAngler, MyCatch) - nicht DSGVO-konform, wenig deutsche Fischarten

## Solution

### Key Features
- **Digitales Fangbuch** mit Foto-Integration (Cloudinary)
- **Automatische Gewichtsberechnung** aus Länge + Fischart
- **GPS-Spot-Tracking** mit persönlichen Gewässern
- **Wetter-Integration** (erfasst automatisch Bedingungen)
- **DSGVO-konform** (deutsches Hosting, keine Datenweitergabe)

### Vorsprung
- Einzige App speziell für deutsche Angler
- Automatische Gewichtsberechnung (kein Konkurrent hat das)
- DSGVO-Sicherheit vs. US-Alternativen

## Unique Value Proposition

### Einzigartiges Versprechen
> "Das digitale Fangbuch für deutsche Angler - mit automatischer Gewichtsberechnung und GPS-Spot-Tracking"

### High-Level Concept
- "Strava für Angler"
- "Dein persönliches Fishing-Logbuch"

## Unfair Advantage

### Nicht kopierbar
- Deutsche DSGVO-Compliance (rechtlicher Vorteil)
- Lokale Community-Know-how (deutsche Angel-Kultur)
- Speed-to-Market (erster ernsthafter deutscher Anbieter)

### Schwer zu kopieren
- Deutsche Fischarten-Datenbank (komplett)
- Integrierte Gewichtsformeln (spezies-spezifisch)
- Lokale Wetter-API-Integration

## Customer Segments

### Early Adopters
- Tech-affine Angler 25-45 Jahre
- Aktiv in Online-Communities (Foren, Facebook-Gruppen)
- Smartphone-savvy, nutzen bereits Apps für Navigation

### Early Majority
- Passionate Hobby-Angler 35-55 Jahre
- Mehrfach pro Monat am Wasser
- Wollen Erfolge systematisch dokumentieren

### Total Addressable Market
- 1,5 Mio. Angler in Deutschland
- ~400.000 aktive Hobby-Angler
- ~80.000-120.000 tech-affine Zielgruppe

## Key Metrics

### Pirate Metrics (AARRR)
- **Acquisition:** Forum-Posts, Reddit, Micro-Influencer
- **Activation:** Erster Fang eingetragen
- **Retention:** Weekly Active Users (Ziel: 40%+ nach Woche 4)
- **Revenue:** Conversion Free → Premium (Ziel: 5-7%)
- **Referral:** Fishing-Buddy-Einladungen (Ziel: 0.3 Viralität)

### Success Metrics
- 1.000 Nutzer in 12 Monaten
- 100 zahlende Kunden (10% Conversion)
- <5% monatliche Churn-Rate

## Channels

### Phase 1: Organic (0€ Budget)
- Angel-Foren (fishing-king.de, Angeln-Total.de)
- Reddit (r/Angeln)
- Facebook-Gruppen (regionale Angel-Gruppen)
- Micro-Influencer (YouTube 5k-50k Abos)

### Phase 2: Paid (500€/Monat)
- Google Ads ("Fangbuch App", "Angel App")
- Content-Marketing SEO
- Referral-Programm

### Phase 3: Scale
- Angel-Messen
- Kooperationen Angel-Shops
- Internationale Expansion (AT, CH)

## Revenue Streams

### Freemium Modell
- **Free:** Bis 50 Fänge, Basis-Features
- **Pro Monthly:** 4,99€/Monat
- **Pro Yearly:** 39,99€/Jahr (33% Rabatt)
- **Lifetime:** 99,99€ (später)

### Monetarisierung
- Direkte Subscriptions via Stripe
- Keine Werbung (Premium-Erlebnis)
- Kein Datenverkauf (DSGVO)

## Cost Structure

### Fixed Costs (Monthly)
| Kostenpunkt | Betrag |
|-------------|--------|
| Vercel Pro | 20$ |
| Upstash Redis | 10$ |
| Cloudinary | 25$ |
| Resend Email | 5$ |
| Domain | 2$ |
| **Gesamt** | **~62$ (~58€)** |

### Break-Even
- ~15 zahlende Jahres-Abos
- Oder ~12 monatliche Abos

## Key Activities

### Aktuell (MVP)
- [x] Core Features implementiert
- [x] DSGVO-Compliance
- [x] Tests (21 Tests, 100% Coverage)
- [ ] Stripe-Integration
- [ ] Domain-Setup

### Q1 Post-Launch
- Soft-Launch in Communities
- Bugfixes basierend auf Feedback
- Premium-Features freischalten

### Q2-Q4
- Content-Marketing
- User-Acquisition
- Feature-Entwicklung (User-Wünsche)

## Key Partners

### Technisch
- **Vercel:** Hosting & Deployment
- **Upstash:** Redis Datenbank
- **Cloudinary:** Bild-Storage
- **Stripe:** Zahlungsabwicklung
- **Resend:** Transactional Emails

### Geschäftlich
- Angel-Shops (Affiliate/Partnerschaften)
- Angelvereine (Bulk-Lizenzen)
- Influencer (Reviews)
- Fachzeitschriften (PR)

## Risk Analysis

### Hohes Risiko
1. **Zu kleiner Markt** → Internationalisierung
2. **Niedrige Conversion** → Freemium-Modell optimieren
3. **Saisonalität** → Winter-Features (Planung, Equipment-Tracking)

### Mittleres Risiko
4. **Technische Probleme** → Monitoring, Backups
5. **Konkurrenz** → Speed, Community-Building

### Niedriges Risiko
6. **DSGVO-Verstöße** → Dokumentation, Audits

---

**Erstellt:** 2026-03-19  
**Status:** Validierung abgeschlossen, bereit für Launch
**Nächster Schritt:** Domain-Registrierung + Soft-Launch
