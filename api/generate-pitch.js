// api/generate-pitch.js
// Vercel serverless function — generates a full pitch deck for one product concept

const SYSTEM_PROMPT = `Du bist ein erfahrener Retail-Stratege. Erstelle ein vollständiges Pitch-Konzept für einen Discounter-Einkäufer (Aldi Süd).

Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt. Kein Text davor, kein Text danach, keine Markdown-Backticks.

JSON-Schema (exakt einhalten):
{
  "productName": "PRODUKTNAME (Großbuchstaben oder Title Case)",
  "tagline": "Tagline mit optional <strong>fettgedrucktem Teil</strong>",
  "stats": [
    { "label": "Ziel-VK", "value": "29,99 €", "sub": "50% unter Marktpreis", "accent": true },
    { "label": "Zielgruppe", "value": "5–12 J.", "sub": "Eltern als Käufer", "accent": false },
    { "label": "Slot-Timing", "value": "Okt. 2027", "sub": "KW 41–44", "accent": false }
  ],
  "positioning": "3–4 Absätze (durch Newline getrennt): (1) Marktlage und warum die Lücke existiert, mit konkreten Marktdaten, (2) Wettbewerbsumfeld und Preispositionierung, (3) Kern-Argument warum dieses Produkt jetzt den Slot gewinnt, (4) konkreter nächster Schritt für den Einkäufer.",
  "positioning_sources": [
    { "label": "Statista 2025", "url": "https://statista.com/..." },
    { "label": "Amazon Bestseller", "url": "https://amazon.de/..." }
  ],
  "specs": [
    { "label": "Eigenschaft", "value": "Beschreibung", "badge": "USP" },
    { "label": "Eigenschaft 2", "value": "Beschreibung 2", "badge": null }
  ],
  "pricing": {
    "vk": "29,99 €",
    "ek": "8,00–9,50 €",
    "ekNote": "FOB China, ≥ 80.000 Stück",
    "ekLanded": "11,50–13,50 €",
    "margin": "≈ 42 %",
    "factor": "≈ 1,8",
    "consumerArg": "Warum der Endkäufer den Preis als Vorteil wahrnimmt (1–2 Sätze)",
    "competitors": [
      { "name": "Wettbewerber Name", "price": 59.99, "priceFormatted": "59,99 €", "channel": "Fachhandel", "isAldi": false, "url": "https://amazon.de/dp/ASIN" },
      { "name": "PRODUKTNAME (Aldi Süd)", "price": 29.99, "priceFormatted": "29,99 €", "channel": "Aktionspreis", "isAldi": true, "url": null }
    ]
  },
  "packaging": [
    { "label": "Format", "value": "Beschreibung" },
    { "label": "Farbkonzept", "value": "Beschreibung" },
    { "label": "Vorderseite", "value": "Beschreibung" },
    { "label": "Rückseite", "value": "Beschreibung" },
    { "label": "Lieferumfang", "value": "Alle enthaltenen Teile" },
    { "label": "POS-Dekoration", "value": "Wie die Aktionsfläche bespielt wird" }
  ],
  "sellthrough": {
    "intro": "Einleitungssatz zum Sell-through",
    "highlights": [
      { "title": "Kaufmotivation / Argument", "body": "Erklärung", "sources": [] },
      { "title": "Marktdaten als Beweis", "body": "Konkrete Zahlen und Quellen", "sources": [{ "label": "NielsenIQ 2024", "url": "https://..." }] },
      { "title": "POS-Dynamik", "body": "Warum der Kaufimpuls am Mittelgang funktioniert", "sources": [] }
    ]
  },
  "arguments": [
    { "title": "Argument 1 — Titel", "body": "Ausformuliertes Argument für den Einkäufer", "sources": [] },
    { "title": "Argument 2 — Titel", "body": "Ausformuliertes Argument", "sources": [{ "label": "Chip.de", "url": "https://..." }] },
    { "title": "Argument 3 — Titel", "body": "Ausformuliertes Argument", "sources": [] },
    { "title": "Argument 4 — Titel", "body": "Ausformuliertes Argument", "sources": [] }
  ],
  "buyerQA": [
    { "q": "Frage des Einkäufers", "a": "Antwort" }
  ],
  "risks": [
    { "risk": "Risiko-Beschreibung", "level": "medium", "mitigation": "Wie mitigiert" }
  ],
  "timeline": [
    { "date": "Mai – Juni 2026 · Jetzt", "title": "Erster Schritt", "body": "Beschreibung", "active": true },
    { "date": "Juli 2026", "title": "Pitch-Termin", "body": "Beschreibung", "active": false }
  ],
  "validation": [
    { "market": "Aldi Nord", "detail": "hatte vergleichbares Produkt im März 2026 für 19,99 €" }
  ]
}

Regeln:
- risk.level muss genau "high", "medium" oder "low" sein
- pricing.competitors: immer absteigend nach price sortiert, Aldi-Version zuletzt (günstigster Preis, isAldi: true)
- 6–10 specs, 4 arguments, 4–6 buyerQA, 4–6 risks, 5–7 timeline-Einträge
- Sei konkret und produktspezifisch — keine generischen Phrasen
- Aktuelle Jahreszahlen: Pitch jetzt (Mai/Juni 2026), Produktionsstart Herbst 2026, Aktionsstart Herbst 2027
- validation-Pflicht: Wenn im Konzept-Kontext (why-Feld) ein Schwester-Discounter- oder Auslands-Treffer erwähnt wird (z.B. "Aldi Nord hatte...", "Aldi Australien", "Aldi UK"), MUSS dieser in validation[] erscheinen. Sonst validation: []

MARGEN-KALKULATION (wichtig — handelsübliche Logik):
- "ek" = FOB-Preis (Warenpreis ab Werk/Hafen Asien). "ekNote" beschreibt diese FOB-Basis.
- "ekLanded" = realistischer ANGELIEFERTER EK an den Händler = FOB + Seefracht + Zoll (0–4,7 %) + Importhandling + Intermediärmarge. Typisch FOB × 1,35–1,45.
- "margin" = HANDELSSPANNE auf Netto-VK, berechnet aus dem LANDED EK (NICHT dem FOB-Preis):
  Netto-VK = Brutto-VK / 1,19 (19 % MwSt). Handelsspanne = (Netto-VK − ekLanded) / Netto-VK × 100.
  Beispiel: VK 24,99 € → Netto-VK 21,00 €; landed EK 12,00 € → Spanne (21,00−12,00)/21,00 = 42,9 %.
- "factor" = Kalkulationsfaktor = Brutto-VK / landed EK (z.B. 24,99 / 13,50 = 1,85).
- Realistischer Korridor für Nonfood-II-Aktionsware: Handelsspanne 38–48 %. Niemals mit FOB als EK rechnen (ergäbe unrealistische 53–60 %).
- Begriff ist "Handelsspanne", NICHT "Bruttohandelsspanne".

Führe vor der Antwort genau 4 Websuchen durch:
1. WETTBEWERBER-URLS: Suche jedes Produkt in pricing.competitors auf Amazon.de (z.B. "Fujifilm Instax Mini 12 amazon.de") → trage die direkte Produkt-URL in competitors[].url ein. Aldi-Eigenmarke bekommt url: null.
2. TREND-QUELLE: Suche einen aktuellen Marktbericht zur Produktkategorie (marktguru, EHI, NielsenIQ, Lebensmittelzeitung, Statista) → trage URL + Label in sources des passenden sellthrough.highlight ein.
3. HÄNDLER-REFERENZ: Suche "[Händler] [Produkt]" auf Mydealz, Chip.de oder ähnlichen Quellen → wenn Treffer, trage URL + Label in sources des passenden arguments-Eintrags ein.
4. MARKTCHANCE-QUELLEN: Suche 2–3 konkrete Belege für die Marktdaten-Aussagen in positioning (Absatzzahlen, Marktanteile, Trendberichte auf Statista, NielsenIQ, Amazon Bestseller, marktguru, EHI). Nur echte URLs aus Suchergebnissen. Trage diese in positioning_sources[] ein.

QUELLEN-PFLICHT:
- competitors[].url: Direkte Amazon.de- oder Shop-URL wenn gefunden, sonst null
- highlights[].sources und arguments[].sources: nur befüllen wenn echte URL aus Websuche vorliegt — kein Erraten von URLs
- positioning_sources[]: 2–3 echte URLs aus Suche 4 — kein Erraten, leeres Array [] wenn nichts gefunden
- Leere Arrays [] sind erlaubt wenn keine Quelle gefunden`

