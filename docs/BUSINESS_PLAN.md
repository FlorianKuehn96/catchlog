# CatchLog Business & Marketing Plan

## 1. Zielgruppe

### Primärzielgruppe: Passionate Angler in Deutschland
- **Demografie:** Männer 25-55 Jahre, Mittelstand+
- **Verhalten:** 
  - Fischen 2-4x pro Monat (Hobby- bis Semi-Profi-Level)
  - Nutzen bereits Smartphones für Navigation/Wetter
  - Aktiv in Facebook-Gruppen und Foren (z.B. Fishing-King, various regional groups)
- **Pain Points:**
  - Papier-Fangbücher gehen verloren/werden nass
  - Keine zentrale Übersicht über alle Fänge
  - Vergessen, wo/wann erfolgreich gefangen wurde
  - Schwierigkeiten mit Gewichtsschätzung
- **Willingness to Pay:** 5-15€/Monat für nützliche Tools

### Sekundärzielgruppe: Fischerzeugnis-Anwärter
- Neue Angler, die systematisch lernen wollen
- Dokumentieren Fänge für Prüfungsnachweise

## 2. Marktgröße

| Metrik | Wert | Quelle |
|--------|------|--------|
| Angler in Deutschland | ~1,5 Millionen | DJV (Deutscher Jagd- und Fischereiverband) |
| Aktive Hobby-Angler | ~400.000 | Schätzung (mehrfach pro Jahr) |
| Smartphone-Nutzer | >95% | Deutschland Durchschnitt |
| TAM (Total Addressable Market) | 400.000 | Aktive Angler mit Smartphone |
| SAM (Serviceable Addressable Market) | 80.000-120.000 | Tech-affin, bereit für Apps |
| SOM (Serviceable Obtainable Market) | 5.000-10.000 | Realistisch in Jahren 1-2 |

**Marktpotential:**
- Bei 1.000 zahlenden Kunden à 10€/Monat = 120.000€/Jahr
- Bei 5.000 zahlenden Kunden à 10€/Monat = 600.000€/Jahr
- Break-even bei ~150-200 zahlenden Kunden

## 3. Konkurrenzanalyse

### Direkte Konkurrenz

| App | Land | Preis | Stärken | Schwächen |
|-----|------|-------|---------|-----------|
| **FishAngler** | USA | Freemium | Große Community, Social Features | Englisch, nicht DSGVO-konform, wenig deutsche Fischarten |
| **Angelführer** | DE | Freemium | Deutsch, umfangreich | Komplex, überladen, keine Foto-Integration |
| **MyCatch** | USA | Freemium | Clean UI, einfach | Englisch, keine automatische Gewichtsberechnung, keine DSGVO |
| **Fangbuch.de** | DE | 9,99€/Jahr | Spezialisiert auf Fangbuch-Funktion | Veraltetes Design, keine GPS-Integration, keine App |

### Indirekte Konkurrenz
- **Papier-Fangbücher:** Traditionell, aber unpraktisch
- **Excel/Notizen:** Kostenlos, aber keine Features
- **Instagram:** Social Sharing, aber kein strukturiertes Logging

### CatchLog's Wettbewerbsvorteile
1. **DSGVO-konform** - Einziger ernsthafter deutscher Anbieter
2. **Auto-Gewichtsberechnung** - Kein Konkurrent hat das
3. **GPS-Spot-Tracking** - Integriert, nicht nur Koordinaten speichern
4. **Deutsche Fischarten** - Vollständig, nicht nur die bekannten
5. **Clean UX** - Weniger ist mehr (im Gegensatz zu überladenen Apps)

## 4. Geschäftsmodell & Preisgestaltung

### Optionen evaluiert

| Modell | Preis | Pro | Contra |
|--------|-------|-----|--------|
| **Freemium** | Basis kostenlos, Premium 4,99€/Monat | Niedrige Einstiegshürde, virales Wachstum | Hohe Support-Last, niedrige Conversion |
| **Premium only** | 9,99€/Jahr | Qualitätsnutzer, bessere Unit Economics | Höhere Akquisitionskosten, langsameres Wachstum |
| **One-time** | 29,99€ einmalig | Einfach, kein Abo-Ärger | Kein wiederkehrendes Einnahmen, kein Server-Cost-Covering |

