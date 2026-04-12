// ============================================================
// app/(pole-2-eco)/commodities/page.tsx — PAGE 06
// Matières Premières — Or, Argent, Pétrole, Gaz, Lithium, Agricoles
//
// ARCHITECTURE :
//   Server Component (async) → fetchAllCommodities() directement
//   Pas d'auto-appel /api/finance/commodities (évite la double requête).
//   CategoryTemplate (Client) reçoit les données via props/children.
//   TradingViewGrid (Client) rendu côté client uniquement (dynamic import).
//
// PORTAGE de l'ancien s-commodites :
//   ✅ Prix live Yahoo Finance (GC=F, SI=F, CL=F, BZ=F, NG=F, HG=F, ZW=F…)
//   ✅ Graphiques TradingView (OANDA:XAUUSD, NYMEX:CL1!, CBOT:ZW1!…)
//   ✅ Disclaimer MIF II (copié depuis l'ancien slide)
//   ✅ Groupement par catégorie (Métaux / Énergie / Agricole)
// ============================================================

import type { Metadata } from 'next'
import { TradingViewClientGrid } from '@/components/widgets/TradingViewClientWrapper'
import {
  fetchAllCommodities,
  groupByCategory,
  formatPrice,
  type CommodityQuote,
  type CommodityCategory,
} from '@/lib/services/commoditiesService'

// ── Metadata SEO ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Commodities — Matières Premières en Temps Réel',
  description:
    "Cours live de l'Or, Argent, Pétrole WTI/Brent, Gaz Naturel, Lithium, Blé, Maïs, Café. Source Yahoo Finance + graphiques TradingView.",
}

export const revalidate = 120

// ── Prix Card ─────────────────────────────────────────────────

function PriceCard({ quote }: { quote: CommodityQuote }) {
  const isUp = quote.changePct >= 0
  const hasError = !!quote.error
  const hasData = quote.price > 0

  return (
    <div
      className="card"
      style={{ padding: '1rem 1.1rem' }}
      title={hasError ? quote.error : undefined}
    >
      {/* Header : emoji + nom */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.4rem' }} aria-hidden="true">{quote.emoji}</span>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
            {quote.name}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {quote.yahooSymbol} · {quote.unit}
          </div>
        </div>
      </div>

      {/* Prix */}
      {hasError && !hasData ? (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          ⚠️ Données indisponibles
        </div>
      ) : (
        <>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.2rem',
              fontWeight: 500,
              color: 'var(--text)',
              letterSpacing: '-0.02em',
            }}
          >
            {formatPrice(quote.price, quote.currency)}
          </div>

          {/* Variation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginTop: '0.25rem',
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                color: isUp ? '#22c55e' : '#ef4444',
                fontWeight: 500,
              }}
            >
              {isUp ? '▲' : '▼'} {isUp ? '+' : ''}
              {quote.changePct.toFixed(2)}%
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              ({isUp ? '+' : ''}{quote.change.toFixed(2)})
            </span>
          </div>
        </>
      )}
    </div>
  )
}

// ── Category Section ──────────────────────────────────────────

const CATEGORY_ICONS: Record<CommodityCategory, string> = {
  'Métaux précieux': '🥇',
  'Énergie': '⚡',
  'Matières agricoles': '🌾',
}

function CategorySection({
  category,
  quotes,
}: {
  category: CommodityCategory
  quotes: CommodityQuote[]
}) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2
        style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '0.75rem',
        }}
      >
        {CATEGORY_ICONS[category]} {category}
      </h2>
      <div className="grid-auto-sm">
        {quotes.map((q) => (
          <PriceCard key={q.symbol} quote={q} />
        ))}
      </div>
    </section>
  )
}

// ── Disclaimer ────────────────────────────────────────────────
// Copié depuis l'ancien slide s-commodites (class="finance-disclaimer")

function MifiiDisclaimer() {
  return (
    <div
      style={{
        fontSize: '0.72rem',
        color: '#f59e0b',
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.5rem 0.9rem',
        marginBottom: '1.5rem',
        lineHeight: 1.5,
      }}
      role="note"
    >
      ⚠️ <strong>Données informatives non-contractuelles</strong> — pas de conseil en investissement
      (Directive MIF II 2014/65/UE). Cours Yahoo Finance, revalidés toutes les 2 min.
    </div>
  )
}

// ── Timestamp ─────────────────────────────────────────────────

function FetchTimestamp({ fetchedAt }: { fetchedAt: string }) {
  const d = new Date(fetchedAt)
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  return (
    <p
      style={{
        fontSize: '0.68rem',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        marginBottom: '2rem',
      }}
    >
      Dernière mise à jour : {time} UTC · Yahoo Finance · Revalidation ISR 120s
    </p>
  )
}

// ── Page principale (Server Component) ───────────────────────

export default async function CommoditiesPage() {
  // Fetch direct (pas via /api/...) — Server Component peut appeler le service
  const quotes = await fetchAllCommodities()
  const grouped = groupByCategory(quotes)
  const fetchedAt = quotes[0]?.fetchedAt ?? new Date().toISOString()

  // Items pour TradingView (on passe seulement les colonnes nécessaires)
  const tvItems = quotes.map((q) => ({
    tvSymbol: q.tvSymbol,
    name: q.name,
    emoji: q.emoji,
  }))

  const categoryOrder: CommodityCategory[] = [
    'Métaux précieux',
    'Énergie',
    'Matières agricoles',
  ]

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="page-header">
        <h1 className="page-title">⚡ Commodities</h1>
        <p className="page-description">
          Or · Argent · Pétrole WTI/Brent · Gaz Naturel · Lithium ETF · Blé · Maïs · Soja · Café
        </p>
        <div className="page-sources">
          {['Yahoo Finance', 'TradingView', 'Alpha Vantage'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>

      {/* ── Disclaimer MIF II (porté depuis l'ancien slide) ── */}
      <MifiiDisclaimer />

      {/* ── Timestamp ── */}
      <FetchTimestamp fetchedAt={fetchedAt} />

      {/* ── Prix Live par catégorie ── */}
      {categoryOrder.map((cat) =>
        grouped[cat]?.length ? (
          <CategorySection key={cat} category={cat} quotes={grouped[cat]} />
        ) : null
      )}

      {/* ── Graphiques TradingView (Client-side only) ── */}
      <section style={{ marginTop: '2.5rem' }}>
        <h2
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '0.9rem',
          }}
        >
          📊 Graphiques TradingView — 3 mois
        </h2>
        {/* dynamic import ssr:false — les widgets TradingView exigent le DOM */}
        <TradingViewClientGrid items={tvItems} />
      </section>

    </div>
  )
}
