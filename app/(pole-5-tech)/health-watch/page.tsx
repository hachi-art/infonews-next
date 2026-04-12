import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Health Watch — OMS & Recherche Médicale',
  description: "Flux OMS (WHO), rapports sanitaires mondiaux et recherche médicale ArXiv.",
}

export default function HealthWatchPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🏥 Health Watch</h1>
        <p className="page-description">
          WHO/OMS · ArXiv q-bio · Alertes sanitaires mondiales
        </p>
        <div className="page-sources">
          {['WHO/OMS', 'ArXiv q-bio', 'CDC'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>
      {/* TODO: HealthNewsGrid + WHOAlerts — portage depuis s-sante + s-alertes */}
    </div>
  )
}
