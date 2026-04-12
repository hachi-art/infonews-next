// ============================================================
// app/(pole-4-screen)/sports-live/page.tsx — PAGE 13
// Résultats & Prochains matchs toutes ligues + Actualités sport
//
// Sources portées depuis routes/sport.js :
//   TheSportsDB API v3 (gratuit, clé "3") → 6 ligues, matchs récents + upcoming
//   BBC Sport RSS → sport général + football + F1 + tennis
//   ESPN RSS → sport général + soccer + NBA
//   football-data.org → classements (FOOTBALL_DATA_KEY optionnel)
// ============================================================

import type { Metadata } from 'next'
import {
  fetchAllLeagues,
  fetchSportNews,
  LEAGUES,
  COMPETITIONS,
  type League,
  type Match,
  type SportArticle,
} from '@/lib/services/sportsService'

export const metadata: Metadata = {
  title: 'Sports Live — Résultats Football, F1, Tennis, NBA',
  description:
    'Résultats et prochains matchs : Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Champions League. BBC Sport, ESPN.',
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

// ── Match Card ────────────────────────────────────────────────

function MatchCard({ match }: { match: Match }) {
  const isFinished = match.status === 'finished'
  const hasScore   = match.homeScore !== null && match.awayScore !== null

  const dateLabel = match.date
    ? new Date(match.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })
    : '—'

  return (
    <div className="card" style={{ padding: '0.7rem 0.9rem' }}>
      {/* Teams + Score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
        <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', textAlign: 'right' }}>
          {match.homeTeam}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 800,
          color: isFinished ? 'var(--text)' : 'var(--text-muted)',
          minWidth: 56, textAlign: 'center', flexShrink: 0,
          background: isFinished ? 'var(--bg)' : 'transparent',
          padding: '0.1rem 0.4rem', borderRadius: 4,
        }}>
          {hasScore ? `${match.homeScore} – ${match.awayScore}` : isFinished ? '? – ?' : 'vs'}
        </span>
        <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>
          {match.awayTeam}
        </span>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.63rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          📅 {dateLabel}{match.time ? ` · ${match.time}` : ''}
        </span>
        {match.stadium && (
          <span style={{ fontSize: '0.63rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            📍 {match.stadium}
          </span>
        )}
      </div>
    </div>
  )
}

// ── League Section ────────────────────────────────────────────

function LeagueSection({ league }: { league: League }) {
  const hasRecent   = league.recent.length > 0
  const hasUpcoming = league.upcoming.length > 0
  if (!hasRecent && !hasUpcoming) return null

  return (
    <div style={{
      padding: '1rem 1.1rem',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      marginBottom: '1rem',
    }}>
      <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>
        {league.country} {league.name}
      </h3>

      {hasRecent && (
        <>
          <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
            ✅ Derniers résultats
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {league.recent.map((m) => <MatchCard key={m.id} match={m} />)}
          </div>
        </>
      )}

      {hasUpcoming && (
        <>
          <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
            🔜 Prochains matchs
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {league.upcoming.map((m) => <MatchCard key={m.id} match={m} />)}
          </div>
        </>
      )}
    </div>
  )
}

// ── News Card ─────────────────────────────────────────────────

const NEWS_BADGE_COLORS: Record<string, string> = {
  BBC:  '#ef4444',
  F1:   '#ff4500',
  TEN:  '#22c55e',
  ESPN: '#ff6600',
  NBA:  '#3b82f6',
}

function NewsCard({ article }: { article: SportArticle }) {
  const color = NEWS_BADGE_COLORS[article.badge] ?? '#6b7280'
  const d = new Date(article.publishedAt)
  const timeLabel = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })

  return (
    <article className="card" style={{ padding: '0.85rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
        <span style={{
          fontSize: '0.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
          color, background: `${color}22`, border: `1px solid ${color}44`,
          padding: '1px 5px', borderRadius: 3, flexShrink: 0,
        }}>
          {article.badge}
        </span>
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
          {article.description.slice(0, 160)}…
        </p>
      )}
    </article>
  )
}

// ── Football-Data Note ────────────────────────────────────────

function FootballDataNote() {
  const hasKey = !!process.env.FOOTBALL_DATA_KEY
  if (hasKey) return null
  return (
    <div style={{
      fontSize: '0.72rem', color: '#f59e0b',
      background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
      borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.9rem', marginBottom: '1.5rem',
    }}>
      ℹ️ Classements détaillés disponibles avec <code>FOOTBALL_DATA_KEY</code> (gratuit sur football-data.org).
      Les ligues ci-dessus proviennent de TheSportsDB (sans clé).
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────

export default async function SportsLivePage() {
  const [leagues, newsArticles] = await Promise.all([
    fetchAllLeagues(3),
    fetchSportNews(30),
  ])

  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const totalMatches = leagues.reduce((n, l) => n + l.recent.length + l.upcoming.length, 0)

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="page-header">
        <h1 className="page-title">⚽ Sports Live</h1>
        <p className="page-description">
          Premier League · La Liga · Bundesliga · Serie A · Ligue 1 · Champions League · BBC Sport · ESPN
        </p>
        <div className="page-sources">
          {['TheSportsDB', 'BBC Sport', 'ESPN', 'football-data.org'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>

      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1.5rem' }}>
        Mise à jour : {time} · {totalMatches} matchs · {leagues.length} ligues · ISR 5 min
      </p>

      <FootballDataNote />

      {/* ── Matchs par ligue ── */}
      <SectionTitle>🏆 Résultats &amp; Prochains Matchs — {leagues.length} ligues</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0' }}>
        {leagues.map((l) => <LeagueSection key={l.leagueId} league={l} />)}
      </div>

      {/* ── Actualités ── */}
      {newsArticles.length > 0 && (
        <>
          <SectionTitle>📰 Actualités Sport — BBC Sport &amp; ESPN ({newsArticles.length})</SectionTitle>
          <div className="grid-auto-sm">
            {newsArticles.slice(0, 20).map((a) => <NewsCard key={a.id} article={a} />)}
          </div>
        </>
      )}

    </div>
  )
}
