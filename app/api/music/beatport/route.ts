import { fetchAllBeatportCharts } from '@/lib/services/beatportService'
import { NextResponse } from 'next/server'

export const revalidate = 3600 // 1h — charts Beatport peu volatils

export async function GET() {
  const tracks = await fetchAllBeatportCharts(10)
  return NextResponse.json({ total: tracks.length, tracks }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
  })
}
