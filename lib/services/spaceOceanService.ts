// ============================================================
// lib/services/spaceOceanService.ts
// Space : NASA APOD + Launch Library 2 + ArXiv astrophysique
// Ocean : NOAA NDBC bouées (données texte temps réel)
// Alertes Env : GDACS + USGS (ré-exportés depuis alertsService)
// ============================================================

import { fetchRssFeed, getTag, type RssItem } from './rssService'

// ── Types ─────────────────────────────────────────────────────

export type ApodData = {
  date: string
  title: string
  explanation: string
  url: string
  hdurl: string | null
  mediaType: 'image' | 'video'
  copyright: string | null
}

export type Launch = {
  id: string
  name: string
  status: string
  net: string | null
  rocket: string
  provider: string
  location: string
  missionName: string
  missionType: string
  imageUrl: string | null
  url: string
  upcoming: boolean
}

export type BuoyReading = {
  id: string
  name: string
  ocean: string
  lat: number
  lon: number
  waveHeight: string | null
  windSpeed: string | null
  waterTemp: string | null
  airTemp: string | null
  pressure: string | null
  updatedAt: string
}

export const OCEAN_STATS = {
  coverage:   '70,9%',
  volume:     '1,335 milliard km³',
  avgDepth:   '3 688 m',
  deepest:    'Fosse des Mariannes — 11 034 m',
  avgTemp:    '17°C',
  acidLevel:  'pH 8,1 (acidification +0,1 depuis 1850)',
  plasticTons:'8 Mt/an',
  species:    '230 000+ espèces connues',
}

// ── NASA APOD ─────────────────────────────────────────────────

export async function fetchAPOD(): Promise<ApodData | null> {
  const apiKey = process.env.NASA_API_KEY ?? 'DEMO_KEY'
  try {
    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`, {
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 3600 }, // APOD change une fois par jour
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = await res.json() as any
    return {
      date:        d.date,
      title:       d.title,
      explanation: d.explanation,
      url:         d.url,
      hdurl:       d.hdurl ?? null,
      mediaType:   d.media_type === 'video' ? 'video' : 'image',
      copyright:   d.copyright?.trim() ?? null,
    }
  } catch (e) {
    console.warn('[APOD]', e instanceof Error ? e.message : e)
    return null
  }
}

// ── Launch Library 2 ─────────────────────────────────────────

function normalizeLaunch(l: any, upcoming: boolean): Launch { // eslint-disable-line @typescript-eslint/no-explicit-any
  return {
    id:          l.id,
    name:        l.name,
    status:      l.status?.name ?? 'À confirmer',
    net:         l.net ?? null,
    rocket:      l.rocket?.configuration?.name ?? 'Inconnue',
    provider:    l.launch_service_provider?.name ?? '',
    location:    l.pad?.location?.name ?? '',
    missionName: l.mission?.name ?? l.name,
    missionType: l.mission?.type ?? '',
    imageUrl:    l.image ?? null,
    url:         l.url ?? '',
    upcoming,
  }
}

export async function fetchUpcomingLaunches(limit = 6): Promise<Launch[]> {
  try {
    const res = await fetch(
      `https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=${limit}&format=json&mode=list`,
      { signal: AbortSignal.timeout(12_000), headers: { 'User-Agent': 'infonews.day/10.0' } }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json() as any // eslint-disable-line @typescript-eslint/no-explicit-any
    return (json?.results ?? []).map((l: any) => normalizeLaunch(l, true)) // eslint-disable-line @typescript-eslint/no-explicit-any
  } catch (e) {
    console.warn('[LaunchLibrary upcoming]', e instanceof Error ? e.message : e)
    return []
  }
}

export async function fetchPreviousLaunches(limit = 4): Promise<Launch[]> {
  try {
    const res = await fetch(
      `https://ll.thespacedevs.com/2.2.0/launch/previous/?limit=${limit}&format=json&mode=list&ordering=-net`,
      { signal: AbortSignal.timeout(12_000), headers: { 'User-Agent': 'infonews.day/10.0' } }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json() as any // eslint-disable-line @typescript-eslint/no-explicit-any
    return (json?.results ?? []).map((l: any) => normalizeLaunch(l, false)) // eslint-disable-line @typescript-eslint/no-explicit-any
  } catch (e) {
    console.warn('[LaunchLibrary previous]', e instanceof Error ? e.message : e)
    return []
  }
}

