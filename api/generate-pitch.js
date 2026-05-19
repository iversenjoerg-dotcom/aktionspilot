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
  "positioning": "2–3 Absätze (durch Newline getrennt) zur Marktlücke. Konkret, mit Marktdaten wo sinnvoll.",
  "specs": [
    { "label": "Eigenschaft", "value": "Beschreibung", "badge": "USP" },
    { "label": "Eigenschaft 2", "value": "Beschreibung 2", "badge": null }
  ],
  "pricing": {
    "vk": "29,99 €",
    "ek": "8,00–9,50 €",
    "ekNote": "FOB China, ≥ 80.000 Stück",
    "margin": "≈ 47 %",
    "consumerArg": "Warum der Endkäufer den Preis als Vorteil wahrnimmt (1–2 Sätze)",
    "competitors": [
      { "name": "Wettbewerber Name", "price": 59.99, "priceFormatted": "59,99 €", "channel": "Fachhandel", "isAldi": false },
      { "name": "PRODUKTNAME (Aldi Süd)", "price": 29.99, "priceFormatted": "29,99 €", "channel": "Aktionspreis", "isAldi": true }
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
      { "title": "Kaufmotivation / Argument", "body": "Erklärung" },
      { "title": "Marktdaten als Beweis", "body": "Konkrete Zahlen und Quellen" },
      { "title": "POS-Dynamik", "body": "Warum der Kaufimpuls am Mittelgang funktioniert" }
    ]
  },
  "arguments": [
    { "title": "Argument 1 — Titel", "body": "Ausformuliertes Argument für den Einkäufer" },
    { "title": "Argument 2 — Titel", "body": "Ausformuliertes Argument" },
    { "title": "Argument 3 — Titel", "body": "Ausformuliertes Argument" },
    { "title": "Argument 4 — Titel", "body": "Ausformuliertes Argument" }
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
  "summary": "2–3 Absätze (durch Newline getrennt). Kern-Argument warum dieses Produkt jetzt, und was der nächste Schritt ist."
}

Regeln:
- risk.level muss genau "high", "medium" oder "low" sein
- pricing.competitors: immer absteigend nach price sortiert, Aldi-Version zuletzt (günstigster Preis, isAldi: true)
- 6–10 specs, 4 arguments, 4–6 buyerQA, 4–6 risks, 5–7 timeline-Einträge
- Sei konkret und produktspezifisch — keine generischen Phrasen
- Aktuelle Jahreszahlen: Pitch jetzt (Mai/Juni 2026), Produktionsstart Herbst 2026, Aktionsstart Herbst 2027`

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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 6000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error('Anthropic API error:', response.status, errBody)
      return res.status(502).json({ error: `Anthropic API returned ${response.status}` })
    }

    const data = await response.json()
    const rawText = data.content?.[0]?.text || ''

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
