import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Music Stream — Charts & Tendances Musicales',
  description: 'Charts Deezer, Billboard, YouTube Music — Top tracks, artistes et albums.',
}

export default function MusicStreamPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🎶 Music Stream</h1>
        <p className="page-description">
          Deezer Top 20 · Billboard · YouTube Music Charts
        </p>
        <div className="page-sources">
          {['Deezer', 'Billboard', 'YouTube Music'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>
      {/* TODO: ChartsGrid (Deezer API) + BillboardRSS — portage depuis s-musique */}
    </div>
  )
}
