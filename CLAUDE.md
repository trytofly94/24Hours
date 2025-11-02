# Projekt-Konfiguration für 24Hours PWA

## 1. Projektbeschreibung

**24Hours** ist eine Progressive Web App (PWA) für intuitive Tagesplanung mit einer innovativen 24-Stunden-Kreisvisualisierung. Die App ermöglicht es Nutzern, ihren Tag visuell zu planen, wobei die Zeit als kreisförmige Darstellung präsentiert wird.

### Projektziele

- **Phase 1**: Lokale PWA mit Browser-basierter Speicherung (localStorage/IndexedDB)
- **Phase 2**: Integration mit Google Calendar API
- **Phase 3**: Server-basiertes Hosting mit Backend-Integration
- Offline-First Ansatz für maximale Verfügbarkeit
- Moderne, intuitive Benutzeroberfläche basierend auf Kreisvisualisierung
- Responsive Design für Mobile und Desktop

## 2. Technologie-Stack

### Frontend
- **Sprache**: JavaScript (ES6+) / TypeScript (optional für spätere Phasen)
- **Build-Tool**: Vite 5.x (schnelles HMR, optimierte Builds)
- **CSS**: Vanilla CSS mit CSS-Variablen für Theming
- **Icons**: SVG-basiert oder Font Awesome

### PWA-Komponenten
- **Service Worker**: Workbox 7.x (für Caching-Strategien)
- **Manifest**: Web App Manifest für Installation
- **Storage**:
  - localStorage für einfache Einstellungen
  - IndexedDB für komplexe Datenstrukturen (via localforage)

### Entwicklungs-Tools
- **Paketmanager**: npm
- **Dev-Server**: Vite Dev Server (mit HMR)
- **Testing**: Vitest (Unit-Tests) + Playwright (E2E-Tests)
- **Linting**: ESLint mit Standard-Config
- **Formatting**: Prettier

### Zukünftige Erweiterungen
- Google Calendar API Integration
- Backend: Node.js + Express (oder Serverless Functions)
- Datenbank: PostgreSQL oder Firebase

## 3. Wichtige Befehle

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten (mit Hot Module Replacement)
npm run dev

# Production Build erstellen
npm run build

# Build-Vorschau lokal testen
npm run preview

# Tests ausführen (Unit-Tests)
npm test

# E2E-Tests ausführen
npm run test:e2e

# Linter ausführen
npm run lint

# Code formatieren
npm run format

