import { fetchTechAiNews } from '@/lib/services/techAiService'
import { NextResponse } from 'next/server'

export const revalidate = 300 // 5 min

export async function GET() {
  const articles = await fetchTechAiNews(80)
  return NextResponse.json({ total: articles.length, articles }, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  })
}
