import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'South Pulse — Afrique, Océanie & Amérique Latine',
  description: 'Flux AfricaNews, AllAfrica, Telesur, MercoPress — actualités du Sud global.',
}

export default function SouthPulsePage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🌍 South Pulse</h1>
        <p className="page-description">
          AfricaNews · AllAfrica · Telesur · MercoPress
        </p>
        <div className="page-sources">
          {['AfricaNews', 'AllAfrica', 'Telesur', 'MercoPress'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>
      {/* TODO: SouthNewsGrid — portage depuis s-afrique-media (orpheline réparée) */}
    </div>
  )
}