# Service Worker generieren (Workbox)
npm run build:sw
```

## 4. Projektstruktur

```
24Hours/
├── public/                  # Statische Assets (nicht verarbeitet von Vite)
│   ├── manifest.json       # PWA Manifest
│   ├── icons/              # App Icons (verschiedene Größen)
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   └── icon-512x512.png
│   └── robots.txt
├── src/                     # Quellcode
│   ├── assets/             # Verarbeitete Assets (Bilder, Fonts)
│   ├── components/         # UI-Komponenten
│   │   ├── CircleView.js  # Hauptkreis-Visualisierung
│   │   ├── TimeBlock.js   # Einzelne Zeitblöcke
│   │   ├── EventModal.js  # Event-Erstellung/-Bearbeitung
│   │   └── SettingsPanel.js
│   ├── lib/                # Utility-Funktionen
│   │   ├── storage.js     # LocalStorage/IndexedDB Wrapper
│   │   ├── timeUtils.js   # Zeit-Berechnungen
│   │   └── eventManager.js # Event-Logik
│   ├── services/           # Service-Layer
│   │   ├── calendarService.js # (später: Google Calendar)
│   │   └── syncService.js     # Sync-Logik
│   ├── styles/             # CSS-Dateien
│   │   ├── main.css       # Globale Styles
│   │   ├── circle.css     # Kreis-spezifische Styles
│   │   └── variables.css  # CSS Custom Properties
│   ├── sw.js              # Service Worker (Workbox)
│   ├── main.js            # App Entry Point
│   └── index.html         # HTML Entry Point
├── tests/                  # Tests
│   ├── unit/              # Unit-Tests
│   └── e2e/               # End-to-End Tests
├── scratchpads/           # Agenten-Workflow
│   ├── active/            # Aktive Scratchpads
│   └── completed/         # Abgeschlossene Scratchpads
├── .gitignore
├── package.json
├── vite.config.js         # Vite-Konfiguration
├── vitest.config.js       # Test-Konfiguration
├── .eslintrc.json         # ESLint-Konfiguration
├── .prettierrc            # Prettier-Konfiguration
├── CLAUDE.md              # Diese Datei
└── README.md              # Projekt-Dokumentation
```

## 5. Architektur-Übersicht

### Kern-Architektur

**Komponentenstruktur:**
- **CircleView**: Hauptkomponente für die 24-Stunden-Visualisierung
  - Rendert SVG-basierten Kreis mit 24 Segmenten
  - Verwaltet Interaktionen (Click, Drag für Event-Erstellung)
  - Event-Binding für Zeitblock-Auswahl

- **TimeBlock**: Repräsentiert einen einzelnen Zeitblock im Kreis
  - Datenstruktur: `{id, start, end, title, description, color, category}`
  - Visuelle Darstellung als Arc-Segment

- **EventModal**: Modal für Event-Erstellung und -Bearbeitung
  - Formular mit Zeit-Picker, Titel, Beschreibung, Kategorie
  - Validierung von Zeitüberschneidungen

**Datenfluss:**
1. User-Interaktion → Component Event Handler
2. Event Handler → EventManager (Business Logic)
3. EventManager → Storage Layer (Persistierung)
4. Storage Layer → Component Update (Re-Render)

### Service Worker Strategie

- **Caching-Strategie**: Cache-First für statische Assets, Network-First für API-Calls
- **Offline-Funktionalität**: Alle Core-Features funktionieren offline
- **Background Sync**: Queue für spätere Synchronisation (Phase 2)

### Datenspeicherung

**Phase 1 (aktuell):**
- IndexedDB via localforage für Event-Daten
- localStorage für User-Einstellungen (Theme, Sprache)

**Phase 2 (geplant):**
- Google Calendar API Integration
- Bidirektionale Synchronisation
- Conflict-Resolution bei Offline-Änderungen

### Performance-Ziele

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse PWA Score**: 90+
- **Bundle-Größe**: < 200KB (gzipped)

## 6. Code-Konventionen

### JavaScript/TypeScript
- **Stil**: ESLint Standard Config
- **Naming Conventions**:
  - camelCase für Variablen und Funktionen
  - PascalCase für Komponenten/Klassen
  - SCREAMING_SNAKE_CASE für Konstanten
- **Kommentare**: JSDoc für öffentliche Funktionen
- **Module**: ES6 Modules (import/export)

### CSS
- **Methodik**: BEM (Block-Element-Modifier) für Klassennamen
- **Beispiel**: `.circle__segment--active`
- **Variablen**: CSS Custom Properties für Theming
- **Mobile-First**: Responsive Design mit Mobile-First Ansatz
- **Browser-Support**: Moderne Browser (ES6+), IE11 nicht unterstützt

### Dateistruktur
- Ein Component = Ein File (außer bei sehr kleinen Utility-Komponenten)
- Co-location: CSS neben zugehörigem JS (wenn component-spezifisch)
- Tests neben Source-Files: `component.js` + `component.test.js`

### Git-Workflow
- **Branch-Naming**: `feature/beschreibung`, `fix/beschreibung`, `docs/beschreibung`
- **Commits**: Conventional Commits Format
  - `feat: Add circle visualization`
  - `fix: Correct time calculation for PM hours`
  - `docs: Update setup instructions`
- **PR-Beschreibungen**: Link zu Issue und Scratchpad

### Error Handling
- Nutze try-catch für asynchrone Operationen
- Zeige benutzerfreundliche Fehlermeldungen
- Logge technische Details in Console (dev) / Sentry (prod, später)

## 7. Hinweise für die Agenten

### Für den Planner-Agent (`planner`)
- **Kontext**: Dieses Projekt befindet sich in Phase 1 (lokale PWA)
- **Scratchpad-Location**: `scratchpads/active/[task-id]_[datum].md`
- **Recherche**: Prüfe auf existierende Scratchpads für ähnliche Features
- **Dependencies**: Berücksichtige die Kreis-Visualisierung als Kern-Feature

### Für den Creator-Agent (`creator`)
- **Branch-Strategie**: Erstelle Feature-Branches von `main`
- **Code-Location**: Neue Komponenten in `src/components/`, Utilities in `src/lib/`
- **PWA-Anforderungen**:
  - Service Worker muss bei Änderungen neu generiert werden
  - Manifest.json aktualisieren bei neuen Features
  - Icons in verschiedenen Größen bereitstellen
- **Stil**: Befolge BEM-Konventionen für CSS
- **Dokumentation**: JSDoc für alle exportierten Funktionen

### Für den Tester-Agent (`tester`)
- **Test-Framework**: Vitest für Unit-Tests, Playwright für E2E
- **Test-Location**: `tests/unit/` und `tests/e2e/`
- **Ausführung**: `npm test` für Unit-Tests, `npm run test:e2e` für E2E
- **Coverage-Ziel**: Minimum 70% für neue Features
- **PWA-Tests**:
  - Teste Offline-Funktionalität
  - Teste Service Worker Caching
  - Teste Installation als PWA
- **Mock-Daten**: Erstelle Mock-Events in `tests/mocks/events.js`

#### Playwright MCP Testing

**Verfügbare MCP-Tools für Browser-Testing:**

Der Tester-Agent hat Zugriff auf spezielle Playwright MCP-Tools, die direkte Browser-Interaktionen ermöglichen. Diese Tools sind besonders nützlich für interaktives Testing und Debugging.

**Kern-Tools:**
- `mcp__playwright__browser_navigate(url)`: Navigiere zu einer URL
- `mcp__playwright__browser_snapshot()`: Erstelle eine Accessibility-Snapshot (bevorzugt gegenüber Screenshot für Aktionen)
- `mcp__playwright__browser_take_screenshot(options)`: Screenshot der aktuellen Seite
- `mcp__playwright__browser_click(element, ref)`: Klicke auf ein Element
- `mcp__playwright__browser_type(element, ref, text)`: Tippe Text in ein Element
- `mcp__playwright__browser_fill_form(fields)`: Fülle mehrere Formularfelder aus
- `mcp__playwright__browser_evaluate(function)`: Führe JavaScript im Browser aus
- `mcp__playwright__browser_wait_for(options)`: Warte auf Text/Zeit
- `mcp__playwright__browser_console_messages()`: Zeige Console-Logs
- `mcp__playwright__browser_handle_dialog(accept, promptText)`: Handle Dialoge/Alerts

**Empfohlener Test-Workflow:**

1. **Setup**: Starte Dev-Server (`npm run dev`)
2. **Navigate**: `browser_navigate('http://localhost:5173')`
3. **Inspect**: `browser_snapshot()` um UI-Status zu erfassen
4. **Interact**: `browser_click()`, `browser_type()`, `browser_fill_form()`
5. **Verify**: `browser_snapshot()` oder `browser_evaluate()` für Assertions
6. **Debug**: `browser_console_messages()` bei Fehlern

**Beispiel: Event-Erstellung testen**

```javascript
// 1. Navigate zur App
await browser_navigate('http://localhost:5173')

