import { useState, useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════
   DATA — Retailers, Categories, Seasons, Prices
   ═══════════════════════════════════════════════════════════ */

const RETAILERS = [
  'ALDI Süd', 'ALDI Nord', 'Lidl', 'Kaufland',
  'Netto', 'Penny', 'Norma',
  'Edeka', 'Rewe',
  'dm', 'Rossmann', 'Müller',
]

const CATEGORIES = {
  'ALDI Süd': [
    'DIY & Handwerk', 'Küche & Haushalt', 'Garten & Outdoor',
    'Sport & Fitness', 'Spielzeug & Kinder', 'Elektronik & Technik',
    'Wohnen & Deko', 'Textil & Mode', 'Beauty & Wellness',
    'Lebensmittel & Saisonales',
  ],
  'ALDI Nord': [
    'DIY & Handwerk', 'Küche & Haushalt', 'Garten & Outdoor',
    'Sport & Fitness', 'Spielzeug & Kinder', 'Elektronik & Technik',
    'Wohnen & Deko', 'Textil & Mode', 'Beauty & Wellness',
    'Lebensmittel & Saisonales',
  ],
  'Lidl': [
    'Parkside (Werkzeug & DIY)', 'Silvercrest (Haushaltselektronik)',
    'Crivit (Sport & Fitness)', 'Livarno (Wohnen & Deko)',
    'Esmara (Mode)', 'Lupilu (Baby & Kind)',
    'Wochenkracher / Food', 'Themenwochen (Saisonal)',
  ],
  'Kaufland': [
    'Nonfood-Aktionsware', 'Küche & Haushalt', 'Garten & Outdoor',
    'Elektronik & Technik', 'Sport & Freizeit', 'Spielzeug & Kinder',
    'Wohnen & Deko', 'Textil & Mode',
  ],
  'dm': [
    'Naturkosmetik & Bio', 'Pflege & Beauty', 'Haushalt & Reinigung',
    'Baby & Kind', 'Gesundheit & Wellness', 'DIY & Kreatives',
    'Ernährung & Supplements',
  ],
  'Rossmann': [
    'Pflege & Beauty', 'Haushalt & Reinigung', 'Baby & Kind',
    'Gesundheit', 'Ernährung', 'Foto & Technik',
  ],
  'Müller': [
    'Spielzeug & Kinder', 'Büro & Schule', 'Beauty & Pflege',
    'Bücher & Medien', 'Haushalt', 'Saisonales',
  ],
  'Edeka': [
    'Markenartikel-Promotion', 'Eigenmarken-Aktion', 'Bio & Regional',
    'Themenwochen (Küche)', 'Drinks & Genuss', 'Snacks & Süßwaren',
  ],
  'Rewe': [
    'Markenartikel-Promotion', 'Eigenmarken-Aktion', 'Bio & Regional',
    'Themenwochen', 'Drinks & Genuss', 'Snacks & Süßwaren',
  ],
}

const DEFAULT_CATEGORIES = [
  'Küche & Haushalt', 'Garten & Outdoor', 'Sport & Freizeit',
  'Spielzeug & Kinder', 'Elektronik & Technik', 'Wohnen & Deko',
  'Textil & Mode', 'Beauty & Wellness', 'Food & Getränke', 'Saisonales',
]

const SEASONS = [
  'Weihnachten', 'Ostern', 'Grillsaison', 'Muttertag / Vatertag',
  'Schulanfang', 'Halloween', 'Valentinstag', 'Ganzjährig',
]

const PRICE_RANGES = [
  'Unter 10 €', '10–20 €', '20–35 €', '35–50 €', '50–75 €', 'Über 75 €',
]

/* ═══════════════════════════════════════════════════════════
   SEARCH FORM — Progressive Disclosure
   ═══════════════════════════════════════════════════════════ */

function SearchForm({ onSearch, loading }) {
  const [mode, setMode]         = useState('initial')
  const [retailer, setRetailer] = useState('')
  const [category, setCategory] = useState('')
  const [season, setSeason]     = useState('')
  const [price, setPrice]       = useState('')   // nur für 'skip'
  const [freeText, setFreeText] = useState('')
  const [deepAnalysis, setDeepAnalysis] = useState(false)

  // Eigene Kategorie
  const [showCustomCat, setShowCustomCat]     = useState(false)
  const [customCatInput, setCustomCatInput]   = useState('')
  // Eigener Anlass
  const [showCustomSeason, setShowCustomSeason]   = useState(false)
  const [customSeasonInput, setCustomSeasonInput] = useState('')
  // Preis-Felder
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')

  const freeRef    = useRef(null)
  const customCatRef    = useRef(null)
  const customSeasonRef = useRef(null)

  const cats      = retailer ? (CATEGORIES[retailer] || DEFAULT_CATEGORIES) : []
  const charCount = freeText.trim().length

  // Preis gilt als gesetzt wenn: skip ODER mind. ein Feld befüllt
  const priceReady = price === 'skip' || priceMin !== '' || priceMax !== ''

  const showCTA =
    (mode === 'guided' && retailer && category && season && priceReady) ||
    mode === 'custom'

  const canSearch =
    (mode === 'guided' && retailer && category && season && priceReady) ||
    (mode === 'custom' && charCount >= 3)

  const handleRetailer = (val) => {
    setRetailer(val)
    setCategory(''); setShowCustomCat(false); setCustomCatInput('')
    setSeason('');   setShowCustomSeason(false); setCustomSeasonInput('')
    setPrice(''); setPriceMin(''); setPriceMax('')
    if (val) setMode('guided')
  }

  const handleCategory = (val) => {
    setCategory(val)
    setShowCustomCat(false); setCustomCatInput('')
    setSeason(''); setShowCustomSeason(false); setCustomSeasonInput('')
    setPrice(''); setPriceMin(''); setPriceMax('')
  }

  const reset = () => {
    setMode('initial')
    setRetailer('')
    setCategory(''); setShowCustomCat(false); setCustomCatInput('')
    setSeason('');   setShowCustomSeason(false); setCustomSeasonInput('')
    setPrice(''); setPriceMin(''); setPriceMax('')
    setFreeText('')
  }

  const handleFreeTextChange = (e) => {
    setFreeText(e.target.value)
    if (mode === 'initial') setMode('custom')
  }

  // Eigene Kategorie bestätigen
  const confirmCustomCat = () => {
    const val = customCatInput.trim()
    if (val) { handleCategory(val) }
    else     { setShowCustomCat(false) }
  }

  // Eigener Anlass bestätigen
  const confirmCustomSeason = () => {
    const val = customSeasonInput.trim()
    if (val) { setSeason(val); setShowCustomSeason(false); setPrice(''); setPriceMin(''); setPriceMax('') }
    else     { setShowCustomSeason(false) }
  }

  // Preis-String für Query bauen
  const buildPriceStr = () => {
    const mn = parseInt(priceMin)
    const mx = parseInt(priceMax)
    if (!isNaN(mn) && !isNaN(mx)) {
      return mn <= mx ? `${mn}–${mx} €` : `${mx}–${mn} €`
    }
    if (!isNaN(mn)) return `ab ${mn} €`
    if (!isNaN(mx)) return `bis ${mx} €`
    return ''
  }

  const search = () => {
    if (!canSearch || loading) return
    if (mode === 'custom' || mode === 'initial') {
      onSearch(freeText.trim(), deepAnalysis)
      return
    }
    let q = `Welche Produkte eignen sich für einen Aktions-Slot bei ${retailer}, Kategorie: ${category}`
    if (season && season !== 'skip') q += `, Saison / Anlass: ${season}`
    const priceStr = price !== 'skip' ? buildPriceStr() : ''
    if (priceStr) q += `, Ziel-VK Preisrahmen: ${priceStr}`
    q += '. Analysiere Markttrends, Discounter-Whitespace und Sell-through-Potenzial. Liefere konkrete Produktkonzepte mit Scores.'
    onSearch(q, deepAnalysis)
  }

  const onKey = (e) => { if (e.key === 'Enter') search() }

  return (
    <div className="sf-wrap">

      {/* ── STEP 1: Retailer — hides when custom ─────────── */}
      <div className={`sf-section ${mode === 'custom' ? 'sf-section-hidden' : ''}`}>
        <div className="sf-block">
          <p className="sf-label">Händler auswählen</p>
          {retailer ? (
            <div className="sf-pill-selected fade-in-up">
              <span>{retailer}</span>
              <button className="sf-pill-clear" onClick={() => handleRetailer('')}>✕</button>
            </div>
          ) : (
            <div className="sf-select-wrap">
              <select className="sf-select" value="" onChange={e => handleRetailer(e.target.value)}>
                <option value="" disabled>Händler wählen …</option>
                {RETAILERS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <span className="sf-select-arrow">▾</span>
            </div>
          )}
        </div>
      </div>

      {/* ── DIVIDER — only when initial ──────────────────── */}
      <div className={`sf-section sf-divider-section ${mode !== 'initial' ? 'sf-section-hidden' : ''}`}>
        <div className="sf-divider"><span>oder</span></div>
      </div>

      {/* ── FREE TEXT — hides when guided ────────────────── */}
      <div className={`sf-section ${mode === 'guided' ? 'sf-section-hidden' : ''}`}>
        <div className="sf-block">
          <p className="sf-label">Eigene Anfrage eingeben</p>
          <input
            ref={freeRef}
            className="sf-input"
            value={freeText}
            onChange={handleFreeTextChange}
            onFocus={() => { if (mode === 'initial') setMode('custom') }}
            onKeyDown={onKey}
            placeholder="z. B. DIY-Geschenke Weihnachten Aldi Süd 25–35 €"
          />
        </div>
      </div>

      {/* ── GUIDED: Category ─────────────────────────────── */}
      {mode === 'guided' && (
        <div className="sf-block fade-in-up" key="cat-block">
          <p className="sf-label">Aktions-Kategorie</p>
          {category ? (
            <div className="sf-pill-selected">
              <span>{category}</span>
              <button className="sf-pill-clear" onClick={() => handleCategory('')}>✕</button>
            </div>
          ) : showCustomCat ? (
            <div className="sf-custom-input-wrap">
              <input
                ref={customCatRef}
                className="sf-input sf-custom-input"
                value={customCatInput}
                onChange={e => setCustomCatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmCustomCat(); if (e.key === 'Escape') setShowCustomCat(false) }}
                placeholder="z. B. Kinder-Elektronik"
                autoFocus
              />
              <div className="sf-custom-actions">
                <button className="sf-custom-confirm" onClick={confirmCustomCat} disabled={!customCatInput.trim()}>Übernehmen →</button>
                <button className="sf-custom-back" onClick={() => { setShowCustomCat(false); setCustomCatInput('') }}>← Zurück zur Auswahl</button>
              </div>
            </div>
          ) : (
            <div className="sf-pills">
              {cats.map(c => (
                <button key={c} className="sf-pill" onClick={() => handleCategory(c)}>{c}</button>
              ))}
              <button className="sf-pill sf-pill-custom" onClick={() => setShowCustomCat(true)}>+ Eigene Kategorie</button>
            </div>
          )}
        </div>
      )}

      {/* ── GUIDED: Season ───────────────────────────────── */}
      {mode === 'guided' && category && (
        <div className="sf-block fade-in-up" key="season-block">
          <p className="sf-label">
            Saison / Anlass
            <span className="sf-optional"> – optional</span>
          </p>
          {season ? (
            <div className="sf-pill-selected">
              <span>{season === 'skip' ? 'Keine Angabe' : season}</span>
              <button className="sf-pill-clear" onClick={() => { setSeason(''); setShowCustomSeason(false); setCustomSeasonInput(''); setPrice(''); setPriceMin(''); setPriceMax('') }}>✕</button>
            </div>
          ) : showCustomSeason ? (
            <div className="sf-custom-input-wrap">
              <input
                ref={customSeasonRef}
                className="sf-input sf-custom-input"
                value={customSeasonInput}
                onChange={e => setCustomSeasonInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmCustomSeason(); if (e.key === 'Escape') setShowCustomSeason(false) }}
                placeholder="z. B. Muttertag, Back-to-School …"
                autoFocus
              />
              <div className="sf-custom-actions">
                <button className="sf-custom-confirm" onClick={confirmCustomSeason} disabled={!customSeasonInput.trim()}>Übernehmen →</button>
                <button className="sf-custom-back" onClick={() => { setShowCustomSeason(false); setCustomSeasonInput('') }}>← Zurück zur Auswahl</button>
              </div>
            </div>
          ) : (
            <div className="sf-pills">
              {SEASONS.map(s => (
                <button key={s} className="sf-pill" onClick={() => setSeason(s)}>{s}</button>
              ))}
              <button className="sf-pill sf-pill-custom" onClick={() => setShowCustomSeason(true)}>+ Eigener Anlass</button>
              <button className="sf-pill sf-pill-skip" onClick={() => setSeason('skip')}>Überspringen</button>
            </div>
          )}
        </div>
      )}

      {/* ── GUIDED: Price ────────────────────────────────── */}
      {mode === 'guided' && category && season && (
        <div className="sf-block fade-in-up" key="price-block">
          <p className="sf-label">
            Ziel-VK Preisrahmen
            <span className="sf-optional"> – optional</span>
          </p>
          {price === 'skip' ? (
            <div className="sf-pill-selected">
              <span>Keine Angabe</span>
              <button className="sf-pill-clear" onClick={() => setPrice('')}>✕</button>
            </div>
          ) : (
            <>
              <div className="sf-price-range">
                <input
                  className="sf-price-input"
                  type="number" min="1" max="100"
                  value={priceMin}
                  onChange={e => setPriceMin(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="1"
                />
                <span className="sf-price-unit">€</span>
                <span className="sf-price-bis">bis</span>
                <input
                  className="sf-price-input"
                  type="number" min="1" max="100"
                  value={priceMax}
                  onChange={e => setPriceMax(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="100"
                />
                <span className="sf-price-unit">€</span>
              </div>
              <button className="sf-pill sf-pill-skip" style={{ marginTop: 10 }} onClick={() => setPrice('skip')}>Überspringen</button>
            </>
          )}
        </div>
      )}

      {/* ── ANALYSETIEFE + CTA — appear together ─────────── */}
      {showCTA && (
        <div className="sf-cta fade-in-up" key="cta">
          <div className="sf-depth-options">
            <label className={`sf-depth-opt ${!deepAnalysis ? 'selected' : ''}`}>
              <input type="radio" name="depth" checked={!deepAnalysis} onChange={() => setDeepAnalysis(false)} />
              <div>
                <span className="sf-depth-title">Schnellanalyse</span>
                <span className="sf-depth-desc">Marktlücken & Konkurrenz. ~10 Sek.</span>
              </div>
            </label>
            <label className={`sf-depth-opt ${deepAnalysis ? 'selected' : ''}`}>
              <input type="radio" name="depth" checked={deepAnalysis} onChange={() => setDeepAnalysis(true)} />
              <div>
                <span className="sf-depth-title">Tiefenanalyse</span>
                <span className="sf-depth-desc">inkl. Trendquellen, Social Signals & internationale Händler-Launches. ~25 Sek.</span>
              </div>
            </label>
          </div>
          <button
            className="sf-search-btn"
            onClick={search}
            disabled={!canSearch || loading}
          >
            {loading ? 'Analysiert …' : 'Analysieren →'}
          </button>
        </div>
      )}

      {/* ── Reset ─────────────────────────────────────────── */}
      {mode !== 'initial' && (
        <div className="sf-reset">
          <button className="sf-reset-btn" onClick={reset}>← Zurück</button>
        </div>
      )}

    </div>
  )
}

/* Strip <cite> tags from AI-generated text */
const stripCite = (text = '') =>
  text.replace(/<cite[^>]*>/g, '').replace(/<\/cite>/g, '')

function stripCiteDeep(obj) {
  if (typeof obj === 'string') return stripCite(obj)
  if (Array.isArray(obj)) return obj.map(stripCiteDeep)
  if (obj && typeof obj === 'object') {
    const out = {}
    for (const k of Object.keys(obj)) out[k] = stripCiteDeep(obj[k])
    return out
  }
  return obj
}

/* ═══════════════════════════════════════════════════════════
   ACCESS MODAL
   ═══════════════════════════════════════════════════════════ */
function AccessModal({ onSuccess, onClose }) {
  const [code, setCode]   = useState('')
  const [error, setError] = useState('')

  const ACCESS_CODE = import.meta.env.VITE_ACCESS_CODE || 'aktionspilot2026'

  const handleSubmit = () => {
    if (code.trim() === ACCESS_CODE) {
      onSuccess()
    } else {
      setError('Ungültiger Zugangscode. Bitte versuche es erneut.')
      setCode('')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {onClose && (
          <button className="modal-close" onClick={onClose} aria-label="Schließen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
        <div className="modal-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 className="modal-title">Geschlossener Zugang</h2>
        <p className="modal-desc">
          AktionsPilot ist derzeit nur ausgewählten Personen
          zugänglich. Bitte gib deinen Zugangscode ein, um
          fortzufahren.
        </p>
        <input
          className="modal-input"
          type="password"
          placeholder="Zugangscode eingeben"
          value={code}
          onChange={e => { setCode(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
        {error && <p className="modal-error">{error}</p>}
        <button className="modal-btn" onClick={handleSubmit}>
          Anmelden →
        </button>
        <div className="modal-divider" />
        <a
          className="modal-request"
          href="mailto:hallo@joergiversen.de?subject=AktionsPilot%20%E2%80%94%20Zugangscode%20anfordern&body=Ich%20m%C3%B6chte%20gerne%20AktionsPilot%20testen%20und%20bitte%20um%20einen%20Zugangscode."
        >
          Noch keinen Zugang? Zugang beantragen
        </a>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Händler & Kategorie eingeben',
      desc: 'Wähle den Händler, die Aktionskategorie und den Preisrahmen. AktionsPilot kennt die Sortimentsvorgaben und Aktionslogik jedes Händlers im Detail.',
    },
    {
      num: '02',
      title: 'KI recherchiert live',
      desc: 'Das Tool durchsucht automatisch Aktionsarchive der vergangenen Jahre, Amazon-Bestseller, erfolgreiche internationale Produkt-Launches sowie aktuelle Trend-Signale aus TikTok, Pinterest und Branchenberichten.',
    },
    {
      num: '03',
      title: 'Produktkonzepte mit Scoring',
      desc: '5–7 konkrete Produktideen bewertet nach vier Dimensionen: Trend-Dynamik, Discounter-Whitespace, Sell-through-Potenzial und Pitch-Reife — inklusive Preisrahmen und EK-Orientierung.',
    },
    {
      num: '04',
      title: 'Pitch-Briefing auf Knopfdruck',
      desc: 'Ein Klick generiert ein vollständiges Pitch-Briefing als Arbeitsgrundlage: Produktspezifikation, Preisarchitektur, Margenberechnung, Einkäufer-Argumentation und Roadmap.',
    },
  ]

  return (
    <section className="how-section">
      <div className="how-inner">
        <div className="how-header">
          <p className="how-eyebrow">Kurz erklärt</p>
          <h2 className="how-title">So funktioniert<br />der AktionsPilot</h2>
          <p className="how-subtitle">
            AktionsPilot bringt die Marktrecherche auf ein neues Level — mit KI-gestützter Analyse,
            echten Webdaten und strukturiertem Pitch-Material als Arbeitsgrundlage für Ihr Team.
          </p>
        </div>

        <div className="how-steps">
          {steps.map((step, i) => (
            <div key={i} className="how-step">
              <div className="how-step-num">{step.num}</div>
              <h3 className="how-step-title">{step.title}</h3>
              <p className="how-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════ */
function Footer({ onImpressum, activeTab }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <span className="footer-brand">
          {activeTab === 'partner'
            ? <>Partner<span className="footer-petrol">Pilot</span></>
            : <>Aktions<span>Pilot</span></>
          }
        </span>
        <div className="footer-links">
          <button className="footer-link" onClick={onImpressum}>Impressum</button>
        </div>
        <span className="footer-copy">© {new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}

/* ═══════════════════════════════════════════════════════════
   IMPRESSUM VIEW
   ═══════════════════════════════════════════════════════════ */
function ImpressumView({ onBack }) {
  return (
    <div className="impressum-view">
      <h1 className="impressum-title">Impressum</h1>
      <p className="impressum-intro">Angaben gemäß § 5 TMG</p>

      <div className="impressum-section">
        <h2>Verantwortlich</h2>
        <p>Jörg Iversen<br />Gaußstraße 196H<br />22765 Hamburg</p>
      </div>

      <div className="impressum-section">
        <h2>Kontakt</h2>
        <p>E-Mail: <a href="mailto:hallo@joergiversen.de" className="impressum-link">hallo@joergiversen.de</a></p>
      </div>

      <div className="impressum-section">
        <h2>Haftungsausschluss</h2>
        <p>
          Die Inhalte dieser Seite wurden mit größtmöglicher Sorgfalt erstellt.
          Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen
          wir jedoch keine Gewähr. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG
          für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
        </p>
      </div>

      <div className="impressum-section">
        <h2>Hinweis</h2>
        <p>
          AktionsPilot ist ein internes Analyse-Tool. Die generierten Inhalte dienen
          als Entscheidungsunterstützung und ersetzen keine unternehmerische Prüfung.
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SCORE BAR
   ═══════════════════════════════════════════════════════════ */
function ScoreBar({ label, value, colorClass, delay = 0 }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 120 + delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return (
    <div className="score-row">
      <span className="score-label">{label}</span>
      <div className="score-track">
        <div className={`score-fill ${colorClass}`} style={{ width: `${width}%` }} />
      </div>
      <span className="score-value">{value}</span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT CARD
   ═══════════════════════════════════════════════════════════ */
function ProductCard({ concept, onSelect, onToggleSave, saved, index, pitchSaved, onUpdateConcept }) {
  const tierClass = { top: 'card-top', growth: 'card-growth', caution: 'card-caution' }[concept.tier] || 'card-growth'
  const tierLabelClass = { top: 'tier-top', growth: 'tier-growth', caution: 'tier-caution' }[concept.tier] || 'tier-growth'
  const upd = onUpdateConcept // shorthand — only truthy for saved cards
  return (
    <div className={`product-card ${tierClass}`}>
      <div className="card-header-row">
        <div className="card-pills">
          {concept.tierLabel && <span className={`card-tier ${tierLabelClass}`}>{concept.tierLabel}</span>}
          {concept.retailer && <span className="card-retailer-pill">{concept.retailer}</span>}
        </div>
        {onToggleSave && (
          <button
            className={`card-bookmark ${saved ? 'saved' : ''}`}
            onClick={e => { e.stopPropagation(); onToggleSave(concept) }}
            title={saved ? 'Gespeichert – klicken zum Entfernen' : 'Speichern'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        )}
      </div>
      <p className="card-name">
        {upd
          ? <EditableField value={concept.name} onSave={v => upd('name', v)} />
          : concept.name}
      </p>
      <p className="card-tagline">
        {upd
          ? <EditableField value={concept.tagline} onSave={v => upd('tagline', v)} />
          : concept.tagline}
      </p>
      <div className="scores">
        <ScoreBar label="Trend"        value={concept.scores.trend}       colorClass="score-fill-0" delay={index * 40} />
        <ScoreBar label="Whitespace"   value={concept.scores.whitespace}  colorClass="score-fill-1" delay={index * 40 + 60} />
        <ScoreBar label="Sell-through" value={concept.scores.sellthrough} colorClass="score-fill-2" delay={index * 40 + 120} />
        <ScoreBar label="Umsetzbar"    value={concept.scores.feasibility} colorClass="score-fill-3" delay={index * 40 + 180} />
      </div>
      <p className="card-why">
        {upd
          ? <EditableField value={stripCite(concept.why)} onSave={v => upd('why', v)} />
          : stripCite(concept.why)}
      </p>
      {concept.caveat && (
        <p className="card-caveat">
          ⚠{' '}
          {upd
            ? <EditableField value={stripCite(concept.caveat)} onSave={v => upd('caveat', v)} />
            : stripCite(concept.caveat)}
        </p>
      )}
      <div className="card-price-row">
        <span className="card-price">VK{' '}
          {upd
            ? <EditableField value={concept.priceRange} onSave={v => upd('priceRange', v)} />
            : concept.priceRange}
        </span>
        <span className="card-ek">
          {upd
            ? <EditableField value={concept.ekHint} onSave={v => upd('ekHint', v)} />
            : concept.ekHint}
        </span>
      </div>
      <button className="card-cta" type="button" onClick={() => onSelect(concept)}>
        {pitchSaved ? 'Pitch-Konzept aufrufen →' : 'Pitch-Konzept generieren →'}
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SOURCE BADGE
   ═══════════════════════════════════════════════════════════ */
function SourceBadge({ label, url }) {
  if (!url) return null
  return (
    <a
      className="source-badge"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
    >
      {label}
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 3 }}>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    </a>
  )
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR — schmal, ausfahrbar
   ═══════════════════════════════════════════════════════════ */
function Sidebar({ activeTab, onSwitchTool, onUserClick, onDashboard, onSaved, onHowItWorks, savedCount, currentView }) {
  return (
    <aside className="dash-sidebar-v2">
      <div className="dsb-logo">A</div>

      <button className={`dsb-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={onDashboard} title="Dashboard">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/></svg>
      </button>

      <button className="dsb-item" onClick={onDashboard} title="Anfragen">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M4 9h4l2 3h4l2-3h4"/></svg>
      </button>

      <button className={`dsb-item ${currentView === 'saved' ? 'active' : ''}`} onClick={onSaved} title="Gespeichert">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z"/></svg>
      </button>

      <button className="dsb-item" onClick={onDashboard} title="Analysen">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19V11"/><path d="M12 19V5"/><path d="M19 19v-6"/></svg>
      </button>

      <div className="dsb-spacer" />

      <button className={`dsb-item ${currentView === 'howitworks' ? 'active' : ''}`} onClick={onHowItWorks} title="Hilfe">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.4 2.4 0 1 1 3.4 2.2c-.8.4-1.3 1-1.3 1.9"/><circle cx="12" cy="16.4" r=".6" fill="currentColor" stroke="none"/></svg>
      </button>

      <button className="dsb-item" disabled title="Einstellungen">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="8" x2="20" y2="8"/><circle cx="9" cy="8" r="2.1"/><line x1="4" y1="16" x2="20" y2="16"/><circle cx="15" cy="16" r="2.1"/></svg>
      </button>

      <button className="dsb-user" onClick={onUserClick} title="Mein Konto">J</button>
    </aside>
  )
}

/* ═══════════════════════════════════════════════════════════
   MODAL — frosted glass overlay
   ═══════════════════════════════════════════════════════════ */
function Modal({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="dash-modal-overlay" onClick={onClose}>
      <div className="dash-modal" onClick={e => e.stopPropagation()}>
        <button className="dash-modal-close" onClick={onClose} aria-label="Schließen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        {children}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD VIEW
   ═══════════════════════════════════════════════════════════ */
function DashboardView({ savedConcepts, onNewAction, onOpenConcept, onToggleSave, onUpdateConcept, savedPitches, dashMode, onSetMode }) {
  const today = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const topPicks = savedConcepts.filter(c => c.tier === 'top').length
  const pitchCount = Object.keys(savedPitches).length

  return (
    <div className="dash-v2">
      {/* Header */}
      <header className="dv2-header">
        <div className="dv2-header-left">
          <h1 className="dv2-greeting">Willkommen zurück, Jörg</h1>
          <span className="dv2-date">{today}</span>
        </div>
        <div className="dv2-header-right">
          <div className="dv2-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>
            <span>Produktidee oder Händler suchen</span>
          </div>
          <button className="dv2-icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.6 21a2 2 0 0 1-3.2 0"/></svg>
            <span className="dv2-notif-dot" />
          </button>
          <button className="dv2-user-chip">
            <span className="dv2-user-avatar">J</span>
            <span className="dv2-user-name">Jörg</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9AA0B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="dv2-hero">
        <div className="dv2-blob dv2-blob-a" />
        <div className="dv2-blob dv2-blob-b" />
        <div className="dv2-toggle-wrap">
          <div className="dv2-toggle">
            <button className={`dv2-toggle-btn ${dashMode === 'aktion' ? 'sel' : ''}`} onClick={() => onSetMode('aktion')}>Aktionsprodukt</button>
            <button className={`dv2-toggle-btn ${dashMode === 'partner' ? 'sel' : ''}`} onClick={() => onSetMode('partner')}>Partnerprodukt</button>
          </div>
        </div>
        <button className="dv2-hero-cta" onClick={onNewAction}>
          <div className="dv2-hero-plus">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          </div>
          <h2 className="dv2-hero-title">{dashMode === 'aktion' ? 'Neues Aktionsprodukt' : 'Neues Partnerprodukt'}</h2>
        </button>
      </section>

      {/* Stats */}
      <div className="dv2-stats">
        <div className="dv2-stat">
          <div className="dv2-stat-icon dv2-stat-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z"/></svg>
          </div>
          <div className="dv2-stat-text"><span className="dv2-stat-num">{savedConcepts.length}</span><span className="dv2-stat-label">Produktideen gespeichert</span></div>
        </div>
        <div className="dv2-stat">
          <div className="dv2-stat-icon dv2-stat-sky">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.2 6.9 18.7l1-5.7-4.1-4 5.7-.8z"/></svg>
          </div>
          <div className="dv2-stat-text"><span className="dv2-stat-num">{topPicks}</span><span className="dv2-stat-label">Top-Picks markiert</span></div>
        </div>
        <div className="dv2-stat">
          <div className="dv2-stat-icon dv2-stat-green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 13h5M10 16.5h5"/></svg>
          </div>
          <div className="dv2-stat-text"><span className="dv2-stat-num">{pitchCount}</span><span className="dv2-stat-label">Pitch-Konzepte erstellt</span></div>
        </div>
      </div>

      {/* Section head */}
      <div className="dv2-section-head">
        <div className="dv2-section-title-wrap">
          <h3 className="dv2-section-title">Gespeicherte Produktideen</h3>
          {savedConcepts.length > 0 && <span className="dv2-section-count">{savedConcepts.length}</span>}
        </div>
        <div className="dv2-filters">
          <div className="dv2-filter">Zuletzt hinzugefügt
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
          <div className="dv2-filter">Alle Händler
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      {/* Grid */}
      {savedConcepts.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </div>
          <p className="dash-empty-title">Noch keine gespeicherten Produktideen</p>
          <p className="dash-empty-sub">Starte eine neue Aktion, um Produktideen zu generieren und hier zu sammeln.</p>
        </div>
      ) : (
        <div className="dv2-grid">
          {savedConcepts.map((concept, i) => (
            <ProductCard
              key={concept.id || i}
              concept={concept}
              onSelect={onOpenConcept}
              onToggleSave={onToggleSave}
              saved={true}
              index={i}
              pitchSaved={!!savedPitches[concept.name]}
              onUpdateConcept={(field, value) => onUpdateConcept(concept, field, value)}
            />
          ))}
        </div>
      )}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════
   EDITABLE FIELD — inline click-to-edit
   ═══════════════════════════════════════════════════════════ */
function EditableField({ value, onSave, displayContent = null, inputClassName = '' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(value)
  const ref = useRef(null)

  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => { if (editing && ref.current) ref.current.focus() }, [editing])

  const commit = () => {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onSave(trimmed)
    else setDraft(value)
  }

  if (editing) return (
    <input
      ref={ref}
      type="text"
      className={`ef-input ${inputClassName}`}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') { e.preventDefault(); commit() }
        if (e.key === 'Escape') { setDraft(value); setEditing(false) }
      }}
    />
  )

  return (
    <span className="ef-display" onMouseDown={e => { e.preventDefault(); setEditing(true) }} title="Klicken zum Bearbeiten">
      {displayContent ?? value}
      <svg className="ef-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </span>
  )
}

function EditablePositioning({ value, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(value)
  const ref = useRef(null)

  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => { if (editing && ref.current) ref.current.focus() }, [editing])

  const commit = () => {
    setEditing(false)
    if (draft.trim() && draft.trim() !== value) onSave(draft.trim())
  }

  if (editing) return (
    <textarea
      ref={ref}
      className="ef-input ef-textarea"
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
    />
  )

  return (
    <div className="ef-display ef-multiline" onClick={() => setEditing(true)} title="Klicken zum Bearbeiten">
      {value.split('\n').filter(l => l.trim()).map((line, i) => (
        <p key={i} style={{ marginBottom: 12 }} dangerouslySetInnerHTML={{ __html: line }} />
      ))}
      <span className="ef-edit-hint">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Bearbeiten
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   EDITABLE SOURCE BADGES — für positioning_sources
   ═══════════════════════════════════════════════════════════ */
function EditableSourceBadges({ sources = [], onUpdate }) {
  const [editingIndex, setEditingIndex] = useState(null)
  const [draftLabel, setDraftLabel]     = useState('')
  const [draftUrl, setDraftUrl]         = useState('')

  if (!sources.length && !onUpdate) return null

  const startEdit = (i) => {
    setEditingIndex(i)
    setDraftLabel(sources[i].label)
    setDraftUrl(sources[i].url || '')
  }

  const commitEdit = () => {
    if (!draftLabel.trim()) { setEditingIndex(null); return }
    const next = sources.map((s, i) => i === editingIndex ? { label: draftLabel.trim(), url: draftUrl.trim() } : s)
    onUpdate(next)
    setEditingIndex(null)
  }

  const remove = (i) => onUpdate(sources.filter((_, idx) => idx !== i))

  return (
    <div className="pos-sources">
      <span className="pos-sources-label">Quellen:</span>
      <div className="pos-sources-badges">
        {sources.map((s, i) => (
          editingIndex === i ? (
            <div key={i} className="pos-source-edit">
              <input className="pos-source-input" value={draftLabel} onChange={e => setDraftLabel(e.target.value)} placeholder="Label" />
              <input className="pos-source-input pos-source-url" value={draftUrl} onChange={e => setDraftUrl(e.target.value)} placeholder="URL" />
              <button className="pos-source-confirm" onClick={commitEdit}>✓</button>
              <button className="pos-source-cancel" onClick={() => setEditingIndex(null)}>✕</button>
            </div>
          ) : (
            <div key={i} className="pos-source-wrap">
              {s.url
                ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="source-badge">{s.label}<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 3 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
                : <span className="source-badge">{s.label}</span>
              }
              {onUpdate && <>
                <button className="pos-source-btn" onClick={() => startEdit(i)} title="Bearbeiten">✎</button>
                <button className="pos-source-btn pos-source-btn-remove" onClick={() => remove(i)} title="Entfernen">✕</button>
              </>}
            </div>
          )
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PITCH SECTION — collapsible wrapper
   ═══════════════════════════════════════════════════════════ */
function PitchSection({ num, title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className={`pitch-section collapsible ${open ? 'is-open' : ''}`}>
      <button className="ps-toggle" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="pitch-section-num">{num}</span>
        <svg className="ps-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div className="ps-body">
        <div className="ps-inner">
          {children}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════
   PITCH DECK VIEW
   ═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   PRICE ARCHITECTURE — editierbare Wettbewerbszeilen + dynamische Balken
   ═══════════════════════════════════════════════════════════ */
function parsePrice(str) {
  if (typeof str === 'number') return str
  if (!str) return 0
  // "24,99 €" / "1.299,00" / "31.80" → Zahl
  const cleaned = String(str).replace(/[^0-9,.-]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}
function formatPrice(n) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function PriceArchitecture({ pricing, retailer, onUpdateField }) {
  const competitors = pricing.competitors || []
  // Balken-Skalierung: höchster Preis = 100%
  const maxPrice = competitors.length
    ? Math.max(...competitors.map(c => parsePrice(c.price ?? c.priceFormatted)), 1)
    : 100

  const updateComp = (i, patch) => onUpdateField(p => {
    const comps = (p.pricing.competitors || []).map((c, idx) => idx === i ? { ...c, ...patch } : c)
    return { ...p, pricing: { ...p.pricing, competitors: comps } }
  })
  const removeComp = (i) => onUpdateField(p => {
    const comps = (p.pricing.competitors || []).filter((_, idx) => idx !== i)
    return { ...p, pricing: { ...p.pricing, competitors: comps } }
  })
  const addComp = () => onUpdateField(p => {
    const comps = [...(p.pricing.competitors || []), { name: 'Neues Produkt', price: 0, channel: 'Kanal', isAldi: false, url: null }]
    return { ...p, pricing: { ...p.pricing, competitors: comps } }
  })
  const setOwn = (i) => onUpdateField(p => {
    // Nur eine Zeile darf "eigenes Produkt" sein
    const comps = (p.pricing.competitors || []).map((c, idx) => ({ ...c, isAldi: idx === i }))
    return { ...p, pricing: { ...p.pricing, competitors: comps } }
  })

  return (
    <>
      <div className="price-bar-wrap">
        {competitors.map((c, i) => {
          const priceNum = parsePrice(c.price ?? c.priceFormatted)
          const pct = Math.max(Math.round((priceNum / maxPrice) * 100), 6)
          const isOwn = !!c.isAldi
          return (
            <div className="pa-row" key={i}>
              <button
                className={`pa-own-toggle ${isOwn ? 'on' : ''}`}
                title={isOwn ? 'Eigenes Produkt' : 'Als eigenes Produkt markieren'}
                onClick={() => setOwn(i)}
              >
                {isOwn
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : <span className="pa-own-empty" />}
              </button>

              <span className={`pa-name ${isOwn ? 'own' : ''}`}>
                <EditableField value={c.name} onSave={v => updateComp(i, { name: v })} />
                <EditableField
                  value={c.url || ''}
                  onSave={v => updateComp(i, { url: v.trim() || null })}
                  displayContent={
                    c.url
                      ? <a href={c.url} target="_blank" rel="noopener noreferrer" className="pa-link-icon" title={c.url} onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      : <span className="pa-link-add" title="Link hinzufügen">+ Link</span>
                  }
                />
              </span>

              <div className="pa-track">
                <div className="pa-fill" style={{
                  width: `${pct}%`,
                  background: isOwn ? 'var(--green)' : 'var(--violet)',
                  fontWeight: isOwn ? 700 : 400,
                }}>
                  <EditableField value={c.channel || ''} onSave={v => updateComp(i, { channel: v })} inputClassName="pa-channel-input" />
                </div>
              </div>

              <span className={`pa-amount ${isOwn ? 'own' : ''}`}>
                <EditableField
                  value={formatPrice(priceNum)}
                  onSave={v => updateComp(i, { price: parsePrice(v), priceFormatted: formatPrice(parsePrice(v)) })}
                />
              </span>

              <button className="pa-remove" title="Zeile entfernen" onClick={() => removeComp(i)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          )
        })}
        <button className="pa-add" onClick={addComp}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Wettbewerber / Produkt hinzufügen
        </button>
      </div>

      {pricing.consumerArg !== undefined && (
        <div className="arg-block forest" style={{ marginBottom: 16 }}>
          <p className="arg-title">Argument für den Endkäufer</p>
          <p className="arg-body">
            <EditableField value={pricing.consumerArg} onSave={v => onUpdateField(p => ({ ...p, pricing: { ...p.pricing, consumerArg: v } }))} />
          </p>
        </div>
      )}

      <div className="margin-grid">
        <div className="margin-card">
          <p className="mc-label">EK-Ziel (FOB)</p>
          <p className="mc-value"><EditableField value={pricing.ek} onSave={v => onUpdateField(p => ({ ...p, pricing: { ...p.pricing, ek: v } }))} /></p>
          <p className="mc-sub"><EditableField value={pricing.ekNote} onSave={v => onUpdateField(p => ({ ...p, pricing: { ...p.pricing, ekNote: v } }))} /></p>
          {pricing.ekLanded !== undefined && (
            <p className="mc-landed">+ Fracht/Zoll/Handling → angeliefert (landed): <EditableField value={pricing.ekLanded} onSave={v => onUpdateField(p => ({ ...p, pricing: { ...p.pricing, ekLanded: v } }))} /></p>
          )}
        </div>
        <div className="margin-card highlight">
          <p className="mc-label">{retailer}-Handelsspanne</p>
          <p className="mc-value"><EditableField value={pricing.margin} onSave={v => onUpdateField(p => ({ ...p, pricing: { ...p.pricing, margin: v } }))} /></p>
          <p className="mc-sub">auf Netto-VK · bei VK <EditableField value={pricing.vk} onSave={v => onUpdateField(p => ({ ...p, pricing: { ...p.pricing, vk: v } }))} /></p>
        </div>
        <div className="margin-card factor">
          <p className="mc-label">Kalkulationsfaktor</p>
          <p className="mc-value"><EditableField value={pricing.factor || '—'} onSave={v => onUpdateField(p => ({ ...p, pricing: { ...p.pricing, factor: v } }))} /></p>
          <p className="mc-sub">VK ÷ EK</p>
        </div>
      </div>

      <p className="pa-caveat">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        FOB ≠ {retailer}-EK: Seefracht, Zoll (0–4,7 %), Importhandling und Intermediärmarge liegen dazwischen. Die Handelsspanne bezieht sich auf den angelieferten (landed) EK, nicht auf den FOB-Preis.
      </p>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   PITCH DECK VIEW
   ═══════════════════════════════════════════════════════════ */
function PitchDeckView({ pitch, onBack, isSavedPitch, onToggleSavePitch, onUpdateField, hideBack }) {
  if (!pitch) return null

  return (
    <div className="pitch-view">
      <div className="pitch-topbar">
        {hideBack
          ? <span />
          : <button className="back-btn" onClick={onBack}>← Zurück zu den Konzepten</button>
        }
        <div className="pitch-topbar-right">
          <button
            className={`pitch-save-btn ${isSavedPitch ? 'saved' : ''}`}
            onClick={onToggleSavePitch}
            title={isSavedPitch ? 'Pitch-Konzept gespeichert – klicken zum Entfernen' : 'Pitch-Konzept speichern'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={isSavedPitch ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <button className="pdf-btn" onClick={() => window.print()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Als PDF speichern
          </button>
        </div>
      </div>

      <div className="pitch-header">
        <p className="pitch-header-meta">Pitch-Konzept</p>
        <h1>
          <EditableField
            value={pitch.productName}
            onSave={v => onUpdateField(p => ({ ...p, productName: v }))}
          />
        </h1>
        <p className="tagline">
          <EditableField
            value={pitch.tagline}
            displayContent={<span dangerouslySetInnerHTML={{ __html: pitch.tagline }} />}
            onSave={v => onUpdateField(p => ({ ...p, tagline: v }))}
          />
        </p>
        <div className="pitch-stat-row">
          {pitch.stats?.map((s, i) => (
            <div key={i} className={`pitch-stat ${s.accent ? 'accent' : ''}`}>
              <p className="pitch-stat-label">{s.label}</p>
              <p className="pitch-stat-value">
                <EditableField
                  value={s.value}
                  inputClassName={s.accent ? 'ef-input-accent' : ''}
                  onSave={v => onUpdateField(p => {
                    const stats = p.stats.map((st, idx) => idx === i ? { ...st, value: v } : st)
                    return { ...p, stats }
                  })}
                />
              </p>
              {s.sub && <p className="pitch-stat-sub">{s.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {pitch.positioning && (
        <PitchSection num="01 — Marktchance" defaultOpen={true}>
          <EditablePositioning
            value={pitch.positioning}
            onSave={v => onUpdateField(p => ({ ...p, positioning: v }))}
          />
          <EditableSourceBadges
            sources={pitch.positioning_sources || []}
            onUpdate={v => onUpdateField(p => ({ ...p, positioning_sources: v }))}
          />
        </PitchSection>
      )}

      {pitch.specs?.length > 0 && (
        <PitchSection num="02 — Produktsteckbrief">
          <div className="card-wrap">
            <table className="spec-table">
              <tbody>
                {pitch.specs.map((s, i) => (
                  <tr key={i}>
                    <td>{s.label}</td>
                    <td>
                      <EditableField
                        value={s.value}
                        onSave={val => onUpdateField(p => {
                          const specs = p.specs.map((item, idx) => idx === i ? { ...item, value: val } : item)
                          return { ...p, specs }
                        })}
                      />
                      {s.badge && <span className="spec-badge">{s.badge}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PitchSection>
      )}

      {pitch.pricing && (
        <PitchSection num="03 — Preisarchitektur & Marge">
          <PriceArchitecture pricing={pitch.pricing} retailer={pitch.retailer || pitch.pricing.retailer || 'Aldi'} onUpdateField={onUpdateField} />
        </PitchSection>
      )}

      {pitch.validation?.length > 0 && (
        <PitchSection num="04 — Referenzmärkte">
          <p style={{ marginBottom: 14, color: 'var(--text-muted)', fontSize: 14 }}>
            Folgende Schwester-Discounter oder internationale Märkte hatten vergleichbare Produkte im Sortiment — ein starkes Validierungssignal für den Pitch.
          </p>
          <table className="spec-table">
            <tbody>
              {pitch.validation.map((v, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>
                    <EditableField
                      value={v.market}
                      onSave={val => onUpdateField(p => {
                        const validation = p.validation.map((item, idx) => idx === i ? { ...item, market: val } : item)
                        return { ...p, validation }
                      })}
                    />
                  </td>
                  <td>
                    <EditableField
                      value={v.detail}
                      onSave={val => onUpdateField(p => {
                        const validation = p.validation.map((item, idx) => idx === i ? { ...item, detail: val } : item)
                        return { ...p, validation }
                      })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PitchSection>
      )}

      {pitch.packaging && (
        <PitchSection num="05 — Packaging-Konzept">
          <div className="card-wrap">
            <table className="pack-table">
              <tbody>
                {pitch.packaging.map((row, i) => (
                  <tr key={i}>
                    <td>{row.label}</td>
                    <td>
                      <EditableField
                        value={row.value}
                        onSave={val => onUpdateField(p => {
                          const packaging = p.packaging.map((item, idx) => idx === i ? { ...item, value: val } : item)
                          return { ...p, packaging }
                        })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PitchSection>
      )}

      {pitch.sellthrough && (
        <PitchSection num="06 — Sell-Through-Story">
          {pitch.sellthrough.intro !== undefined && (
            <EditablePositioning
              value={pitch.sellthrough.intro}
              onSave={val => onUpdateField(p => ({ ...p, sellthrough: { ...p.sellthrough, intro: val } }))}
            />
          )}
          {pitch.sellthrough.highlights?.map((h, i) => (
            <div key={i} className={`arg-block ${i % 2 === 1 ? 'forest' : ''}`}>
              <p className="arg-title">
                <EditableField
                  value={h.title}
                  onSave={val => onUpdateField(p => {
                    const highlights = p.sellthrough.highlights.map((item, idx) => idx === i ? { ...item, title: val } : item)
                    return { ...p, sellthrough: { ...p.sellthrough, highlights } }
                  })}
                />
              </p>
              <p className="arg-body">
                <EditableField
                  value={h.body}
                  onSave={val => onUpdateField(p => {
                    const highlights = p.sellthrough.highlights.map((item, idx) => idx === i ? { ...item, body: val } : item)
                    return { ...p, sellthrough: { ...p.sellthrough, highlights } }
                  })}
                />
              </p>
              {h.sources?.length > 0 && (
                <div className="source-badges">
                  {h.sources.map((s, j) => <SourceBadge key={j} label={s.label} url={s.url} />)}
                </div>
              )}
            </div>
          ))}
        </PitchSection>
      )}

      {pitch.arguments && (
        <PitchSection num="07 — Einkäufer-Argumentation">
          {pitch.arguments.map((arg, i) => (
            <div key={i} className="arg-block">
              <p className="arg-title">
                <EditableField
                  value={arg.title}
                  onSave={val => onUpdateField(p => {
                    const args = p.arguments.map((item, idx) => idx === i ? { ...item, title: val } : item)
                    return { ...p, arguments: args }
                  })}
                />
              </p>
              <p className="arg-body">
                <EditableField
                  value={arg.body}
                  onSave={val => onUpdateField(p => {
                    const args = p.arguments.map((item, idx) => idx === i ? { ...item, body: val } : item)
                    return { ...p, arguments: args }
                  })}
                />
              </p>
              {arg.sources?.length > 0 && (
                <div className="source-badges">
                  {arg.sources.map((s, j) => <SourceBadge key={j} label={s.label} url={s.url} />)}
                </div>
              )}
            </div>
          ))}
          {pitch.buyerQA?.length > 0 && (
            <>
              <hr className="hr" />
              <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-faint)', margin: '20px 0 12px' }}>
                Was der Einkäufer fragen wird
              </h3>
              <div className="card-wrap">
                <table className="qa-table">
                  <tbody>
                    {pitch.buyerQA.map((qa, i) => (
                      <tr key={i}>
                        <td>„
                          <EditableField
                            value={qa.q}
                            onSave={val => onUpdateField(p => {
                              const buyerQA = p.buyerQA.map((item, idx) => idx === i ? { ...item, q: val } : item)
                              return { ...p, buyerQA }
                            })}
                          />"
                        </td>
                        <td>
                          <EditableField
                            value={qa.a}
                            onSave={val => onUpdateField(p => {
                              const buyerQA = p.buyerQA.map((item, idx) => idx === i ? { ...item, a: val } : item)
                              return { ...p, buyerQA }
                            })}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </PitchSection>
      )}

      {pitch.risks && (
        <PitchSection num="08 — Risikoabwägung">
          <table className="risk-table">
            <thead><tr><th>Risiko</th><th>Level</th><th>Mitigation</th></tr></thead>
            <tbody>
              {pitch.risks.map((r, i) => {
                const cycle = { low: 'medium', medium: 'high', high: 'low' }
                const levelLabel = { high: 'Hoch', medium: 'Mittel', low: 'Niedrig' }
                return (
                  <tr key={i}>
                    <td>
                      <EditableField
                        value={r.risk}
                        onSave={val => onUpdateField(p => {
                          const risks = p.risks.map((item, idx) => idx === i ? { ...item, risk: val } : item)
                          return { ...p, risks }
                        })}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`pill pill-${r.level} pill-clickable`}
                        title="Klicken zum Ändern (Niedrig / Mittel / Hoch)"
                        onClick={() => onUpdateField(p => {
                          const risks = p.risks.map((item, idx) => idx === i ? { ...item, level: cycle[item.level] || 'medium' } : item)
                          return { ...p, risks }
                        })}
                      >
                        {levelLabel[r.level] || r.level}
                      </button>
                    </td>
                    <td>
                      <EditableField
                        value={r.mitigation}
                        onSave={val => onUpdateField(p => {
                          const risks = p.risks.map((item, idx) => idx === i ? { ...item, mitigation: val } : item)
                          return { ...p, risks }
                        })}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </PitchSection>
      )}

      {pitch.timeline && (
        <PitchSection num="09 — Roadmap">
          <div className="timeline">
            {pitch.timeline.map((tl, i) => (
              <div key={i} className={`tl-item ${tl.active ? 'tl-active' : ''}`}>
                <p className="tl-date">
                  <EditableField
                    value={tl.date}
                    onSave={val => onUpdateField(p => {
                      const timeline = p.timeline.map((item, idx) => idx === i ? { ...item, date: val } : item)
                      return { ...p, timeline }
                    })}
                  />
                </p>
                <p className="tl-title">
                  <EditableField
                    value={tl.title}
                    onSave={val => onUpdateField(p => {
                      const timeline = p.timeline.map((item, idx) => idx === i ? { ...item, title: val } : item)
                      return { ...p, timeline }
                    })}
                  />
                </p>
                <p className="tl-body">
                  <EditableField
                    value={tl.body}
                    onSave={val => onUpdateField(p => {
                      const timeline = p.timeline.map((item, idx) => idx === i ? { ...item, body: val } : item)
                      return { ...p, timeline }
                    })}
                  />
                </p>
              </div>
            ))}
          </div>
        </PitchSection>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  // Reload-State: pitch + zugehöriges Konzept werden ATOMAR zusammen gespeichert,
  // damit sie beim Reload nie auseinanderlaufen (Bug: falsches Produkt nach Reload)
  const loadPitchSession = () => {
    try {
      const raw = sessionStorage.getItem('aktionspilot_pitch_session')
      if (!raw) return { pitch: null, concept: null }
      const parsed = JSON.parse(raw)
      return { pitch: parsed.pitch || null, concept: parsed.concept || null }
    } catch { return { pitch: null, concept: null } }
  }
  const _initSession = loadPitchSession()

  const [view, setView]               = useState(() => {
    if (window.location.hash === '#pitch' && _initSession.pitch) return 'pitch'
    return 'dashboard'
  })
  const [cardsData, setCardsData]     = useState(null)
  const [pitchData, setPitchData]     = useState(_initSession.pitch)
  const [pitchCache, setPitchCache]   = useState({})
  const [savedPitches, setSavedPitches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aktionspilot_saved_pitches') || '{}') }
    catch { return {} }
  })
  const [selectedConcept, setSelected] = useState(_initSession.concept)
  const [loading, setLoading]         = useState(false)
  const [loadingPitch, setLoadingPitch] = useState(false)
  const [error, setError]             = useState(null)
  const [activeTab, setActiveTab] = useState('aktions')
  const [toolsOpen, setToolsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [pitchSource, setPitchSource] = useState('cards') // track where pitch was opened from
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [dashMode, setDashMode] = useState('aktion')

  // Close mobile menu on Escape
  useEffect(() => {
    if (!mobileMenuOpen) return
    const fn = (e) => { if (e.key === 'Escape') setMobileMenuOpen(false) }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [mobileMenuOpen])

  // Bug-Fix Reload: pitch UND zugehöriges Konzept ATOMAR zusammen speichern,
  // damit beim Reload nie ein falsches Produkt zum Pitch erscheint
  useEffect(() => {
    try {
      if (pitchData && selectedConcept) {
        sessionStorage.setItem('aktionspilot_pitch_session', JSON.stringify({ pitch: pitchData, concept: selectedConcept }))
      } else if (!pitchData) {
        sessionStorage.removeItem('aktionspilot_pitch_session')
      }
    } catch {}
  }, [pitchData, selectedConcept])

  const switchTool = (tab) => {
    setActiveTab(tab)
    resetToSearch()
    setToolsOpen(false)
  }

  const scrollToHow = () => {
    setView('howitworks')
    window.history.pushState({ view: 'howitworks' }, '', '#howitworks')
    window.scrollTo({ top: 0 })
    setToolsOpen(false)
  }
  const [pendingQuery, setPendingQuery]       = useState(null)
  const [pendingDeep, setPendingDeep]         = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    localStorage.getItem('ap_auth') === '1'
  )
  const [savedConcepts, setSavedConcepts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ap_saved') || '[]') }
    catch { return [] }
  })
  const [navVisible, setNavVisible] = useState(false)

  useEffect(() => {
    localStorage.setItem('ap_saved', JSON.stringify(savedConcepts))
  }, [savedConcepts])

  const toggleSave = (concept) => {
    setSavedConcepts(prev => {
      const exists = prev.find(c => (c.id || c.name) === (concept.id || concept.name))
      if (exists) return prev.filter(c => (c.id || c.name) !== (concept.id || concept.name))
      return [...prev, { ...concept, savedAt: new Date().toISOString() }]
    })
  }

  const isSaved = (concept) =>
    savedConcepts.some(c => (c.id || c.name) === (concept.id || concept.name))

  const updateSavedConcept = (concept, field, value) => {
    setSavedConcepts(prev => {
      const next = prev.map(c =>
        (c.id || c.name) === (concept.id || concept.name) ? { ...c, [field]: value } : c
      )
      try { localStorage.setItem('ap_saved', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const pitchKey = (concept) => concept?.name || ''

  const isPitchSaved = (concept) => !!savedPitches[pitchKey(concept)]

  const updateSavedPitch = (concept, data) => {
    setSavedPitches(prev => {
      const next = { ...prev, [pitchKey(concept)]: data }
      try { localStorage.setItem('aktionspilot_saved_pitches', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const updatePitchField = (updater) => {
    setPitchData(prev => {
      const next = updater(prev)
      if (selectedConcept && isPitchSaved(selectedConcept)) updateSavedPitch(selectedConcept, next)
      return next
    })
  }

  const toggleSavePitch = (concept, data) => {
    setSavedPitches(prev => {
      const next = { ...prev }
      const k = pitchKey(concept)
      if (next[k]) delete next[k]
      else next[k] = data
      try { localStorage.setItem('aktionspilot_saved_pitches', JSON.stringify(next)) } catch {}
      return next
    })
  }

  useEffect(() => {
    const handleScroll = () => setNavVisible(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Browser back/forward button support
  useEffect(() => {
    const handlePop = () => {
      const hash = window.location.hash
      if (hash === '#impressum') {
        setView('impressum')
      } else if (hash === '#results') {
        setView('cards')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (hash === '#pitch') {
        setView('pitch')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (hash === '#saved') {
        setView('saved')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setView('dashboard')
        setCardsData(null)
        setPitchData(null)
        setSelected(null)
        setError(null)
      }
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  /* ── Generate (Auth-Gate erfolgt global beim Seitenladen) ── */
  const generateCards = (query, deepAnalysis = false) => {
    runGenerateCards(query, deepAnalysis)
  }

  const handleAccessGranted = () => {
    localStorage.setItem('ap_auth', '1')
    setIsAuthenticated(true)
    setShowAccessModal(false)
    if (pendingQuery) {
      const q = pendingQuery
      const d = pendingDeep
      setPendingQuery(null)
      setPendingDeep(false)
      runGenerateCards(q, d)
    }
  }

  /* ── Generate Cards ──────────────────────────────────── */
  const runGenerateCards = async (query, deepAnalysis = false) => {
    if (!query) return
    setError(null)
    setSearchModalOpen(false)
    setLoading(true)
    setView('loading-cards')
    try {
      const res = await fetch('/api/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, deepAnalysis }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `API error ${res.status}`)
      }
      const data = await res.json()
      // Eindeutige IDs vergeben — AI liefert immer "1","2","3", was zu falschen Bookmark-Matches führt
      // Händler (retailer) an jedes concept anhängen, damit gespeicherte Cards ihn kennen
      const ts = Date.now()
      if (data.concepts) {
        data.concepts = data.concepts.map((c, i) => ({ ...c, id: `${ts}-${i}`, retailer: c.retailer || data.retailer }))
      }
      setCardsData(data)
      setView('cards')
      window.history.pushState({ view: 'cards' }, '', '#results')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError(e.message)
      setView('dashboard')
      setSearchModalOpen(true)
    } finally {
      setLoading(false)
    }
  }

  /* ── Generate Pitch ──────────────────────────────────── */
  const pitchCacheKey = (c) => `${c.name}::${c.tagline || ''}`

  const generatePitch = async (concept) => {
    const key = pitchCacheKey(concept)
    const sourceView = view === 'loading-pitch' ? pitchSource : view // fallback safety
    setPitchSource(view) // remember where we came from

    if (savedPitches[concept.name]) {
      setSelected(concept)
      setPitchData(savedPitches[concept.name])
      setView('pitch')
      window.history.pushState({ view: 'pitch' }, '', '#pitch')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (pitchCache[key]) {
      setSelected(concept)
      setPitchData(pitchCache[key])
      setView('pitch')
      window.history.pushState({ view: 'pitch' }, '', '#pitch')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setSelected(concept)
    setError(null)
    setLoadingPitch(true)
    setView('loading-pitch')
    try {
      const res = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, context: cardsData?.searchContext }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `API error ${res.status}`)
      }
      const data = await res.json()
      const cleanData = stripCiteDeep(data)
      setPitchCache(prev => ({ ...prev, [key]: cleanData }))
      setPitchData(cleanData)
      setView('pitch')
      window.history.pushState({ view: 'pitch' }, '', '#pitch')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError(e.message)
      setView(sourceView) // go back to where we came from, not always 'cards'
    } finally {
      setLoadingPitch(false)
    }
  }

  const resetToSearch = () => {
    setView('dashboard')
    setCardsData(null)
    setPitchData(null)
    setSelected(null)
    setError(null)
    if (window.location.hash) {
      window.history.pushState({}, '', window.location.pathname)
    }
  }

  const goDashboard = () => {
    setView('dashboard'); setCardsData(null); setPitchData(null); setSelected(null); setError(null)
    if (window.location.hash) window.history.pushState({}, '', window.location.pathname)
    window.scrollTo({ top: 0 })
  }
  const goSaved = () => {
    setView('saved'); window.history.pushState({ view: 'saved' }, '', '#saved'); window.scrollTo({ top: 0 })
  }
  const goHowItWorks = () => {
    setView('howitworks'); window.history.pushState({ view: 'howitworks' }, '', '#howitworks'); window.scrollTo({ top: 0 })
  }

  return (
    <div className="app-shell">
      {/* ── ZUGANGS-GATE: blockiert die gesamte App bis Code eingegeben ── */}
      {!isAuthenticated && (
        <AccessModal onSuccess={handleAccessGranted} />
      )}

      {isAuthenticated && <>

      {/* ── SEARCH MODAL (global, neues Design) ── */}
      <Modal open={searchModalOpen} onClose={() => setSearchModalOpen(false)}>
        <div className="dash-modal-search">
          <span className="dv2-modal-eyebrow">ZENTRALE AKTION</span>
          <h2 className="dash-modal-title">Neue Aktion analysieren</h2>
          <SearchForm onSearch={generateCards} loading={loading} />
        </div>
      </Modal>

      {/* ── PERMANENTER LAYOUT-RAHMEN: Sidebar + Content ── */}
      <div className="dash-layout">
        <Sidebar
          activeTab={activeTab}
          currentView={view}
          savedCount={savedConcepts.length}
          onSwitchTool={switchTool}
          onDashboard={goDashboard}
          onSaved={goSaved}
          onHowItWorks={goHowItWorks}
          onUserClick={() => {}}
        />

        <div className="dash-content">

        {/* ── DASHBOARD ── */}
        {view === 'dashboard' && (
            <DashboardView
              savedConcepts={savedConcepts}
              savedPitches={savedPitches}
              dashMode={dashMode}
              onSetMode={setDashMode}
              onNewAction={() => setSearchModalOpen(true)}
              onOpenConcept={generatePitch}
              onToggleSave={toggleSave}
              onUpdateConcept={updateSavedConcept}
            />
        )}

        {/* ── HOW IT WORKS (eigene View) ── */}
        {view === 'howitworks' && (
          <div className="dash-content-inner">
            <HowItWorks />
          </div>
        )}

        {/* ── LOADING CARDS ── */}
        {view === 'loading-cards' && (
          <div className="loading-wrap">
            <div className="loading-spinner" />
            <p className="loading-label">Markt wird analysiert …</p>
            <p className="loading-sub">Trend-Daten · Whitespace · Sell-through-Einschätzung · Webrecherche</p>
          </div>
        )}

        {/* ── CARDS ── */}
        {view === 'cards' && cardsData && (
          <div className="dash-content-inner">
            <div className="results-header">
              <div>
                <p className="results-context">{cardsData.retailer} · {cardsData.season}</p>
                <h2 className="results-title">{cardsData.searchContext}</h2>
              </div>
              <button className="new-search-btn" onClick={resetToSearch}>Neue Anfrage</button>
            </div>
            {error && <div className="error-box">⚠ {error}</div>}
            <div className="legend">
              <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--score-1)' }} /><span>Trend 2025/26</span></div>
              <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--score-2)' }} /><span>Discounter-Whitespace</span></div>
              <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--score-3)' }} /><span>Sell-through (Aldi-Kunde)</span></div>
              <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--score-4)' }} /><span>Pitch-Reife / Umsetzbarkeit</span></div>
            </div>
            <div className="cards-grid">
              {cardsData.concepts?.map((concept, i) => (
                <ProductCard
                  key={concept.id || i}
                  concept={concept}
                  onSelect={generatePitch}
                  onToggleSave={toggleSave}
                  saved={isSaved(concept)}
                  index={i}
                  pitchSaved={!!savedPitches[concept.name]}
                />
              ))}
            </div>
            {cardsData.excluded?.length > 0 && (
              <div className="excluded-section">
                <p className="excluded-title">Ausschluss — bereits Discounter-Standard, kein Whitespace</p>
                <div className="excluded-grid">
                  {cardsData.excluded.map((ex, i) => (
                    <div key={i} className="excluded-item">
                      <p className="excl-name"><span className="excl-x">✗</span>{ex.name}</p>
                      <p className="excl-reason">{ex.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── LOADING PITCH ── */}
        {view === 'loading-pitch' && (
          <div className="pitch-loading">
            <div className="loading-spinner" />
            <p className="pitch-loading-label">Pitch-Konzept wird generiert …</p>
            <p className="pitch-loading-sub">{selectedConcept?.name} · Specs · Preisarchitektur · Roadmap</p>
          </div>
        )}

        {/* ── PITCH ── */}
        {view === 'pitch' && pitchData && (
          <div className="dash-content-inner">
          <PitchDeckView
            pitch={pitchData}
            isSavedPitch={isPitchSaved(selectedConcept)}
            onToggleSavePitch={() => selectedConcept && toggleSavePitch(selectedConcept, pitchData)}
            onUpdateField={updatePitchField}
            hideBack={pitchSource === 'saved' || pitchSource === 'dashboard' || (selectedConcept && isSaved(selectedConcept))}
            onBack={() => {
              // Nie zur alten Such-Ansicht — nur zu Cards (falls vorhanden) oder Dashboard
              if (pitchSource === 'cards' && cardsData) {
                setView('cards')
                window.history.pushState({ view: 'cards' }, '', '#results')
              } else {
                goDashboard()
              }
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
          </div>
        )}

        {/* ── SAVED ── */}
        {view === 'saved' && (
          <div className="dash-content-inner">
            <div className="results-header">
              <div>
                <p className="results-context">Merkliste</p>
                <h2 className="results-title">
                  {savedConcepts.length} gespeicherte{savedConcepts.length !== 1 ? ' Konzepte' : 's Konzept'}
                </h2>
              </div>
              <button className="new-search-btn" onClick={resetToSearch}>← Zur Suche</button>
            </div>
            {savedConcepts.length === 0 ? (
              <div className="saved-empty">
                <p>Noch keine Konzepte gespeichert.</p>
                <p>Klicke auf das Lesezeichen-Icon auf einer Karte um sie zu speichern.</p>
              </div>
            ) : (
              <div className="cards-grid">
                {savedConcepts.map((concept, i) => (
                  <ProductCard
                    key={concept.id || i}
                    concept={concept}
                    onSelect={generatePitch}
                    onToggleSave={toggleSave}
                    saved={true}
                    index={i}
                    pitchSaved={!!savedPitches[concept.name]}
                    onUpdateConcept={(field, value) => updateSavedConcept(concept, field, value)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        {view === 'impressum' && (
          <ImpressumView onBack={resetToSearch} />
        )}

          <Footer activeTab={activeTab} onImpressum={() => {
            setView('impressum')
            window.history.pushState({}, '', '#impressum')
          }} />

        </div>{/* dash-content */}
      </div>{/* dash-layout */}
      </>}
    </div>
  )
}
