'use client'

// ============================================================
// components/widgets/WorldometersCounters.tsx
// Compteurs Worldometers animés — calcul côté client uniquement.
// AUCUN appel API — valeurs dérivées de taux annuels officiels.
// Sources : ONU, Banque Mondiale, GIEC, OMS, IEA (2024).
// Mise à jour toutes les secondes via setInterval.
// ============================================================

import { useEffect, useRef, useState } from 'react'

// ── Types ─────────────────────────────────────────────────────

type CounterDef = {
  id: string
  emoji: string
  label: string
  sub: string
  /** Valeur au 1er janvier de l'année courante (base) */
  baseValue: number
  /** Incrément par seconde (peut être négatif) */
  ratePerSecond: number
  /** Format d'affichage */
  format: 'integer' | 'decimal-1' | 'decimal-2'
  /** Couleur de la bordure gauche */
  color: 'green' | 'red' | 'orange' | 'blue' | 'default'
}

// ── Constantes de taux (sources officielles 2024) ─────────────

// Secondes dans une année non-bissextile
const SECONDS_PER_YEAR = 365.25 * 24 * 3600

function ratePerSec(perYear: number): number {
  return perYear / SECONDS_PER_YEAR
}

/**
 * Calcule les secondes écoulées depuis le 1er janvier de l'année courante à 00:00:00 UTC.
 * Utilisé pour calculer les valeurs courantes depuis la base annuelle.
 */
function secondsSinceYearStart(): number {
  const now = new Date()
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0))
  return (now.getTime() - yearStart.getTime()) / 1000
}

// ── Définition des compteurs ──────────────────────────────────

const COUNTERS: CounterDef[] = [
  // ── Démographie ──
  {
    id: 'population',
    emoji: '👥',
    label: 'Population mondiale',
    sub: '+80 M / an (ONU 2024)',
    baseValue: 8_189_700_000,  // estimation ONU 1er Jan 2024
    ratePerSecond: ratePerSec(80_000_000),
    format: 'integer',
    color: 'blue',
  },
  {
    id: 'births',
    emoji: '👶',
    label: 'Naissances aujourd\'hui',
    sub: '~140 M / an',
    baseValue: 0,
    ratePerSecond: ratePerSec(140_000_000), // reset journalier géré dans computeValues
    format: 'integer',
    color: 'green',
  },
  {
    id: 'deaths',
    emoji: '💀',
    label: 'Décès aujourd\'hui',
    sub: '~60 M / an',
    baseValue: 0,
    ratePerSecond: ratePerSec(60_000_000),
    format: 'integer',
    color: 'red',
  },
  // ── Environnement ──
  {
    id: 'co2',
    emoji: '🌫️',
    label: 'CO₂ émis (tonnes)',
    sub: '~37 Gt / an (GIEC 2024)',
    baseValue: 0,
    ratePerSecond: ratePerSec(37_000_000_000),
    format: 'integer',
    color: 'orange',
  },
  {
    id: 'forests',
    emoji: '🌳',
    label: 'Forêts perdues (ha)',
    sub: '~10 M ha / an',
    baseValue: 0,
    ratePerSecond: ratePerSec(10_000_000),
    format: 'decimal-2',
    color: 'red',
  },
  {
    id: 'plastic',
    emoji: '🧴',
    label: 'Plastique produit (t)',
    sub: '~430 Mt / an',
    baseValue: 0,
    ratePerSecond: ratePerSec(430_000_000),
    format: 'integer',
    color: 'orange',
  },
  {
    id: 'water',
    emoji: '💧',
    label: 'Eau consommée (L)',
    sub: '~4 000 km³ / an',
    baseValue: 0,
    ratePerSecond: ratePerSec(4_000_000_000_000_000),
    format: 'integer',
    color: 'blue',
  },
  {
    id: 'energy',
    emoji: '⚡',
    label: 'Énergie consommée (TWh)',
    sub: '~580 EJ / an (IEA 2024)',
    baseValue: 0,
    ratePerSecond: ratePerSec(580_000_000 / 3.6), // EJ→TWh
    format: 'decimal-1',
    color: 'orange',
  },
  // ── Santé ──
  {
    id: 'tobacco',
    emoji: '🚬',
    label: 'Décès tabac aujourd\'hui',
    sub: '8 M / an (OMS 2024)',
    baseValue: 0,
    ratePerSecond: ratePerSec(8_000_000), // reset journalier géré dans computeValues
    format: 'integer',
    color: 'red',
  },
  {
    id: 'malaria',
    emoji: '🦟',
    label: 'Décès paludisme auj.',
    sub: '~608 000 / an (OMS)',
    baseValue: 0,
    ratePerSecond: ratePerSec(608_000),
    format: 'integer',
    color: 'red',
  },
  {
    id: 'hunger',
    emoji: '🍽️',
    label: 'Sous-alimentés',
    sub: '~9% pop mondiale (FAO)',
    baseValue: 733_000_000,
    ratePerSecond: 0, // valeur statique annuelle
    format: 'integer',
    color: 'red',
  },
  // ── Économie & Tech ──
  {
    id: 'oil',
    emoji: '🛢️',
    label: 'Pétrole extrait (barils)',
    sub: '~100 M barils / jour',
    baseValue: 0,
    ratePerSecond: ratePerSec(36_500_000_000),
    format: 'integer',
    color: 'orange',
  },
  {
    id: 'emails',
    emoji: '📧',
    label: 'Emails envoyés auj.',
    sub: '~330 Md / jour',
    baseValue: 0,
    ratePerSecond: 330_000_000_000 / (24 * 3600),
    format: 'integer',
    color: 'green',
  },
  {
    id: 'internet',
    emoji: '🌐',
    label: 'Utilisateurs Internet',
    sub: '~5,5 Md (Datareportal 2024)',
    baseValue: 5_440_000_000,
    ratePerSecond: ratePerSec(200_000_000),
    format: 'integer',
    color: 'blue',
  },
  {
    id: 'cars',
    emoji: '🚗',
    label: 'Voitures fabriquées',
    sub: '~95 M / an (OICA)',
    baseValue: 0,
    ratePerSecond: ratePerSec(95_000_000),
    format: 'integer',
    color: 'default',
  },
  {
    id: 'phones',
    emoji: '📱',
    label: 'Téléphones vendus',
    sub: '~1,4 Md / an (IDC)',
    baseValue: 0,
    ratePerSecond: ratePerSec(1_400_000_000),
    format: 'integer',
    color: 'green',
  },
]