// ── ArXiv Astrophysique ───────────────────────────────────────

export async function fetchArxivSpace(limit = 8): Promise<RssItem[]> {
  return fetchRssFeed('https://rss.arxiv.org/rss/astro-ph', 'ArXiv Astrophysique', 'PAPER', limit)
}

// ── NOAA NDBC Bouées ─────────────────────────────────────────

type BuoyDef = { id: string; name: string; ocean: string; lat: number; lon: number }

const BUOYS: BuoyDef[] = [
  { id: '41048', name: 'Atlantic NE',   lat: 31.8,  lon: -69.6,  ocean: 'Atlantique Nord' },
  { id: '46059', name: 'Pacific NW',    lat: 37.9,  lon: -129.9, ocean: 'Pacifique Nord'  },
  { id: '41049', name: 'Atlantic SE',   lat: 27.5,  lon: -62.9,  ocean: 'Atlantique'      },
  { id: '21004', name: 'Pacific West',  lat: 28.0,  lon: 135.0,  ocean: 'Pacifique Ouest' },
]

async function fetchBuoy(b: BuoyDef): Promise<BuoyReading | null> {
  try {
    const res = await fetch(
      `https://www.ndbc.noaa.gov/data/realtime2/${b.id}.txt`,
      { signal: AbortSignal.timeout(8_000), headers: { 'User-Agent': 'infonews.day/10.0' } }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    const lines = text.split('\n')
    const header = lines[0].split(/\s+/)
    const data   = lines[2]?.split(/\s+/) || []
    const v = (name: string) => {
      const i = header.indexOf(name)
      return i >= 0 && data[i] && data[i] !== 'MM' ? data[i] : null
    }
    return {
      id:        b.id,
      name:      b.name,
      ocean:     b.ocean,
      lat:       b.lat,
      lon:       b.lon,
      waveHeight: v('WVHT') ? `${v('WVHT')} m`   : null,
      windSpeed:  v('WSPD') ? `${v('WSPD')} m/s` : null,
      waterTemp:  v('WTMP') ? `${v('WTMP')} °C`  : null,
      airTemp:    v('ATMP') ? `${v('ATMP')} °C`  : null,
      pressure:   v('PRES') ? `${v('PRES')} hPa` : null,
      updatedAt:  new Date().toISOString(),
    }
  } catch (e) {
    console.warn(`[NOAA buoy ${b.id}]`, e instanceof Error ? e.message : e)
    return null
  }
}

export async function fetchAllBuoys(): Promise<BuoyReading[]> {
  const results = await Promise.allSettled(BUOYS.map(fetchBuoy))
  return results
    .filter((r): r is PromiseFulfilledResult<BuoyReading | null> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((v): v is BuoyReading => v !== null)
}

// ── Fetch complet page Space & Ocean ─────────────────────────

export async function fetchSpaceOceanPage() {
  const [apod, upcoming, previous, arxiv, buoys] = await Promise.allSettled([
    fetchAPOD(),
    fetchUpcomingLaunches(6),
    fetchPreviousLaunches(4),
    fetchArxivSpace(8),
    fetchAllBuoys(),
  ])
  return {
    apod:     apod.status     === 'fulfilled' ? apod.value     : null,
    upcoming: upcoming.status === 'fulfilled' ? upcoming.value : [],
    previous: previous.status === 'fulfilled' ? previous.value : [],
    arxiv:    arxiv.status    === 'fulfilled' ? arxiv.value    : [],
    buoys:    buoys.status    === 'fulfilled' ? buoys.value    : [],
    fetchedAt: new Date().toISOString(),
  }
}
