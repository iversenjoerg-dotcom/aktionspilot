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
  const [price, setPrice]       = useState('')
  const [freeText, setFreeText] = useState('')
  const [deepAnalysis, setDeepAnalysis] = useState(false)
  const freeRef = useRef(null)

  const cats      = retailer ? (CATEGORIES[retailer] || DEFAULT_CATEGORIES) : []
  const charCount = freeText.trim().length

  // CTA block erscheint: sobald Freitext-Feld fokussiert ODER guided vollständig
  const showCTA =
    (mode === 'guided' && retailer && category && season && price) ||
    mode === 'custom'

  // Button aktiv: min. 3 Zeichen im Freitext ODER guided vollständig
  const canSearch =
    (mode === 'guided' && retailer && category && season && price) ||
    (mode === 'custom' && charCount >= 3)

  const handleRetailer = (val) => {
    setRetailer(val)
    setCategory('')
    setSeason('')
    setPrice('')
    if (val) setMode('guided')
  }

  const handleCategory = (val) => {
    setCategory(val)
    setSeason('')
    setPrice('')
  }

  const reset = () => {
    setMode('initial')
    setRetailer('')
    setCategory('')
    setSeason('')
    setPrice('')
    setFreeText('')
  }

  const handleFreeTextChange = (e) => {
    setFreeText(e.target.value)
    // Aktiviert custom mode — aber nie automatisch zurücksetzen wenn Feld geleert wird
    // Nur ← Zurück setzt den Mode zurück
    if (mode === 'initial') setMode('custom')
  }

  const search = () => {
    if (!canSearch || loading) return
    if (mode === 'custom' || mode === 'initial') {
      onSearch(freeText.trim(), deepAnalysis)
      return
    }
    let q = `Welche Produkte eignen sich für einen Aktions-Slot bei ${retailer}, Kategorie: ${category}`
    if (season && season !== 'skip') q += `, Saison / Anlass: ${season}`
    if (price  && price  !== 'skip') q += `, Ziel-VK Preisrahmen: ${price}`
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
          ) : (
            <div className="sf-pills">
              {cats.map(c => (
                <button key={c} className="sf-pill" onClick={() => handleCategory(c)}>{c}</button>
              ))}
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
              <button className="sf-pill-clear" onClick={() => { setSeason(''); setPrice(''); }}>✕</button>
            </div>
          ) : (
            <div className="sf-pills">
              {SEASONS.map(s => (
                <button key={s} className="sf-pill" onClick={() => setSeason(s)}>{s}</button>
              ))}
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
          {price ? (
            <div className="sf-pill-selected">
              <span>{price === 'skip' ? 'Keine Angabe' : price}</span>
              <button className="sf-pill-clear" onClick={() => setPrice('')}>✕</button>
            </div>
          ) : (
            <div className="sf-pills">
              {PRICE_RANGES.map(p => (
                <button key={p} className="sf-pill" onClick={() => setPrice(p)}>{p}</button>
              ))}
              <button className="sf-pill sf-pill-skip" onClick={() => setPrice('skip')}>Überspringen</button>
            </div>
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
        <button className="modal-close" onClick={onClose} aria-label="Schließen">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div className="modal-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 className="modal-title">Geschlossene Beta</h2>
        <p className="modal-desc">
          Aktionspilot befindet sich in aktiver Entwicklung.
          Der Zugang zur Analyse-Funktion ist derzeit nur
          ausgewählten Personen zugänglich.
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
          href="mailto:hallo@joergiversen.de?subject=Aktionspilot%20%E2%80%94%20Zugangscode%20anfordern&body=Ich%20m%C3%B6chte%20gerne%20Aktionspilot%20testen%20und%20bitte%20um%20einen%20Zugangscode."
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
      desc: 'Wähle den Händler, die Aktionskategorie und den Preisrahmen. Aktionspilot kennt die Sortimentsvorgaben und Aktionslogik jedes Händlers im Detail.',
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
          <h2 className="how-title">So funktioniert<br />der Aktionspilot.</h2>
          <p className="how-subtitle">
            Aktionspilot bringt die Marktrecherche auf ein neues Level — mit KI-gestützter Analyse,
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
function Footer({ onImpressum }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <span className="footer-brand">Aktions<span>pilot</span></span>
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
          Aktionspilot ist ein internes Analyse-Tool. Die generierten Inhalte dienen
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
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT CARD
   ═══════════════════════════════════════════════════════════ */
function ProductCard({ concept, onSelect, onToggleSave, saved, index }) {
  const tierClass = { top: 'card-top', growth: 'card-growth', caution: 'card-caution' }[concept.tier] || 'card-growth'
  const tierLabelClass = { top: 'tier-top', growth: 'tier-growth', caution: 'tier-caution' }[concept.tier] || 'tier-growth'
  return (
    <div className={`product-card ${tierClass}`} onClick={() => onSelect(concept)}>
      <div className="card-header-row">
        <span className={`card-tier ${tierLabelClass}`}>{concept.tierLabel}</span>
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
      <p className="card-name">{concept.name}</p>
      <p className="card-tagline">{concept.tagline}</p>
      <div className="scores">
        <ScoreBar label="Trend"        value={concept.scores.trend}       colorClass="score-fill-0" delay={index * 40} />
        <ScoreBar label="Whitespace"   value={concept.scores.whitespace}  colorClass="score-fill-1" delay={index * 40 + 60} />
        <ScoreBar label="Sell-through" value={concept.scores.sellthrough} colorClass="score-fill-2" delay={index * 40 + 120} />
        <ScoreBar label="Umsetzbar"    value={concept.scores.feasibility} colorClass="score-fill-3" delay={index * 40 + 180} />
      </div>
      <p className="card-why">{stripCite(concept.why)}</p>
      {concept.caveat && <p className="card-caveat">⚠ {stripCite(concept.caveat)}</p>}
      <div className="card-price-row">
        <span className="card-price">VK {concept.priceRange}</span>
        <span className="card-ek">{concept.ekHint}</span>
      </div>
      <button className="card-cta" type="button" onClick={(e) => { e.stopPropagation(); onSelect(concept) }}>
        Pitch-Konzept generieren →
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PITCH DECK VIEW
   ═══════════════════════════════════════════════════════════ */
function PitchDeckView({ pitch, onBack }) {
  if (!pitch) return null
  const maxPrice = pitch.pricing?.competitors
    ? Math.max(...pitch.pricing.competitors.map(c => c.price))
    : 100

  const renderPriceBar = (comp, i) => {
    const pct = Math.round((comp.price / maxPrice) * 100)
    return (
      <div className="price-bar-row" key={i}>
        <span className="price-bar-lbl" style={comp.isAldi ? { fontWeight: 700, color: 'var(--text)' } : {}}>
          {comp.name}
        </span>
        <div className="price-bar-track">
          <div className="price-bar-fill" style={{
            width: `${pct}%`,
            background: comp.isAldi ? 'var(--green)' : 'var(--violet)',
            fontWeight: comp.isAldi ? 700 : 400,
          }}>
            {comp.channel}
          </div>
        </div>
        <span className="price-bar-amount" style={comp.isAldi ? { color: 'var(--green)' } : {}}>
          {comp.priceFormatted}
        </span>
      </div>
    )
  }

  return (
    <div className="pitch-view">
      <div className="pitch-topbar">
        <button className="back-btn" onClick={onBack}>← Zurück zu den Konzepten</button>
        <span className="pitch-badge">Pitch-Konzept · Aktionspilot</span>
      </div>

      <div className="pitch-header">
        <p className="pitch-header-meta">01 — Positionierung</p>
        <h1>{pitch.productName}</h1>
        <p className="tagline" dangerouslySetInnerHTML={{ __html: pitch.tagline }} />
        <div className="pitch-stat-row">
          {pitch.stats?.map((s, i) => (
            <div key={i} className={`pitch-stat ${s.accent ? 'accent' : ''}`}>
              <p className="pitch-stat-label">{s.label}</p>
              <p className="pitch-stat-value">{s.value}</p>
              {s.sub && <p className="pitch-stat-sub">{s.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {pitch.positioning && (
        <section className="pitch-section">
          <div className="ink-box">
            {pitch.positioning.split('\n').filter(l => l.trim()).map((line, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: line }} />
            ))}
          </div>
        </section>
      )}

      {pitch.specs?.length > 0 && (
        <section className="pitch-section">
          <p className="pitch-section-num">02 — Produktsteckbrief</p>
          <h2>Was das Produkt kann</h2>
          <div className="card-wrap">
            <table className="spec-table">
              <tbody>
                {pitch.specs.map((s, i) => (
                  <tr key={i}>
                    <td>{s.label}</td>
                    <td>{s.value}{s.badge && <span className="spec-badge">{s.badge}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {pitch.pricing && (
        <section className="pitch-section">
          <p className="pitch-section-num">03 — Preisarchitektur & Marge</p>
          <h2>Der Preis-Vorteil als Kernargument</h2>
          <div className="price-bar-wrap">
            {pitch.pricing.competitors?.map((c, i) => renderPriceBar(c, i))}
          </div>
          {pitch.pricing.consumerArg && (
            <div className="arg-block forest" style={{ marginBottom: 16 }}>
              <p className="arg-title">Argument für den Endkäufer</p>
              <p className="arg-body">{pitch.pricing.consumerArg}</p>
            </div>
          )}
          <div className="margin-grid">
            <div className="margin-card">
              <p className="mc-label">EK-Ziel (FOB, ≥ 80k Stück)</p>
              <p className="mc-value">{pitch.pricing.ek}</p>
              <p className="mc-sub">{pitch.pricing.ekNote}</p>
            </div>
            <div className="margin-card highlight">
              <p className="mc-label">Aldi-Bruttohandelsspanne</p>
              <p className="mc-value">{pitch.pricing.margin}</p>
              <p className="mc-sub">Bei VK {pitch.pricing.vk}</p>
            </div>
          </div>
        </section>
      )}

      {pitch.packaging && (
        <section className="pitch-section">
          <p className="pitch-section-num">04 — Packaging-Konzept</p>
          <h2>Die Verpackung als erstes Kaufargument</h2>
          <div className="card-wrap">
            <table className="pack-table">
              <tbody>
                {pitch.packaging.map((row, i) => (
                  <tr key={i}><td>{row.label}</td><td>{row.value}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {pitch.sellthrough && (
        <section className="pitch-section">
          <p className="pitch-section-num">05 — Sell-Through-Story</p>
          <h2>Warum dreht das beim Aldi-Kunden?</h2>
          {pitch.sellthrough.intro && <p>{pitch.sellthrough.intro}</p>}
          {pitch.sellthrough.highlights?.map((h, i) => (
            <div key={i} className={`arg-block ${i % 2 === 1 ? 'forest' : ''}`}>
              <p className="arg-title">{h.title}</p>
              <p className="arg-body">{h.body}</p>
            </div>
          ))}
        </section>
      )}

      {pitch.arguments && (
        <section className="pitch-section">
          <p className="pitch-section-num">06 — Einkäufer-Argumentation</p>
          <h2>Die Argumente im Gespräch</h2>
          {pitch.arguments.map((arg, i) => (
            <div key={i} className="arg-block">
              <p className="arg-title">{arg.title}</p>
              <p className="arg-body">{arg.body}</p>
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
                      <tr key={i}><td>„{qa.q}"</td><td>{qa.a}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}

      {pitch.risks && (
        <section className="pitch-section">
          <p className="pitch-section-num">07 — Risikoabwägung</p>
          <h2>Risiken & Mitigationen</h2>
          <table className="risk-table">
            <thead><tr><th>Risiko</th><th>Level</th><th>Mitigation</th></tr></thead>
            <tbody>
              {pitch.risks.map((r, i) => (
                <tr key={i}>
                  <td>{r.risk}</td>
                  <td><span className={`pill pill-${r.level}`}>{{ high: 'Hoch', medium: 'Mittel', low: 'Niedrig' }[r.level] || r.level}</span></td>
                  <td>{r.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {pitch.timeline && (
        <section className="pitch-section">
          <p className="pitch-section-num">08 — Roadmap</p>
          <h2>Von heute zum Aktionsstarter</h2>
          <div className="timeline">
            {pitch.timeline.map((tl, i) => (
              <div key={i} className={`tl-item ${tl.active ? 'tl-active' : ''}`}>
                <p className="tl-date">{tl.date}</p>
                <p className="tl-title">{tl.title}</p>
                <p className="tl-body">{tl.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {pitch.summary && (
        <div className="ink-box">
          <p><strong>Zusammenfassung</strong></p>
          {pitch.summary.split('\n').filter(l => l.trim()).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  const [view, setView]               = useState('search')
  const [cardsData, setCardsData]     = useState(null)
  const [pitchData, setPitchData]     = useState(null)
  const [pitchCache, setPitchCache]   = useState({})
  const [selectedConcept, setSelected] = useState(null)
  const [loading, setLoading]         = useState(false)
  const [loadingPitch, setLoadingPitch] = useState(false)
  const [error, setError]             = useState(null)
  const [showAccessModal, setShowAccessModal] = useState(false)
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
      } else {
        setView('search')
        setCardsData(null)
        setPitchData(null)
        setSelected(null)
        setError(null)
      }
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  /* ── Auth gate ───────────────────────────────────────── */
  const generateCards = (query, deepAnalysis = false) => {
    if (!isAuthenticated) {
      setPendingQuery(query)
      setPendingDeep(deepAnalysis)
      setShowAccessModal(true)
      return
    }
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
      setCardsData(data)
      setView('cards')
      window.history.pushState({ view: 'cards' }, '', '#results')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError(e.message)
      setView('search')
    } finally {
      setLoading(false)
    }
  }

  /* ── Generate Pitch ──────────────────────────────────── */
  const generatePitch = async (concept) => {
    if (pitchCache[concept.id]) {
      setSelected(concept)
      setPitchData(pitchCache[concept.id])
      setView('pitch')
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
      setPitchCache(prev => ({ ...prev, [concept.id]: data }))
      setPitchData(data)
      setView('pitch')
      window.history.pushState({ view: 'pitch' }, '', '#pitch')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError(e.message)
      setView('cards')
    } finally {
      setLoadingPitch(false)
    }
  }

  const resetToSearch = () => {
    setView('search')
    setCardsData(null)
    setPitchData(null)
    setSelected(null)
    setError(null)
    if (window.location.hash) {
      window.history.pushState({}, '', window.location.pathname)
    }
  }

  return (
    <div className="app-shell">
      {showAccessModal && (
        <AccessModal
          onSuccess={handleAccessGranted}
          onClose={() => setShowAccessModal(false)}
        />
      )}

      {/* Topbar — transparent initially, white on scroll */}
      <header className={`topbar ${navVisible ? 'topbar-scrolled' : ''}`}>
        <div className="topbar-inner">
          <span className="topbar-logo" onClick={resetToSearch}>
            Aktions<span>pilot</span>
          </span>
          {savedConcepts.length > 0 && (
            <button className="nav-saved-btn" onClick={() => setView('saved')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              Gespeichert
              <span className="nav-saved-count">{savedConcepts.length}</span>
            </button>
          )}
        </div>
      </header>

      <div className="main-content">

        {/* ── SEARCH ── */}
        {view === 'search' && (
          <>
            <div className="search-hero">
              <h1>Welche Produkte gewinnen den<br />nächsten <em>Aktions-Slot?</em></h1>
              <p>Aktionspilot findet die Produkt-Lücken im Aktionssortiment der großen Händler — mit KI-generierter Marktanalyse, Whitespace-Bewertung und strukturiertem Pitchdeck-Material.</p>
              <SearchForm onSearch={generateCards} loading={loading} />
            </div>
            {error && <div className="error-box">⚠ {error}</div>}
          </>
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
          <>
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
          </>
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
          <PitchDeckView
            pitch={pitchData}
            onBack={() => window.history.back()}
          />
        )}

        {/* ── SAVED ── */}
        {view === 'saved' && (
          <>
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
                  />
                ))}
              </div>
            )}
          </>
        )}
        {view === 'impressum' && (
          <ImpressumView onBack={resetToSearch} />
        )}

      </div>

      {view === 'search' && <HowItWorks />}

      <Footer onImpressum={() => {
        setView('impressum')
        window.history.pushState({}, '', '#impressum')
      }} />
    </div>
  )
}
