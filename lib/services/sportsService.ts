// ============================================================
// lib/services/sportsService.ts
// Matchs : TheSportsDB (gratuit, clé "3" = accès public)
// Classements : football-data.org (FOOTBALL_DATA_KEY optionnel)
// News : BBC Sport RSS + ESPN RSS
// Portage exact de routes/sport.js + services associés
// ============================================================

import { fetchRssFeed, mergeAndDeduplicate, type RssItem } from './rssService'

// ── Types ─────────────────────────────────────────────────────

export type Match = {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: string | null
  awayScore: string | null
  date: string
  time: string | null
  league: string
  season: string | null
  stadium: string | null
  url: string
  status: 'finished' | 'upcoming' | 'live'
}

export type League = {
  leagueId: number
  name: string
  country: string
  recent: Match[]
  upcoming: Match[]
}

export type Standing = {
  position: number
  team: string
  crest: string | null
  played: number
  won: number
  draw: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export type SportArticle = RssItem

// ── TheSportsDB ───────────────────────────────────────────────

const TSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/3'

// Même liste de ligues que theSportsDbService.js
export const LEAGUES: Array<{ id: number; name: string; country: string }> = [
  { id: 4328, name: 'Premier League',   country: '🇬🇧' },
  { id: 4335, name: 'La Liga',          country: '🇪🇸' },
  { id: 4331, name: 'Bundesliga',       country: '🇩🇪' },
  { id: 4332, name: 'Serie A',          country: '🇮🇹' },
  { id: 4334, name: 'Ligue 1',          country: '🇫🇷' },
  { id: 4480, name: 'Champions League', country: '🌍' },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeEvent(e: any, status: Match['status']): Match {
  return {
    id:        String(e.idEvent),
    homeTeam:  e.strHomeTeam ?? '?',
    awayTeam:  e.strAwayTeam ?? '?',
    homeScore: e.intHomeScore ?? null,
    awayScore: e.intAwayScore ?? null,
    date:      e.dateEvent ?? '',
    time:      e.strTime ?? null,
    league:    e.strLeague ?? '',
    season:    e.strSeason ?? null,
    stadium:   e.strVenue ?? null,
    url:       `https://www.thesportsdb.com/event/${e.idEvent}`,
    status,
  }
}

async function fetchRecentMatches(leagueId: number, limit = 5): Promise<Match[]> {
  try {
    const res = await fetch(`${TSDB_BASE}/eventspastleague.php?id=${leagueId}`, {
      signal: AbortSignal.timeout(8_000),
      headers: { 'User-Agent': 'infonews.day/10.0' },
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json() as any // eslint-disable-line @typescript-eslint/no-explicit-any
    const events = json?.events ?? []
    return events.slice(-limit).reverse().map((e: any) => normalizeEvent(e, 'finished')) // eslint-disable-line @typescript-eslint/no-explicit-any
  } catch (e) {
    console.warn(`[TheSportsDB recent ${leagueId}]`, e instanceof Error ? e.message : e)
    return []
  }
}

async function fetchUpcomingMatches(leagueId: number, limit = 5): Promise<Match[]> {
  try {
    const res = await fetch(`${TSDB_BASE}/eventsnextleague.php?id=${leagueId}`, {
      signal: AbortSignal.timeout(8_000),
      headers: { 'User-Agent': 'infonews.day/10.0' },
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json() as any // eslint-disable-line @typescript-eslint/no-explicit-any
    const events = json?.events ?? []
    return events.slice(0, limit).map((e: any) => normalizeEvent(e, 'upcoming')) // eslint-disable-line @typescript-eslint/no-explicit-any
  } catch (e) {
    console.warn(`[TheSportsDB upcoming ${leagueId}]`, e instanceof Error ? e.message : e)
    return []
  }
}

export async function fetchAllLeagues(matchesPerLeague = 3): Promise<League[]> {
  const results = await Promise.allSettled(
    LEAGUES.map(async (l) => {
      const [recentR, upcomingR] = await Promise.allSettled([
        fetchRecentMatches(l.id, matchesPerLeague),
        fetchUpcomingMatches(l.id, matchesPerLeague),
      ])
      return {
        leagueId: l.id,
        name:     l.name,
        country:  l.country,
        recent:   recentR.status   === 'fulfilled' ? recentR.value   : [],
        upcoming: upcomingR.status === 'fulfilled' ? upcomingR.value : [],
      }
    })
  )
  return results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => (r as PromiseFulfilledResult<League>).value)
}

// ── Football-Data.org (optionnel — clé env) ───────────────────

export const COMPETITIONS = [
  { code: 'PL',  name: 'Premier League',   flag: '🇬🇧' },
  { code: 'PD',  name: 'La Liga',          flag: '🇪🇸' },
  { code: 'BL1', name: 'Bundesliga',       flag: '🇩🇪' },
  { code: 'SA',  name: 'Serie A',          flag: '🇮🇹' },
  { code: 'FL1', name: 'Ligue 1',          flag: '🇫🇷' },
  { code: 'CL',  name: 'Champions League', flag: '🌍' },
]

export async function fetchStandings(competitionCode: string): Promise<{ source: string; competition: string; standings: Standing[] }> {
  const apiKey = process.env.FOOTBALL_DATA_KEY
  if (!apiKey) return { source: 'N/A (FOOTBALL_DATA_KEY manquante)', competition: competitionCode, standings: [] }
  try {
    const res = await fetch(`https://api.football-data.org/v4/competitions/${competitionCode}/standings`, {
      signal: AbortSignal.timeout(8_000),
      headers: { 'X-Auth-Token': apiKey },
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json() as any // eslint-disable-line @typescript-eslint/no-explicit-any
    const table = json?.standings?.[0]?.table ?? []
    return {
      source:      'football-data.org',
      competition: json?.competition?.name ?? competitionCode,
      standings:   table.slice(0, 10).map((t: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        position:     t.position,
        team:         t.team?.name ?? '',
        crest:        t.team?.crest ?? null,
        played:       t.playedGames,
        won:          t.won,
        draw:         t.draw,
        lost:         t.lost,
        goalsFor:     t.goalsFor,
        goalsAgainst: t.goalsAgainst,
        points:       t.points,
      })),
    }
  } catch (e) {
    console.warn('[football-data]', e instanceof Error ? e.message : e)
    return { source: 'error', competition: competitionCode, standings: [] }
  }
}

// ── BBC Sport + ESPN RSS ──────────────────────────────────────

const BBC_SPORT_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml',          source: 'BBC Sport',    badge: 'BBC' },
  { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', source: 'BBC Football', badge: 'BBC' },
  { url: 'https://feeds.bbci.co.uk/sport/formula1/rss.xml', source: 'BBC F1',       badge: 'F1'  },
  { url: 'https://feeds.bbci.co.uk/sport/tennis/rss.xml',   source: 'BBC Tennis',   badge: 'TEN' },
] as const

const ESPN_FEEDS = [
  { url: 'https://www.espn.com/espn/rss/news',        source: 'ESPN',         badge: 'ESPN' },
  { url: 'https://www.espn.com/espn/rss/soccer/news', source: 'ESPN Soccer',  badge: 'ESPN' },
  { url: 'https://www.espn.com/espn/rss/nba/news',    source: 'ESPN NBA',     badge: 'NBA'  },
] as const

export async function fetchSportNews(limit = 40): Promise<SportArticle[]> {
  const allFeeds = [...BBC_SPORT_FEEDS, ...ESPN_FEEDS]
  const results = await Promise.allSettled(
    allFeeds.map((f) => fetchRssFeed(f.url, f.source, f.badge, 10))
  )
  const articles = results
    .filter((r): r is PromiseFulfilledResult<RssItem[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
  return mergeAndDeduplicate(articles, limit)
}
