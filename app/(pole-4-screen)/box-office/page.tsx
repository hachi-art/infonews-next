import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Box Office — Hollywood & Cinéma Mondial',
  description: 'Films en salle, tendances TMDB, Variety et chiffres Box Office mondiaux.',
}

export default function BoxOfficePage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🎬 Box Office</h1>
        <p className="page-description">
          Films en salle · TMDB Trending · Variety · Rotten Tomatoes
        </p>
        <div className="page-sources">
          {['TMDB', 'Variety', 'Rotten Tomatoes'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>
      {/* TODO: CinemaGrid (TMDB API) + VarietyRSS — portage depuis s-cinema */}
    </div>
  )
}
