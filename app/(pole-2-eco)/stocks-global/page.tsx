// ============================================================
// app/(pole-2-eco)/stocks-global/page.tsx — PAGE 08
// Indices boursiers mondiaux + Indicateurs World Bank
//
// Sources portées :
//   services/worldbankService.js → fetchDashboard (GDP, pop, CO2, life, internet)
//   services/financeService.js (étendu) → indices Asia, BRICS, Océanie, Amérique Latine
//   Yahoo Finance v8 → 000001.SS, ^N225, ^BSESN, ^HSI, ^JKSE, ^KS11, ^TWII…
// ============================================================

import type { Metadata } from 'next'
import {
  fetchGlobalIndices,
  fetchDashboard,
  type GlobalIndex,
  type IndicatorRow,
} from '@/lib/services/worldbankService'

export const metadata: Metadata = {
  title: 'Stocks Global — Indices Asie, BRICS & Émergents',
  description:
    'Indices boursiers mondiaux : Shanghai, Nikkei 225, Sensex, Hang Seng, KOSPI, Bovespa, JSE + indicateurs économiques Banque Mondiale.',
}

export const revalidate = 300

// ── Helpers ───────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: '0.75rem', marginTop: '2rem',
    }}>
      {children}
    </h2>
  )
}

function formatValue(value: number, unit: string): string {
  if (unit === 'USD') {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)} T`
    if (value >= 1e9)  return `$${(value / 1e9).toFixed(1)} Md`
    return `$${value.toLocaleString('fr-FR')}`
  }
  if (unit === '%') return `${value.toFixed(1)} %`
  if (unit === 'ans') return `${value.toFixed(1)} ans`
  if (unit === 't') return `${value.toFixed(2)} t`
  return value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
}

// ── Index Card ────────────────────────────────────────────────

function IndexCard({ index }: { index: GlobalIndex }) {
  const isUp = index.changePct >= 0
  const hasData = index.price > 0
  const color = isUp ? '#22c55e' : '#ef4444'

  return (
    <div className="card" style={{ padding: '0.9rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '1.1rem' }}>{index.flag}</span>
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{index.name}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {index.symbol} · {index.region}
          </div>
        </div>
      </div>
      {hasData ? (
        <>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)' }}>
            {index.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>{index.currency}</span>
          </div>
          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color, marginTop: '0.2rem', fontWeight: 500 }}>
            {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{index.changePct.toFixed(2)}%
            <span style={{ color: 'var(--text-muted)', marginLeft: '0.3rem' }}>
              ({isUp ? '+' : ''}{index.change.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
            </span>
          </div>
        </>
      ) : (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {index.error ? '⚠️ Indisponible' : '— Marché fermé'}
        </div>
      )}
    </div>
  )
}

// ── Indicator Table ───────────────────────────────────────────

const INDICATOR_LABELS: Record<string, { emoji: string; label: string }> = {
  gdp:      { emoji: '💰', label: 'PIB (USD)' },
  pop:      { emoji: '👥', label: 'Population' },
  co2:      { emoji: '🌫️', label: 'CO₂ per capita (t)' },
  life:     { emoji: '❤️', label: 'Espérance de vie (ans)' },
  internet: { emoji: '🌐', label: 'Internautes (%)' },
}

function IndicatorSection({ indicatorKey, rows }: { indicatorKey: string; rows: IndicatorRow[] }) {
  const meta = INDICATOR_LABELS[indicatorKey]
  if (!meta || !rows.length) return null
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
        {meta.emoji} {meta.label} — Top {rows.length} (World Bank)
      </h3>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {rows.map((row, i) => (
          <div key={row.iso3} style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.45rem 0.75rem',
            background: i < 3 ? 'rgba(245,158,11,0.04)' : 'transparent',
            borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <span style={{ width: 20, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0 }}>{i + 1}</span>
            <span style={{ flex: 1, fontSize: '0.78rem', color: 'var(--text)' }}>{row.country}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', flexShrink: 0 }}>
              {formatValue(row.value, row.unit)}
            </span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{row.year}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────

export default async function StocksGlobalPage() {
  const [indices, dashboard] = await Promise.all([
    fetchGlobalIndices(),
    fetchDashboard(),
  ])

  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const liveIndices = indices.filter((i) => i.price > 0)
  const downIndices = indices.filter((i) => i.price === 0)

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="page-header">
        <h1 className="page-title">🌏 Stocks Global</h1>
        <p className="page-description">
          Shanghai · Nikkei · Sensex · Hang Seng · KOSPI · Bovespa · JSE · MOEX + Indicateurs Banque Mondiale
        </p>
        <div className="page-sources">
          {['Yahoo Finance', 'World Bank Open Data'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>

      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1.5rem' }}>
        Mise à jour : {time} · {liveIndices.length}/{indices.length} indices actifs · ISR 5 min
      </p>

      {/* ── Disclaimer ── */}
      <div style={{
        fontSize: '0.72rem', color: '#f59e0b',
        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.9rem', marginBottom: '1.5rem',
      }} role="note">
        ⚠️ <strong>Données informatives non-contractuelles</strong> — pas de conseil en investissement (MIF II). Cours Yahoo Finance, certains marchés fermés hors heures de cotation.
      </div>

      {/* ── Indices ── */}
      <SectionTitle>📊 Indices Boursiers Mondiaux ({liveIndices.length} actifs)</SectionTitle>
      <div className="grid-auto-sm" style={{ marginBottom: '2rem' }}>
        {liveIndices.map((idx) => <IndexCard key={idx.symbol} index={idx} />)}
        {downIndices.map((idx) => <IndexCard key={idx.symbol} index={idx} />)}
      </div>

      {/* ── Indicateurs Banque Mondiale ── */}
      <SectionTitle>🌍 Indicateurs Économiques — World Bank Open Data</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {Object.entries(dashboard).map(([key, rows]) => (
          <IndicatorSection key={key} indicatorKey={key} rows={rows} />
        ))}
      </div>

    </div>
  )
}
