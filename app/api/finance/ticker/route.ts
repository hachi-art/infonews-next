// ============================================================
// app/api/finance/ticker/route.ts
// Route Handler — expose les cours du ticker en JSON.
// Consommé par des clients externes éventuels.
// Les Server Components appellent fetchTickerQuotes() directement.
// ============================================================

import { fetchTickerQuotes } from '@/lib/api/finance'
import { NextResponse } from 'next/server'

// ISR côté Route Handler : Next.js re-fetchera au bout de 60s
export const revalidate = 60

export async function GET() {
  try {
    const quotes = await fetchTickerQuotes()
    return NextResponse.json(quotes, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (err) {
    console.error('[/api/finance/ticker]', err)
    return NextResponse.json({ error: 'Service indisponible' }, { status: 502 })
  }
}
