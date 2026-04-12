import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mobility Live — Vols, Maritime & Ferroviaire',
  description: 'Radars de vols (OpenSky), trafic maritime et fret ferroviaire en temps réel.',
}

export default function MobilityPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">✈️ Mobility Live</h1>
        <p className="page-description">
          Radars de vols · Trafic maritime · Fret ferroviaire
        </p>
        <div className="page-sources">
          {['OpenSky Network', 'MarineTraffic', 'NOAA Ocean'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>
      {/* TODO: FlightRadarMap (OpenSky), MaritimeMap, RailFreightWidget */}
    </div>
  )
}
