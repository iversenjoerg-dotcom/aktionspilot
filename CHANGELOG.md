# Aktionspilot — Changelog

Alle Änderungen je Version. Neueste Version zuerst.

---

## v9 — How It Works Section + Footer + Impressum
**Dateien:** `src/App.jsx`, `src/App.css`

- Neue Section „So funktioniert Aktionspilot" auf der Startseite mit 4 Schritten
- Schritte: Händler eingeben → KI recherchiert live → Produktkonzepte mit Scoring → Pitch-Deck auf Knopfdruck
- Großformatige Schritt-Nummern mit Blau-Violett-Gradient
- USP-Bar: drei Alleinstellungsmerkmale mit blauen Check-Badges
- Footer: dunkel, Markenname, Impressum-Link, Copyright
- Impressum-Seite: eigene View mit Platzhalter-Inhalt (§ 5 TMG), ausfüllbar in GitHub

---

## v8 — Changelog + Versionsordner-Fix
**Dateien:** `CHANGELOG.md` (neu)

- `CHANGELOG.md` angelegt mit vollständiger Versionshistorie rückwirkend bis v0
- ZIP-Struktur geändert: innerer Ordner heißt jetzt `Aktionspilot-vX/` statt immer `aktionspilot/` → keine Konflikte mehr beim mehrfachen Entpacken
- ZIP wird vor jeder neuen Version gelöscht, damit keine doppelten Inhalte entstehen

---

## v7 — Farbsystem: Gradient + Wünsche-Blau
**Datei:** `src/App.css`

- „Aktions-Slot?" Headline bekommt Farbverlauf: Dunkelblau `#1D4ED8` → Violet `#6161FF`
- Neue CSS-Variable `--brand-blue: #2563EB` (Wünsche-Blau) eingeführt
- Informations-Elemente auf Wünsche-Blau verschoben: Ergebnis-Labels, Pitch-Abschnittsnummern, Pitch-Badge, Timeline-Marker, Pitch-Header-Meta
- Buttons und interaktive Elemente bleiben Violet (Monday.com `#6161FF`)
- Button-disabled Fix aus v6 ebenfalls enthalten (hellviolett statt dunkelgrau)

---

## v6 — Bugfixes Freitext-Eingabe
**Dateien:** `src/App.jsx`, `src/App.css`

- Freitext-Feld: Löschen des Textes setzt Formular nicht mehr zurück — nur „← Zurück" resettet den Mode
- Deaktivierter Button: hellviolett `#E8EAF6` mit grauem Text statt dunkelgrau (war unlesbar)
- Doppelten CSS-Eintrag für `.sf-search-btn:disabled` entfernt

---

## v5 — Freitext-Feld UX-Fixes
**Dateien:** `src/App.jsx`, `src/App.css`

- Klick ins Freitext-Feld löst sofortiges Kollabieren der Händlersuche aus (`onFocus` Handler)
- Toggle + Button erscheinen bereits bei Fokus, Button ist deaktiviert bis 3 Zeichen eingegeben
- `canSearch` und `showCTA` getrennt: `showCTA` reagiert auf Fokus, `canSearch` auf Zeichenanzahl
- Input-Breite: `width: 100%; display: block` statt `flex: 1` (war zu schmal)
- Disabled-Button-Style ergänzt: grau mit `cursor: not-allowed`

---

## v4 — Progressive Disclosure überarbeitet
**Dateien:** `src/App.jsx`, `src/App.css`

- Händler-Block erhält eigenen `sf-section` Wrapper mit Collapse-Animation
- „oder"-Divider wird eigenständige Section (verschwindet sobald ein Pfad gewählt)
- Freitext-Block bekommt eigenen Section-Wrapper (kollabiert bei Guided-Mode)
- Analysetiefe-Toggle ohne eigene Headline direkt über dem CTA eingebettet
- CTA und Analysetiefe erscheinen jetzt immer gemeinsam als eine Einheit
- Mindest-Wortanzahl für Freitext-CTA eingeführt

