'use client'

// ============================================================
// components/widgets/TradingViewClientWrapper.tsx
// Wrapper Client Component pour TradingViewGrid.
// next/dynamic avec ssr:false ne peut s'utiliser que dans un
// Client Component — ce fichier sert de pont pour commodities/page.tsx
// (Server Component) qui ne peut pas appeler dynamic({ssr:false}) lui-même.
// ============================================================

import dynamic from 'next/dynamic'

const TradingViewGrid = dynamic(
  () => import('@/components/widgets/TradingViewWidget').then((m) => m.TradingViewGrid),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '0.8rem',
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-card" style={{ height: 180 }} />
        ))}
      </div>
    ),
  }
)

export { TradingViewGrid as TradingViewClientGrid }
