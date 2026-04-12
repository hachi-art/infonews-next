// ============================================================
// app/(pole-6-music)/music-pro-dj/page.tsx — PAGE 22
// DJ Charts électroniques — Beatport Top 100 par genre
// + actualités musicales (Billboard, Pitchfork, NME)
//
// Sources portées depuis l'ancien :
//   routes/music.js → /api/music/beatport → fetchAllBeatportCharts
//   services/beatportRss.js → 6 genres RSS (Techno, House, DH, Melodic, D&B, Afro)
//   services/billboardRss.js → Billboard, Pitchfork, NME, Loudwire
// ============================================================

import type { Metadata } from 'next'
import {
  fetchAllBeatportCharts,
  fetchMusicNews,
  ALL_GENRES,
  type BeatportTrack,
  type MusicNewsArticle,
} from '@/lib/services/beatportService'

export const metadata: Metadata = {
  title: 'Music Pro DJ — Beatport Charts, Billboard, Pitchfork',
  description:
    'Top 100 Beatport par genre (Techno, House, Deep House, Melodic, D&B, Afro House) + actualités musicales Billboard et Pitchfork.',
}

export const revalidate = 3600

// ── Section title ─────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: '0.75rem', marginTop: '1.5rem',
    }}>
      {children}
    </h2>
  )
}

// ── Couleurs par genre ────────────────────────────────────────

const GENRE_COLORS: Record<string, string> = {
  'Techno':                  '#ef4444',
  'House':                   '#f59e0b',
  'Deep House':               '#3b82f6',
  'Melodic House & Techno':  '#8b5cf6',
  'Drum & Bass':              '#10b981',
  'Afro House':               '#f97316',
}

// ── Track Card ────────────────────────────────────────────────

function TrackCard({ track, rank }: { track: BeatportTrack; rank: number }) {
  const color = GENRE_COLORS[track.genre] ?? 'var(--text-muted)'
  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card"
      style={{ padding: '0.7rem 0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'flex-start', gap: '0.7rem' }}
    >
      {/* Rank */}
      <span style={{
        fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)', minWidth: 28, flexShrink: 0,
      }}>
        #{rank}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {track.title}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem', alignItems: 'center' }}>
          <span style={{
            fontSize: '0.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
            color, background: `${color}22`, border: `1px solid ${color}44`,
            padding: '1px 5px', borderRadius: 3,
          }}>
            {track.genre}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Beatport
          </span>
        </div>
      </div>
    </a>
  )
}

// ── News Article Card ─────────────────────────────────────────

function NewsCard({ article }: { article: MusicNewsArticle }) {
  const d = new Date(article.publishedAt)
  const timeLabel = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  return (
    <article className="card" style={{ padding: '0.85rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
        <span style={{
          fontSize: '0.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
          color: '#f59e0b', background: 'rgba(245,158,11,0.15)',
          border: '1px solid rgba(245,158,11,0.3)', padding: '1px 5px', borderRadius: 3,
        }}>
          {article.badge}
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{article.source}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {timeLabel}
        </span>
      </div>
      <a href={article.url} target="_blank" rel="noopener noreferrer"
        style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', textDecoration: 'none', lineHeight: 1.35 }}>
        {article.title}
      </a>
    </article>
  )
}

// ── Page (Server Component) ───────────────────────────────────

export default async function MusicProDjPage() {
  const [allTracks, newsArticles] = await Promise.all([
    fetchAllBeatportCharts(10),
    fetchMusicNews(24),
  ])

  // Regroupe par genre dans l'ordre canonique
  const byGenre = ALL_GENRES.map((genre) => ({
    genre,
    tracks: allTracks.filter((t) => t.genre === genre),
  })).filter((g) => g.tracks.length > 0)

  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="page-header">
        <h1 className="page-title">🎧 Music Pro DJ</h1>
        <p className="page-description">
          Beatport Top 100 · {byGenre.length} genres · Techno · House · Deep House · Melodic · D&amp;B · Afro
        </p>
        <div className="page-sources">
          {['Beatport', 'Billboard', 'Pitchfork', 'NME', 'Loudwire'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>

      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1.5rem' }}>
        Mise à jour : {time} · {allTracks.length} tracks · ISR 1h
      </p>

      {/* ── Charts Beatport par genre ── */}
      {byGenre.map(({ genre, tracks }) => (
        <section key={genre} style={{ marginBottom: '2rem' }}>
          <SectionTitle>
            <span style={{ color: GENRE_COLORS[genre] ?? 'var(--text-muted)' }}>●</span>{' '}
            {genre} — Top {tracks.length}
          </SectionTitle>
          <div className="grid-auto-sm">
            {tracks.map((t, i) => <TrackCard key={t.id} track={t} rank={i + 1} />)}
          </div>
        </section>
      ))}

      {/* ── Actualités musicales ── */}
      {newsArticles.length > 0 && (
        <>
          <SectionTitle>🎵 Actualités musicales — {newsArticles.length} articles</SectionTitle>
          <div className="grid-auto-sm">
            {newsArticles.slice(0, 12).map((a) => <NewsCard key={a.id} article={a} />)}
          </div>
        </>
      )}

    </div>
  )
}
