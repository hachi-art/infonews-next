import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events Agenda — Concerts, Festivals & Sorties',
  description: 'Agenda culturel géolocalisé — Dice, Resident Advisor, Fever et Wikipedia.',
}

export default function EventsAgendaPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🎪 Events Agenda</h1>
        <p className="page-description">
          Dice · Resident Advisor · Fever · Wikipedia &quot;En ce jour&quot;
        </p>
        <div className="page-sources">
          {['Dice', 'Resident Advisor', 'Fever', 'Wikipedia'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>
      {/* TODO: EventsGrid (géolocalisation) + WikiOnThisDay — portage depuis s-events */}
    </div>
  )
}
