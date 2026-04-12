import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stocks West — Indices Occidentaux',
  description: 'S&P500, Nasdaq, CAC40, DAX — cours en temps réel et évolutions.',
}

export default function StocksWestPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📈 Stocks West</h1>
        <p className="page-description">
          S&P500 · Nasdaq · CAC40 · DAX · Dow Jones · FTSE 100
        </p>
        <div className="page-sources">
          {['Yahoo Finance', 'Alpha Vantage'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>
      {/* TODO: MarketTiles, StockChart (recharts), CryptoFearGreed */}
    </div>
  )
}
