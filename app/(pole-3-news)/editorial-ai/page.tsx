import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editorial IA — Synthèse Journaliste Citoyen',
  description: 'Analyses de journalisme citoyen synthétisées par IA avec sources citées et CrossCheck.',
}

export default function EditorialAiPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">✍️ Editorial IA</h1>
        <p className="page-description">
          Synthèse IA · Sources citées · CrossCheck West/East intégré
        </p>
        <div className="page-sources">
          {['Claude AI', 'Toutes sources actives'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>
      {/* TODO: EditorialSynthesis + CrossCheckPanel — portage depuis s-editorial + s-crosscheck */}
    </div>
  )
}
