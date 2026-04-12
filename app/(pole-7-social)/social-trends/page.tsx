// ============================================================
// app/(pole-7-social)/social-trends/page.tsx — PAGE 27
// Reddit RSS — 5 subreddits (portage exact de redditService.js)
//
// Sources :
//   r/worldnews · r/europe · r/science · r/technology · r/geopolitics
// ============================================================

import type { Metadata } from 'next'
import {
  fetchAllSubreddits,
  SUBREDDITS,
  type RedditPost,
} from '@/lib/services/redditService'

export const metadata: Metadata = {
  title: 'Social Trends — Reddit, r/worldnews, r/geopolitics',
  description:
    'Top posts Reddit : r/worldnews, r/europe, r/science, r/technology, r/geopolitics — flux RSS serveur (pas de CORS).',
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

// Couleur par subreddit
const SUB_COLORS: Record<string, string> = {
  worldnews:   '#ff4500',
  europe:      '#3b82f6',
  science:     '#22c55e',
  technology:  '#8b5cf6',
  geopolitics: '#f59e0b',
}

function PostCard({ post, rank }: { post: RedditPost; rank: number }) {
  const color = SUB_COLORS[post.subreddit] ?? '#6b7280'
  const d = new Date(post.publishedAt)
  const ago = Math.round((Date.now() - d.getTime()) / 60_000)
  const timeLabel = ago < 60 ? `${ago} min` : ago < 1440 ? `${Math.round(ago / 60)} h` : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })

  return (
    <article className="card" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
        color: 'var(--text-muted)', minWidth: 24, flexShrink: 0, paddingTop: '0.1rem',
      }}>
        #{rank}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <a href={post.url} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text)', textDecoration: 'none', lineHeight: 1.35, display: 'block' }}>
          {post.title}
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
            color, background: `${color}22`, border: `1px solid ${color}44`,
            padding: '1px 6px', borderRadius: 3,
          }}>
            r/{post.subreddit}
          </span>
          <span style={{ fontSize: '0.63rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            il y a {timeLabel}
          </span>
        </div>
      </div>
    </article>
  )
}

// ── Page ──────────────────────────────────────────────────────

export default async function SocialTrendsPage() {
  const bySubreddit = await fetchAllSubreddits(15)
  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const totalPosts = Object.values(bySubreddit).reduce((n, posts) => n + posts.length, 0)

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="page-header">
        <h1 className="page-title">📊 Social Trends</h1>
        <p className="page-description">
          Reddit Top Posts · r/worldnews · r/europe · r/science · r/technology · r/geopolitics
        </p>
        <div className="page-sources">
          {SUBREDDITS.map((s) => (
            <span key={s.id} className="source-badge" style={{ color: SUB_COLORS[s.id] }}>
              {s.emoji} r/{s.id}
            </span>
          ))}
        </div>
      </div>

      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1.5rem' }}>
        Mise à jour : {time} · {totalPosts} posts · RSS serveur (pas de clé Reddit) · ISR 5 min
      </p>

      {/* ── Posts par subreddit ── */}
      {SUBREDDITS.map((sub) => {
        const posts: RedditPost[] = bySubreddit[sub.id] ?? []
        if (!posts.length) return null
        const color = SUB_COLORS[sub.id]
        return (
          <section key={sub.id} style={{ marginBottom: '2rem' }}>
            <SectionTitle>
              <span style={{ color }}>{sub.emoji} r/{sub.id}</span>
              {' — '}
              {sub.label} ({posts.length} posts)
            </SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {posts.map((p, i) => <PostCard key={p.id} post={p} rank={i + 1} />)}
            </div>
          </section>
        )
      })}

    </div>
  )
}
