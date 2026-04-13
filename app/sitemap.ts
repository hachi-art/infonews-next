import { MetadataRoute } from 'next'
import { ALL_ROUTES } from '@/lib/config/navigation'

const BASE_URL = 'https://infonews.day'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return ALL_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.href}`,
    lastModified: now,
    changeFrequency: 'hourly' as const,
    priority: route.href === '/home' ? 1.0 : 0.8,
  }))
}
