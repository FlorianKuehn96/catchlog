# Test-Cases für Offline-First Integration

## Übersicht
Diese Test-Cases validieren die Offline-First Funktionalität der CatchLog App.

---

## Test 1: Datenbank-Initialisierung

### TC-DB-001: IndexedDB wird beim App-Start initialisiert
**Voraussetzung:** Browser unterstützt IndexedDB

**Schritte:**
1. Öffne die App in Chrome/Firefox/Safari
2. Öffne DevTools → Application → IndexedDB
3. Überprüfe ob "CatchLogDB" existiert

**Erwartetes Ergebnis:**
- Datenbank "CatchLogDB" ist vorhanden
- ObjectStores: catches, spots, syncQueue, metadata

---

## Test 2: Offline-Modus Erkennung

### TC-OFF-001: Offline-Status wird im UI angezeigt
**Voraussetzung:** App ist geöffnet, Netzwerk ist verfügbar

**Schritte:**
1. Gehe zu Dashboard
2. Aktiviere "Offline" im DevTools Network Tab (oder deaktiviere WiFi)
3. Warte 2 Sekunden

**Erwartetes Ergebnis:**
- Gelber "Offline-Modus" Banner erscheint unten im Bildschirm
- Text zeigt "Offline-Modus" an

### TC-OFF-002: Online-Status wird wieder angezeigt
**Voraussetzung:** App ist im Offline-Modus

**Schritte:**
1. Aktiviere WiFi/DevTools Network wieder
2. Warte 2 Sekunden

**Erwartetes Ergebnis:**
- Offline-Banner verschwindet
- Sync beginnt automatisch (falls ausstehende Daten vorhanden)

---

## Test 3: Fang-Eintragung im Offline-Modus

### TC-CATCH-001: Neuer Fang wird lokal gespeichert (Offline)
**Voraussetzung:** App ist offline

**Schritte:**
1. Deaktiviere Netzwerk
2. Gehe zu Dashboard → "Neuen Fang eintragen"
3. Fülle alle Pflichtfelder aus:
   - Gewässer auswählen
   - Fischart: "Hecht"
   - Länge: 65
   - Gewicht: 2.5
   - Köder: "Gummifisch"
4. Klicke "Fang speichern"

**Erwartetes Ergebnis:**
- Erfolgsmeldung: "Fang lokal gespeichert. Wird synchronisiert..."
- Fang erscheint in der Liste
- Badge zeigt "1 ausstehend" im Offline-Indikator

### TC-CATCH-002: Fang wird synchronisiert (Wiederverbindung)
**Voraussetzung:** Offline erstellter Fang vorhanden

**Schritte:**
1. Aktiviere Netzwerk wieder
2. Warte 5-10 Sekunden (oder klicke "Jetzt synchronisieren")

**Erwartetes Ergebnis:**
- Sync läuft automatisch
- Badge zeigt keine ausstehenden Elemente mehr
- Fang ist jetzt auf dem Server (überprüfe via API-Call)

---

## Test 4: Gewässer-Verwaltung im Offline-Modus

### TC-SPOT-001: Neues Gewässer wird lokal gespeichert (Offline)
**Voraussetzung:** App ist offline

**Schritte:**
1. Deaktiviere Netzwerk
2. Gehe zu Dashboard → Tab "Gewässer"
3. Klicke "+ Neues Gewässer hinzufügen"
4. Gib Namen ein und wähle Typ
5. Klicke "Speichern"

**Erwartetes Ergebnis:**
- Gewässer erscheint in der Liste
- Offline-Indikator zeigt ausstehende Änderung an

---

## Test 5: Sync-Button (iOS)

### TC-SYNC-001: "Sync jetzt" Button ist verfügbar
**Voraussetzung:** iOS Gerät oder iOS User-Agent, ausstehende Daten vorhanden

**Schritte:**
1. Erstelle offline einen Fang (wie in TC-CATCH-001)
2. Klicke auf den "1 zum Sync" Button
3. Klicke "Jetzt synchronisieren"

**Erwartetes Ergebnis:**
- Modal zeigt Synchronisations-Status
- Lade-Animation während Sync
- Erfolgsmeldung nach Abschluss

### TC-SYNC-002: Sync-Error wird angezeigt
**Voraussetzung:** Server ist nicht erreichbar (z.B. 500er Fehler simulieren)

**Schritte:**
1. Blockiere API-Calls im DevTools
2. Versuche zu syncen

**Erwartetes Ergebnis:**
- Fehlermeldung im Modal
- Daten bleiben in der Queue
- Retry-Button verfügbar

---

## Test 6: Progressive Enhancement / Fallback

### TC-FALLBACK-001: App funktioniert ohne Offline-Features
**Voraussetzung:** Browser ohne IndexedDB (z.B. im Private Mode Safari)

**Schritte:**
1. Öffne App im Private/Incognito Mode
2. Versuche Fang zu erstellen

**Erwartetes Ergebnis:**
- App lädt normal
- API-Calls funktionieren (wenn online)
- Keine Fehler in der Console
- Offline-Features sind einfach nicht verfügbar (keine localStorage Fehler)

---

## Test 7: Daten-Migration

### TC-MIG-001: Bestehende Server-Daten werden geladen
**Voraussetzung:** User hat bereits Fänge auf dem Server

**Schritte:**
1. Lösche IndexedDB in DevTools
2. Lade Seite neu
3. Warte bis Dashboard geladen ist

**Erwartetes Ergebnis:**
- Alle bestehenden Fänge werden angezeigt
- Daten werden in IndexedDB zwischengespeichert
- Nachfolgende Offline-Zugriffe sind schnell

---

## Test 8: Fehlerbehandlung

### TC-ERROR-001: Failed syncs werden in Queue behalten
**Voraussetzung:** Netzwerk ist sehr langsam/instabil

**Schritte:**
1. Simuliere langsames Netzwerk (3G) in DevTools
2. Erstelle mehrere Fänge offline
3. Aktiviere langsames Netzwerk
4. Beobachte Sync

**Erwartetes Ergebnis:**
- Queue zeigt alle ausstehenden Items
- Items werden nacheinander synchronisiert
- Fehlerhafte Items bleiben in der Queue mit Retry-Count

---

## Automatisierte Tests

### Unit Tests
```bash
# Teste Offline-Hooks
npm test -- hooks.test.ts

# Teste DB-Initialisierung  
npm test -- db.test.ts

# Teste Sync-Logik
npm test -- sync.test.ts
```

### E2E Tests
```bash
# Cypress E2E Tests
npx cypress run --spec "cypress/e2e/offline-first.cy.ts"
```

---

## Test-Notizen

### Bekannte Einschränkungen:
- Safari im Private Mode: IndexedDB nicht verfügbar → App funktioniert trotzdem
- iOS < 16: Service Worker Limitierungen
- Bilder werden nicht offline gecached (nur URLs)

### Debug-Informationen:
- IndexedDB Status: DevTools → Application → IndexedDB → CatchLogDB
- Service Worker: DevTools → Application → Service Workers
- Network Queue: DevTools → Application → Storage

---

## Abnahmekriterien

✅ Alle TC-DB Tests bestanden  
✅ Alle TC-OFF Tests bestanden  
✅ Alle TC-CATCH Tests bestanden  
✅ Alle TC-SPOT Tests bestanden  
✅ Alle TC-SYNC Tests bestanden (iOS)  
✅ Alle TC-FALLBACK Tests bestanden  
✅ Alle TC-MIG Tests bestanden  
✅ Alle TC-ERROR Tests bestanden  