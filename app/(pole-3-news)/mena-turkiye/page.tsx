import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MENA & Türkiye — Al Jazeera, TRT, Anadolu',
  description: 'Flux Al Jazeera, TRT World et Anadolu Agency — actualités Moyen-Orient et Turquie.',
}

export default function MenaTurkiyePage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🌙 MENA & Türkiye</h1>
        <p className="page-description">
          Al Jazeera · TRT World · Anadolu Agency
        </p>
        <div className="page-sources">
          {['Al Jazeera', 'TRT World', 'Anadolu Agency'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>
      {/* TODO: MenaNewsGrid — portage depuis s-moyen-orient-media (orpheline réparée) */}
    </div>
  )
}
