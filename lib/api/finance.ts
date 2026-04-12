// ============================================================
// lib/api/finance.ts
// Service Yahoo Finance — port TypeScript de l'ancien financeService.js
// Utilisé par les Server Components et les Route Handlers.
//
// Pattern : native fetch + AbortSignal.timeout + Promise.allSettled
// Aucune dépendance externe (pas d'axios, pas de yahoo-finance2).
// ============================================================

export type TickerQuote = {
  symbol: string
  name: string
  price: number
  change: number      // valeur absolue
  changePct: number   // %
  currency: string
  error?: string
}

// ── Symboles du ticker principal ──────────────────────────────

const TICKER_SYMBOLS: Array<{ symbol: string; name: string; currency: string }> = [
  { symbol: 'SPY',     name: 'S&P 500',     currency: 'USD' },
  { symbol: 'QQQ',     name: 'Nasdaq 100',  currency: 'USD' },
  { symbol: '^FCHI',   name: 'CAC 40',      currency: 'EUR' },
  { symbol: '^GDAXI',  name: 'DAX',         currency: 'EUR' },
  { symbol: 'BTC-USD', name: 'Bitcoin',     currency: 'USD' },
  { symbol: 'ETH-USD', name: 'Ethereum',    currency: 'USD' },
  { symbol: 'GC=F',   name: 'Or ($/oz)',    currency: 'USD' },
  { symbol: 'CL=F',   name: 'Pétrole WTI', currency: 'USD' },
]

// ── Yahoo Finance v8 fetch ─────────────────────────────────────

/**
 * Récupère un seul quote depuis Yahoo Finance v8.
 * URL : https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=5d
 */
async function fetchOneQuote(
  symbol: string,
  name: string,
  currency: string,
): Promise<TickerQuote> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`

  const res = await fetch(url, {
    signal: AbortSignal.timeout(8_000),
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/json',
    },
    // Next.js cache tag — permet revalidateTag('ticker') si besoin
    next: { tags: ['ticker'] },
  })

  if (!res.ok) {
    throw new Error(`Yahoo ${symbol}: HTTP ${res.status}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await res.json() as any

  const result = json?.chart?.result?.[0]
  if (!result) throw new Error(`Yahoo ${symbol}: no result`)

  const meta = result.meta
  const price: number = meta.regularMarketPrice ?? 0
  const prevClose: number = meta.chartPreviousClose ?? meta.previousClose ?? price
  const change = price - prevClose
  const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0

  return {
    symbol,
    name,
    price,
    change: parseFloat(change.toFixed(4)),
    changePct: parseFloat(changePct.toFixed(2)),
    currency: meta.currency ?? currency,
  }
}

// ── Public API ─────────────────────────────────────────────────

/**
 * Récupère tous les quotes du ticker en parallèle.
 * Utilise Promise.allSettled → chaque symbole échoue indépendamment.
 * Retourne price:0 pour les symboles en erreur (le TickerBar affiche "—").
 */
export async function fetchTickerQuotes(): Promise<TickerQuote[]> {
  const results = await Promise.allSettled(
    TICKER_SYMBOLS.map(({ symbol, name, currency }) =>
      fetchOneQuote(symbol, name, currency),
    ),
  )

  return results.map((r, i) => {
    const { symbol, name, currency } = TICKER_SYMBOLS[i]
    if (r.status === 'fulfilled') return r.value
    return {
      symbol,
      name,
      currency,
      price: 0,
      change: 0,
      changePct: 0,
      error: r.reason instanceof Error ? r.reason.message : String(r.reason),
    }
  })
}
