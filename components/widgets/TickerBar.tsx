'use client'

// ============================================================
// components/widgets/TickerBar.tsx
// Ticker financier défilant — reçoit les données du Server Component.
// Double le tableau pour un scroll CSS infini sans JS.
// ============================================================

type Quote = {
  symbol: string
  name: string
  price: number
  change: number
  changePct: number
  currency: string
}

function TickerItem({ quote }: { quote: Quote }) {
  const isUp = quote.changePct >= 0
  const sign = isUp ? '+' : ''
  const hasData = quote.price > 0

  return (
    <span className="ticker-item" aria-label={`${quote.name}: ${quote.price} ${quote.currency}`}>
      <span className="ticker-symbol">{quote.symbol}</span>
      {hasData ? (
        <>
          <span className="ticker-price">
            {quote.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`ticker-change--${isUp ? 'up' : 'down'}`}>
            {sign}{quote.changePct.toFixed(2)}%
          </span>
        </>
      ) : (
        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>—</span>
      )}
    </span>
  )
}

export default function TickerBar({ quotes }: { quotes: Quote[] }) {
  if (!quotes.length) return null

  // Duplication pour scroll CSS infini
  const doubled = [...quotes, ...quotes]

  return (
    <div className="ticker-wrap" role="marquee" aria-label="Ticker financier">
      <div className="ticker-track">
        {doubled.map((q, i) => (
          <TickerItem key={`${q.symbol}-${i}`} quote={q} />
        ))}
      </div>
    </div>
  )
}
