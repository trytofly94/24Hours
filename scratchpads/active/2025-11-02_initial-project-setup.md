# Initial Project Setup - 24Hours PWA

**Erstellt**: 2025-11-02
**Typ**: Feature
**Geschätzter Aufwand**: Groß
**Verwandtes Issue**: N/A (Initial Setup)

## Kontext & Ziel

Initialisierung der kompletten Projektstruktur für die 24Hours Progressive Web App. Dies ist die Foundation für Phase 1 (MVP - Lokale PWA) und umfasst:

- Vite-basiertes Build-Setup mit allen notwendigen Plugins
- PWA-Konfiguration (Service Worker, Manifest, Icons)
- Basis-HTML-Struktur mit semantischem Markup
- 24-Stunden-Kreis-Visualisierung als SVG-Komponente
- Grundlegende Styles mit CSS Custom Properties
- IndexedDB-Setup für lokale Datenspeicherung
- Alle Konfigurationsdateien (ESLint, Prettier, Vite, Vitest)

Ziel ist ein vollständig funktionsfähiges, installierbares PWA-Grundgerüst, auf dem alle weiteren Features aufbauen können.

## Anforderungen

- [ ] Vite-Projekt mit allen Dependencies korrekt konfiguriert
- [ ] PWA-Manifest mit allen erforderlichen Icon-Größen
- [ ] Service Worker mit Workbox (Cache-First-Strategie)
- [ ] Basis-HTML mit korrektem Meta-Tags für PWA
- [ ] SVG-basierte 24-Stunden-Kreis-Visualisierung (24 Segmente)
- [ ] CSS mit BEM-Konventionen und CSS-Variablen für Theming
- [ ] IndexedDB-Wrapper mit localforage
- [ ] ESLint, Prettier, Vitest Konfiguration
- [ ] Git-Repository initialisiert mit .gitignore
- [ ] Lighthouse PWA-Score > 90

## Untersuchung & Analyse

**Kontext-Recherche:**
- Keine existierenden Scratchpads gefunden (brandneues Projekt)
- Kein Git-Repository vorhanden - muss initialisiert werden
- CLAUDE.md enthält sehr detaillierte Projekt-Spezifikationen
- README.md bereits vorhanden, aber Projekt-Code fehlt komplett

**Technologie-Entscheidungen (basierend auf CLAUDE.md):**
- Build-Tool: Vite 5.x (schnelles HMR, optimierte Builds)
- Service Worker: Workbox 7.x mit vite-plugin-pwa
- Storage: localforage (einfacher IndexedDB-Wrapper)
- Testing: Vitest (Unit) + Playwright (E2E, später)
- Code-Stil: ESLint Standard + Prettier
- CSS-Methodik: BEM (Block-Element-Modifier)

**Architektur-Überlegungen:**
- Modularer Aufbau: Komponenten in `src/components/`, Utilities in `src/lib/`
- SVG-basierter Kreis für maximale Skalierbarkeit und Performance
- CSS Custom Properties für einfaches Theming
- Offline-First: Service Worker cached alle statischen Assets
- Mobile-First: Responsive Design von Anfang an

**Anti-Overengineering Prinzipien:**
- Vanilla JavaScript (kein Framework-Overhead für MVP)
- Einfacher State-Management (Event-basiert, kein Redux/Zustand)
- Direkte DOM-Manipulation für Kreis-Updates (performant genug für MVP)
- lokalforage statt komplexem IndexedDB-Code
- Standard Vite-Setup ohne Custom-Konfigurationen wo möglich

**Kreis-Visualisierung Design:**
Basierend auf typischen 24-Stunden-Kreis-Designs:
- 24 Segmente (1 Segment = 1 Stunde)
- 0:00 Uhr oben (12 Uhr Position)
- Uhrzeigersinn-Rotation
- Hover-Effekte für Interaktivität
- Click-Handler für Event-Erstellung

## Implementierungsplan

