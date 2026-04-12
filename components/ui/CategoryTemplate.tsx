'use client'

// ============================================================
// components/ui/CategoryTemplate.tsx
// Template générique pour les 28 pages.
// Gère : header, sources, état de chargement (skeletons),
// état d'erreur avec bouton retry, et slot children.
// ============================================================

import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'

// ── Types ─────────────────────────────────────────────────────

type SkeletonConfig = {
  /** Nombre de cartes skeleton à afficher en chargement */
  cards?: number
  /** Type de layout skeleton */
  layout?: 'grid' | 'list' | 'counters'
}

type CategoryTemplateProps = {
  /** Titre affiché en h1 avec font-serif */
  title: string
  /** Emoji préfixant le titre */
  icon: string
  /** Sous-titre descriptif */
  description: string
  /** Badges sources affichés dans le header */
  sources: string[]
  /** Contenu principal de la page */
  children: ReactNode
  /** Affiche les skeletons à la place du contenu */
  isLoading?: boolean
  /** Affiche l'état d'erreur si non null */
  error?: string | null
  /** Callback appelé lors du clic sur "Réessayer" */
  onRetry?: () => void
  /** Config des skeletons en mode loading */
  skeletonConfig?: SkeletonConfig
  /** Slot optionnel affiché sous le header (filtres, actions…) */
  toolbar?: ReactNode
}

// ── Skeleton Components ───────────────────────────────────────

function SkeletonCard() {
  return <div className="skeleton-card" aria-hidden="true" />
}

function SkeletonCounterCard() {
  return (
    <div className="card" style={{ padding: '0.85rem 1rem' }} aria-hidden="true">
      <div className="skeleton skeleton-badge" style={{ width: 28, height: 28, borderRadius: '50%', marginBottom: 8 }} />
      <div className="skeleton skeleton-text" style={{ width: '70%', height: '0.7em', marginBottom: 6 }} />
      <div className="skeleton skeleton-text" style={{ width: '90%', height: '1.1em', marginBottom: 4 }} />
      <div className="skeleton skeleton-text" style={{ width: '50%', height: '0.65em' }} />
    </div>
  )
}

function SkeletonListItem() {
  return (
    <div className="card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem' }} aria-hidden="true">
      <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="skeleton skeleton-title" style={{ height: '0.9em' }} />
        <div className="skeleton skeleton-text" style={{ height: '0.75em' }} />
        <div className="skeleton skeleton-text" style={{ width: '40%', height: '0.65em' }} />
      </div>
    </div>
  )
}

function LoadingSkeleton({ config }: { config: SkeletonConfig }) {
  const count = config.cards ?? 6

  if (config.layout === 'counters') {
    return (
      <div className="counters-grid" aria-label="Chargement…" aria-busy="true">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCounterCard key={i} />
        ))}
      </div>
    )
  }

  if (config.layout === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
           aria-label="Chargement…" aria-busy="true">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    )
  }

  // Default: grid
  return (
    <div className="grid-auto" aria-label="Chargement…" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

// ── Error State ───────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="cat-error" role="alert">
      <span className="cat-error-icon">⚠️</span>
      <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Erreur de chargement</p>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 360 }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="cat-error-retry">
          ↺ Réessayer
        </button>
      )}
    </div>
  )
}

// ── Header Skeleton (for loading state) ──────────────────────

function HeaderSkeleton() {
  return (
    <div className="page-header" aria-hidden="true">
      <div className="skeleton skeleton-title" style={{ marginBottom: 10, height: '1.75rem', width: '40%' }} />
      <div className="skeleton skeleton-text" style={{ marginBottom: 12, width: '65%', height: '0.85rem' }} />
      <div style={{ display: 'flex', gap: 6 }}>
        {[80, 100, 70].map((w, i) => (
          <div key={i} className="skeleton skeleton-badge" style={{ width: w }} />
        ))}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────

export default function CategoryTemplate({
  title,
  icon,
  description,
  sources,
  children,
  isLoading = false,
  error = null,
  onRetry,
  skeletonConfig = { cards: 6, layout: 'grid' },
  toolbar,
}: CategoryTemplateProps) {
  return (
    <div className="page-container">

      {/* ── Header ── */}
      {isLoading ? (
        <HeaderSkeleton />
      ) : (
        <div className="page-header">
          <h1 className="page-title">
            <span aria-hidden="true">{icon}</span> {title}
          </h1>
          <p className="page-description">{description}</p>
          <div className="page-sources" role="list" aria-label="Sources">
            {sources.map((s) => (
              <span key={s} className="source-badge" role="listitem">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Toolbar (filtres, actions…) ── */}
      {toolbar && !isLoading && !error && (
        <div style={{ marginBottom: '1.25rem' }}>{toolbar}</div>
      )}

      {/* ── Contenu principal ── */}
      {error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : isLoading ? (
        <LoadingSkeleton config={skeletonConfig} />
      ) : (
        children
      )}
    </div>
  )
}

// ── Hook utilitaire ───────────────────────────────────────────

/**
 * useDataFetcher — mini-hook pour gérer loading/error/retry
 * dans les composants pages qui font du fetch côté client.
 */
export function useDataFetcher<T>(
  fetcher: () => Promise<T>,
  initialData: T
): {
  data: T
  isLoading: boolean
  error: string | null
  retry: () => void
} {
  const [data, setData] = useState<T>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }, [fetcher])

  return { data, isLoading, error, retry: load }
}