### Empfohlenes Modell: Freemium

**Kostenlos (Free):**
- Bis 50 Fänge speichern
- Basis-Statistiken
- Kein Export
- Werbung (optional, später)

**Premium (Pro):**
- Unbegrenzte Fänge
- CSV/Excel-Export
- Erweiterte Statistiken (Trends, Bestzeiten)
- Wetter-Integration
- Cloud-Backup
- Keine Werbung

**Preisgestaltung:**
- **Monatlich:** 4,99€
- **Jährlich:** 39,99€ (33% Rabatt)
- **Lebenszeit:** 99,99€ (später, bei Nachfrage)

### Kostenstruktur (pro Monat)

| Kostenpunkt | Betrag | Anmerkung |
|-------------|--------|-----------|
| Vercel Pro | 20$ | Bei Traffic > Hobby-Plan |
| Upstash Redis | 10$ | Bei Nutzerwachstum |
| Cloudinary | 25$ | Bild-Storage & Transformation |
| Resend/SES | 5$ | Transactional Emails |
| Domain + DNS | 2$ | catchlog.app |
| **Fixkosten gesamt** | **~62$/Monat (~58€)** | |

**Break-Even:** Bei ~15 zahlenden Nutzern/Jährlich-Abos

## 5. Marketing-Strategie

### Phase 1: Launch (Monat 1-3)
**Ziel:** Erste 100 Nutzer, Validierung Product-Market-Fit

**Taktiken:**
1. **Fishing-Foren & Communities**
   - fishing-king.de (großes deutsches Forum)
   - Angeln-Total.de
   - Regionale Facebook-Gruppen (z.B. "Angler Berlin/Brandenburg")
   - Soft-Promotion: "Habe eine App gebaut, Feedback erwünscht"

2. **Reddit**
   - r/Angeln (größtes deutschsprachiges Angel-Subreddit)
   - r/Fishing
   - "Show HN" Stil Posts

3. **Influencer-Outreach (Micro)**
   - YouTube-Angler mit 5k-50k Abos
   - Angebot: Lifetime-Zugang kostenlos für ehrliches Review
   - Ziel: 3-5 Reviews im ersten Quartal

4. **Content-Marketing**
   - Blog-Posts: "Die besten Fangbuch-Apps im Vergleich"
   - "Wie berechne ich das Gewicht meines Fisches?"
   - SEO auf deutsche Angel-Keywords

**Budget:** 0€ (nur Zeit, organisches Wachstum)

### Phase 2: Growth (Monat 4-12)
**Ziel:** 1.000 Nutzer, 100 zahlende Kunden

**Taktiken:**
1. **Google Ads** (wenn CAC < LTV)
   - Keywords: "Fangbuch App", "Angel App", "Fänge speichern"
   - Budget: 300-500€/Monat testweise

2. **Referral-Programm**
   - "Einladen und beide 1 Monat Premium gratis"
   - Viraler Loop über Fishing-Buddies

3. **Partnerschaften**
   - Angel-Shops (Ruten, Köder online)
   - Angelvereine (Bulk-Angebote)
   - Köder-Hersteller (Brand-awareness)

4. **PR**
   - Fachzeitschriften (Angelzeitung, Blinker)
   - "Lokaler Entwickler baut App" - Regionalzeitungen

**Budget:** 500-1.000€/Monat

### Phase 3: Scale (Jahr 2+)
**Ziel:** 5.000+ Nutzer, 500+ zahlende Kunden

**Taktiken:**
- Internationlisierung (Österreich, Schweiz, Niederlande)
- App-Stores (Marketing-Budget für ASO)
- Influencer-Marketing (größere Deals)
- Event-Sponsoring (Angelmessen, Wettbewerbe)

## 6. Financial Projections

### Szenario: Realistisch (Basis-Annahme)

| Monat | Nutzer (gesamt) | Zahlende | MRR | Jahresumsatz |
|-------|-----------------|----------|-----|--------------|
| 3 | 200 | 5 | 25€ | - |
| 6 | 500 | 20 | 100€ | - |
| 9 | 800 | 40 | 200€ | - |
| 12 | 1.200 | 80 | 400€ | ~4.800€ |
| 18 | 2.500 | 200 | 1.000€ | ~12.000€ |
| 24 | 4.000 | 400 | 2.000€ | ~24.000€ |

