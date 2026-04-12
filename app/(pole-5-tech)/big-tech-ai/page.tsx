// ============================================================
// app/(pole-5-tech)/big-tech-ai/page.tsx — PAGE 17
// Fusion intelligente : Tech + IA + Cyber + Recherche ArXiv
//
// Sources portées depuis l'ancien :
//   routes/tech.js  → TechCrunch, ArsTechnica, Wired, Guardian Tech
//   services/techCrunchRss.js → TechCrunch top + AI
//   services/openAiBlogRss.js → OpenAI, DeepMind, Microsoft AI, BAIR
//   services/bleepingComputerRss.js → BleepingComputer, CISA
//   services/arxivService.js → cs.AI, cs.LG
//
// Fusion : tri par date ↓ + déduplication URL + titre
// Badges : TECH · AI · CYBER · PAPER
// ============================================================

import type { Metadata } from 'next'
import {
  fetchTechAiNews,
  ALL_SOURCES,
  BADGE_COLORS,
  type NewsArticle,
} from '@/lib/services/techAiService'

export const metadata: Metadata = {
  title: 'Big Tech & IA — GAFAM, OpenAI, DeepMind, ArXiv',
  description:
    'Flux fusionné Tech + IA + Cybersécurité + Recherche ArXiv. TechCrunch, Wired, OpenAI, DeepMind, BleepingComputer, CISA.',
}

export const revalidate = 300

// ── Badge Component ───────────────────────────────────────────

function Badge({ badge }: { badge: string }) {
  const color = BADGE_COLORS[badge] ?? '#6b7280'
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '0.6rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.06em',
        padding: '1px 6px',
        borderRadius: '3px',
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
        flexShrink: 0,
      }}
    >
      {badge}
    </span>
  )
}

// ── Article Card ──────────────────────────────────────────────

function ArticleCard({ article }: { article: NewsArticle }) {
  const d = new Date(article.publishedAt)
  const ago = Math.round((Date.now() - d.getTime()) / 60_000)
  const timeLabel =
    ago < 60
      ? `il y a ${ago} min`
      : ago < 1440
      ? `il y a ${Math.round(ago / 60)} h`
      : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })

  return (
    <article
      className="card"
      style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
    >
      {/* Top row : badge + source + date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <Badge badge={article.badge} />
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {article.source}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
          {timeLabel}
        </span>
      </div>

      {/* Titre cliquable */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text)',
          textDecoration: 'none',
          lineHeight: 1.35,
        }}
      >
        {article.title}
      </a>

      {/* Description */}
      {article.description && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
          {article.description.slice(0, 180)}
          {article.description.length > 180 ? '…' : ''}
        </p>
      )}
    </article>
  )
}

// ── Section header ────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: '0.72rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '0.75rem',
        marginTop: '1.5rem',
      }}
    >
      {children}
    </h2>
  )
}

// ── Page (Server Component) ───────────────────────────────────

export default async function BigTechAiPage() {
  const articles = await fetchTechAiNews(80)

  // Séparation par badge pour les sections
  const tech  = articles.filter((a) => a.badge === 'TECH')
  const ai    = articles.filter((a) => a.badge === 'AI')
  const cyber = articles.filter((a) => a.badge === 'CYBER')
  const paper = articles.filter((a) => a.badge === 'PAPER')

  const totalOk = articles.length
  const fetchedAt = articles[0]?.publishedAt ?? new Date().toISOString()
  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="page-header">
        <h1 className="page-title">🤖 Big Tech &amp; IA</h1>
        <p className="page-description">
          GAFAM · OpenAI · DeepMind · HackerNews · ArXiv cs.AI — Fusion intelligente {totalOk} articles
        </p>
        <div className="page-sources">
          {ALL_SOURCES.map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>

      {/* ── Timestamp ── */}
      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1.5rem' }}>
        Mise à jour : {time} · {totalOk} articles · déduplication URL+titre active · ISR 5 min
      </p>

      {/* ── Légende badges ── */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {Object.entries(BADGE_COLORS).map(([badge, color]) => (
          <span key={badge} style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.7rem', color: 'var(--text-muted)',
          }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
            {badge === 'TECH' ? 'Technologie' : badge === 'AI' ? 'Intelligence Artificielle' : badge === 'CYBER' ? 'Cybersécurité' : 'Recherche (ArXiv)'}
          </span>
        ))}
      </div>

      {/* ── Tech ── */}
      {tech.length > 0 && (
        <>
          <SectionTitle>💻 Technologie — {tech.length} articles</SectionTitle>
          <div className="grid-auto-sm">
            {tech.slice(0, 12).map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        </>
      )}

      {/* ── IA ── */}
      {ai.length > 0 && (
        <>
          <SectionTitle>🧠 Intelligence Artificielle — {ai.length} articles</SectionTitle>
          <div className="grid-auto-sm">
            {ai.slice(0, 12).map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        </>
      )}

      {/* ── Cybersécurité ── */}
      {cyber.length > 0 && (
        <>
          <SectionTitle>🔒 Cybersécurité — {cyber.length} articles</SectionTitle>
          <div className="grid-auto-sm">
            {cyber.slice(0, 8).map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        </>
      )}

      {/* ── Recherche ArXiv ── */}
      {paper.length > 0 && (
        <>
          <SectionTitle>📄 Recherche ArXiv cs.AI / cs.LG — {paper.length} papers</SectionTitle>
          <div className="grid-auto-sm">
            {paper.slice(0, 8).map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        </>
      )}

    </div>
  )
}
