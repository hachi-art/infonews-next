'use client'

// ============================================================
// components/widgets/TradingViewWidget.tsx
// Portage des graphiques TradingView de l'ancienne page s-commodites.
// Ancien code (HTML) :
//   <script src="tradingview/embed-widget-mini-symbol-overview.js" async>
//   {"symbol":"OANDA:XAUUSD","colorTheme":"dark","dateRange":"3M"}
//   </script>
// Nouveau code (React) : useEffect charge le script dynamiquement
// pour respecter les règles Next.js (pas de <script> inline en SSR).
// ============================================================

import { useEffect, useRef } from 'react'

// ── Types ─────────────────────────────────────────────────────

type TradingViewConfig = {
  symbol: string
  width?: string | number
  height?: number
  dateRange?: '1D' | '1M' | '3M' | '12M' | '60M' | 'ALL'
  colorTheme?: 'dark' | 'light'
  isTransparent?: boolean
  locale?: string
  autosize?: boolean
}

type TradingViewWidgetProps = {
  config: TradingViewConfig
  label: string
}

// ── TradingView Script URL ─────────────────────────────────────
const TV_SCRIPT_URL =
  'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js'

// ── Component ─────────────────────────────────────────────────

export default function TradingViewWidget({ config, label }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)

  const fullConfig: TradingViewConfig = {
    width: '100%',
    height: 160,
    dateRange: '3M',
    colorTheme: 'dark',
    isTransparent: true,
    autosize: true,
    locale: 'fr',
    ...config,
  }

  useEffect(() => {
    // Nettoyage du widget précédent si le composant est ré-rendu
    if (!widgetRef.current) return
    widgetRef.current.innerHTML = ''

    // Création du conteneur TradingView
    const inner = document.createElement('div')
    inner.className = 'tradingview-widget-container__widget'
    widgetRef.current.appendChild(inner)

    // Injection du script avec la config inline (même pattern que l'ancien HTML)
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = TV_SCRIPT_URL
    script.async = true
    script.textContent = JSON.stringify(fullConfig)
    widgetRef.current.appendChild(script)

    return () => {
      if (widgetRef.current) widgetRef.current.innerHTML = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.symbol])

  return (
    <div
      ref={containerRef}
      className="tv-widget-box"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
      }}
    >
      <div
        ref={widgetRef}
        className="tradingview-widget-container"
        style={{ height: fullConfig.height }}
      />
      <div
        style={{
          fontSize: '0.68rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          padding: '4px 8px',
          borderTop: '1px solid var(--border)',
        }}
      >
        {label}
      </div>
    </div>
  )
}

// ── TradingView Grid ──────────────────────────────────────────
// Wrapper pratique pour afficher plusieurs widgets en grille.

type TradingViewItem = {
  tvSymbol: string
  name: string
  emoji: string
}

export function TradingViewGrid({ items }: { items: TradingViewItem[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '0.8rem',
      }}
    >
      {items.map((item) => (
        <TradingViewWidget
          key={item.tvSymbol}
          label={`${item.emoji} ${item.name}`}
          config={{
            symbol: item.tvSymbol,
            dateRange: '3M',
            colorTheme: 'dark',
            isTransparent: true,
          }}
        />
      ))}
    </div>
  )
}
