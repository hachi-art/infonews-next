// ============================================================
// app/(pole-1-world)/home/page.tsx
// PAGE 01 — HOME / Dashboard Mondial
// Server Component — fetch finance au build/ISR (revalidate 120s)
// Client widgets : WorldometersCounters, TickerBar
// ============================================================

import type { Metadata } from 'next'
import { Suspense } from 'react'
import WorldometersCounters from '@/components/widgets/WorldometersCounters'
import TickerBar from '@/components/widgets/TickerBar'
import { fetchTickerQuotes } from '@/lib/api/finance'

export const metadata: Metadata = {
  title: 'Home — Dashboard Mondial',
  description:
    'Compteurs planétaires Worldometers, ticker finance/crypto en temps réel, Agent IA Globe-Guide.',
}

// ── Revalidation ISR : données finance recalculées toutes les 2 min ──
export const revalidate = 120


// ── Skeleton Ticker ────────────────────────────────────────────

function TickerSkeleton() {
  return (
    <div
      className="ticker-wrap"
      aria-busy="true"
      aria-label="Chargement du ticker…"
      style={{ justifyContent: 'center', gap: '2rem' }}
    >
      {[120, 90, 110, 95, 130].map((w, i) => (
        <div key={i} className="skeleton" style={{ width: w, height: '0.8em', borderRadius: 4 }} />
      ))}
    </div>
  )
}

// ── Section Separator ──────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: '0.72rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '0.75rem',
      }}
    >
      {children}
    </h2>
  )
}

// ── Page Component ────────────────────────────────────────────

export default async function HomePage() {
  // Appel direct au service — pas d'auto-fetch HTTP (Server Component)
  const tickerData = await fetchTickerQuotes()

  return (
    <div className="page-container">

      {/* ── En-tête ── */}
      <div className="page-header">
        <h1 className="page-title">🏠 Dashboard Mondial</h1>
        <p className="page-description">
          Compteurs planétaires · Ticker finance &amp; crypto · Agent IA Globe-Guide
        </p>
        <div className="page-sources">
          {['Worldometers', 'Yahoo Finance', 'CoinGecko', 'ONU · OMS · GIEC'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>

      {/* ── Ticker Finance (données serveur → Client Component) ── */}
      <section aria-label="Ticker financier">
        <SectionTitle>📈 Marchés &amp; Crypto — temps réel</SectionTitle>
        <Suspense fallback={<TickerSkeleton />}>
          <TickerBar quotes={tickerData} />
        </Suspense>
      </section>

      {/* ── Compteurs Worldometers (Client Component — calcul local) ── */}
      <Suspense
        fallback={
          <div style={{ marginBottom: '2rem' }}>
            <div className="counters-section-title skeleton" style={{ height: '0.72em', width: 280, marginBottom: 12 }} />
            <div className="counters-grid">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="skeleton-card" style={{ height: 110 }} />
              ))}
            </div>
          </div>
        }
      >
        <WorldometersCounters />
      </Suspense>

      {/* ── Informations globe-guide ── */}
      <section
        style={{
          padding: '1rem 1.25rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          marginBottom: '2rem',
        }}
        aria-label="Globe-Guide IA"
      >
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text)' }}>🌐 Globe-Guide IA</strong> — Utilisez le bouton en bas à droite
          pour interroger l&apos;assistant IA sur l&apos;actualité mondiale.
          L&apos;historique de conversation est conservé dans votre session uniquement — aucune donnée n&apos;est enregistrée.
        </p>
      </section>

    </div>
  )
}
