import { fetchSpaceOceanPage } from '@/lib/services/spaceOceanService'
import { NextResponse } from 'next/server'

export const revalidate = 600 // 10 min

export async function GET() {
  const data = await fetchSpaceOceanPage()
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200' },
  })
}