// ── Format Numbers ─────────────────────────────────────────────

function formatNumber(value: number, format: CounterDef['format']): string {
  if (format === 'decimal-1') {
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  }
  if (format === 'decimal-2') {
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return Math.floor(value).toLocaleString('fr-FR')
}

// ── Counter Card ───────────────────────────────────────────────

function CounterCard({ def, value }: { def: CounterDef; value: number }) {
  return (
    <div
      className={`counter-card counter-card--${def.color}`}
      role="status"
      aria-label={`${def.label} : ${formatNumber(value, def.format)}`}
    >
      <div className="counter-emoji" aria-hidden="true">{def.emoji}</div>
      <div className="counter-label">{def.label}</div>
      <div className="counter-value" aria-live="polite" aria-atomic="true">
        {formatNumber(value, def.format)}
      </div>
      <div className="counter-sub">{def.sub}</div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────

type CounterValues = Record<string, number>

/**
 * Calcule les valeurs initiales de tous les compteurs
 * en fonction des secondes écoulées depuis le 1er janvier.
 */
function computeValues(elapsed: number): CounterValues {
  const values: CounterValues = {}
  // Secondes depuis le début du jour (UTC)
  const now = new Date()
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const elapsedToday = (now.getTime() - dayStart.getTime()) / 1000

  for (const def of COUNTERS) {
    // Compteurs "aujourd'hui" : remise à zéro chaque jour
    const isDailyCounter = ['births', 'deaths', 'tobacco', 'malaria'].includes(def.id)
    const e = isDailyCounter ? elapsedToday : elapsed
    values[def.id] = def.baseValue + def.ratePerSecond * e
  }
  return values
}

export default function WorldometersCounters() {
  const elapsedRef = useRef<number>(0)
  // null pendant le SSR — évite le mismatch d'hydration (timestamps serveur ≠ client)
  const [values, setValues] = useState<CounterValues | null>(null)

  useEffect(() => {
    // Initialisation côté client uniquement
    elapsedRef.current = secondsSinceYearStart()
    setValues(computeValues(elapsedRef.current))

    const interval = setInterval(() => {
      elapsedRef.current += 1
      setValues(computeValues(elapsedRef.current))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Skeleton pendant l'hydration (SSR → client)
  if (values === null) {
    return (
      <section className="counters-section" aria-label="Compteurs mondiaux en temps réel">
        <h2 className="counters-section-title">🌍 Compteurs planétaires — temps réel estimé</h2>
        <div className="counters-grid">
          {COUNTERS.map((def) => (
            <div key={def.id} className="skeleton-card" style={{ height: 110 }} aria-hidden="true" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="counters-section" aria-label="Compteurs mondiaux en temps réel">
      <h2 className="counters-section-title">
        🌍 Compteurs planétaires — temps réel estimé
      </h2>
      <div className="counters-grid">
        {COUNTERS.map((def) => (
          <CounterCard key={def.id} def={def} value={values[def.id]} />
        ))}
      </div>
      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.6rem', fontFamily: 'var(--font-mono)' }}>
        Estimations basées sur les taux annuels officiels ONU/OMS/GIEC/IEA. Mise à jour chaque seconde.
      </p>
    </section>
  )
}
