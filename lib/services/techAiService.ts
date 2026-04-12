// ============================================================
// lib/services/techAiService.ts
// Flux Tech + IA + Cyber + Recherche ArXiv
// Sources : TechCrunch · Ars Technica · Wired · Guardian Tech
//           OpenAI · DeepMind · Microsoft AI · BAIR
//           BleepingComputer · CISA · ArXiv cs.AI / cs.LG
// ============================================================

import { fetchRssFeed, mergeAndDeduplicate, type RssItem } from './rssService'

export type NewsArticle = RssItem

// ── Définition des flux ───────────────────────────────────────

const FEEDS = [
  // ── Tech générale ──
  { url: 'https://techcrunch.com/feed/',                                    source: 'TechCrunch',       badge: 'TECH' },
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/',   source: 'TechCrunch AI',    badge: 'AI'   },
  { url: 'https://feeds.arstechnica.com/arstechnica/index',                 source: 'Ars Technica',     badge: 'TECH' },
  { url: 'https://www.wired.com/feed/rss',                                  source: 'Wired',            badge: 'TECH' },
  { url: 'https://www.theguardian.com/technology/rss',                      source: 'Guardian Tech',    badge: 'TECH' },
  // ── IA Labs ──
  { url: 'https://openai.com/blog/rss.xml',                                 source: 'OpenAI',           badge: 'AI'   },
  { url: 'https://www.deepmind.com/blog/rss.xml',                           source: 'DeepMind',         badge: 'AI'   },
  { url: 'https://blogs.microsoft.com/ai/feed/',                            source: 'Microsoft AI',     badge: 'AI'   },
  { url: 'https://bair.berkeley.edu/blog/feed.xml',                         source: 'BAIR',             badge: 'AI'   },
  // ── Cybersécurité ──
  { url: 'https://www.bleepingcomputer.com/feed/',                          source: 'BleepingComputer', badge: 'CYBER'},
  { url: 'https://www.cisa.gov/news.xml',                                   source: 'CISA',             badge: 'CYBER'},
  // ── Recherche ArXiv (Atom) ──
  { url: 'https://rss.arxiv.org/rss/cs.AI',                                 source: 'ArXiv cs.AI',      badge: 'PAPER'},
  { url: 'https://rss.arxiv.org/rss/cs.LG',                                 source: 'ArXiv cs.LG',      badge: 'PAPER'},
] as const

export const ALL_SOURCES = FEEDS.map((f) => f.source)

export const BADGE_COLORS: Record<string, string> = {
  TECH:  '#3b82f6',
  AI:    '#8b5cf6',
  CYBER: '#ef4444',
  PAPER: '#f59e0b',
}

// ── Fetch principal ───────────────────────────────────────────

export async function fetchTechAiNews(limit = 60): Promise<NewsArticle[]> {
  const results = await Promise.allSettled(
    FEEDS.map((f) => fetchRssFeed(f.url, f.source, f.badge, 12))
  )
  const articles = results
    .filter((r): r is PromiseFulfilledResult<RssItem[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)

  return mergeAndDeduplicate(articles, limit)
}
