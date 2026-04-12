import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Globe 3D — Satellite & Alertes',
  description: 'Vue satellite NASA, radars météo temps réel, alertes séismes et tsunamis.',
}

export default function Globe3DPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🌐 Globe 3D</h1>
        <p className="page-description">
          Vue satellite NASA · Radars météo · Alertes Séismes & Tsunamis
        </p>
        <div className="page-sources">
          {['NASA', 'USGS', 'GDACS', 'OpenWeather'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>
      {/* TODO: Globe3DViewer (react-globe.gl), WeatherRadar, EarthquakeAlerts */}
    </div>
  )
}
