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
Führe 4 gezielte Websuchen durch bevor du antwortest:
1. PFLICHT-KEYWORDSUCHE: "[Händlername] [Produktname]" als einfache Keyword-Suche — findet Chip.de, Mydealz, Presseartikel und aktuelle Händler-Aktionen
2. SCHWESTER-DISCOUNTER: Aldi Süd ↔ Aldi Nord; Lidl ↔ Kaufland. Gleiche Keyword-Logik: "Aldi Nord [Produkt]" etc. → Treffer = Validierungssignal (nicht Ausschluss)
3. ECHTER WETTBEWERBER: Bei Aldi-Anfrage → "Lidl [Produkt]" und "Kaufland [Produkt]"; bei Lidl-Anfrage → "Aldi [Produkt]". Treffer = Whitespace-Problem, stärkt Ausschluss-Argument
4. Amazon DE Bestseller der Kategorie als Sell-through-Signal

FRAMING-REGEL:
- Schwester-Treffer (Aldi Nord bei Aldi-Süd-Anfrage): im "why" als Beleg nennen, im "caveat" erklären warum kein Ausschluss ("geografisch getrennte Kundschaft")
- Wettbewerber-Treffer (Lidl hat es aktiv): im "caveat" als ernstes Warnsignal, oder in "excluded" mit Begründung`

const SEARCH_DEEP = `
Führe 6–8 gezielte Websuchen durch bevor du antwortest:
1. PFLICHT-KEYWORDSUCHE: "[Händlername] [Produktname]" als einfache Keyword-Suche — exakt wie ein Mensch es bei Google eingeben würde (z.B. "Aldi Sofortbildkamera Kinder"). Findet Chip.de, Mydealz, aktuelle Deals, Presseartikel.
2. SCHWESTER-DISCOUNTER: Wenn Aldi Süd → auch "Aldi Nord [Produkt]"; wenn Aldi Nord → "Aldi Süd [Produkt]"; wenn Lidl → "Kaufland [Produkt]". Treffer = Validierungssignal: zeigt Sellability ohne DACH-Whitespace zu verringern. Muss im Pitch-Material erscheinen.
3. ECHTER WETTBEWERBER: Bei Aldi-Anfrage → "Lidl [Produkt]", "Kaufland [Produkt]", ggf. "dm [Produkt]" oder "Rossmann [Produkt]" je nach Kategorie. Treffer = Whitespace-Problem, stärkt Ausschluss-Argument.
4. INTERNATIONAL: Aldi UK, Aldi Australien, Aldi USA oder Lidl international — zeigt bewährtes Potenzial ohne DACH-Whitespace zu verringern
5. Amazon DE Bestseller und Bewertungsanzahl als Sell-through-Signal
6. Trendberichte von marktguru, EHI oder NielsenIQ zur Kategorie
7. Social-Media-Signale: TikTok, Pinterest, Instagram — bewerte ob Publikum zum Händler-Kunden passt
8. Spielwarenmesse/NPD für Spielzeug/Elektronik — oder Lebensmittelzeitung für Food/Saisonal

FRAMING-PFLICHT:
- Schwester-Treffer (z.B. "Aldi Nord hatte Produkt im März 2026 für 19,99 €"): MUSS in "why" als Validierungsbeleg erscheinen + in "caveat" erklären ("Aldi Süd hat geografisch eigene Kundschaft — kein Ausschlussgrund, stärkt Pitch")
- Wettbewerber-Treffer (z.B. "Lidl hat es gerade aktiv im Sortiment"): in "caveat" als ernstes Warnsignal nennen, oder Konzept in "excluded" verschieben mit klarer Begründung
Zitiere konkrete Fundstellen mit Jahr in den Begründungen.`

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
      // Retry-After Header berücksichtigen falls vorhanden
      const retryAfter = response.headers.get('retry-after')
      const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : delays[attempt]
      console.warn(`Rate limit (429) – Versuch ${attempt + 1}/${maxAttempts}, warte ${waitMs}ms …`)
      await new Promise(r => setTimeout(r, waitMs))
      continue
    }

    // Andere Fehler oder letzter Versuch: direkt zurückgeben
    return response
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })

  const { query, deepAnalysis } = req.body
  if (!query || typeof query !== 'string') return res.status(400).json({ error: 'Missing or invalid query' })

  const systemPrompt = SYSTEM_BASE + (deepAnalysis ? SEARCH_DEEP : SEARCH_QUICK)

  try {
    const response = await callWithRetry({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: systemPrompt,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: query }],
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
