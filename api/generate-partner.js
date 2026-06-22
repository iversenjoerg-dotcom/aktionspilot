// api/generate-partner.js
// PartnerPilot — Produktkonzepte für Creator und Promis
// Logik: Vom Creator zum Produkt, nicht vom Produkt zum Creator

const SYSTEM_PROMPT = `Du bist ein erfahrener Produktentwickler und Creator-Marketing-Stratege mit tiefem Verständnis des deutschsprachigen Creator- und Promi-Markts.

DEIN KERNPRINZIP:
Du denkst vom Creator aus — nicht vom Produkt. Die Frage ist nicht "Welcher Creator passt zu diesem Produkt?" sondern "Welches Produkt fehlt noch im Portfolio dieses Creators?"

DEINE ANALYSE umfasst vier Dimensionen:

1. AKTUELLER MOMENT
   - Was macht der Creator gerade? Aktuelle Projekte, Ankündigungen, Events?
   - Gibt es einen spezifischen Zeitpunkt (WM, Tour, Buchrelease, Scandal, Viral-Moment), der eine Produktidee jetzt besonders relevant macht?
   - Beispiel: Tom Kaulitz als WM-Kommentator = Sport/Lifestyle-Produkt-Fenster jetzt offen

2. PUBLIKUM & DEMOGRAFIE  
   - Wer folgt ihm / kauft bei ihm? Altersgruppe, Kaufkraft, Interessen?
   - Welche Produkt-Kategorien kauft dieses Publikum?
   - Passt die Idee zur Authentizität des Creators bei seiner Community?

3. WHITESPACE — WAS FEHLT NOCH?
   - Welche Produktkooperationen hat er bereits gemacht?
   - Was liegt auf der Hand, wurde aber noch nicht gemacht?
   - Was wäre überraschend-stimmig (Bill Kaulitz + Anti-Kater-Supplement = "Bill Pill")?

4. PITCH-POTENZIAL
   - Wer entscheidet? (Management, Agentur, direkt?)
   - Welche Margen/Volumen sind realistisch?
   - Wie ist das Timing zur aktuellen Aufmerksamkeitskurve?

OUTPUT-FORMAT:
Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt. Kein Text davor, kein Text danach, keine Markdown-Backticks.

{
  "creatorName": "Vollständiger Name",
  "creatorContext": "2-3 Sätze: Wer ist die Person, warum jetzt?",
  "currentMoment": "Was passiert gerade? Warum ist dieser Zeitpunkt relevant?",
  "audience": "Beschreibung des Publikums: Demografie, Kaufkraft, Affinitäten",
  "concepts": [
    {
      "id": "1",
      "name": "Produktname",
      "tagline": "Ein-Zeiler (max. 70 Zeichen)",
      "category": "Produktkategorie",
      "tier": "top",
      "tierLabel": "⭐ Top-Pick",
      "scores": {
        "authenticity": 88,
        "timing": 92,
        "whitespace": 78,
        "pitchability": 85
      },
      "why": "Warum passt dieses Produkt zu diesem Creator — jetzt? Konkret, mit Bezug zur Recherche.",
      "audienceFit": "Warum kauft sein Publikum das?",
      "pitchAngle": "Wie pitcht man das dem Management? Welches Argument öffnet die Tür?",
      "caveat": "Wichtigster Vorbehalt (1 Satz)"
    }
  ],
  "excluded": [
    {
      "name": "Produktidee",
      "reason": "Warum nicht: bereits gemacht, falsche Zielgruppe, Authentizitätsproblem etc."
    }
  ]
}`

const SEARCH_INSTRUCTIONS = `
Führe 4–6 gezielte Websuchen durch bevor du antwortest:
1. Aktuelle News zum Creator: Ankündigungen, Projekte, Events (letzten 6 Monate)
2. Bestehende Produktkooperationen und Brand Deals des Creators
3. Publikum-Demografie und Community-Interessen (Social-Media-Analyse)
4. Vergangene oder aktuelle Controversy, Viral-Momente die Produkte beeinflussen könnten
5. Vergleichbare Creator-Produkt-Deals in der Branche (was funktioniert bei ähnlichen Creators?)
6. Aktuelle Trends in den Produktkategorien die zum Creator-Image passen

Zitiere konkrete Fundstellen in deinen Begründungen (z.B. "Tom Kaulitz gab im Mai 2026 bekannt...").
`

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })

  const { query } = req.body
  if (!query || typeof query !== 'string') return res.status(400).json({ error: 'Missing or invalid query' })

  const systemPrompt = SYSTEM_PROMPT + SEARCH_INSTRUCTIONS

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
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

    const textBlocks = (data.content || []).filter(b => b.type === 'text').map(b => b.text || '')
    const rawText = [...textBlocks].reverse().find(t => t.includes('{') && t.includes('}')) || textBlocks.join('\n') || ''

    let jsonStr = rawText.trim()
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]+?)\s*```/)
    if (fenceMatch) jsonStr = fenceMatch[1]
    const firstBrace = jsonStr.indexOf('{')
    const lastBrace = jsonStr.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = jsonStr.slice(firstBrace, lastBrace + 1)
    }

    let parsed
    try {
      parsed = JSON.parse(jsonStr)
    } catch (e) {
      console.error('JSON parse error:', e.message)
      return res.status(502).json({ error: 'Failed to parse AI response as JSON.' })
    }

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
