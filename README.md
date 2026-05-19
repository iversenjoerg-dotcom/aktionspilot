# Aktionspilot — Deployment Guide

KI-gestütztes Tool zur Gewinnung von Aktions-Slots bei deutschen Discountern und Handelsketten.
Entwickelt für die Wünsche Group.

---

## Was du brauchst (alles kostenlos bzw. günstig)

1. **GitHub-Account** → github.com
2. **Vercel-Account** → vercel.com (mit GitHub verbinden)
3. **Anthropic API Key** → console.anthropic.com → „API Keys" → „Create Key" (~$10 zum Starten)

---

## Deployment in 3 Schritten

### 1. Repository auf GitHub anlegen
1. github.com → „New repository" → Name: `aktionspilot` → Private → „Create"
2. „uploading an existing file" → alle Dateien aus diesem Ordner hochladen
3. Ordnerstruktur muss erhalten bleiben: `api/` und `src/` als Unterordner

### 2. Auf Vercel deployen
1. vercel.com → „Add New Project" → GitHub-Repository `aktionspilot` importieren
2. Vor dem Deploy: „Environment Variables" → `ANTHROPIC_API_KEY` → API Key eintragen
3. „Deploy" klicken → nach ~1 Minute ist die App live

### 3. Testen
Öffne die Vercel-URL und tippe eine Anfrage ein, z. B.:
> Welche DIY-Geschenkprodukte passen zur Weihnachtsaktion bei Aldi Süd, Zielpreis 25–35 €?

---

## Projektstruktur

```
aktionspilot/
├── api/
│   ├── generate-cards.js   ← Produktkarten mit Scores generieren
│   └── generate-pitch.js   ← Vollständiges Pitch-Deck generieren
├── src/
│   ├── App.jsx             ← Haupt-React-App
│   ├── App.css             ← Design System
│   └── main.jsx            ← Entry point
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── .env.example
```

---

## Kosten (Orientierung)

- Karten generieren: ~$0.02 pro Anfrage
- Pitch-Deck generieren: ~$0.06 pro Klick
- Vercel Hosting: kostenlos (Hobby Plan)

---

## Versionierung

Immer als `Aktionspilot-vX.zip` herunterladen und deployen.
