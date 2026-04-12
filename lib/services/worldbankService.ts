// ============================================================
// lib/services/worldbankService.ts
// World Bank Open Data API (gratuit, sans clé)
// + Flux RSS institutions financières : FED, BCE, FMI, OCDE, WB Blog
// Docs : https://datahelpdesk.worldbank.org/knowledgebase/articles/898581
// ============================================================

import { fetchRssFeed, mergeAndDeduplicate, type RssItem } from './rssService'

const WB_BASE = 'https://api.worldbank.org/v2'

// ── Types ─────────────────────────────────────────────────────

export type IndicatorKey = 'gdp' | 'pop' | 'poverty' | 'co2' | 'life' | 'literacy' | 'internet' | 'gini'

export type IndicatorRow = {
  country: string
  iso3: string
  value: number
  year: string
  label: string
  unit: string
}

export type WorldBankDashboard = Record<IndicatorKey, IndicatorRow[]>

// ── Définitions indicateurs (même liste que l'ancien JS) ──────

export const INDICATORS: Record<IndicatorKey, { id: string; label: string; unit: string }> = {
  gdp:      { id: 'NY.GDP.MKTP.CD',  label: 'PIB (USD)',             unit: 'USD' },
  pop:      { id: 'SP.POP.TOTL',     label: 'Population',            unit: 'hab' },
  poverty:  { id: 'SI.POV.DDAY',     label: 'Pauvreté extrême (%)',  unit: '%'   },
  co2:      { id: 'EN.ATM.CO2E.PC',  label: 'CO₂ per capita (t)',    unit: 't'   },
  life:     { id: 'SP.DYN.LE00.IN',  label: 'Espérance de vie',      unit: 'ans' },
  literacy: { id: 'SE.ADT.LITR.ZS',  label: 'Alphabétisation (%)',   unit: '%'   },
  internet: { id: 'IT.NET.USER.ZS',  label: 'Internautes (%)',       unit: '%'   },
  gini:     { id: 'SI.POV.GINI',     label: 'Indice Gini',           unit: ''    },
}

// ── World Bank API fetch ───────────────────────────────────────

export async function fetchIndicator(key: IndicatorKey, limit = 15): Promise<IndicatorRow[]> {
  const ind = INDICATORS[key]
  const url = `${WB_BASE}/country/all/indicator/${ind.id}?format=json&per_page=${limit * 3}&mrv=1`
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(14_000),
      headers: { 'User-Agent': 'infonews.day/10.0' },
      next: { revalidate: 86400 }, // données annuelles — cache 24h
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json() as [unknown, unknown[]]
    if (!json?.[1]) return []
    return json[1]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((d: any) => d.value !== null && d.countryiso3code && d.country?.value)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => (b.value || 0) - (a.value || 0))
      .slice(0, limit)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((d: any) => ({
        country: d.country.value,
        iso3:    d.countryiso3code,
        value:   d.value,
        year:    d.date,
        label:   ind.label,
        unit:    ind.unit,
      }))
  } catch (e) {
    console.warn(`[WorldBank ${key}]`, e instanceof Error ? e.message : e)
    return []
  }
}

export async function fetchTopGDP(limit = 15): Promise<IndicatorRow[]> {
  return fetchIndicator('gdp', limit)
}

export async function fetchDashboard(): Promise<WorldBankDashboard> {
  const keys: IndicatorKey[] = ['gdp', 'pop', 'co2', 'life', 'internet']
  const results = await Promise.allSettled(keys.map((k) => fetchIndicator(k, 10)))
  const out = {} as WorldBankDashboard
  keys.forEach((k, i) => {
    out[k] = results[i].status === 'fulfilled' ? (results[i] as PromiseFulfilledResult<IndicatorRow[]>).value : []
  })
  return out
}

// ── Institutions RSS ──────────────────────────────────────────
// Même SOURCE_MAP que routes/society.js + feeds institutions

export type InstitutionFeed = {
  key: string
  label: string
  url: string
  badge: string
  country: string
}

