import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Time Machine — Archives & Mémoire du Monde',
  description: "Archives historiques Wikipedia, Chronicling America, collections Louvre et Met Museum.",
}

export default function TimeMachinePage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">⏳ Time Machine</h1>
        <p className="page-description">
          Wikipedia &quot;En ce jour&quot; · Chronicling America · Louvre · Met Museum
        </p>
        <div className="page-sources">
          {['Wikipedia', 'Chronicling America', 'Louvre', 'Met Museum'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>
      {/* TODO: OnThisDay + HistoricalSearch + MuseumWidget — portage depuis s-timemachine + s-hist */}
    </div>
  )
}
