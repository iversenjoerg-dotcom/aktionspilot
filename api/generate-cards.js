// api/generate-cards.js
// Vercel serverless function — Schnell- und Tiefenanalyse mit optionaler Webrecherche

const SYSTEM_BASE = `Du bist ein erfahrener Retail-Stratege für den deutschen Lebensmittelhandel (LEH).
Du analysierst Produktkategorien für Aktions-Slots bei deutschen Discountern (Aldi Süd, Lidl, Kaufland, Netto etc.).
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
      "why": "2–3 Sätze warum dieses Produkt jetzt in diesen Slot passt. Konkret, mit echten Daten aus der Webrecherche wo verfügbar.",
      "caveat": "Wichtigster Vorbehalt (max. 1 Satz)"
    }
  ],
  "excluded": [
    {
      "name": "Produktname",
      "reason": "Warum ausgeschlossen"
    }
  ]
}

Regeln für tier: "top" → "⭐ Top-Pick" | "growth" → "📈 Wachstum" | "caution" → "⚠ Hürden prüfen"
Scores: Ganzzahlen 0–100, realistisch differenziert.
Generiere 5–7 Konzepte (beste zuerst) + 3–5 Ausschlüsse.`

const SEARCH_QUICK = `
Führe 2–3 gezielte Websuchen durch bevor du antwortest:
1. Ob dieser Händler in den letzten 3 Jahren ein ähnliches Produkt im Aktionssortiment hatte (z.B. via marktguru.de, kaufda.de)
2. Aktuelle Amazon DE Bestseller in dieser Kategorie (Bewertungsanzahl als Sell-through-Signal)
3. Was Konkurrenz-Discounter in dieser Kategorie aktuell anbieten (Aldi Nord vs. Süd, Lidl)

Zitiere konkrete Fundstellen in deinen Begründungen.`

const SEARCH_DEEP = `
Führe 5–7 gezielte Websuchen durch bevor du antwortest:
1. Ob dieser Händler in den letzten 3 Jahren ein ähnliches Produkt im Aktionssortiment hatte (marktguru.de, kaufda.de, Händler-Prospektarchive)
2. Ob Aldi UK, Aldi Australien, Aldi USA oder Lidl international das Produkt bereits gelistet haben — das zeigt bewährtes Potenzial ohne DACH-Whitespace zu verringern (Beispiel: Mushroom Grow Box bei Aldi Australia 2024)
3. Aktuelle Amazon DE Bestseller und Bewertungsanzahl als Sell-through-Signal
4. Trendberichte von marktguru, EHI oder NielsenIQ zur Kategorie
5. Social-Media-Signale: TikTok-Trends, Pinterest und Instagram zur Kategorie — bewerte ob das Publikum zum Händler-Kunden passt (z.B. Aldi-Käufer 30–55 Jahre)
6. Für Food/Saisonal: aktuelle Lebensmittelzeitung-Berichte
7. Für Spielzeug/Elektronik: Spielwarenmesse-Trends, aktuelle Toy-Trendberichte (NPD, Spielzeug-Industrie)

Zitiere konkrete Fundstellen mit Jahr in deinen Begründungen (z.B. "Aldi Australia listete X in 2024").
Nutze echte Daten um Scores und Pitch-Argumente zu belegen.`

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })

  const { query, deepAnalysis } = req.body
  if (!query || typeof query !== 'string') return res.status(400).json({ error: 'Missing or invalid query' })

  const systemPrompt = SYSTEM_BASE + (deepAnalysis ? SEARCH_DEEP : SEARCH_QUICK)

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
        system: systemPrompt,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: query }],
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error('Anthropic API error:', response.status, errBody)
      return res.status(502).json({ error: `Anthropic API returned ${response.status}` })
    }

    const data = await response.json()

    // Extract text from content blocks (web search adds tool_use/tool_result blocks)
    const textBlock = data.content?.find(block => block.type === 'text')
    const rawText = textBlock?.text || ''

    let jsonStr = rawText.trim()
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]+?)\s*```/)
    if (fenceMatch) jsonStr = fenceMatch[1]

    // Find JSON object in text
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
    if (jsonMatch) jsonStr = jsonMatch[0]

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
