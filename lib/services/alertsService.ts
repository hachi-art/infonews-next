// ============================================================
// lib/services/alertsService.ts
// Alertes mondiales : séismes USGS + catastrophes GDACS
// Sources :
//   USGS GeoJSON — https://earthquake.usgs.gov/
//   GDACS RSS    — https://www.gdacs.org/xml/rss.xml
// ============================================================

import { fetchRssFeed, getTag, getAttr } from './rssService'

// ── Types ─────────────────────────────────────────────────────

export type EarthquakeSeverity = 'low' | 'medium' | 'high' | 'critical'

export type EarthquakeAlert = {
  id: string
  magnitude: number
  place: string
  time: string
  url: string | null
  depth: number | null
  lat: number | null
  lon: number | null
  severity: EarthquakeSeverity
}

export type DisasterSeverity = 'low' | 'medium' | 'critical'

export type DisasterAlert = {
  id: string
  title: string
  type: string
  severity: DisasterSeverity
  alertLevel: string
  place: string
  url: string
  publishedAt: string
  lat: number | null
  lon: number | null
  source: 'GDACS'
}

// ── USGS Séismes ──────────────────────────────────────────────

const USGS_FEEDS = [
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson',
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson',
]

function magSeverity(mag: number): EarthquakeSeverity {
  if (mag >= 7) return 'critical'
  if (mag >= 6) return 'high'
  if (mag >= 5) return 'medium'
  return 'low'
}

export async function fetchEarthquakes(limit = 10): Promise<EarthquakeAlert[]> {
  for (const feedUrl of USGS_FEEDS) {
    try {
      const res = await fetch(feedUrl, {
        signal: AbortSignal.timeout(8_000),
        headers: { 'User-Agent': 'infonews.day/10.0' },
      })
      if (!res.ok) continue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const json = await res.json() as any
      const features = json?.features || []
      if (!features.length) continue

      return features.slice(0, limit).map((f: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const p = f.properties
        const coords = f.geometry?.coordinates || []
        const mag = parseFloat((p.mag || 0).toFixed(1))
        return {
          id:        f.id,
          magnitude: mag,
          place:     p.place || 'Lieu inconnu',
          time:      new Date(p.time).toISOString(),
          url:       p.url || null,
          depth:     coords[2] != null ? Math.round(coords[2]) : null,
          lat:       coords[1] ?? null,
          lon:       coords[0] ?? null,
          severity:  magSeverity(mag),
        }
      }).sort((a: EarthquakeAlert, b: EarthquakeAlert) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
      )
    } catch (e) {
      console.warn('[USGS]', e instanceof Error ? e.message : e)
    }
  }
  return []
}

// ── GDACS Catastrophes ────────────────────────────────────────

const SEVERITY_MAP: Record<string, DisasterSeverity> = {
  Green:  'low',
  Orange: 'medium',
  Red:    'critical',
}

export async function fetchGDACS(limit = 15): Promise<DisasterAlert[]> {
  try {
    const res = await fetch('https://www.gdacs.org/xml/rss.xml', {
      signal: AbortSignal.timeout(10_000),
      headers: {
        'User-Agent': 'infonews.day/10.0',
        'Accept': 'application/rss+xml, application/xml, */*',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()

    // Découpe manuelle des <item> (rssService.splitBlocks est local)
    const blocks: string[] = []
    const openRe = /<item(?:\s[^>]*)?>/gi
    let match: RegExpExecArray | null
    while ((match = openRe.exec(xml)) !== null) {
      const start = match.index + match[0].length
      const end = xml.indexOf('</item>', start)
      if (end >= 0) blocks.push(xml.slice(start, end))
    }

    return blocks.slice(0, limit).map((block) => {
      const title = getTag(block, 'title') || 'Alerte inconnue'
      const type = title.match(/^([A-Z]+)/)?.[1] || 'ALERT'
      const alertLevel = getTag(block, 'gdacs:alertlevel') || 'Green'
      const georss = getTag(block, 'georss:point')
      const parts = georss.split(' ')
      return {
        id:          getTag(block, 'guid') || getTag(block, 'link'),
        title,
        type,
        severity:    SEVERITY_MAP[alertLevel] ?? 'low',
        alertLevel,
        place:       getTag(block, 'gdacs:country') || getTag(block, 'description') || '',
        url:         getTag(block, 'link'),
        publishedAt: (() => { try { return new Date(getTag(block, 'pubDate')).toISOString() } catch { return new Date().toISOString() } })(),
        lat:         parts[0] ? parseFloat(parts[0]) : null,
        lon:         parts[1] ? parseFloat(parts[1]) : null,
        source:      'GDACS' as const,
      }
    })
  } catch (e) {
    console.warn('[GDACS]', e instanceof Error ? e.message : e)
    return []
  }
}

// ── Combiné ───────────────────────────────────────────────────

export async function fetchAllAlerts(limit = 10) {
  const [earthquakesR, gdacsR] = await Promise.allSettled([
    fetchEarthquakes(limit),
    fetchGDACS(limit),
  ])
  return {
    earthquakes: earthquakesR.status === 'fulfilled' ? earthquakesR.value : [],
    disasters:   gdacsR.status === 'fulfilled'       ? gdacsR.value       : [],
    fetchedAt:   new Date().toISOString(),
  }
}
