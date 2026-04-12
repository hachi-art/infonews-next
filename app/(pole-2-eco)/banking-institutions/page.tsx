// ============================================================
// app/(pole-2-eco)/banking-institutions/page.tsx — PAGE 07
// Banques centrales & Institutions financières mondiales
//
// Sources portées depuis :
//   routes/society.js SOURCE_MAP → FED, BCE, FMI, OCDE, ONU, WB Blog
//   services/worldbankService.js → fetchTopGDP (top 15 PIB)
//   Même URLs RSS que l'ancien Express
// ============================================================

import type { Metadata } from 'next'
import {
  fetchTopGDP,
  fetchInstitutionNews,
  INSTITUTION_FEEDS,
  type IndicatorRow,
  type InstitutionArticle,
} from '@/lib/services/worldbankService'

export const metadata: Metadata = {
  title: 'Banking Reports — FED, BCE, FMI, Banque Mondiale',
  description:
    'Flux officiels FED, BCE, FMI, OCDE, Banque Mondiale. Top 15 PIB mondial, indicateurs économiques World Bank Open Data.',
}

export const revalidate = 1800

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
  return value.toLocaleString('fr-FR')
}

// ── GDP Row ───────────────────────────────────────────────────

function GdpRow({ row, rank }: { row: IndicatorRow; rank: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      padding: '0.5rem 0.75rem',
      background: rank <= 3 ? 'rgba(245,158,11,0.05)' : 'transparent',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ width: 24, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>
        {rank}
      </span>
      <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text)', fontWeight: rank <= 3 ? 600 : 400 }}>
        {row.country}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', flexShrink: 0 }}>
        {formatValue(row.value, row.unit)}
      </span>
      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
        {row.year}
      </span>
    </div>
  )
}

// ── Institution Badge ─────────────────────────────────────────

const BADGE_COLORS: Record<string, string> = {
  FED:  '#22c55e',
  BCE:  '#3b82f6',
  FMI:  '#f59e0b',
  OCDE: '#8b5cf6',
  WB:   '#8b5cf6',
  ONU:  '#3b82f6',
}

function Badge({ badge }: { badge: string }) {
  const color = BADGE_COLORS[badge] ?? '#6b7280'
  return (
    <span style={{
      fontSize: '0.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
      letterSpacing: '0.06em', padding: '1px 6px', borderRadius: 3, flexShrink: 0,
      background: `${color}22`, color, border: `1px solid ${color}44`,
    }}>
      {badge}
    </span>
  )
}

// ── Article Card ──────────────────────────────────────────────

function ArticleCard({ article }: { article: InstitutionArticle }) {
  const d = new Date(article.publishedAt)
  const timeLabel = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  return (
    <article className="card" style={{ padding: '0.85rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
        <Badge badge={article.badge} />
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          {article.country} {article.institution}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {timeLabel}
        </span>
      </div>
      <a href={article.url} target="_blank" rel="noopener noreferrer"
        style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text)', textDecoration: 'none', lineHeight: 1.35 }}>
        {article.title}
      </a>
      {article.description && (
        <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', margin: '0.3rem 0 0', lineHeight: 1.5 }}>
          {article.description.slice(0, 160)}…
        </p>
      )}
    </article>
  )
}

// ── Page ──────────────────────────────────────────────────────

export default async function BankingInstitutionsPage() {
  const [gdpData, articles] = await Promise.all([
    fetchTopGDP(15),
    fetchInstitutionNews(60),
  ])

  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  // Regrouper articles par institution
  const byInstitution = INSTITUTION_FEEDS.map((f) => ({
    ...f,
    articles: articles.filter((a) => a.institution === f.label).slice(0, 5),
  })).filter((g) => g.articles.length > 0)

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="page-header">
        <h1 className="page-title">🏦 Banking Reports</h1>
        <p className="page-description">
          FED · BCE · FMI · OCDE · Banque Mondiale · Nations Unies · Top PIB mondial
        </p>
        <div className="page-sources">
          {INSTITUTION_FEEDS.map((f) => (
            <span key={f.key} className="source-badge">{f.country} {f.label}</span>
          ))}
        </div>
      </div>

      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1.5rem' }}>
        Mise à jour : {time} · ISR 30 min · PIB : World Bank Open Data (données annuelles)
      </p>

      {/* ── Top 15 PIB ── */}
      {gdpData.length > 0 && (
        <>
          <SectionTitle>🏆 Top {gdpData.length} PIB Mondial — World Bank</SectionTitle>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
            {gdpData.map((row, i) => (
              <GdpRow key={row.iso3} row={row} rank={i + 1} />
            ))}
          </div>
        </>
      )}

      {/* ── Articles par institution ── */}
      {byInstitution.map(({ label, country, badge, articles: items }) => (
        <section key={label} style={{ marginBottom: '2rem' }}>
          <SectionTitle>
            {country} {label} — {items.length} publications récentes{' '}
            <Badge badge={badge} />
          </SectionTitle>
          <div className="grid-auto-sm">
            {items.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        </section>
      ))}

    </div>
  )
}
