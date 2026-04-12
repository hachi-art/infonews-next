// ============================================================
// lib/services/commoditiesService.ts
// Portage TypeScript du financeService.js (ANCIEN) pour les matières premières.
// Source : Yahoo Finance v8 API — gratuit, sans clé.
// Même pattern que l'ancien financeService.js :
//   const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
//   const meta = res.chart.result[0].meta
//   return { price: meta.regularMarketPrice, change: curr - prev, ... }
// ============================================================

// ── Types ─────────────────────────────────────────────────────

export type CommodityCategory = 'Métaux précieux' | 'Énergie' | 'Matières agricoles'

export type Commodity = {
  symbol: string
  yahooSymbol: string
  /** Symbole TradingView pour les graphiques mini */
  tvSymbol: string
  name: string
  emoji: string
  unit: string
  category: CommodityCategory
}

export type CommodityQuote = Commodity & {
  price: number
  previousClose: number
  change: number       // absolu
  changePct: number    // %
  currency: string
  fetchedAt: string
  error?: string
}

// ── Catalogue des matières premières ─────────────────────────
// Yahoo symbols vs TradingView symbols sont différents — les deux sont maintenus ici.

export const COMMODITIES: Commodity[] = [
  // ── Métaux précieux ──
  {
    symbol: 'GOLD',     yahooSymbol: 'GC=F',       tvSymbol: 'OANDA:XAUUSD',
    name: 'Or',         emoji: '🥇', unit: '$/oz',   category: 'Métaux précieux',
  },
  {
    symbol: 'SILVER',   yahooSymbol: 'SI=F',        tvSymbol: 'OANDA:XAGUSD',
    name: 'Argent',     emoji: '🥈', unit: '$/oz',   category: 'Métaux précieux',
  },
  {
    symbol: 'COPPER',   yahooSymbol: 'HG=F',        tvSymbol: 'COMEX:HG1!',
    name: 'Cuivre',     emoji: '🔩', unit: '$/lb',   category: 'Métaux précieux',
  },
  {
    symbol: 'LITHIUM',  yahooSymbol: 'LIT',         tvSymbol: 'AMEX:LIT',
    name: 'Lithium ETF', emoji: '⚡', unit: '$/action', category: 'Métaux précieux',
  },
  // ── Énergie ──
  {
    symbol: 'WTI',      yahooSymbol: 'CL=F',        tvSymbol: 'NYMEX:CL1!',
    name: 'Pétrole WTI', emoji: '🛢️', unit: '$/baril', category: 'Énergie',
  },
  {
    symbol: 'BRENT',    yahooSymbol: 'BZ=F',        tvSymbol: 'ICEEUR:B1!',
    name: 'Pétrole Brent', emoji: '⛽', unit: '$/baril', category: 'Énergie',
  },
  {
    symbol: 'GAS',      yahooSymbol: 'NG=F',        tvSymbol: 'NYMEX:NG1!',
    name: 'Gaz Naturel', emoji: '🔥', unit: '$/MMBtu', category: 'Énergie',
  },
  // ── Matières agricoles ──
  {
    symbol: 'WHEAT',    yahooSymbol: 'ZW=F',        tvSymbol: 'CBOT:ZW1!',
    name: 'Blé',        emoji: '🌾', unit: '¢/boisseau', category: 'Matières agricoles',
  },
  {
    symbol: 'CORN',     yahooSymbol: 'ZC=F',        tvSymbol: 'CBOT:ZC1!',
    name: 'Maïs',       emoji: '🌽', unit: '¢/boisseau', category: 'Matières agricoles',
  },
  {
    symbol: 'SOYBEAN',  yahooSymbol: 'ZS=F',        tvSymbol: 'CBOT:ZS1!',
    name: 'Soja',       emoji: '🫘', unit: '¢/boisseau', category: 'Matières agricoles',
  },
  {
    symbol: 'COFFEE',   yahooSymbol: 'KC=F',        tvSymbol: 'ICE:KC1!',
    name: 'Café Arabica', emoji: '☕', unit: '¢/lb',  category: 'Matières agricoles',
  },
]

// ── Fetch individuel (portage exact de l'ancien financeService.js) ──

async function fetchOneQuote(commodity: Commodity): Promise<CommodityQuote> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(commodity.yahooSymbol)}`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; infonews-bot/1.0)' },
    next: { revalidate: 120 },   // ISR : re-fetch toutes les 2 min
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) {
    throw new Error(`Yahoo Finance ${res.status} pour ${commodity.yahooSymbol}`)
  }

  const json = await res.json()
  const result = json?.chart?.result?.[0]

  if (!result) {
    throw new Error(`Pas de résultat Yahoo pour ${commodity.yahooSymbol}`)
  }

  const meta = result.meta
  const curr = meta.regularMarketPrice as number
  // Même logique que l'ancien financeService.js :
  const prev = (meta.previousClose ?? meta.chartPreviousClose ?? curr) as number
  const change = curr - prev
  const changePct = prev !== 0 ? (change / prev) * 100 : 0

  return {
    ...commodity,
    price: curr,
    previousClose: prev,
    change,
    changePct,
    currency: (meta.currency as string) || 'USD',
    fetchedAt: new Date().toISOString(),
  }
}

// ── Fetch principal (tous les symboles en parallèle) ──────────

export async function fetchAllCommodities(): Promise<CommodityQuote[]> {
  const results = await Promise.allSettled(
    COMMODITIES.map((c) => fetchOneQuote(c))
  )

  return results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value
    }
    // Fallback gracieux : renvoie le commodity avec prix à 0 + message d'erreur
    return {
      ...COMMODITIES[i],
      price: 0,
      previousClose: 0,
      change: 0,
      changePct: 0,
      currency: 'USD',
      fetchedAt: new Date().toISOString(),
      error: result.reason instanceof Error ? result.reason.message : 'Erreur inconnue',
    } satisfies CommodityQuote
  })
}

// ── Helper : grouper par catégorie ────────────────────────────

export function groupByCategory(
  quotes: CommodityQuote[]
): Record<CommodityCategory, CommodityQuote[]> {
  return quotes.reduce(
    (acc, q) => {
      if (!acc[q.category]) acc[q.category] = []
      acc[q.category].push(q)
      return acc
    },
    {} as Record<CommodityCategory, CommodityQuote[]>
  )
}

// ── Helper : formater un prix ──────────────────────────────────

export function formatPrice(price: number, currency: string): string {
  if (price === 0) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price) + ' ' + currency
}