### 1. Git-Repository & Basis-Setup
- [ ] Git-Repository initialisieren (`git init`)
- [ ] `.gitignore` erstellen (node_modules, dist, .env, etc.)
- [ ] Initial Commit mit README.md und CLAUDE.md

### 2. npm-Projekt initialisieren & Dependencies
- [ ] `package.json` erstellen mit korrekten Metadaten
- [ ] Core-Dependencies installieren:
  - `vite` (^5.0.0)
  - `vite-plugin-pwa` (^0.19.0)
  - `workbox-window` (^7.0.0)
  - `localforage` (^1.10.0)
- [ ] Dev-Dependencies installieren:
  - `vitest` (^1.0.0)
  - `eslint` (^8.0.0)
  - `eslint-config-standard` (^17.0.0)
  - `prettier` (^3.0.0)
  - `@playwright/test` (^1.40.0) - für spätere E2E-Tests
- [ ] npm-Scripts definieren (dev, build, preview, test, lint, format)

### 3. Konfigurationsdateien erstellen
- [ ] `vite.config.js`:
  - PWA-Plugin mit Service Worker Config
  - Build-Optimierungen
  - Dev-Server-Settings
- [ ] `vitest.config.js`:
  - Test-Environment: jsdom
  - Coverage-Settings (min. 70%)
- [ ] `.eslintrc.json`:
  - Standard-Config
  - Browser-Environment
- [ ] `.prettierrc`:
  - Semi: false
  - Single-Quotes: true
  - Trailing-Comma: es5

### 4. Verzeichnisstruktur anlegen
```
src/
├── components/
│   └── CircleView.js (MVP-Version)
├── lib/
│   ├── storage.js (localforage-Wrapper)
│   └── timeUtils.js (Zeit-Berechnungen)
├── styles/
│   ├── variables.css (CSS Custom Properties)
│   ├── main.css (Globale Styles)
│   └── circle.css (Kreis-spezifische Styles)
├── main.js (Entry Point)
└── index.html

public/
├── manifest.json
├── robots.txt
└── icons/
    └── (Placeholder-Icons generieren)
```

### 5. PWA-Konfiguration
- [ ] `public/manifest.json` erstellen:
  - Name: "24Hours - Day Planner"
  - Short-Name: "24Hours"
  - Start-URL: "/"
  - Display: "standalone"
  - Theme-Color: "#4F46E5" (Indigo)
  - Background-Color: "#FFFFFF"
  - Icons: Alle Größen (72, 96, 128, 144, 152, 192, 384, 512)
- [ ] Placeholder-Icons generieren (vorerst einfarbige SVG-Icons)
- [ ] Service Worker Config in vite.config.js:
  - registerType: 'autoUpdate'
  - Strategies: Cache-First für statische Assets
  - Runtime-Caching für API-Calls (vorbereitet)

### 6. HTML-Grundstruktur (src/index.html)
- [ ] Semantisches HTML5-Markup
- [ ] Meta-Tags für PWA:
  - viewport
  - theme-color
  - apple-mobile-web-app-capable
  - manifest-Link
- [ ] Hauptstruktur:
  - `<header>` mit App-Titel
  - `<main>` mit #circle-container
  - `<footer>` mit Settings-Button (später)
- [ ] Script-Tag für main.js (type="module")

### 7. CSS-Grundgerüst
- [ ] `variables.css`:
  - Farb-Palette (Primary, Secondary, Grays)
  - Abstände (Spacing-Scale)
  - Typografie (Font-Sizes, Weights)
  - Kreis-Dimensionen
- [ ] `main.css`:
  - CSS-Reset (box-sizing, margins)
  - Body-Styles (Font-Family, Background)
  - Layout (Flexbox für Zentrierung)
  - Responsive-Breakpoints
- [ ] `circle.css`:
  - `.circle` Container-Styles
  - `.circle__svg` SVG-Styles
  - `.circle__segment` Segment-Styles
  - `.circle__segment--active` Hover/Active-States
  - Animationen/Transitions

