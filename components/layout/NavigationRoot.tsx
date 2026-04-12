'use client'

// ============================================================
// components/layout/NavigationRoot.tsx
// Client Component — Gère les états actifs via usePathname()
// Généré depuis NAVIGATION (lib/config/navigation.ts)
// Aucune route codée en dur ici — tout vient du JSON
// ============================================================

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAVIGATION, getPoleByHref, type Pole } from '@/lib/config/navigation'

export default function NavigationRoot() {
  const pathname = usePathname()

  // Pôle actif : trouvé via pathname, fallback sur pôle 0 (World)
  const activePole: Pole = getPoleByHref(pathname) ?? NAVIGATION[0]

  return (
    <header className="nav-root" role="banner">
      {/* ── Barre des pôles (niveau 1) ── */}
      <nav
        className="pole-nav"
        aria-label="Navigation principale — 7 pôles"
      >
        <div className="pole-nav-inner">
          {/* Logo / marque */}
          <Link href="/home" className="nav-brand" aria-label="InfoNews.day — Accueil">
            <span className="nav-brand-icon">📰</span>
            <span className="nav-brand-name">InfoNews<span className="nav-brand-dot">.day</span></span>
          </Link>

          {/* Boutons de pôles */}
          <div className="pole-btns" role="list">
            {NAVIGATION.map((pole) => {
              const isActive = pole.id === activePole.id
              return (
                <Link
                  key={pole.id}
                  href={pole.routes[0].href}
                  role="listitem"
                  aria-current={isActive ? 'true' : undefined}
                  className={`pole-btn${isActive ? ' pole-btn--active' : ''}`}
                  style={
                    {
                      '--pole-accent': pole.accentColor,
                      '--pole-accent-bg': pole.accentBg,
                    } as React.CSSProperties
                  }
                >
                  <span className="pole-btn-icon" aria-hidden="true">
                    {pole.icon}
                  </span>
                  <span className="pole-btn-label">{pole.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* ── Sous-navigation du pôle actif (niveau 2) ── */}
      <nav
        className="sub-nav"
        aria-label={`Navigation — ${activePole.label}`}
        style={
          {
            '--pole-accent': activePole.accentColor,
            '--pole-accent-bg': activePole.accentBg,
          } as React.CSSProperties
        }
      >
        <div className="sub-nav-inner">
          {activePole.routes.map((route) => {
            const isActive = pathname === route.href || pathname.startsWith(route.href + '/')
            return (
              <Link
                key={route.href}
                href={route.href}
                aria-current={isActive ? 'page' : undefined}
                title={route.description}
                className={`sub-btn${isActive ? ' sub-btn--active' : ''}`}
              >
                <span className="sub-btn-icon" aria-hidden="true">
                  {route.icon}
                </span>
                <span className="sub-btn-label">{route.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
