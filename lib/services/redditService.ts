// ============================================================
// lib/services/redditService.ts
// Reddit RSS — server-side (évite le CORS navigateur)
// Portage exact de services/redditService.js
// ============================================================

import { fetchRssFeed, mergeAndDeduplicate, type RssItem } from './rssService'

export type SubredditDef = { id: string; label: string; url: string; emoji: string }

// Même liste que l'ancien service + 2 supplémentaires
export const SUBREDDITS: SubredditDef[] = [
  { id: 'worldnews',   label: 'World News',   url: 'https://www.reddit.com/r/worldnews/.rss',   emoji: '🌍' },
  { id: 'europe',      label: 'Europe',        url: 'https://www.reddit.com/r/europe/.rss',      emoji: '🇪🇺' },
  { id: 'science',     label: 'Science',       url: 'https://www.reddit.com/r/science/.rss',     emoji: '🔬' },
  { id: 'technology',  label: 'Technology',    url: 'https://www.reddit.com/r/technology/.rss',  emoji: '💻' },
  { id: 'geopolitics', label: 'Geopolitics',   url: 'https://www.reddit.com/r/geopolitics/.rss', emoji: '🗺️' },
]

export type RedditPost = RssItem & { subreddit: string; subredditLabel: string }

function cleanTitle(title: string): string {
  // Supprime le préfixe Reddit natif "/r/sub on Reddit: "
  return title.replace(/^\/r\/\w+\s+on\s+Reddit:\s*/i, '').trim()
}

async function fetchSubreddit(sub: SubredditDef, limit = 15): Promise<RedditPost[]> {
  const items = await fetchRssFeed(sub.url, `r/${sub.id}`, sub.id.toUpperCase(), limit)
  return items.map((a) => ({
    ...a,
    title: cleanTitle(a.title),
    subreddit: sub.id,
    subredditLabel: sub.label,
    badge: sub.id.toUpperCase(),
  }))
}

export async function fetchAllSubreddits(limitPerSub = 15): Promise<Record<string, RedditPost[]>> {
  const results = await Promise.allSettled(
    SUBREDDITS.map((s) => fetchSubreddit(s, limitPerSub))
  )
  const out: Record<string, RedditPost[]> = {}
  SUBREDDITS.forEach((s, i) => {
    out[s.id] = results[i].status === 'fulfilled'
      ? (results[i] as PromiseFulfilledResult<RedditPost[]>).value
      : []
  })
  return out
}

export async function fetchRedditMulti(limit = 30): Promise<RedditPost[]> {
  const results = await Promise.allSettled(
    SUBREDDITS.map((s) => fetchSubreddit(s, 10))
  )
  const posts = results
    .filter((r): r is PromiseFulfilledResult<RedditPost[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
  return mergeAndDeduplicate(posts, limit) as RedditPost[]
}
