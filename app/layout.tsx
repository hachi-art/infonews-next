// ============================================================
// app/layout.tsx — Root Layout infonews.day v10
// Server Component — Pas de 'use client' ici
// ============================================================

import type { Metadata, Viewport } from 'next'
import { DM_Sans, DM_Mono, DM_Serif_Display } from 'next/font/google'
import NavigationRoot from '@/components/layout/NavigationRoot'
import GlobeGuide from '@/components/ai/GlobeGuide'
import './globals.css'

// ── Fonts ────────────────────────────────────────────────────
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

// ── Metadata ─────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'InfoNews.day — Le tableau de bord planétaire',
    template: '%s — InfoNews.day',
  },
  description:
    '28 pages · 7 pôles · Sources mondiales en temps réel. Finance, Géopolitique, Tech, Culture.',
  metadataBase: new URL('https://infonews.day'),
  openGraph: {
    siteName: 'InfoNews.day',
    locale: 'fr_FR',
    type: 'website',
    title: 'InfoNews.day — Le tableau de bord planétaire',
    description: '28 pages · 7 pôles · Sources mondiales en temps réel.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InfoNews.day',
    description: 'Le tableau de bord planétaire — 28 sources mondiales.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export const viewport: Viewport = {
  themeColor: '#080c18',
  width: 'device-width',
  initialScale: 1,
}

// ── Root Layout ───────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="fr"
      className={`${dmSans.variable} ${dmMono.variable} ${dmSerif.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/*
          NavigationRoot — Client Component
          Reçoit NAVIGATION via import statique dans le composant.
          Hauteur combinée pole-nav + sub-nav = var(--nav-total-h)
          définie en CSS pour le padding-top du main.
        */}
        <NavigationRoot />

        {/*
          main — reçoit un padding-top = hauteur totale de la nav
          pour ne jamais masquer le contenu sous la nav sticky.
        */}
        <main id="main-content" className="main-content">
          {children}
        </main>

        {/*
          GlobeGuide — Agent IA flottant
          z-index: 9999 — toujours au-dessus de tout
          Historique stocké en sessionStorage uniquement (zéro DB)
        */}
        <GlobeGuide />
      </body>
    </html>
  )
}
