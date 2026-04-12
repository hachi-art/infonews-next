import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ── Images distantes autorisées ──────────────────────────────
  // Déclarées ici pour next/image (NASA APOD, TMDB, drapeaux…)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'apod.nasa.gov' },
      { protocol: 'https', hostname: 'www.nasa.gov' },
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: '*.coingecko.com' },
    ],
  },

  // ── Headers de sécurité ──────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',        value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          // TradingView a besoin d'être autorisé en frame-ancestors
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://s3.tradingview.com",
              "frame-src https://s.tradingview.com https://www.tradingview.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://query1.finance.yahoo.com https://api.coingecko.com https://api.frankfurter.app https://api.alternative.me https://earthquake.usgs.gov https://www.gdacs.org https://api.nasa.gov https://ll.thespacedevs.com https://www.ndbc.noaa.gov https://api.themoviedb.org https://rss.arxiv.org https://api.worldbank.org https://www.thesportsdb.com https://api.football-data.org https://www.reddit.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
            ].join('; '),
          },
        ],
      },
      // Cache statique long pour les assets immuables
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig
