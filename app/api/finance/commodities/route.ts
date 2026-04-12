// ============================================================
// app/api/finance/commodities/route.ts — Route Handler Next.js 15
// GET /api/finance/commodities
// Portage de l'ancien routes/finance.js (Express) en App Router.
// Cache : revalidate 120s (ISR côté serveur).
// ============================================================

import { NextResponse } from 'next/server'
import { fetchAllCommodities } from '@/lib/services/commoditiesService'

// Indique à Next.js de mettre en cache cette route 120 secondes
export const revalidate = 120

export async function GET() {
  try {
    const quotes = await fetchAllCommodities()

    return NextResponse.json(
      {
        fetchedAt: new Date().toISOString(),
        count: quotes.length,
        quotes,
      },
      {
        headers: {
          // Cache navigateur : 60s stale, 120s revalidation
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60',
        },
      }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json(
      { error: 'Erreur fetch commodités', detail: message },
      { status: 500 }
    )
  }
}
