import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'World Radios — Radio Garden & Podcasts',
  description: 'Radios mondiales via Radio Garden + Podcasts BBC, RFI, FT News, Huberman Lab.',
}

export default function WorldRadiosPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📻 World Radios</h1>
        <p className="page-description">
          Radio Garden (globe interactif) · BBC Podcasts · RFI · FT News · Darknet Diaries
        </p>
        <div className="page-sources">
          {['Radio Garden', 'BBC Podcasts', 'RFI', 'FT News'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>
      {/* TODO: RadioGardenEmbed + PodcastsList — portage depuis s-radio + s-podcasts */}
    </div>
  )
}