---

## v3 — Webrecherche + Analysetiefe-Toggle
**Dateien:** `api/generate-cards.js`, `src/App.jsx`, `src/App.css`

- Webrecherche aktiviert: Claude nutzt Web Search Tool bei jeder Anfrage
- Zwei Analyse-Modi eingeführt:
  - **Schnellanalyse** (~10 Sek.): Händler-History (3 Jahre), Amazon-Bestseller, Konkurrenz
  - **Tiefenanalyse** (~25 Sek.): zusätzlich Aldi UK/AU/USA, TikTok/Pinterest/Instagram, marktguru/NIQ/EHI, LZ, Spielzeugtrends
- Toggle-UI (Radio-Buttons mit Hilfstext) in Formular integriert
- Hintergrundfarbe heller: `#F8F9FF`
- WCAG AA: `--text-faint` auf `#71717A` (4.9:1), `--text-muted` auf `#4B5563` (7.4:1)
- JSON-Extraktion in API robuster gemacht (sucht aktiv nach JSON-Block im Text)

---

## v2 — Texte, UX-Fixes, WCAG, Dot Grid
**Dateien:** `src/App.jsx`, `src/App.css`

- Headline: „Welche Produkte gewinnen den nächsten Aktions-Slot?"
- Copy: „Aktionspilot findet die Produkt-Lücken im Aktionssortiment der großen Händler — mit KI-generierter Marktanalyse, Whitespace-Bewertung und fertigem Pitch-Deck."
- „← Neu starten" → „← Zurück"
- CTA erscheint erst wenn Saison UND Preisrahmen ausgewählt (auch „Überspringen" muss aktiv geklickt werden)
- Kein Pfeil-Symbol mehr in „Überspringen"-Pills
- WCAG AA: „oder" `#4B5563` (7.2:1), Reset-Button `#374151` (10.7:1), Optional-Label `#6B7280` (4.6:1)
- Hintergrund: Dot Grid (28px Raster) mit subtilen Farbflairs (Violet links, Gelb rechts)

---

## v1 — Initiales Release: Aktionspilot
**Dateien:** alle

- Umbenennung von SlotScout/SlotFinder/slotlock → Aktionspilot überall
- Logo: `Aktions<span>pilot</span>` (pilot in Violet)
- Topbar-Meta: „Jeder Slot. Immer gewonnen."
- `package.json` name: `aktionspilot`
- `README.md` neu mit Aktionspilot-Branding
- ZIP-Ordner: `aktionspilot/`

---

## v0 (slot-finder-v7) — Strukturiertes Eingabeformular
**Dateien:** `src/App.jsx`, `src/App.css`

- Progressive Disclosure Formular: Händler → Kategorie → Saison → Preis
- Händler-Dropdown mit 12 Händlern (inkl. Lidl-Themenwelten: Parkside, Silvercrest etc.)
- Kategorie als klickbare Pills (händler-spezifisch)
- Saison + Preis als Pills mit „Überspringen"-Option
- „oder"-Divider mit smooth Collapse-Animation bei Händler-Auswahl
- Cache für Pitch-Decks: zweiter Klick auf Karte = sofort, kein API-Call

---

## v0 (slot-finder-v3) — Light Theme + Design System
**Dateien:** `src/App.jsx`, `src/App.css`, `index.html`

- Komplettes Redesign: Light Theme (war Dark Theme)
- Primärfarbe: Monday.com Violet `#6161FF`
- Akzentfarbe: Miro Yellow `#FFD02F`
- Font: Poppins (war Nunito)
- Score-Farben: nur kühle Palette (Blau/Teal/Violet/Purple — kein Amber/Rot)
- Miro-Style Suchfeld: gerundeter Container, Button inside
- Hintergrund: `#F5F6FA` (helles Grau-Weiß)
- CTA-Button als volle Breite, immer sichtbar (war nur bei Hover)

---

*Format: Datum wird beim nächsten Update ergänzt.*
