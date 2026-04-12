import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Western Press — Reuters, AFP, BBC, Guardian',
  description: 'Flux RSS Reuters, AFP, AP News, BBC World, The Guardian — actualités occidentales.',
}

export default function WesternPressPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🗞️ Western Press</h1>
        <p className="page-description">
          Reuters · AFP · AP News · BBC World · The Guardian · DW · Euronews
        </p>
        <div className="page-sources">
          {['Reuters', 'AFP', 'AP', 'BBC', 'The Guardian'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>
      {/* TODO: NewsGrid (RSS feeds) + CrossCheck col-west — portage depuis s-sources */}
    </div>
  )
}
