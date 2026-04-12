// ============================================================
// app/(pole-7-social)/cia-ngo-vault/page.tsx — PAGE 26
// Droits humains · Environnement · Santé · Organisations
//
// Sources portées depuis routes/society.js + societyRssService.js :
//   Amnesty International · Human Rights Watch · UNHCR
//   Greenpeace · UNEP
//   WHO
//   Nations Unies · UNICEF · MSF · World Bank Blog
// ============================================================

import type { Metadata } from 'next'
import {
  fetchAllSocietyNews,
  BADGE_COLORS,
  CATEGORY_LABELS,
  ALL_SOURCES,
  type SocietyArticle,
} from '@/lib/services/societyService'

export const metadata: Metadata = {
  title: 'CIA & NGO Vault — Droits Humains, Environnement, ONG',
  description:
    'Amnesty International, Human Rights Watch, UNHCR, Greenpeace, UNEP, WHO, UNICEF, MSF, Nations Unies, World Bank Blog.',
}

export const revalidate = 600

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

function ArticleCard({ article }: { article: SocietyArticle }) {
  const d = new Date(article.publishedAt)
  const ago = Math.round((Date.now() - d.getTime()) / 60_000)
  const timeLabel =
    ago < 1440
      ? `il y a ${Math.max(1, Math.round(ago / 60))} h`
      : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })

  return (
    <article className="card" style={{ padding: '0.85rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
        <Badge badge={article.badge} />
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{article.source}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
          {timeLabel}
        </span>
      </div>
      <a href={article.url} target="_blank" rel="noopener noreferrer"
        style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text)', textDecoration: 'none', lineHeight: 1.35 }}>
        {article.title}
      </a>
      {article.description && (
        <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', margin: '0.3rem 0 0', lineHeight: 1.5 }}>
          {article.description.slice(0, 180)}…
        </p>
      )}
    </article>
  )
}

// ── Page ──────────────────────────────────────────────────────

export default async function CiaNgoVaultPage() {
  const data = await fetchAllSocietyNews(12)
  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  type DataKey = 'rights' | 'environment' | 'health' | 'orgs'
  const sections: Array<{ key: DataKey; label: string }> = [
    { key: 'rights',      label: CATEGORY_LABELS.rights },
    { key: 'environment', label: CATEGORY_LABELS.environment },
    { key: 'health',      label: CATEGORY_LABELS.health },
    { key: 'orgs',        label: CATEGORY_LABELS.orgs },
  ]

  const totalArticles = sections.reduce((n, s) => n + (data[s.key]?.length ?? 0), 0)

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="page-header">
        <h1 className="page-title">🕵️ CIA &amp; NGO Vault</h1>
        <p className="page-description">
          Droits humains · Environnement · Santé mondiale · Organisations internationales — {totalArticles} articles
        </p>
        <div className="page-sources">
          {ALL_SOURCES.map((s) => <span key={s} className="source-badge">{s}</span>)}
        </div>
      </div>

      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1.5rem' }}>
        Mise à jour : {time} · {totalArticles} articles · déduplication URL+titre · ISR 10 min
      </p>

      {/* ── Légende ── */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {Object.entries(BADGE_COLORS).map(([badge, color]) => (
          <span key={badge} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
            {badge === 'DROITS' ? 'Droits humains' : badge === 'ENV' ? 'Environnement' : badge === 'SANTÉ' ? 'Santé' : badge === 'ONU' ? 'Nations Unies' : badge === 'ONG' ? 'ONG' : 'Banque Mondiale'}
          </span>
        ))}
      </div>

      {/* ── Sections par catégorie ── */}
      {sections.map(({ key, label }) => {
        const articles = data[key] ?? []
        if (!articles.length) return null
        return (
          <section key={key} style={{ marginBottom: '2rem' }}>
            <SectionTitle>{label} — {articles.length} articles</SectionTitle>
            <div className="grid-auto-sm">
              {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
            </div>
          </section>
        )
      })}

    </div>
  )
}