// ── Retry helper: bis zu 3 Versuche mit Exponential Backoff bei 429 ──────────
async function callWithRetry(requestBody, apiKey, maxAttempts = 3) {
  const delays = [2000, 5000, 10000] // 2s → 5s → 10s

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    })

    if (response.ok) return response

    if (response.status === 429 && attempt < maxAttempts - 1) {
      const retryAfter = response.headers.get('retry-after')
      const retryAfterMs = retryAfter ? Math.min(parseInt(retryAfter) * 1000, 8000) : delays[attempt]
      const waitMs = retryAfterMs
      console.warn(`Rate limit (429) – Versuch ${attempt + 1}/${maxAttempts}, warte ${waitMs}ms …`)
      await new Promise(r => setTimeout(r, waitMs))
      continue
    }

    return response
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  const { concept, context } = req.body
  if (!concept || typeof concept !== 'object') {
    return res.status(400).json({ error: 'Missing concept data' })
  }

  const userPrompt = `Erstelle ein vollständiges Pitch-Konzept für folgendes Produktkonzept:

Produktname: ${concept.name}
Tagline: ${concept.tagline}
Kategorie: ${concept.category || ''}
Preisrange: ${concept.priceRange}
EK-Hinweis: ${concept.ekHint || ''}
Warum der Slot: ${concept.why}
Wichtiger Vorbehalt: ${concept.caveat || 'keiner'}

Kontext der ursprünglichen Anfrage: ${context || 'Weihnachtsaktion bei Aldi Süd, Zielpreis 25–35 €'}

Liefere jetzt das vollständige JSON-Pitch-Konzept.`

  try {
    const response = await callWithRetry({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: userPrompt }],
    }, apiKey)

    if (!response.ok) {
      const errBody = await response.text()
      console.error('Anthropic API error:', response.status, errBody)

      if (response.status === 429) {
        return res.status(429).json({
          error: 'Die KI ist gerade stark ausgelastet. Bitte versuche es in 30–60 Sekunden nochmal.',
        })
      }
      return res.status(502).json({ error: `Anthropic API returned ${response.status}` })
    }

    const data = await response.json()
    // Web Search liefert mehrere Content-Blöcke — Text-Block gezielt extrahieren
    const textBlock = data.content?.find(block => block.type === 'text')
    const rawText = textBlock?.text || data.content?.[0]?.text || ''

    // Robust JSON extraction
    let jsonStr = rawText.trim()
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]+?)\s*```/)
    if (fenceMatch) jsonStr = fenceMatch[1]

    let parsed
    try {
      parsed = JSON.parse(jsonStr)
    } catch (e) {
      console.error('JSON parse error:', e.message, '\nRaw:', rawText.slice(0, 500))
      return res.status(502).json({ error: 'Failed to parse pitch response. Please try again.' })
    }

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
