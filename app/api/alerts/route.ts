import { fetchAllAlerts } from '@/lib/services/alertsService'
import { NextResponse } from 'next/server'

export const revalidate = 120

export async function GET() {
  const data = await fetchAllAlerts(15)
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' },
  })
}
