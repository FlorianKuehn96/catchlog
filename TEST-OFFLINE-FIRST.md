# Offline-First Test-Dokumentation

Umfassende Test-Cases für die Offline-First Funktionalität der Angler-Tracking-App.

---

## 📋 Übersicht

Diese Dokumentation deckt alle Test-Szenarien ab, die für eine robuste Offline-First PWA erforderlich sind.

---

## 1. Manuelle Tests (Browser)

### 1.1 Chrome DevTools: Offline-Modus

| Test | Beschreibung | Status |
|------|--------------|--------|
| ☐ | App im Chrome öffnen (https://localhost:3000 oder deployte URL) |
| ☐ | DevTools öffnen (F12 oder Rechtsklick → Inspect) |
| ☐ | Tab "Network" auswählen |
| ☐ | Dropdown "No throttling" → "Offline" wechseln |
| ☐ | Seite neu laden (F5) - App sollte aus Cache laden |
| ☐ | Neuer Fang eintragen (Offline) |
| ☐ | Fänge anzeigen - Eintrag sollte sichtbar sein |
| ☐ | Offline-Modus deaktivieren |
| ☐ | Sync-Status prüfen - Daten sollten synchronisiert werden |
| ☐ | Cloud-Backend prüfen - Daten sind vorhanden |

**Chrome-spezifische Features testen:**
| ☐ | Background Sync API verfügbar? (Application → Background Sync) |
| ☐ | Service Worker Status prüfen (Application → Service Workers) |
| ☐ | Cache Storage anzeigen (Application → Cache Storage) |
| ☐ | IndexedDB Daten prüfen (Application → IndexedDB → Dexie) |

---

### 1.2 Firefox: Private Window + Netzwerk deaktivieren

| Test | Beschreibung | Status |
|------|--------------|--------|
| ☐ | Private Window öffnen (Ctrl+Shift+P / Cmd+Shift+P) |
| ☐ | App URL eingeben und laden |
| ☐ | Netzwerk deaktivieren (Flugmodus oder Netzwerk trennen) |
| ☐ | Seite neu laden - App sollte funktionieren |
| ☐ | Datensatz erstellen (z.B. neuer Fang) |
| ☐ | Datensatz bearbeiten |
| ☐ | Datensatz löschen (mit "Gelöscht" markieren) |
| ☐ | Netzwerk wieder aktivieren |
| ☐ | Sync-Prozess startet automatisch? |
| ☐ | Konflikte prüfen - Keine Duplikate?

**Firefox-spezifische Prüfungen:**
| ☐ | Storage Persistence (about:persistence) |
| ☐ | Service Worker in about:debugging |
| ☐ | Push-Benachrichtigungen funktionieren? |

---

### 1.3 Safari (Mac): Develop Menu → Offline

| Test | Beschreibung | Status |
|------|--------------|--------|
| ☐ | Develop Menu aktivieren (Preferences → Advanced → Show Develop menu) |
| ☐ | App in Safari öffnen |
| ☐ | Develop → Network → Offline auswählen |
| ☐ | Seite neu laden (Cmd+R) |
| ☐ | Offline-Daten erstellen |
| ☐ | App-Funktionalität testen (alle CRUD-Operationen) |
| ☐ | Develop → Network → Online wiederherstellen |
| ☐ | Sync-Verhalten beobachten |

**Safari-spezifische Tests:**
| ☐ | Application Cache vs Service Worker Verhalten |
| ☐ | IndexedDB Support prüfen |
| ☐ | Web SQL Fallback funktioniert? |
| ☐ | Mobile Safari Simulation (Responsive Design Mode) |

---

### 1.4 iOS Simulator Test (Xcode)

| Test | Beschreibung | Status |
|------|--------------|--------|
| ☐ | Xcode öffnen → Open Developer Tool → Simulator |
| ☐ | iPhone-Gerät auswählen (iPhone 14/15) |
| ☐ | Safari öffnen und App laden |
| ☐ | "Zum Home-Bildschirm" hinzufügen testen |
| ☐ | App vom Home-Screen starten (Standalone-Modus) |
| ☐ | Flugmodus aktivieren (Control Center) |
| ☐ | Offline-Funktionalität testen |
| ☐ | Flugmodus deaktivieren |
| ☐ | Sync nach Wiederverbindung |

**iOS Simulator-spezifisch:**
| ☐ | Shake-Gesture für Sync-Trigger testen |
| ☐ | App im Hintergrund (Home-Button) und wieder öffnen |
| ☐ | App beenden (Swipe up) und neu starten |
| ☐ | Storage-Limit simulieren (Settings → Safari → Clear History) |

---

## 2. Automatisierte Tests (Code-Beispiele)

### 2.1 Jest Tests für Dexie.js Operationen

```typescript
// __tests__/dexie.offline.test.ts
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { db } from '../src/db';
import { Fang } from '../src/types';

describe('Dexie.js Offline Operations', () => {
  beforeEach(async () => {
    await db.faenge.clear();
    await db.syncQueue.clear();
  });

  afterEach(async () => {
    await db.delete();
    await db.open();
  });

  it('sollte Fänge offline speichern', async () => {
    const fang: Fang = {
      id: 'local-1',
      fischart: 'Hecht',
      gewicht: 2500,
      laenge: 65,
      datum: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending'
    };

    await db.faenge.add(fang);
    const saved = await db.faenge.get('local-1');
    
    expect(saved).toBeDefined();
    expect(saved?.fischart).toBe('Hecht');
    expect(saved?.syncStatus).toBe('pending');
  });

  it('sollte Sync-Queue befüllen', async () => {
    const operation = {
      id: crypto.randomUUID(),
      table: 'faenge',
      operation: 'create',
      data: { id: 'test-1', fischart: 'Barsch' },
      timestamp: Date.now(),
      retryCount: 0
    };

    await db.syncQueue.add(operation);
    const queue = await db.syncQueue.toArray();
    
    expect(queue).toHaveLength(1);
    expect(queue[0].operation).toBe('create');
  });

  it('sollte Konflikte erkennen', async () => {
    const baseFang = {
      id: 'conflict-1',
      fischart: 'Zander',
      syncStatus: 'synced',
      updatedAt: new Date('2024-01-01')
    };

    await db.faenge.add(baseFang);
    
    // Simuliere externe Änderung (neuer Timestamp)
    const externalUpdate = {
      ...baseFang,
      gewicht: 3000,
      updatedAt: new Date('2024-01-02')
    };

    // Konflikt-Erkennung
    const existing = await db.faenge.get('conflict-1');
    const hasConflict = existing && 
      new Date(externalUpdate.updatedAt) > new Date(existing.updatedAt);
    
    expect(hasConflict).toBe(true);
  });

  it('sollte Bulk-Operations unterstützen', async () => {
    const fänge: Fang[] = Array.from({ length: 100 }, (_, i) => ({
      id: `bulk-${i}`,
      fischart: ['Hecht', 'Barsch', 'Zander'][i % 3],
      gewicht: 1000 + i * 10,
      datum: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending'
    }));

    const startTime = performance.now();
    await db.faenge.bulkAdd(fänge);
    const duration = performance.now() - startTime;

    const count = await db.faenge.count();
    expect(count).toBe(100);
    expect(duration).toBeLessThan(1000); // Unter 1 Sekunde
  });

  it('sollte Transaktionen atomar ausführen', async () => {
    await db.transaction('rw', [db.faenge, db.syncQueue], async () => {
      await db.faenge.add({ id: 'tx-1', fischart: 'Aal' });
      await db.syncQueue.add({ 
        id: 'tx-op-1', 
        table: 'faenge',
        operation: 'create' 
      });
      // Rollback bei Fehler
      throw new Error('Simulierter Fehler');
    }).catch(() => {});

    const fangCount = await db.faenge.where('id').equals('tx-1').count();
    expect(fangCount).toBe(0); // Rolled back
  });
});
```

**Test-Ausführung:**
| Test | Befehl | Status |
|------|--------|--------|
| ☐ | `npm test -- dexie.offline.test.ts` |
| ☐ | `npm test -- --coverage` |
| ☐ | `npm test -- --watch` (für Entwicklung) |

---

### 2.2 Cypress Tests für UI-Flows

```typescript
// cypress/e2e/offline-flows.cy.ts
describe('Offline UI Flows', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
    cy.clearIndexedDb('AnglerDB');
  });

  it('sollte Offline-Indikator anzeigen', () => {
    // Offline gehen
    cy.goOffline();
    
    cy.get('[data-testid="offline-indicator"]')
      .should('be.visible')
      .and('contain', 'Offline');
    
    cy.get('[data-testid="sync-status"]')
      .should('contain', 'Warte auf Verbindung');
  });

  it('sollte Fänge offline erstellen', () => {
    cy.goOffline();
    
    cy.get('[data-testid="add-fang-btn"]').click();
    cy.get('[data-testid="fischart-input"]').type('Hecht');
    cy.get('[data-testid="gewicht-input"]').type('2500');
    cy.get('[data-testid="save-fang-btn"]').click();
    
    // Offline-Badge sollte angezeigt werden
    cy.get('[data-testid="fang-card"]')
      .first()
      .find('[data-testid="offline-badge"]')
      .should('be.visible');
    
    // In IndexedDB gespeichert?
    cy.getIndexedDb('AnglerDB', 'faenge').then((fänge) => {
      expect(fänge).to.have.length(1);
      expect(fänge[0].syncStatus).to.equal('pending');
    });
  });

  it('sollte Sync nach Wiederverbindung durchführen', () => {
    // Offline: Fang erstellen
    cy.goOffline();
    cy.get('[data-testid="add-fang-btn"]').click();
    cy.get('[data-testid="fischart-input"]').type('Barsch');
    cy.get('[data-testid="gewicht-input"]').type('800');
    cy.get('[data-testid="save-fang-btn"]').click();
    
    // Wieder online
    cy.goOnline();
    
    // Sync-Animation sollte angezeigt werden
    cy.get('[data-testid="sync-spinner"]', { timeout: 10000 })
      .should('be.visible');
    
    // Nach Sync: Badge sollte verschwinden
    cy.get('[data-testid="offline-badge"]', { timeout: 10000 })
      .should('not.exist');
    
    // Sync-Status sollte "Synchronisiert" anzeigen
    cy.get('[data-testid="sync-status"]')
      .should('contain', 'Synchronisiert');
  });

  it('sollte Konflikt-UI anzeigen', () => {
    // Simuliere Konflikt-Szenario
    cy.window().then((win) => {
      win.localStorage.setItem('simulation-mode', 'conflict');
    });
    
    cy.get('[data-testid="add-fang-btn"]').click();
    cy.get('[data-testid="fischart-input"]').type('Zander');
    cy.get('[data-testid="save-fang-btn"]').click();
    
    // Konflikt-Dialog sollte erscheinen
    cy.get('[data-testid="conflict-dialog"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-testid="local-version"]').should('be.visible');
        cy.get('[data-testid="remote-version"]').should('be.visible');
        cy.get('[data-testid="resolve-local-btn"]').click();
      });
    
    cy.get('[data-testid="conflict-dialog"]').should('not.exist');
  });

  it('sollte Bulk-Import offline verarbeiten', () => {
    cy.goOffline();
    
    cy.get('[data-testid="import-btn"]').click();
    cy.get('[data-testid="file-input"]')
      .selectFile('cypress/fixtures/100-faenge.csv', { force: true });
    
    cy.get('[data-testid="import-progress"]', { timeout: 30000 })
      .should('contain', '100/100');
    
    cy.get('[data-testid="sync-status-badge"]')
      .should('contain', '100 ausstehend');
  });

  // Custom Commands
  Cypress.Commands.add('goOffline', () => {
    cy.log('Gehe offline');
    cy.intercept('*', (req) => {
      req.destroy(); // Blockiere alle Requests
    }).as('offline');
    cy.window().then((win) => {
      win.dispatchEvent(new Event('offline'));
    });
  });

  Cypress.Commands.add('goOnline', () => {
    cy.log('Gehe online');
    cy.intercept('*').as('online');
    cy.window().then((win) => {
      win.dispatchEvent(new Event('online'));
    });
  });

  Cypress.Commands.add('getIndexedDb', (dbName, table) => {
    return cy.window().then((win) => {
      return new Promise((resolve) => {
        const request = win.indexedDB.open(dbName);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction(table, 'readonly');
          const store = tx.objectStore(table);
          const getAll = store.getAll();
          getAll.onsuccess = () => resolve(getAll.result);
        };
      });
    });
  });
});
```

**Cypress Test-Ausführung:**
| Test | Befehl | Status |
|------|--------|--------|
| ☐ | `npx cypress open` (interaktiv) |
| ☐ | `npx cypress run --spec "cypress/e2e/offline-flows.cy.ts"` |
| ☐ | `npx cypress run --record` (mit Dashboard) |

---

### 2.3 Playwright Tests für Service Worker

```typescript
// playwright/offline-sw.spec.ts
import { test, expect, chromium } from '@playwright/test';

test.describe('Service Worker Offline Tests', () => {
  test.beforeEach(async ({ context }) => {
    // Service Worker erlauben
    await context.grantPermissions(['notifications']);
  });

  test('sollte Service Worker registrieren', async ({ page }) => {
    await page.goto('/');
    
    const swRegistration = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return {
        scope: registration.scope,
        active: registration.active?.state,
        installing: registration.installing?.state
      };
    });
    
    expect(swRegistration.active).toBe('activated');
    expect(swRegistration.scope).toContain(window.location.origin);
  });

  test('sollte Offline-Cache bedienen', async ({ browser }) => {
    // Neuer Context für echtes Offline-Verhalten
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Zuerst online laden
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Offline gehen
    await context.setOffline(true);
    
    // Seite neu laden - sollte aus Cache funktionieren
    await page.reload();
    
    // App sollte geladen sein
    await expect(page.locator('[data-testid="app-root"]')).toBeVisible();
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
  });

  test('sollte Background Sync registrieren', async ({ page }) => {
    await page.goto('/');
    
    const bgSyncSupported = await page.evaluate(() => {
      return 'sync' in ServiceWorkerRegistration.prototype;
    });
    
    test.skip(!bgSyncSupported, 'Background Sync nicht unterstützt');
    
    const syncTags = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      const tags = await registration.sync.getTags();
      return tags;
    });
    
    // Nach Sync-Operation sollte Tag vorhanden sein
    await page.goto('/');
    await page.click('[data-testid="add-fang-btn"]');
    await page.fill('[data-testid="fischart-input"]', 'Hecht');
    await page.click('[data-testid="save-fang-btn"]');
    
    // Warte auf Sync-Registrierung
    await page.waitForTimeout(500);
    
    const newTags = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return await registration.sync.getTags();
    });
    
    expect(newTags).toContain('sync-faenge');
  });

  test('sollte Cache-Strategie korrekt anwenden', async ({ page, context }) => {
    // Cache-Strategie: Cache First, dann Network
    await page.goto('/');
    
    // Warte auf SW-Aktivierung
    await page.waitForFunction(() => {
      return navigator.serviceWorker.controller !== null;
    });
    
    // Lade eine Ressource
    const response = await page.evaluate(async () => {
      const start = performance.now();
      const res = await fetch('/api/faenge');
      const time = performance.now() - start;
      return { 
        fromCache: res.headers.get('X-From-Cache'),
        status: res.status,
        time
      };
    });
    
    // Zweite Anfrage sollte schneller sein (aus Cache)
    const cachedResponse = await page.evaluate(async () => {
      const start = performance.now();
      const res = await fetch('/api/faenge');
      return {
        fromCache: res.headers.get('X-From-Cache'),
        time: performance.now() - start
      };
    });
    
    expect(cachedResponse.time).toBeLessThan(response.time);
  });

  test('sollte Push-Notification empfangen (falls unterstützt)', async ({ page }) => {
    const pushSupported = await page.evaluate(() => {
      return 'PushManager' in window;
    });
    
    test.skip(!pushSupported, 'Push nicht unterstützt');
    
    // Simuliere Push
    await page.evaluate(() => {
      const registration = navigator.serviceWorker.ready;
      return registration.then(reg => {
        // Simulierter Push für Testzwecke
        reg.showNotification('Test', { body: 'Sync abgeschlossen' });
      });
    });
    
    // Notification sollte angezeigt werden
    await expect(page.locator('text=Sync abgeschlossen')).toBeVisible();
  });

  test('sollte Update-Mechanismus testen', async ({ page }) => {
    await page.goto('/');
    
    // Simuliere Service Worker Update
    const updateAvailable = await page.evaluate(async () => {
      return new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          resolve(true);
        });
        
        // Timeout nach 5 Sekunden
        setTimeout(() => resolve(false), 5000);
      });
    });
    
    // Update-Banner sollte erscheinen
    if (updateAvailable) {
      await expect(page.locator('[data-testid="update-banner"]')).toBeVisible();
    }
  });
});
```

**Playwright Test-Ausführung:**
| Test | Befehl | Status |
|------|--------|--------|
| ☐ | `npx playwright test offline-sw.spec.ts` |
| ☐ | `npx playwright test --headed` (sichtbar) |
| ☐ | `npx playwright test --project=chromium` (spezifischer Browser) |

---

## 3. Edge Cases

### 3.1 Schnelles Online/Offline toggeln

| Test | Beschreibung | Erwartetes Verhalten | Status |
|------|--------------|---------------------|--------|
| ☐ | 5x schnell hintereinander Offline/Online wechseln | Keine doppelten Syncs | |
| ☐ | Sync während Status-Wechsel | Sauberer Abbruch/Wiederaufnahme | |
| ☐ | Mehrere schnelle Änderungen | Batching in Sync-Queue | |
| ☐ | Online → Offline während Sync läuft | Pending-Status korrekt gesetzt | |
| ☐ | Offline → Online während Queue leer | Kein Fehler, sauberer Durchlauf | |

**Test-Skript:**
```javascript
// Schnelles Toggeln simulieren
async function rapidToggleTest() {
  for (let i = 0; i < 5; i++) {
    window.dispatchEvent(new Event('offline'));
    await sleep(100);
    window.dispatchEvent(new Event('online'));
    await sleep(100);
  }
  // Prüfe: Nur 1 Sync-Vorgang sollte geplant sein
}
```

---

### 3.2 Mehrere Tabs gleichzeitig

| Test | Beschreibung | Erwartetes Verhalten | Status |
|------|--------------|---------------------|--------|
| ☐ | Tab 1: Offline, Tab 2: Online | Unabhängige Status | |
| ☐ | Beide Tabs: Offline-Änderungen | BroadcastChannel Sync | |
| ☐ | Tab 1: Sync starten, Tab 2: Änderung | Keine Konflikte | |
| ☐ | 10+ Tabs gleichzeitig öffnen | Performance stabil | |
| ☐ | Tab schließen während Sync | Keine Datenkorruption | |

**BroadcastChannel Test:**
```javascript
// Cross-Tab Kommunikation testen
const channel = new BroadcastChannel('angler-sync');
channel.postMessage({ type: 'SYNC_REQUEST', timestamp: Date.now() });
```

---

### 3.3 Browser-Crash während Sync

| Test | Beschreibung | Erwartetes Verhalten | Status |
|------|--------------|---------------------|--------|
| ☐ | Hard-Reload (F5) während Sync | Sync-Queue erhalten | |
| ☐ | Tab schließen während Sync | Retry-Count erhöht | |
| ☐ | Browser komplett schließen | Daten persistent | |
| ☐ | Crash während IndexedDB-Transaktion | Rollback korrekt | |
| ☐ | Wiederherstellung nach Crash | Sync wird fortgesetzt | |

**Simulation:**
```javascript
// Vor Absichtlichem Crash
window.addEventListener('beforeunload', () => {
  localStorage.setItem('last-sync-state', JSON.stringify({
    timestamp: Date.now(),
    inProgress: true
  }));
});
```

---

### 3.4 Storage-Limit erreicht

| Test | Beschreibung | Erwartetes Verhalten | Status |
|------|--------------|---------------------|--------|
| ☐ | Quota prüfen (`navigator.storage.estimate()`) | Warnung bei >80% | |
| ☐ | Storage-Limit simulieren | Graceful Degradation | |
| ☐ | Alte Daten archivieren | FIFO-Prinzip | |
| ☐ | Storage voll: Neuer Fang | Fehlermeldung + Handlungsoptionen | |
| ☐ | Aufgeräumte Daten wiederherstellen | Verfügbar via Cloud | |

**Storage-Überwachung:**
```javascript
async function checkStorage() {
  const estimate = await navigator.storage.estimate();
  const usedPercent = (estimate.usage / estimate.quota) * 100;
  
  if (usedPercent > 80) {
    // Zeige Warnung
    showStorageWarning(usedPercent);
  }
  
  if (usedPercent > 95) {
    // Archiviere alte Daten
    await archiveOldData();
  }
}
```

---

### 3.5 Konflikte beim gleichzeitigen Editieren

| Test | Beschreibung | Erwartetes Verhalten | Status |
|------|--------------|---------------------|--------|
| ☐ | Gerät A & B: Gleicher Fang offline bearbeiten | Konflikt-Detection | |
| ☐ | Unterschiedliche Felder editiert | Automatisches Merging | |
| ☐ | Gleiches Feld editiert | Konflikt-UI anzeigen | |
| ☐ | Gerät A löscht, Gerät B editiert | Löschung gewinnt? | |
| ☐ | Zeitstempel-Strategie testen | Letzte Änderung gewinnt? | |

**Konflikt-Resolution-Strategien:**
```typescript
enum ConflictStrategy {
  LAST_WRITE_WINS = 'last-write-wins',
  FIRST_WRITE_WINS = 'first-write-wins',
  MANUAL_MERGE = 'manual-merge',
  SERVER_WINS = 'server-wins',
  CLIENT_WINS = 'client-wins'
}
```

---

## 4. iOS-spezifische Tests

### 4.1 Background Sync nicht verfügbar

| Test | Beschreibung | Erwartetes Verhalten | Status |
|------|--------------|---------------------|--------|
| ☐ | `'sync' in ServiceWorkerRegistration.prototype` prüfen | `false` auf iOS | |
| ☐ | Fallback: Manuelles Sync-UI | Button sichtbar | |
| ☐ | App in Hintergrund: Kein Auto-Sync | Beim Reopen anzeigen | |
| ☐ | Periodische Sync-Alternative | setInterval Fallback | |
| ☐ | Push-Notification als Trigger | Falls verfügbar nutzen | |

**iOS Feature Detection:**
```javascript
function getSyncStrategy() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const supportsBackgroundSync = 'sync' in ServiceWorkerRegistration.prototype;
  
  if (isIOS || !supportsBackgroundSync) {
    return 'manual'; // Oder 'periodic'
  }
  return 'background-sync';
}
```

---

### 4.2 Manueller Sync-Button

| Test | Beschreibung | Erwartetes Verhalten | Status |
|------|--------------|---------------------|--------|
| ☐ | Button bei Offline-Änderungen sichtbar | Badge mit Anzahl | |
| ☐ | Click: Sync starten | Spinner anzeigen | |
| ☐ | Erfolg: Toast/Notification | "X Fänge synchronisiert" | |
| ☐ | Fehler: Retry-Option | "Erneut versuchen" Button | |
| ☐ | Pull-to-Refresh | Löst auch Sync aus | |

**UI-Elemente:**
| Element | Test-Selektor | Status |
|---------|---------------|--------|
| ☐ | `data-testid="manual-sync-btn"` | |
| ☐ | `data-testid="sync-badge-count"` | |
| ☐ | `data-testid="sync-spinner"` | |
| ☐ | `data-testid="sync-success-toast"` | |
| ☐ | `data-testid="sync-error-message"` | |

---

### 4.3 App-Icon zum Homescreen hinzufügen

| Test | Beschreibung | Erwartetes Verhalten | Status |
|------|--------------|---------------------|--------|
| ☐ | "Zum Home-Bildschirm" Dialog | iOS Safari Share-Menü | |
| ☐ | Icon Rendering | 180x180 Touch-Icon | |
| ☐ | Splash Screen | `apple-touch-startup-image` | |
| ☐ | Standalone-Modus erkennen | `display-mode: standalone` | |
| ☐ | Status-Bar Style | `apple-mobile-web-app-status-bar-style` | |
| ☐ | Keine Browser-UI | Keine URL-Leiste | |
| ☐ | iPhone vs iPad | Responsive Anpassung | |

**Manifest & Meta-Tags prüfen:**
| Tag | Vorhanden | Status |
|-----|-----------|--------|
| ☐ | `<meta name="apple-mobile-web-app-capable" content="yes">` | |
| ☐ | `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">` | |
| ☐ | `<link rel="apple-touch-icon" href="/icon-180.png">` | |
| ☐ | `apple-touch-startup-image` für alle Screen-Size | |

---

## 5. Performance-Tests

### 5.1 Bulk-Import von 100+ Fängen

| Test | Szenario | Zielwert | Status |
|------|----------|----------|--------|
| ☐ | 100 Fänge importieren | < 3 Sekunden | |
| ☐ | 500 Fänge importieren | < 10 Sekunden | |
| ☐ | 1000 Fänge importieren | < 30 Sekunden | |
| ☐ | Import während Offline | Keine UI-Blockierung | |
| ☐ | Import-Progress anzeigen | Smooth Updates | |
| ☐ | Import abbrechen | Sauberer Abbruch | |

**Performance-Benchmark:**
```javascript
// Benchmark-Code
async function benchmarkBulkImport(count) {
  const data = generateTestFänge(count);
  
  performance.mark('import-start');
  await db.faenge.bulkAdd(data);
  performance.mark('import-end');
  
  const measure = performance.measure(
    'bulk-import',
    'import-start',
    'import-end'
  );
  
  console.log(`${count} Fänge in ${measure.duration}ms`);
  return measure.duration;
}
```

**Zielwerte:**
| Anzahl | Max. Zeit | Memory-Impact | Status |
|--------|-----------|---------------|--------|
| ☐ 100 | < 3000ms | < 50MB | |
| ☐ 500 | < 10000ms | < 100MB | |
| ☐ 1000 | < 30000ms | < 200MB | |

---

### 5.2 Sync-Dauer messen

| Test | Szenario | Zielwert | Status |
|------|----------|----------|--------|
| ☐ | 1 Fang syncen | < 500ms | |
| ☐ | 10 Fänge syncen | < 2 Sekunden | |
| ☐ | 50 Fänge syncen | < 5 Sekunden | |
| ☐ | 100 Fänge syncen | < 10 Sekunden | |
| ☐ | Sync mit langsamer Verbindung (3G) | Timeout-Handling | |
| ☐ | Concurrent Syncs | Keine Dopplung | |

**Sync-Monitoring:**
```typescript
interface SyncMetrics {
  operationCount: number;
  startTime: number;
  endTime: number;
  duration: number;
  bytesTransferred: number;
  errors: number;
  retries: number;
}

// Usage
const metrics = await syncWithMetrics(pendingOperations);
console.log(`Sync completed in ${metrics.duration}ms`);
```

---

### 5.3 Memory-Usage überwachen

| Test | Szenario | Zielwert | Status |
|------|----------|----------|--------|
| ☐ | Baseline-Memory | < 50MB Heap | |
| ☐ | Nach 100 Fängen laden | < 100MB Heap | |
| ☐ | Nach 1 Stunde Nutzung | Kein Memory Leak | |
| ☐ | Während Bulk-Import | Keine OOM-Fehler | |
| ☐ | Nach Cache-Clear | Memory freigegeben | |
| ☐ | Performance.now() Tracking | 60 FPS erhalten | |

**Memory-Profil:**
```javascript
// Memory-Monitoring
function logMemoryUsage(label) {
  if (performance.memory) {
    const memory = performance.memory;
    console.log(`[${label}]`, {
      usedJSHeapSize: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      totalJSHeapSize: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
    });
  }
}

// Regelmäßiges Monitoring
setInterval(() => logMemoryUsage('periodic'), 30000);
```

**Chrome DevTools Memory Tab:**
| Test | Vorgehen | Status |
|------|----------|--------|
| ☐ | Heap Snapshot erstellen (Baseline) | |
| ☐ | Aktion durchführen (z.B. 100 Fänge laden) | |
| ☐ | Heap Snapshot erstellen (Nach Aktion) | |
| ☐ | Comparison View: Memory-Leaks identifizieren | |
| ☐ | Allocation Timeline aufzeichnen | |

---

## 📊 Test-Checkliste Zusammenfassung

### Manuelle Tests
| Kategorie | Anzahl | ☐ Erledigt |
|-----------|--------|-----------|
| Chrome DevTools | 10 | ☐ |
| Firefox | 10 | ☐ |
| Safari (Mac) | 8 | ☐ |
| iOS Simulator | 10 | ☐ |

### Automatisierte Tests
| Framework | Test-Dateien | ☐ Läuft |
|-----------|--------------|---------|
| Jest | `dexie.offline.test.ts` | ☐ |
| Cypress | `offline-flows.cy.ts` | ☐ |
| Playwright | `offline-sw.spec.ts` | ☐ |

### Edge Cases
| Kategorie | Anzahl | ☐ Getestet |
|-----------|--------|------------|
| Rapid Toggle | 5 | ☐ |
| Multi-Tab | 5 | ☐ |
| Crash Recovery | 5 | ☐ |
| Storage Limit | 5 | ☐ |
| Konflikte | 5 | ☐ |

### iOS-spezifisch
| Kategorie | Anzahl | ☐ Getestet |
|-----------|--------|------------|
| Background Sync Fallback | 5 | ☐ |
| Manuelles Sync | 5 | ☐ |
| Home-Screen | 7 | ☐ |

### Performance
| Kategorie | Anzahl | ☐ Getestet |
|-----------|--------|------------|
| Bulk-Import | 6 | ☐ |
| Sync-Dauer | 6 | ☐ |
| Memory | 6 | ☐ |

---

## 🚀 Test-Ausführung

### Einmalige Ausführung
```bash
# Alle Tests
npm run test:all

# Nur Offline-Tests
npm run test:offline

# Manuelle Tests (mit Playwright)
npx playwright test --grep "offline"

# Mit Coverage
npm run test:coverage
```

### CI/CD Integration
```yaml
# .github/workflows/offline-tests.yml
name: Offline-First Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Jest Tests
        run: npm test -- dexie.offline.test.ts
      - name: Run Playwright Tests
        run: npx playwright test offline-sw.spec.ts
      - name: Run Cypress Tests
        run: npx cypress run --spec "cypress/e2e/offline-flows.cy.ts"
```

---

## 📝 Anmerkungen

- Aktualisiere diese Checkliste nach jeder Test-Runde
- Dokumentiere gefundene Bugs mit Referenz zu GitHub Issues
- Performance-Baseline bei jeder Version speichern

---

*Letzte Aktualisierung: 2025-01-XX*
*Version: 1.0*