### 8. 24-Stunden-Kreis-Visualisierung (CircleView.js)
- [ ] SVG-Generierung:
  - ViewBox: "0 0 400 400"
  - Kreis-Radius: 180px
  - 24 Arc-Segmente berechnen (je 15°)
- [ ] Segment-Rendering:
  - Path-Elemente für jeden Arc
  - Data-Attribute: `data-hour="0-23"`
  - CSS-Klassen: `.circle__segment`
- [ ] Stunden-Labels:
  - Text-Elemente an korrekten Positionen
  - 0, 3, 6, 9, 12, 15, 18, 21 Uhr prominent
  - Kleinere Labels für Zwischenstunden
- [ ] Event-Listener:
  - Click-Handler für Segmente (console.log vorerst)
  - Hover-Effekte (CSS-Klassen togglen)
- [ ] Export als Modul-Funktion: `createCircleView()`

### 9. Storage-Layer (lib/storage.js)
- [ ] lokalforage initialisieren:
  - DB-Name: "24hours-db"
  - Store-Name: "events"
- [ ] Wrapper-Funktionen:
  - `getEvents()`: Alle Events abrufen
  - `saveEvent(event)`: Event speichern
  - `deleteEvent(id)`: Event löschen
  - `updateEvent(id, data)`: Event aktualisieren
- [ ] Error-Handling mit try-catch
- [ ] JSDoc-Dokumentation für alle Funktionen

### 10. Zeit-Utilities (lib/timeUtils.js)
- [ ] `getCurrentHour()`: Aktuelle Stunde (0-23)
- [ ] `formatTime(hour, minute)`: Zeit formatieren (HH:MM)
- [ ] `calculateArcPath(hour)`: SVG-Path für Stunden-Segment
- [ ] `hourToAngle(hour)`: Stunde zu Grad-Winkel (0° = oben)
- [ ] Konstanten: `HOURS_IN_DAY = 24`, `DEGREES_PER_HOUR = 15`

### 11. App Entry Point (main.js)
- [ ] Imports:
  - Styles (variables.css, main.css, circle.css)
  - CircleView-Komponente
  - Storage-Funktionen
- [ ] DOM-Ready-Handler:
  - Circle-View rendern in #circle-container
  - Service Worker registrieren (wenn vorhanden)
  - Initialen State laden aus Storage
- [ ] Basis-Event-Handling:
  - Kreis-Segment-Clicks loggen (vorerst)
- [ ] Error-Boundary für globale Fehler

### 12. Tests & Validierung
- [ ] Unit-Tests für timeUtils.js:
  - Test hourToAngle() für alle 24 Stunden
  - Test formatTime() für verschiedene Eingaben
- [ ] Unit-Tests für storage.js:
  - Mock IndexedDB
  - Test CRUD-Operationen
- [ ] Manuelle Tests:
  - PWA installierbar in Chrome/Firefox
  - Offline-Funktionalität (Service Worker)
  - Responsive Design (Mobile, Tablet, Desktop)
  - Kreis rendert korrekt mit 24 Segmenten
  - Hover-Effekte funktionieren

### 13. Build & Lighthouse-Check
- [ ] Production-Build: `npm run build`
- [ ] Build-Größe prüfen (Ziel: < 200KB gzipped)
- [ ] Preview lokal testen: `npm run preview`
- [ ] Lighthouse-Audit durchführen:
  - PWA-Score: 90+ (Ziel)
  - Performance: 90+ (Ziel)
  - Accessibility: 90+ (Ziel)
- [ ] Bei Problemen: Optimierungen vornehmen

### 14. Dokumentation finalisieren
- [ ] README.md aktualisieren:
  - Installation-Steps validieren
  - Screenshot-Placeholder durch echten Screenshot ersetzen (optional)
- [ ] Code-Kommentare prüfen:
  - JSDoc für alle exports
  - Inline-Kommentare für komplexe Logik