// 2. Erfasse initialen Zustand
await browser_snapshot()

// 3. Klicke auf Stunden-Segment (z.B. 9 Uhr)
await browser_click('9 Uhr Segment', '[data-hour="9"]')

// 4. Erfasse Modal-Zustand
await browser_snapshot()

// 5. Fülle Event-Formular aus
await browser_fill_form([
  { name: 'Event Titel', ref: '#event-title', type: 'textbox', value: 'Meeting' },
  { name: 'Start-Zeit', ref: '#event-start', type: 'textbox', value: '09:00' },
  { name: 'End-Zeit', ref: '#event-end', type: 'textbox', value: '10:00' }
])

// 6. Speichere Event
await browser_click('Speichern Button', '#event-save-btn')

// 7. Verifiziere Event im Kreis
const eventVisible = await browser_evaluate(() => {
  return document.querySelector('[data-event-id]') !== null
})

// 8. Prüfe Console auf Fehler
await browser_console_messages({ onlyErrors: true })
```

**Testing-Strategie:**

- **Unit-Tests (Vitest)**: Isolierte Logik (timeUtils, storage, eventManager)
  - Schnell, deterministisch
  - Keine Browser-Abhängigkeiten
  - Fokus auf Business-Logik

- **E2E-Tests (Playwright Scripts)**: User-Flows in `tests/e2e/`
  - Automatisierte Tests mit playwright.config.js
  - CI/CD Integration
  - Regression-Testing

- **Playwright MCP (Interactive)**: Manuelles Testing & Debugging
  - Exploratives Testing
  - UI-Debugging
  - Schnelles Feedback während Entwicklung
  - Besser als Screenshot: `browser_snapshot()` liefert strukturierte Accessibility-Daten

**Best Practices:**
- Nutze `browser_snapshot()` statt Screenshot für Test-Aktionen (strukturierte Daten)
- Nutze `browser_take_screenshot()` nur für visuelle Dokumentation
- Warte auf Netzwerk-Idle mit `browser_wait_for()` nach Interaktionen
- Prüfe Console-Errors mit `browser_console_messages({ onlyErrors: true })`
- Nutze `data-testid` Attribute für robuste Element-Selektion
- Handle Dialogs explizit mit `browser_handle_dialog()`

### Für den Deployer-Agent (`deployer`)
- **Build-Check**: Führe `npm run build` aus und prüfe auf Fehler
- **PR-Template**: Füge folgendes hinzu:
  - Link zum GitHub Issue
  - Link zum Scratchpad (relativ: `scratchpads/completed/...`)
  - Screenshots bei UI-Änderungen
  - Lighthouse-Scores bei Performance-relevanten Änderungen
- **Scratchpad-Archivierung**: Verschiebe von `active/` nach `completed/`
- **Dokumentation**: Aktualisiere README.md bei neuen Features

### Für den Validator-Agent (`validator`)
- **Prüfpunkte**:
  - PR wurde erfolgreich auf GitHub erstellt
  - Scratchpad wurde archiviert
  - Alle CI-Checks laufen
  - README.md ist aktuell (wenn zutreffend)
  - Build ist erfolgreich (`npm run build`)
- **Bei Fehlern**: Melde deutlich, welcher Schritt fehlgeschlagen ist

## 8. Entwicklungs-Roadmap

### Phase 1: MVP (Lokale PWA) - AKTUELL
- [ ] Basis-Setup (Vite, PWA-Struktur)
- [ ] Kreis-Visualisierung (24 Stunden)
- [ ] Event-Erstellung und -Bearbeitung
- [ ] Lokale Datenspeicherung (IndexedDB)
- [ ] Service Worker für Offline-Funktionalität
- [ ] Responsive Design
- [ ] Basis-Kategorien und Farbcodierung

### Phase 2: Google Calendar Integration
- [ ] OAuth2-Authentifizierung
- [ ] Bidirektionale Synchronisation
- [ ] Conflict-Resolution
- [ ] Background Sync API

### Phase 3: Server-Hosting und Backend
- [ ] Backend-API (Node.js/Express)
- [ ] User-Authentifizierung
- [ ] Multi-Device-Sync
- [ ] Cloud-Speicherung

## 9. Bekannte Einschränkungen & TODOs

- **Browser-Support**: Aktuell nur moderne Browser (Chrome 90+, Firefox 88+, Safari 14+)
- **Zeitzone-Handling**: Noch zu implementieren für Multi-Timezone-Support
- **Barrierefreiheit**: ARIA-Labels und Keyboard-Navigation müssen noch optimiert werden
- **Performance**: Große Mengen von Events (>100) könnten Rendering verlangsamen

## 10. Ressourcen & Referenzen

- [Vite Dokumentation](https://vitejs.dev/)
- [Workbox Guides](https://developers.google.com/web/tools/workbox)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

---

**Letzte Aktualisierung**: 2025-11-02
**Version**: 1.0.0
**Maintainer**: Lennart
