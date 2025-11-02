# 24Hours - Intuitive Tagesplanung mit Kreisvisualisierung

Eine moderne Progressive Web App (PWA), die Ihren Tag als 24-Stunden-Kreis visualisiert und intuitive Planung ermöglicht.

![24Hours App](docs/screenshot-placeholder.png) _(Screenshot folgt nach Implementierung)_

## ✨ Features

- 🔄 **Kreisförmige 24-Stunden-Visualisierung**: Sehen Sie Ihren ganzen Tag auf einen Blick
- 📱 **Progressive Web App**: Installierbar auf Mobile und Desktop, funktioniert offline
- 💾 **Lokale Datenspeicherung**: Ihre Daten bleiben auf Ihrem Gerät (IndexedDB)
- 🎨 **Farbcodierte Kategorien**: Organisieren Sie Events nach Typ (Arbeit, Freizeit, etc.)
- ⚡ **Schnell & Reaktionsschnell**: Vite-basiert für optimale Performance
- 🌐 **Offline-First**: Arbeiten Sie ohne Internetverbindung

## 🚀 Geplante Features (Roadmap)

- 📅 **Google Calendar Integration**: Bidirektionale Synchronisation
- ☁️ **Cloud-Backup**: Zugriff von mehreren Geräten
- 🔔 **Smart Notifications**: Erinnerungen für Events
- 📊 **Analytics**: Visualisierung Ihrer Zeitnutzung

## 🏁 Erste Schritte

### Voraussetzungen

- [Node.js](https://nodejs.org/) (Version 18.x oder höher)
- [npm](https://www.npmjs.com/) (kommt mit Node.js)
- Moderner Webbrowser (Chrome 90+, Firefox 88+, Safari 14+)

### Installation

1. **Repository klonen**:
   ```bash
   git clone https://github.com/IhrUsername/24Hours.git
   cd 24Hours
   ```

2. **Abhängigkeiten installieren**:
   ```bash
   npm install
   ```

3. **Entwicklungsserver starten**:
   ```bash
   npm run dev
   ```

4. **App im Browser öffnen**:
   - Öffnen Sie [http://localhost:5173](http://localhost:5173)
   - Die App lädt automatisch bei Code-Änderungen neu (Hot Module Replacement)

### Production Build

Für ein optimiertes Production-Build:

```bash
npm run build
npm run preview
```

Das Build wird im `dist/` Ordner erstellt und kann auf jedem Static-Hosting-Service deployed werden.

## 🎯 Nutzung

### Event erstellen

1. Klicken Sie auf einen Zeitbereich im 24-Stunden-Kreis
2. Geben Sie Titel, Beschreibung und wählen Sie eine Kategorie
3. Passen Sie die Start- und Endzeit an
4. Klicken Sie auf "Speichern"

### Event bearbeiten

- Klicken Sie auf ein existierendes Event im Kreis
- Bearbeiten Sie die Details im Modal
- Speichern Sie oder löschen Sie das Event

### App installieren (PWA)

- **Desktop**: Klicken Sie auf das Install-Icon in der Adresszeile
- **Mobile**: Tippen Sie auf "Zum Homescreen hinzufügen" im Browser-Menü

### Offline-Nutzung

Die App speichert automatisch alle Daten lokal und funktioniert vollständig offline nach der ersten Installation.

## 🛠️ Entwicklung

### Projektstruktur

```
24Hours/
├── public/              # Statische Assets (Icons, Manifest)
├── src/
│   ├── components/     # UI-Komponenten
│   ├── lib/           # Utility-Funktionen
│   ├── services/      # Business Logic Layer
│   ├── styles/        # CSS-Dateien
│   └── main.js        # App Entry Point
├── tests/             # Unit- und E2E-Tests
└── scratchpads/       # Entwicklungs-Workflow (Agenten)
```

### Verfügbare Scripts

| Command | Beschreibung |
|---------|-------------|
| `npm run dev` | Startet Entwicklungsserver mit HMR |
| `npm run build` | Erstellt optimiertes Production-Build |
| `npm run preview` | Vorschau des Production-Builds lokal |
| `npm test` | Führt Unit-Tests aus (Vitest) |
| `npm run test:e2e` | Führt End-to-End-Tests aus (Playwright) |
| `npm run lint` | Prüft Code-Qualität (ESLint) |
| `npm run format` | Formatiert Code (Prettier) |

### Tests durchführen

```bash
# Unit-Tests
npm test

# Unit-Tests mit Coverage
npm run test:coverage

# E2E-Tests
npm run test:e2e

# E2E-Tests im UI-Modus
npm run test:e2e:ui
```

### Code-Konventionen

- **JavaScript**: ES6+ mit ESLint Standard Config
- **CSS**: BEM-Methodik (`.block__element--modifier`)
- **Commits**: Conventional Commits Format (`feat:`, `fix:`, `docs:`)
- **Branching**: `feature/`, `fix/`, `docs/` Prefixes

Details siehe [CLAUDE.md](CLAUDE.md) Abschnitt 6.

## 🏗️ Architektur

### Technologie-Stack

- **Build-Tool**: Vite 5.x
- **Service Worker**: Workbox 7.x
- **Storage**: IndexedDB (via localforage)
- **Testing**: Vitest + Playwright
- **Styling**: Vanilla CSS mit CSS Custom Properties

### PWA-Features

- **Offline-First**: Service Worker mit Cache-First-Strategie
- **Installierbar**: Web App Manifest mit Icons
- **Responsive**: Mobile-First Design
- **Performance**: Lighthouse Score 90+

Details zur Architektur siehe [CLAUDE.md](CLAUDE.md) Abschnitt 5.

## 🤝 Beitragen

Dieses Projekt nutzt einen agentenbasierten Entwicklungs-Workflow. Wenn Sie beitragen möchten:

1. Lesen Sie [CLAUDE.md](CLAUDE.md) für Projekt-Konventionen
2. Erstellen Sie ein GitHub Issue für Ihre Idee
3. Nutzen Sie den `/dev` Befehl für Entwicklungsaufgaben
4. Folgen Sie dem 5-Phasen-Workflow (Plan-Create-Test-Deploy-Validate)

### Entwicklungs-Workflow

```bash
# Für neue Features oder Bugfixes
> /dev "Add recurring events feature"
> /dev 123  # Wenn GitHub Issue #123 existiert
```

Der Workflow orchestriert automatisch spezialisierte Agenten für Planung, Implementierung, Testing und Deployment.

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei für Details.

## 🐛 Bekannte Probleme

- Zeitzone-Handling noch nicht implementiert
- Performance bei >100 Events könnte optimiert werden
- Keyboard-Navigation (Accessibility) in Arbeit

Siehe vollständige Liste in [CLAUDE.md](CLAUDE.md) Abschnitt 9.

## 📞 Support & Kontakt

- **Issues**: [GitHub Issues](https://github.com/IhrUsername/24Hours/issues)
- **Diskussionen**: [GitHub Discussions](https://github.com/IhrUsername/24Hours/discussions)
- **E-Mail**: your.email@example.com _(anpassen)_

## 🙏 Danksagungen

- Inspiriert von modernen Zeit-Management-Philosophien
- PWA Best Practices von [web.dev](https://web.dev/progressive-web-apps/)
- Community-Feedback und Contributions

---

**Status**: 🚧 In aktiver Entwicklung (Phase 1 - MVP)
**Version**: 0.1.0
**Letzte Aktualisierung**: November 2025

Erstellt mit ❤️ und Claude Code
