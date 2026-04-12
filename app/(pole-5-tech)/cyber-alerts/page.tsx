import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cyber Alerts — Veille Cybersécurité Mondiale',
  description: 'Alertes failles mondiales, BleepingComputer, CVE Database et CERT.',
}

export default function CyberAlertsPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🛡️ Cyber Alerts</h1>
        <p className="page-description">
          BleepingComputer · CVE Database · CERT · Legal Hackers
        </p>
        <div className="page-sources">
          {['BleepingComputer', 'CVE Database', 'CERT'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>
      {/* TODO: CyberAlertsGrid — portage depuis s-cyber */}
    </div>
  )
}