export const INSTITUTION_FEEDS: InstitutionFeed[] = [
  { key: 'fed',   label: 'Federal Reserve',  url: 'https://www.federalreserve.gov/feeds/press_all.xml',    badge: 'FED',  country: '🇺🇸' },
  { key: 'ecb',   label: 'BCE / ECB',        url: 'https://www.ecb.europa.eu/rss/press.html',               badge: 'BCE',  country: '🇪🇺' },
  { key: 'imf',   label: 'FMI / IMF',        url: 'https://www.imf.org/en/News/rss?language=eng',           badge: 'FMI',  country: '🌍' },
  { key: 'oecd',  label: 'OCDE / OECD',      url: 'https://www.oecd.org/newsroom/rss.xml',                  badge: 'OCDE', country: '🌐' },
  { key: 'wb',    label: 'World Bank Blog',  url: 'https://blogs.worldbank.org/en/rss.xml',                 badge: 'WB',   country: '🌍' },
  { key: 'un',    label: 'Nations Unies',    url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml', badge: 'ONU',  country: '🌐' },
]

export type InstitutionArticle = RssItem & { institution: string; country: string }

export async function fetchInstitutionNews(limit = 60): Promise<InstitutionArticle[]> {
  const results = await Promise.allSettled(
    INSTITUTION_FEEDS.map((f) =>
      fetchRssFeed(f.url, f.label, f.badge, 10).then((items) =>
        items.map((a) => ({ ...a, institution: f.label, country: f.country }))
      )
    )
  )
  const articles = results
    .filter((r): r is PromiseFulfilledResult<InstitutionArticle[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
  return mergeAndDeduplicate(articles, limit) as InstitutionArticle[]
}

// ── Indices boursiers globaux (Yahoo Finance) ─────────────────
// Pour stocks-global : Shanghai, Nikkei, Sensex, JSE, BRICS

export type GlobalIndex = {
  symbol: string
  name: string
  region: string
  flag: string
  price: number
  change: number
  changePct: number
  currency: string
  error?: string
}

const GLOBAL_INDICES = [
  { symbol: '000001.SS', name: 'Shanghai Composite', region: 'Chine',       flag: '🇨🇳', currency: 'CNY' },
  { symbol: '^N225',     name: 'Nikkei 225',          region: 'Japon',       flag: '🇯🇵', currency: 'JPY' },
  { symbol: '^BSESN',    name: 'BSE Sensex',          region: 'Inde',        flag: '🇮🇳', currency: 'INR' },
  { symbol: '^JKSE',     name: 'Jakarta Composite',   region: 'Indonésie',   flag: '🇮🇩', currency: 'IDR' },
  { symbol: '^KS11',     name: 'KOSPI',               region: 'Corée Sud',   flag: '🇰🇷', currency: 'KRW' },
  { symbol: '^TWII',     name: 'Taiwan Weighted',     region: 'Taïwan',      flag: '🇹🇼', currency: 'TWD' },
  { symbol: '^HSI',      name: 'Hang Seng',           region: 'Hong Kong',   flag: '🇭🇰', currency: 'HKD' },
  { symbol: 'IMOEX.ME',  name: 'MOEX Russia',         region: 'Russie',      flag: '🇷🇺', currency: 'RUB' },
  { symbol: '^BVSP',     name: 'Bovespa',             region: 'Brésil',      flag: '🇧🇷', currency: 'BRL' },
  { symbol: '^GSPTSE',   name: 'TSX Composite',       region: 'Canada',      flag: '🇨🇦', currency: 'CAD' },
  { symbol: '^AXJO',     name: 'ASX 200',             region: 'Australie',   flag: '🇦🇺', currency: 'AUD' },
  { symbol: '^J203',     name: 'JSE All Share',       region: 'Afrique Sud', flag: '🇿🇦', currency: 'ZAR' },
]

async function fetchOneIndex(s: typeof GLOBAL_INDICES[number]): Promise<GlobalIndex> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s.symbol)}?interval=1d&range=5d`
  const res = await fetch(url, {
    signal: AbortSignal.timeout(8_000),
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'application/json',
    },
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await res.json() as any
  const meta = json?.chart?.result?.[0]?.meta
  if (!meta) throw new Error('no meta')
  const price    = meta.regularMarketPrice ?? 0
  const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price
  const change   = price - prevClose
  const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0
  return {
    symbol:    s.symbol,
    name:      s.name,
    region:    s.region,
    flag:      s.flag,
    price,
    change:    parseFloat(change.toFixed(2)),
    changePct: parseFloat(changePct.toFixed(2)),
    currency:  meta.currency ?? s.currency,
  }
}

export async function fetchGlobalIndices(): Promise<GlobalIndex[]> {
  const results = await Promise.allSettled(GLOBAL_INDICES.map(fetchOneIndex))
  return results.map((r, i) => {
    const s = GLOBAL_INDICES[i]
    if (r.status === 'fulfilled') return r.value
    return { symbol: s.symbol, name: s.name, region: s.region, flag: s.flag, price: 0, change: 0, changePct: 0, currency: s.currency, error: r.reason?.message }
  })
}