*MRR = Monthly Recurring Revenue bei durchschnittlich 5€/Nutzer (Mix aus Monthly/Jährlich)*

### Szenario: Optimistisch

| Monat | Nutzer | Zahlende | MRR | Jahresumsatz |
|-------|--------|----------|-----|--------------|
| 12 | 3.000 | 300 | 1.500€ | ~18.000€ |
| 24 | 8.000 | 1.200 | 6.000€ | ~72.000€ |

### Szenario: Pessimistisch

| Monat | Nutzer | Zahlende | MRR | Kommentar |
|-------|--------|----------|-----|-----------|
| 12 | 400 | 15 | 75€ | Nischenprodukt, langsames Wachstum |
| 24 | 800 | 40 | 200€ | Side-Hustle Level |

## 7. Go-to-Market Timeline

| Woche | Aktivität | Ziel |
|-------|-----------|------|
| 1-2 | Finalisierung MVP, Domain-Setup | Produkt ready |
| 3 | Soft-Launch in Angel-Communities | 50 Nutzer, Feedback |
| 4-6 | Bugfixes basierend auf Feedback | Stabilität |
| 7-8 | Stripe-Integration, Premium-Features | Monetarisierung ready |
| 9-12 | Content-Marketing, Forum-Posts | 200 Nutzer |
| 13-24 | Skalierung, ggf. kleine Ad-Campaigns | 1.000 Nutzer |

## 8. Risiken & Mitigation

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| **Zu kleiner Markt** | Mittel | Hoch | Internationalisierung (AT, CH, NL, UK) |
| **Zu niedrige Conversion** | Hoch | Mittel | Freemium-Modell, starker Value-Showcase |
| **Technische Probleme** | Niedrig | Hoch | Monitoring, Backups, Redis-Persistenz |
| **DSGVO-Verstöße** | Niedrig | Sehr hoch | Dokumentation, regelmäßige Audits |
| **Klon durch großen Player** | Mittel | Hoch | Speed-to-market, Community-Building |

## 9. Erfolgs-Metriken (KPIs)

| Metrik | Ziel Monat 3 | Ziel Monat 12 | Messung |
|--------|-------------|---------------|---------|
| **MAU** (Monthly Active Users) | 100 | 800 | Analytics |
| **Conversion Rate** | 2% | 7% | Stripe-Daten |
| **Churn** (Kündigungsrate) | <10%/Monat | <5%/Monat | Stripe-Daten |
| **CAC** (Customer Acquisition Cost) | - | <20€ | Marketing-Spend/Nutzer |
| **LTV** (Lifetime Value) | - | >60€ | Durchschnittliche Abo-Laufzeit |
| **NPS** (Net Promoter Score) | >30 | >50 | Umfragen |

## 10. Fazit & Empfehlung

### Stärken der Idee
✅ Klares Problem (Fangbuch-Digitalisierung)  
✅ Bezahlbare Zielgruppe (kein Preis-Sensitiv)  
✅ Niedrige Break-Even-Hürde (~15 zahlende Kunden)  
✅ Technisch bereits umgesetzt (MVP fertig)  
✅ DSGVO-Vorteil gegenüber US-Konkurrenz  

### Schwächen
⚠️ Kleiner Markt (nur Deutschland = ~400k potentielle Nutzer)  
⚠️ Saisonalität (weniger Angler im Winter)  
⚠️ Kein "viraler" Mechanismus (private Aktivität)  

### Empfehlung
**JA, es lohnt sich** - aber als **Side-Hustle**, nicht als Vollzeit-Startup.

**Realistisches Ziel:**
- Jahr 1: 1.000 Nutzer, 100 zahlende Kunden, ~5.000€ Umsatz
- Jahr 2: 5.000 Nutzer, 400 zahlende Kunden, ~24.000€ Umsatz
- Ab Jahr 2: Entscheidung ob ausbauen oder als passive Einnahmequelle laufen lassen

**Nächster Schritt:**
Domain registrieren (catchlog.org oder fangtracker.de) und Soft-Launch durchführen. In 3 Monaten wird klar sein, ob die Conversion funktioniert.

---

**Erstellt:** 2026-03-19  
**Status:** Plan erstellt, wartet auf Nutzer-Entscheidung
