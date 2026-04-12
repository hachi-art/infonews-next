// ============================================================
// app/(pole-4-screen)/streaming-guide/page.tsx — PAGE 14
// Streaming & Cinéma
//
// Sources portées :
//   routes/cinema.js → tmdbService.js (TMDB, actif si TMDB_API_KEY)
//   services/varietyRss.js → Variety + Hollywood Reporter
//   services/tmdbService.js → rssCinemaFallback (AlloCiné)
//
// Sans TMDB_API_KEY → RSS uniquement (Variety, THR, AlloCiné)
// Avec TMDB_API_KEY → TMDB Trending movies + séries + RSS
//
// JustWatch : API privée sans clé publique officielle.
//   Placeholder avec lien deeplink par plateforme.
// ============================================================

import type { Metadata } from 'next'
import {
  fetchStreamingNews,
  fetchTmdbTrending,
  STREAMING_PLATFORMS,
  type StreamingArticle,
  type TmdbMovie,
} from '@/lib/services/streamingService'

export const metadata: Metadata = {
  title: 'Streaming Guide — Netflix, Disney+, HBO, Amazon Prime',
  description:
    'Nouvelles sorties Netflix, Disney+, HBO Max, Amazon Prime. Actualités Variety, Hollywood Reporter, AlloCiné. Données TMDB si clé configurée.',
}

export const revalidate = 1800 // 30 min

// ── Section title ─────────────────────────────────────────────

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

// ── TMDB Movie Card ───────────────────────────────────────────

function TmdbCard({ movie }: { movie: TmdbMovie }) {
  return (
    <a href={movie.url} target="_blank" rel="noopener noreferrer"
      className="card"
      style={{ padding: '0', overflow: 'hidden', textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
      {movie.poster ? (
        <img src={movie.poster} alt={movie.title} loading="lazy"
          style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', aspectRatio: '2/3', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
          {movie.type === 'tv' ? '📺' : '🎬'}
        </div>
      )}
      <div style={{ padding: '0.7rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.3rem', alignItems: 'center' }}>
          <span style={{
            fontSize: '0.6rem', fontFamily: 'var(--font-mono)', fontWeight: 700,
            color: movie.type === 'tv' ? '#3b82f6' : '#f59e0b',
            background: movie.type === 'tv' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)',
            border: `1px solid ${movie.type === 'tv' ? 'rgba(59,130,246,0.3)' : 'rgba(245,158,11,0.3)'}`,
            padding: '1px 5px', borderRadius: 3,
          }}>
            {movie.type === 'tv' ? 'SÉRIE' : 'FILM'}
          </span>
          {parseFloat(movie.rating) > 0 && (
            <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
              ⭐ {movie.rating}
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
          {movie.title}
        </div>
        {movie.releaseDate && (
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            {movie.releaseDate}
          </div>
        )}
      </div>
    </a>
  )
}

// ── News Card ─────────────────────────────────────────────────

function NewsCard({ article }: { article: StreamingArticle }) {
  const timeLabel = new Date(article.publishedAt).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short',
  })
  return (
    <article className="card" style={{ padding: '0.85rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
        <span style={{
          fontSize: '0.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
          color: '#8b5cf6', background: 'rgba(139,92,246,0.15)',
          border: '1px solid rgba(139,92,246,0.3)', padding: '1px 5px', borderRadius: 3,
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
      {article.description && (
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.3rem 0 0', lineHeight: 1.5 }}>
          {article.description.slice(0, 150)}…
        </p>
      )}
    </article>
  )
}

// ── JustWatch Placeholder ─────────────────────────────────────

function JustWatchPlaceholder() {
  const LINKS = [
    { name: 'Netflix',      url: 'https://www.justwatch.com/fr/streaming/netflix',        icon: '🎬' },
    { name: 'Disney+',      url: 'https://www.justwatch.com/fr/streaming/disney-plus',    icon: '✨' },
    { name: 'HBO Max',      url: 'https://www.justwatch.com/fr/streaming/max',            icon: '👑' },
    { name: 'Amazon Prime', url: 'https://www.justwatch.com/fr/streaming/amazon-prime',   icon: '📦' },
    { name: 'Apple TV+',    url: 'https://www.justwatch.com/fr/streaming/apple-tv-plus',  icon: '🍎' },
    { name: 'Canal+',       url: 'https://www.justwatch.com/fr/streaming/canal-plus',     icon: '🎭' },
  ]
  return (
    <div style={{
      padding: '1rem 1.25rem',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      marginBottom: '1.5rem',
    }}>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        <strong style={{ color: 'var(--text)' }}>📺 JustWatch</strong> — L&apos;API JustWatch est privée (pas de clé publique). Accédez directement aux catalogues :
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {LINKS.map(({ name, url, icon }) => (
          <a key={name} href={url} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.35rem 0.7rem',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem', color: 'var(--text)', textDecoration: 'none',
              fontWeight: 500,
            }}>
            {icon} {name}
          </a>
        ))}
      </div>
    </div>
  )
}

// ── Page (Server Component) ───────────────────────────────────

export default async function StreamingGuidePage() {
  const [newsArticles, tmdbMovies] = await Promise.all([
    fetchStreamingNews(36),
    fetchTmdbTrending('fr-FR', 12),
  ])

  const hasTmdb = tmdbMovies.length > 0
  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="page-header">
        <h1 className="page-title">📺 Streaming Guide</h1>
        <p className="page-description">
          Netflix · Disney+ · HBO Max · Amazon Prime · Apple TV+ · Canal+
        </p>
        <div className="page-sources">
          {['JustWatch', hasTmdb ? 'TMDB' : 'TMDB (clé manquante)', 'Variety', 'Hollywood Reporter', 'AlloCiné'].map((s) => (
            <span key={s} className="source-badge" style={s.includes('manquante') ? { opacity: 0.5 } : undefined}>{s}</span>
          ))}
        </div>
      </div>

      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1.5rem' }}>
        Mise à jour : {time} · ISR 30 min
        {!hasTmdb && ' · Ajoutez TMDB_API_KEY dans .env.local pour les affiches TMDB'}
      </p>

      {/* ── JustWatch deeplinks ── */}
      <JustWatchPlaceholder />

      {/* ── TMDB (si clé disponible) ── */}
      {hasTmdb && (
        <>
          <SectionTitle>🎬 Tendances TMDB — Films &amp; Séries cette semaine</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
            {tmdbMovies.map((m) => <TmdbCard key={`${m.type}-${m.id}`} movie={m} />)}
          </div>
        </>
      )}

      {/* ── Actualités cinéma/streaming ── */}
      {newsArticles.length > 0 && (
        <>
          <SectionTitle>📰 Actualités Cinéma &amp; Streaming — {newsArticles.length} articles</SectionTitle>
          <div className="grid-auto-sm">
            {newsArticles.map((a) => <NewsCard key={a.id} article={a} />)}
          </div>
        </>
      )}

    </div>
  )
}
