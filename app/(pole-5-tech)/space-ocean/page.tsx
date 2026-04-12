// ============================================================
// app/(pole-5-tech)/space-ocean/page.tsx — PAGE 20
// Fusion : NASA APOD + Launch Library 2 + ArXiv astrophysique
//          + NOAA bouées + Alertes USGS/GDACS (section Environnement)
//
// Sources portées depuis l'ancien :
//   routes/space.js → apod, launches, arxiv, ocean (NOAA)
//   routes/alerts.js → earthquakes (USGS), gdacs
//   services/nasaApodService.js → NASA_API_KEY ou DEMO_KEY
//   services/launchLibraryService.js → ll.thespacedevs.com
//   services/noaaOceanService.js → NDBC bouées
//   services/gdacsService.js + earthquakeService.js
// ============================================================

import type { Metadata } from 'next'
import { fetchSpaceOceanPage, OCEAN_STATS, type Launch, type BuoyReading } from '@/lib/services/spaceOceanService'
import { fetchAllAlerts, type EarthquakeAlert, type DisasterAlert } from '@/lib/services/alertsService'
import type { RssItem } from '@/lib/services/rssService'

export const metadata: Metadata = {
  title: 'Space & Ocean — NASA APOD, Lancements, NOAA, Alertes',
  description:
    'NASA APOD, prochains lancements spatiaux (Launch Library 2), NOAA bouées océaniques, alertes USGS séismes et catastrophes GDACS.',
}

export const revalidate = 600

// ── Section title ─────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: '0.75rem', marginTop: '2rem',
    }}>
      {children}
    </h2>
  )
}

// ── NASA APOD Card ────────────────────────────────────────────

function ApodCard({ apod }: { apod: NonNullable<Awaited<ReturnType<typeof fetchSpaceOceanPage>>['apod']> }) {
  return (
    <div className="card" style={{ padding: '1rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '1.2rem' }}>🌌</span>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            NASA · Astronomy Picture of the Day · {apod.date}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{apod.title}</div>
        </div>
      </div>
      {apod.mediaType === 'image' ? (
        <img
          src={apod.url}
          alt={apod.title}
          style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}
          loading="lazy"
        />
      ) : (
        <div style={{ position: 'relative', paddingBottom: '56.25%', marginBottom: '0.75rem' }}>
          <iframe
            src={apod.url}
            title={apod.title}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 'var(--radius-sm)' }}
            allowFullScreen
          />
        </div>
      )}
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
        {apod.explanation.slice(0, 400)}…
      </p>
      {apod.copyright && (
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
          © {apod.copyright}
        </p>
      )}
    </div>
  )
}

// ── Launch Card ───────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  'Go for Launch': '#22c55e',
  'Success':       '#22c55e',
  'TBD':           '#f59e0b',
  'TBC':           '#f59e0b',
  'Hold':          '#ef4444',
  'Failure':       '#ef4444',
}

