// api/generate-cards.js
// Vercel serverless function — keeps the Anthropic API key server-side

const SYSTEM_PROMPT = `Du bist ein erfahrener Retail-Stratege für den deutschen Lebensmittelhandel (LEH).
Du analysierst Produktkategorien für Aktions-Slots bei deutschen Discountern (Aldi Süd, Lidl, Kaufland, Netto).
Du kennst Aktionsplanung, Vorlaufzeiten (6–12 Monate für Nonfood), Whitespace-Analyse und Sell-through-Faktoren aus der Praxis.

Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt. Kein Text davor, kein Text danach, keine Markdown-Backticks.

JSON-Schema (halte dich exakt daran):
{
  "searchContext": "Kurze neutrale Zusammenfassung der Anfrage (max. 80 Zeichen)",
  "retailer": "Händler aus der Anfrage, z.B. 'Aldi Süd'",
  "season": "Saison/Anlass aus der Anfrage, z.B. 'Weihnachten 2027'",
  "concepts": [
    {
      "id": "1",
      "name": "Produktkonzept-Name (kurz, prägnant)",
      "tagline": "Ein-Zeilen-Beschreibung des Konzepts (max. 70 Zeichen)",
      "category": "Kategorie, z.B. DIY / Elektronik / Wellness",
      "tier": "top",
      "tierLabel": "⭐ Top-Pick",
      "scores": {
        "trend": 88,
        "whitespace": 92,
        "sellthrough": 78,
        "feasibility": 85
      },
      "priceRange": "27–32 €",
      "ekHint": "EK ca. 6–8 € (China-OEM)",
      "why": "2–3 Sätze warum dieses Produkt jetzt in diesen Slot passt. Konkret, nicht generisch.",
      "caveat": "Wichtigster Vorbehalt, Compliance-Hinweis oder Risiko (max. 1 Satz)"
    }
  ],
  "excluded": [
    {
      "name": "Produktname",
      "reason": "Warum ausgeschlossen (z.B. bereits Standard bei Aldi/Lidl)"
    }
  ]
}

Regeln für "tier":
- "top"     → tierLabel "⭐ Top-Pick"      (Gesamtbewertung stark, klar empfehlen)
- "growth"  → tierLabel "📈 Wachstum"      (Wachstum gut, aber Hürde vorhanden)
- "caution" → tierLabel "⚠ Hürden prüfen" (Interessant, aber komplexe Compliance oder Sell-through-Risiko)

Scores sind Ganzzahlen 0–100. Realistisch und differenziert — nicht alle 85+.

Generiere:
- 5–7 Konzepte, sortiert nach Gesamtpotenzial (beste zuerst)
- 3–5 explizite Ausschlüsse (Produkte, die bereits Standard im Discounter sind)

Für jeden Konzept: Sei konkret und produktspezifisch, nicht generisch.
Berücksichtige: Aldi/Lidl-Aktionslogik (kein WLAN-Zwang für Kinder-Elektronik → DSGVO-Vorteil), Compliance (CE, EN 71, IFRA etc.), Asien-Sourcing-Realität.`

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  const { query } = req.body
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid query' })
  }

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
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: query }],
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error('Anthropic API error:', response.status, errBody)
      return res.status(502).json({ error: `Anthropic API returned ${response.status}` })
    }

    const data = await response.json()
    const rawText = data.content?.[0]?.text || ''

    // Extract JSON robustly (handles accidental markdown fences)
    let jsonStr = rawText.trim()
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]+?)\s*```/)
    if (fenceMatch) jsonStr = fenceMatch[1]

    let parsed
    try {
      parsed = JSON.parse(jsonStr)
    } catch (e) {
      console.error('JSON parse error:', e.message, '\nRaw:', rawText.slice(0, 500))
      return res.status(502).json({ error: 'Failed to parse AI response as JSON. Try rephrasing your query.' })
    }

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
