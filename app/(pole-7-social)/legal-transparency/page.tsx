import type { Metadata } from 'next'
import { ALL_ROUTES } from '@/lib/config/navigation'

export const metadata: Metadata = {
  title: 'Legal Transparency — Sources & APIs',
  description: 'Page de transparence totale — toutes les sources et APIs utilisées par InfoNews.day.',
}

export default function LegalTransparencyPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">⚖️ Legal Transparency</h1>
        <p className="page-description">
          Transparence totale · 100+ APIs · Sources citées · Copyright © 2026 InfoNews.day
        </p>
      </div>

      {/* Table des 28 routes — générée depuis navigation.ts */}
      <section className="legal-section">
        <h2 className="legal-section-title">📍 Pages indexées ({ALL_ROUTES.length})</h2>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Page</th>
              <th>URL</th>
              <th>Pôle</th>
              <th>Sources</th>
            </tr>
          </thead>
          <tbody>
            {ALL_ROUTES.map((route) => (
              <tr key={route.href}>
                <td>{route.icon} {route.label}</td>
                <td><code>{route.href}</code></td>
                <td>{route.poleLabel}</td>
                <td>{route.sources?.join(', ') ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="legal-section">
        <h2 className="legal-section-title">🔒 Politique de confidentialité</h2>
        <ul className="legal-list">
          <li>Aucun cookie de tracking — zéro traceur tiers</li>
          <li>Historique IA : sessionStorage uniquement — effacé à la fermeture du navigateur</li>
          <li>Aucune base de données utilisateur</li>
          <li>Sources TASS et Xinhua signalées médias d&apos;État conformément au Règlement UE 2022/350</li>
        </ul>
      </section>

      <footer className="legal-footer">
        <p>© 2024–2026 infonews.day · Projet open source sous licence MIT</p>
      </footer>
    </div>
  )
}