function LaunchCard({ launch }: { launch: Launch }) {
  const netDate = launch.net ? new Date(launch.net) : null
  const color = STATUS_COLORS[launch.status] ?? 'var(--text-muted)'
  const isUpcoming = launch.upcoming

  return (
    <div className="card" style={{ padding: '0.85rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color, fontWeight: 600 }}>
          {isUpcoming ? '🚀' : launch.status === 'Success' ? '✅' : '❌'} {launch.status}
        </span>
        {launch.provider && (
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
            {launch.provider}
          </span>
        )}
      </div>
      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
        {launch.missionName}
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        🛸 {launch.rocket}
        {launch.location && ` · 📍 ${launch.location}`}
      </div>
      {netDate && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
          🗓 {netDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} UTC
        </div>
      )}
    </div>
  )
}

// ── ArXiv Paper Card ──────────────────────────────────────────

function PaperCard({ paper }: { paper: RssItem }) {
  return (
    <div className="card" style={{ padding: '0.85rem 1rem' }}>
      <div style={{ fontSize: '0.65rem', color: '#f59e0b', fontFamily: 'var(--font-mono)', marginBottom: '0.3rem' }}>
        PAPER · {paper.source}
      </div>
      <a href={paper.url} target="_blank" rel="noopener noreferrer"
        style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', textDecoration: 'none', lineHeight: 1.35 }}>
        {paper.title}
      </a>
      {paper.description && (
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0.35rem 0 0' }}>
          {paper.description.slice(0, 180)}…
        </p>
      )}
    </div>
  )
}

// ── Bouée Card ────────────────────────────────────────────────

function BuoyCard({ buoy }: { buoy: BuoyReading }) {
  return (
    <div className="card" style={{ padding: '0.85rem 1rem' }}>
      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text)', marginBottom: '0.35rem' }}>
        🌊 {buoy.name}
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: '0.5rem' }}>
          {buoy.ocean}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.2rem' }}>
        {[
          ['🌊 Vagues',    buoy.waveHeight],
          ['💨 Vent',      buoy.windSpeed],
          ['🌡️ Eau',       buoy.waterTemp],
          ['🌡️ Air',       buoy.airTemp],
          ['🔵 Pression',  buoy.pressure],
        ].map(([label, val]) => val && (
          <div key={label as string} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {label} {val}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Séisme Card ───────────────────────────────────────────────

const MAG_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#f59e0b',
  low:      '#6b7280',
}

function EarthquakeCard({ q }: { q: EarthquakeAlert }) {
  const color = MAG_COLORS[q.severity]
  return (
    <a href={q.url ?? '#'} target="_blank" rel="noopener noreferrer"
      className="card"
      style={{ padding: '0.75rem 1rem', textDecoration: 'none', display: 'block' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{
          fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)',
          color, flexShrink: 0, minWidth: 40,
        }}>
          M{q.magnitude}
        </span>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>{q.place}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {new Date(q.time).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            {q.depth != null && ` · prof. ${q.depth} km`}
          </div>
        </div>
      </div>
    </a>
  )
}

// ── Disaster Card (GDACS) ─────────────────────────────────────

const DISASTER_COLORS: Record<string, string> = {
  critical: '#ef4444',
  medium:   '#f59e0b',
  low:      '#22c55e',
}

function DisasterCard({ d }: { d: DisasterAlert }) {
  const color = DISASTER_COLORS[d.severity]
  return (
    <a href={d.url} target="_blank" rel="noopener noreferrer"
      className="card"
      style={{ padding: '0.75rem 1rem', textDecoration: 'none', display: 'block' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color, fontFamily: 'var(--font-mono)',
          background: `${color}22`, border: `1px solid ${color}44`, padding: '1px 5px', borderRadius: 3 }}>
          {d.alertLevel.toUpperCase()}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{d.type}</span>
      </div>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{d.title}</div>
      {d.place && (
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
          📍 {d.place}
        </div>
      )}
    </a>
  )
}

// ── Page principale ───────────────────────────────────────────

export default async function SpaceOceanPage() {
  const [spaceData, alertsData] = await Promise.all([
    fetchSpaceOceanPage(),
    fetchAllAlerts(10),
  ])

  const { apod, upcoming, previous, arxiv, buoys } = spaceData
  const { earthquakes, disasters } = alertsData
  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="page-header">
        <h1 className="page-title">🛸 Space &amp; Ocean</h1>
        <p className="page-description">
          NASA APOD · ESA · Launch Library 2 · ArXiv Astrophysique · NOAA Bouées · Alertes USGS &amp; GDACS
        </p>
        <div className="page-sources">
          {['NASA', 'Launch Library 2', 'ArXiv', 'NOAA NDBC', 'USGS', 'GDACS'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>

      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1.5rem' }}>
        Mise à jour : {time} · ISR 10 min
      </p>

      {/* ── NASA APOD ── */}
      {apod && (
        <>
          <SectionTitle>🌌 Astronomy Picture of the Day — NASA</SectionTitle>
          <ApodCard apod={apod} />
        </>
      )}

      {/* ── Lancements à venir ── */}
      {upcoming.length > 0 && (
        <>
          <SectionTitle>🚀 Prochains Lancements — Launch Library 2</SectionTitle>
          <div className="grid-auto-sm">
            {upcoming.map((l) => <LaunchCard key={l.id} launch={l} />)}
          </div>
        </>
      )}

      {/* ── Derniers lancements ── */}
      {previous.length > 0 && (
        <>
          <SectionTitle>📋 Derniers Lancements</SectionTitle>
          <div className="grid-auto-sm">
            {previous.map((l) => <LaunchCard key={l.id} launch={l} />)}
          </div>
        </>
      )}

      {/* ── Recherche ArXiv ── */}
      {arxiv.length > 0 && (
        <>
          <SectionTitle>📄 Recherche ArXiv — Astrophysique</SectionTitle>
          <div className="grid-auto-sm">
            {arxiv.map((p) => <PaperCard key={p.id} paper={p} />)}
          </div>
        </>
      )}

      {/* ── NOAA Bouées ── */}
      {buoys.length > 0 && (
        <>
          <SectionTitle>🌊 Océans — Bouées NOAA NDBC (temps réel)</SectionTitle>
          <div style={{ marginBottom: '1rem', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontFamily: 'var(--font-mono)' }}>
            <span>📐 Superficie : {OCEAN_STATS.coverage}</span>
            <span>🌡️ Temp. moy. : {OCEAN_STATS.avgTemp}</span>
            <span>🔬 pH : {OCEAN_STATS.acidLevel}</span>
            <span>🧴 Plastique : {OCEAN_STATS.plasticTons}</span>
          </div>
          <div className="grid-auto-sm">
            {buoys.map((b) => <BuoyCard key={b.id} buoy={b} />)}
          </div>
        </>
      )}

      {/* ── Alertes Environnement (USGS + GDACS) ── */}
      <section style={{
        marginTop: '2rem',
        padding: '1rem 1.25rem',
        background: 'rgba(239,68,68,0.05)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 'var(--radius)',
      }}>
        <SectionTitle>⚠️ Alertes Environnement</SectionTitle>

        {earthquakes.length > 0 && (
          <>
            <h3 style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
              🌍 Séismes récents — USGS ({earthquakes.length})
            </h3>
            <div className="grid-auto-sm" style={{ marginBottom: '1.5rem' }}>
              {earthquakes.map((q) => <EarthquakeCard key={q.id} q={q} />)}
            </div>
          </>
        )}

        {disasters.length > 0 && (
          <>
            <h3 style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
              🚨 Catastrophes mondiales — GDACS ({disasters.length})
            </h3>
            <div className="grid-auto-sm">
              {disasters.map((d) => <DisasterCard key={d.id} d={d} />)}
            </div>
          </>
        )}

        {earthquakes.length === 0 && disasters.length === 0 && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            ✅ Aucune alerte majeure en ce moment.
          </p>
        )}
      </section>

    </div>
  )
}
