// ============================================================
// lib/services/streamingService.ts
// Sorties streaming & cinéma via RSS public (sans clé)
// Sources : Variety · Hollywood Reporter · AlloCiné RSS
// TMDB : activé automatiquement si TMDB_API_KEY est défini
// ============================================================

import { fetchRssFeed, mergeAndDeduplicate, type RssItem } from './rssService'

export type StreamingArticle = RssItem

// ── Flux RSS gratuits ─────────────────────────────────────────

const RSS_FEEDS = [
  { url: 'https://variety.com/feed/',               source: 'Variety',            badge: 'VARIETY' },
  { url: 'https://www.hollywoodreporter.com/feed/', source: 'Hollywood Reporter', badge: 'THR'     },
  { url: 'https://www.allocine.fr/rss/actu_cine.rss', source: 'AlloCiné',         badge: 'CINÉ'    },
] as const

export async function fetchStreamingNews(limit = 40): Promise<StreamingArticle[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map((f) => fetchRssFeed(f.url, f.source, f.badge, 15))
  )
  const articles = results
    .filter((r): r is PromiseFulfilledResult<RssItem[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
  return mergeAndDeduplicate(articles, limit)
}

// ── TMDB (optionnel — clé env) ────────────────────────────────

export type TmdbMovie = {
  id: number
  title: string
  overview: string
  poster: string | null
  rating: string
  releaseDate: string
  url: string
  type: 'movie' | 'tv'
}

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMG  = 'https://image.tmdb.org/t/p/w500'

export async function fetchTmdbTrending(lang = 'fr-FR', limit = 12): Promise<TmdbMovie[]> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) return []

  try {
    const [moviesRes, tvRes] = await Promise.allSettled([
      fetch(`${TMDB_BASE}/trending/movie/week?api_key=${apiKey}&language=${lang}`, {
        signal: AbortSignal.timeout(8_000),
      }),
      fetch(`${TMDB_BASE}/trending/tv/week?api_key=${apiKey}&language=${lang}`, {
        signal: AbortSignal.timeout(8_000),
      }),
    ])

    const movies: TmdbMovie[] = []
    if (moviesRes.status === 'fulfilled' && moviesRes.value.ok) {
      const d = await moviesRes.value.json() as any // eslint-disable-line @typescript-eslint/no-explicit-any
      ;(d?.results ?? []).slice(0, limit).forEach((m: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        movies.push({
          id:          m.id,
          title:       m.title,
          overview:    (m.overview ?? '').slice(0, 200),
          poster:      m.poster_path ? `${TMDB_IMG}${m.poster_path}` : null,
          rating:      m.vote_average?.toFixed(1) ?? '–',
          releaseDate: m.release_date ?? '',
          url:         `https://www.themoviedb.org/movie/${m.id}`,
          type:        'movie',
        })
      })
    }
    if (tvRes.status === 'fulfilled' && tvRes.value.ok) {
      const d = await tvRes.value.json() as any // eslint-disable-line @typescript-eslint/no-explicit-any
      ;(d?.results ?? []).slice(0, limit).forEach((s: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        movies.push({
          id:          s.id,
          title:       s.name ?? s.original_name,
          overview:    (s.overview ?? '').slice(0, 200),
          poster:      s.poster_path ? `${TMDB_IMG}${s.poster_path}` : null,
          rating:      s.vote_average?.toFixed(1) ?? '–',
          releaseDate: s.first_air_date ?? '',
          url:         `https://www.themoviedb.org/tv/${s.id}`,
          type:        'tv',
        })
      })
    }
    return movies
  } catch (e) {
    console.warn('[TMDB]', e instanceof Error ? e.message : e)
    return []
  }
}

export const STREAMING_PLATFORMS = [
  { name: 'Netflix',       color: '#e50914', icon: '🎬' },
  { name: 'Disney+',       color: '#113ccf', icon: '✨' },
  { name: 'HBO Max',       color: '#5822b4', icon: '👑' },
  { name: 'Amazon Prime',  color: '#00a8e0', icon: '📦' },
  { name: 'Apple TV+',     color: '#555555', icon: '🍎' },
  { name: 'Canal+',        color: '#003078', icon: '🎭' },
]
