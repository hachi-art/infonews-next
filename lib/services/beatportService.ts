// ============================================================
// lib/services/beatportService.ts
// Beatport Top 100 RSS par genre (gratuit, sans clé)
// Billboard · Pitchfork · NME · Loudwire (news musicale)
// ============================================================

import { fetchRssFeed, mergeAndDeduplicate, type RssItem } from './rssService'

// ── Types ─────────────────────────────────────────────────────

export type BeatportTrack = {
  id: string
  title: string
  genre: string
  url: string
  imageUrl: string | null
  publishedAt: string
}

export type MusicNewsArticle = RssItem

// ── Beatport RSS ──────────────────────────────────────────────

const BEATPORT_FEEDS = [
  { url: 'https://www.beatport.com/genre/techno-(peak-time-driving)/6/top-100?format=rss',  genre: 'Techno' },
  { url: 'https://www.beatport.com/genre/house/5/top-100?format=rss',                        genre: 'House' },
  { url: 'https://www.beatport.com/genre/deep-house/12/top-100?format=rss',                  genre: 'Deep House' },
  { url: 'https://www.beatport.com/genre/melodic-house-techno/90/top-100?format=rss',        genre: 'Melodic House & Techno' },
  { url: 'https://www.beatport.com/genre/drum-bass/1/top-100?format=rss',                    genre: 'Drum & Bass' },
  { url: 'https://www.beatport.com/genre/afro-house/89/top-100?format=rss',                  genre: 'Afro House' },
] as const

export const ALL_GENRES = BEATPORT_FEEDS.map((f) => f.genre)

async function fetchGenre(
  url: string,
  genre: string,
  limit: number,
): Promise<BeatportTrack[]> {
  const items = await fetchRssFeed(url, `Beatport ${genre}`, genre, limit)
  return items.map((i) => ({
    id:          i.id,
    title:       i.title,
    genre,
    url:         i.url,
    imageUrl:    i.imageUrl,
    publishedAt: i.publishedAt,
  }))
}

export async function fetchAllBeatportCharts(limitPerGenre = 10): Promise<BeatportTrack[]> {
  const results = await Promise.allSettled(
    BEATPORT_FEEDS.map((f) => fetchGenre(f.url, f.genre, limitPerGenre))
  )
  return results
    .filter((r): r is PromiseFulfilledResult<BeatportTrack[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
}

export async function fetchBeatportByGenres(
  genres: string[],
  limitPerGenre = 10,
): Promise<BeatportTrack[]> {
  const feeds = BEATPORT_FEEDS.filter((f) => genres.includes(f.genre))
  const results = await Promise.allSettled(
    feeds.map((f) => fetchGenre(f.url, f.genre, limitPerGenre))
  )
  return results
    .filter((r): r is PromiseFulfilledResult<BeatportTrack[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
}

// ── Music News (Billboard · Pitchfork · NME · Loudwire) ──────

const MUSIC_NEWS_FEEDS = [
  { url: 'https://www.billboard.com/feed/',             source: 'Billboard', badge: 'CHARTS' },
  { url: 'https://pitchfork.com/rss/news/feed/r.xml',  source: 'Pitchfork', badge: 'REVIEW' },
  { url: 'https://www.nme.com/feed',                    source: 'NME',       badge: 'NEWS'   },
  { url: 'https://loudwire.com/feed/',                  source: 'Loudwire',  badge: 'ROCK'   },
] as const

export async function fetchMusicNews(limit = 40): Promise<MusicNewsArticle[]> {
  const results = await Promise.allSettled(
    MUSIC_NEWS_FEEDS.map((f) => fetchRssFeed(f.url, f.source, f.badge, 12))
  )
  const articles = results
    .filter((r): r is PromiseFulfilledResult<RssItem[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
  return mergeAndDeduplicate(articles, limit)
}
