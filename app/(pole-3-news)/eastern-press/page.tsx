import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Eastern Press — Xinhua, TASS, NHK, Yonhap',
  description: 'Flux Xinhua (Chine), TASS (Russie), NHK (Japon), Yonhap (Corée) — signalés médias d\'État.',
}

export default function EasternPressPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🀄 Eastern Press</h1>
        <p className="page-description">
          Xinhua · TASS · NHK · Yonhap
        </p>
        <div className="page-sources">
          {['Xinhua ⚠️', 'TASS ⚠️', 'NHK', 'Yonhap'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
        <p className="page-disclaimer">
          ⚠️ Xinhua et TASS sont signalés comme médias d&apos;État. Sources affichées à titre informatif.
        </p>
      </div>
      {/* TODO: EasternNewsGrid — portage depuis s-orient (orpheline réparée) */}
    </div>
  )
}
