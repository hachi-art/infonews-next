// ============================================================
// lib/services/societyService.ts
// Droits humains, environnement, ONG, santé mondiale
// Sources portées depuis services/societyRssService.js :
//   Amnesty · HRW · UNHCR · Greenpeace · UNEP · WHO
//   ONU · UNICEF · MSF · World Bank Blog
// ============================================================

import { fetchRssFeed, mergeAndDeduplicate, type RssItem } from './rssService'

export type SocietyArticle = RssItem & { category: string }

// ── Définition des flux (même URLs que societyRssService.js) ──

const FEEDS = [
  // Droits humains
  { url: 'https://www.amnesty.org/en/latest/news/feed/',                           source: 'Amnesty International', badge: 'DROITS', category: 'rights'      },
  { url: 'https://www.hrw.org/news/rss',                                           source: 'Human Rights Watch',    badge: 'DROITS', category: 'rights'      },
  { url: 'https://news.un.org/feed/subscribe/en/news/topic/refugees/rss.xml',      source: 'UNHCR / ONU',           badge: 'DROITS', category: 'rights'      },
  // Environnement
  { url: 'https://www.greenpeace.org/international/feed/',                          source: 'Greenpeace',            badge: 'ENV',    category: 'environment' },
  { url: 'https://www.unep.org/news-and-stories/news/rss.xml',                     source: 'UNEP',                  badge: 'ENV',    category: 'environment' },
  // Santé
  { url: 'https://www.who.int/rss-feeds/news-english.xml',                         source: 'WHO',                   badge: 'SANTÉ',  category: 'health'      },
  // Organisations internationales
  { url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml',                 source: 'Nations Unies',         badge: 'ONU',    category: 'orgs'        },
  { url: 'https://www.unicef.org/press-releases/rss',                              source: 'UNICEF',                badge: 'ONU',    category: 'orgs'        },
  { url: 'https://www.msf.fr/rss/actualites',                                      source: 'MSF',                   badge: 'ONG',    category: 'orgs'        },
  { url: 'https://blogs.worldbank.org/en/rss.xml',                                 source: 'World Bank Blog',       badge: 'WB',     category: 'orgs'        },
] as const

export const BADGE_COLORS: Record<string, string> = {
  DROITS: '#ef4444',
  ENV:    '#22c55e',
  SANTÉ:  '#3b82f6',
  ONU:    '#3b82f6',
  ONG:    '#f59e0b',
  WB:     '#8b5cf6',
}

export const ALL_SOURCES = FEEDS.map((f) => f.source)

export const CATEGORY_LABELS: Record<string, string> = {
  rights:      '⚖️ Droits Humains',
  environment: '🌿 Environnement',
  health:      '🏥 Santé Mondiale',
  orgs:        '🌐 Organisations Internationales',
}

// ── Fetch par catégorie ───────────────────────────────────────

async function fetchCategory(category: string, limit = 12): Promise<SocietyArticle[]> {
  const feeds = FEEDS.filter((f) => f.category === category)
  const results = await Promise.allSettled(
    feeds.map((f) =>
      fetchRssFeed(f.url, f.source, f.badge, limit).then((items) =>
        items.map((a) => ({ ...a, category }))
      )
    )
  )
  const articles = results
    .filter((r): r is PromiseFulfilledResult<SocietyArticle[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
  return mergeAndDeduplicate(articles, limit * feeds.length) as SocietyArticle[]
}

// ── Fetch global (toutes catégories) ─────────────────────────

export async function fetchAllSocietyNews(limitPerCat = 12) {
  const cats = ['rights', 'environment', 'health', 'orgs'] as const
  const results = await Promise.allSettled(cats.map((c) => fetchCategory(c, limitPerCat)))
  return {
    rights:      results[0].status === 'fulfilled' ? results[0].value : [],
    environment: results[1].status === 'fulfilled' ? results[1].value : [],
    health:      results[2].status === 'fulfilled' ? results[2].value : [],
    orgs:        results[3].status === 'fulfilled' ? results[3].value : [],
    fetchedAt:   new Date().toISOString(),
  }
}