- [ ] Scratchpad-Update:
  - Fortschrittsnotizen finalisieren
  - Abschluss-Checkliste abhaken

## Fortschrittsnotizen

**2025-11-02 - Start:**
- Scratchpad erstellt
- Projekt-Analyse abgeschlossen
- Kein Git-Repo vorhanden - wird im ersten Schritt erstellt
- Keine Dependencies installiert - komplettes Setup von Grund auf
- Sehr klare Anforderungen durch CLAUDE.md verfügbar

**Technische Entscheidungen dokumentiert:**
- Vanilla JS für MVP (kein React/Vue Overhead)
- Workbox über vite-plugin-pwa (Standard-Integration)
- localforage statt direkter IndexedDB-Code
- BEM-CSS statt CSS-in-JS oder Tailwind

**Potenzielle Herausforderungen identifiziert:**
1. SVG-Arc-Path-Berechnung für Kreissegmente (trigonometrische Funktionen)
2. Responsive Kreis-Skalierung (SVG viewBox + CSS)
3. Service Worker Caching-Strategie korrekt konfigurieren
4. PWA-Icons in allen Größen (evtl. Tool nutzen für Generierung)

**Lösungsansätze:**
1. Mathematische Formel: `angle = (hour * 15) - 90` (0° oben statt rechts)
2. SVG `preserveAspectRatio="xMidYMid meet"` + Container mit max-width
3. vite-plugin-pwa hat gute Defaults - Cache-First für Assets
4. Vorerst einfarbige SVG-Icons, später mit Icon-Generator optimieren

## Ressourcen & Referenzen

**Dokumentation:**
- [Vite Guide](https://vitejs.dev/guide/)
- [vite-plugin-pwa Documentation](https://vite-pwa-org.netlify.app/)
- [Workbox Caching Strategies](https://developers.google.com/web/tools/workbox/modules/workbox-strategies)
- [Web App Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [localforage API](https://localforage.github.io/localForage/)

**SVG-Ressourcen:**
- [SVG Path Commands (MDN)](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)
- [Arc Path Tutorial](https://www.nan.fyi/svg-paths)

**PWA-Best-Practices:**
- [web.dev PWA Checklist](https://web.dev/pwa-checklist/)
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) (für Icons)

**Code-Beispiele:**
- SVG-Kreissegmente: Ähnlich wie Pie-Charts (D3.js-Prinzipien)
- Service Worker: vite-plugin-pwa Examples Repository

**Tools:**
- Lighthouse (Chrome DevTools) für PWA-Audit
- Chrome Application Tab für Service Worker Debugging
- Firefox Developer Tools für IndexedDB Inspection

## Abschluss-Checkliste

- [ ] Kernfunktionalität implementiert:
  - [ ] Vite-Setup vollständig
  - [ ] PWA installierbar
  - [ ] 24-Stunden-Kreis rendert korrekt
  - [ ] Storage-Layer funktioniert
- [ ] Tests geschrieben und bestanden:
  - [ ] Unit-Tests für Utils (min. 70% Coverage)
  - [ ] Manuelle PWA-Installation getestet
  - [ ] Offline-Funktionalität verifiziert
- [ ] Dokumentation aktualisiert:
  - [ ] Code vollständig kommentiert (JSDoc)
  - [ ] README.md validiert
- [ ] Code-Review durchgeführt:
  - [ ] ESLint zeigt keine Fehler
  - [ ] Prettier formatiert korrekt
  - [ ] BEM-Konventionen eingehalten
- [ ] Deployed/Released:
  - [ ] Production-Build erfolgreich
  - [ ] Lighthouse-Score > 90 (PWA)
  - [ ] Bundle-Größe < 200KB (gzipped)

---
**Status**: Aktiv
**Zuletzt aktualisiert**: 2025-11-02
**Nächster Schritt**: Creator-Agent startet mit Schritt 1 (Git-Setup)
**Geschätzte Entwicklungszeit**: 4-6 Stunden
