// ============================================================
// lib/config/navigation.ts — Source de vérité unique du routing
// infonews.day v10 | 7 pôles | 28 pages
// Modifier ici = mis à jour partout (nav, sitemap, breadcrumbs)
// ============================================================

export type Route = {
  label: string
  href: string
  icon: string
  description: string
  /** Sources principales affichées sur la page */
  sources?: string[]
}

export type Pole = {
  id: string
  label: string
  icon: string
  /** Couleur d'accent CSS — utilisée via var(--pole-accent) */
  accentColor: string
  /** Couleur de fond subtile pour la sub-nav active */
  accentBg: string
  routes: Route[]
}

export const NAVIGATION: Pole[] = [
  // ── PÔLE 1 ─ World Pulse ────────────────────────────────────
  {
    id: 'world',
    label: 'World Pulse',
    icon: '🌍',
    accentColor: '#3b82f6',
    accentBg: 'rgba(59,130,246,0.08)',
    routes: [
      {
        label: 'Home',
        href: '/home',
        icon: '🏠',
        description: 'Ticker Finance/Crypto, Assistant IA central, Dashboard Worldometers',
        sources: ['Worldometers', 'CoinGecko', 'Yahoo Finance'],
      },
      {
        label: 'Globe 3D',
        href: '/globe-3d',
        icon: '🌐',
        description: 'Vue satellite NASA, Radars météo temps réel, Alertes Séismes & Tsunamis',
        sources: ['NASA', 'USGS', 'GDACS', 'OpenWeather'],
      },
      {
        label: 'Mobility Live',
        href: '/mobility',
        icon: '✈️',
        description: 'Radars de vols (Air), Trafic maritime (Sea) et Fret ferroviaire',
        sources: ['OpenSky Network', 'MarineTraffic', 'NOAA Ocean'],
      },
    ],
  },

  // ── PÔLE 2 ─ Éco, Marchés & Pouvoir ────────────────────────
  {
    id: 'eco',
    label: 'Éco & Marchés',
    icon: '💹',
    accentColor: '#22c55e',
    accentBg: 'rgba(34,197,94,0.08)',
    routes: [
      {
        label: 'Stocks West',
        href: '/stocks-west',
        icon: '📈',
        description: 'Indices Occidentaux — S&P500, Nasdaq, CAC40, DAX',
        sources: ['Yahoo Finance', 'Alpha Vantage'],
      },
      {
        label: 'Stocks Global',
        href: '/stocks-global',
        icon: '🌏',
        description: 'Indices Asie (Shanghai, Nikkei), Inde, Afrique et BRICS',
        sources: ['Yahoo Finance', 'World Bank'],
      },
      {
        label: 'Commodities',
        href: '/commodities',
        icon: '⚡',
        description: "Cours de l'Or, Argent, Pétrole, Gaz, Lithium et Matières Agricoles",
        sources: ['Alpha Vantage', 'Yahoo Finance'],
      },
      {
        label: 'Banking Reports',
        href: '/banking-institutions',
        icon: '🏦',
        description: 'Flux officiels FED, BCE, FMI, Banque Mondiale et NDB',
        sources: ['FED', 'BCE', 'FMI', 'World Bank', 'NDB'],
      },
    ],
  },

  // ── PÔLE 3 ─ Newsroom ───────────────────────────────────────
  {
    id: 'news',
    label: 'Newsroom',
    icon: '📡',
    accentColor: '#ef4444',
    accentBg: 'rgba(239,68,68,0.08)',
    routes: [
      {
        label: 'Western Press',
        href: '/western-press',
        icon: '🗞️',
        description: 'Flux Reuters, AFP, AP, BBC, The Guardian',
        sources: ['Reuters', 'AFP', 'AP', 'BBC', 'The Guardian'],
      },
      {
        label: 'Eastern Press',
        href: '/eastern-press',
        icon: '🀄',
        description: 'Flux Xinhua (Chine), TASS (Russie), NHK (Japon), Yonhap (Corée)',
        sources: ['Xinhua ⚠️', 'TASS ⚠️', 'NHK', 'Yonhap'],
      },
      {
        label: 'MENA & Türkiye',
        href: '/mena-turkiye',
        icon: '🌙',
        description: 'Flux Al Jazeera, TRT World, Anadolu Agency',
        sources: ['Al Jazeera', 'TRT World', 'Anadolu Agency'],
      },
      {
        label: 'South Pulse',
        href: '/south-pulse',
        icon: '🌍',
        description: "Flux AfricaNews, AllAfrica, Telesur, MercoPress",
        sources: ['AfricaNews', 'AllAfrica', 'Telesur', 'MercoPress'],
      },
      {
        label: 'Editorial IA',
        href: '/editorial-ai',
        icon: '✍️',
        description: 'Analyses de journaliste citoyen synthétisées par IA avec sources citées',
        sources: ['Claude AI', 'Toutes sources actives'],
      },
    ],
  },

  // ── PÔLE 4 ─ Screen & Stream ────────────────────────────────
  {
    id: 'screen',
    label: 'Screen & Stream',
    icon: '🎭',
    accentColor: '#a855f7',
    accentBg: 'rgba(168,85,247,0.08)',
    routes: [
      {
        label: 'Streaming Guide',
        href: '/streaming-guide',
        icon: '📺',
        description: "Sorties Netflix, Disney+, HBO, Amazon Prime via JustWatch",
        sources: ['JustWatch', 'TMDB'],
      },
      {
        label: 'Box Office',
        href: '/box-office',
        icon: '🎬',
        description: 'Actualités Hollywood, Variety, Rotten Tomatoes et chiffres Cinéma',
        sources: ['TMDB', 'Variety', 'Rotten Tomatoes'],
      },
      {
        label: 'Sports Live',
        href: '/sports-live',
        icon: '⚽',
        description: 'Actu DAZN, beIN Sports, résultats mondiaux et droits TV',
        sources: ['TheSportsDB', 'ESPN', 'BBC Sport'],
      },
      {
        label: 'Events Agenda',
        href: '/events-agenda',
        icon: '🎪',
        description: 'Sorties et événements (Dice, RA, Fever) par géolocalisation',
        sources: ['Dice', 'Resident Advisor', 'Fever', 'Wikipedia'],
      },
    ],
  },

  // ── PÔLE 5 ─ Tech, Science & Terre ─────────────────────────
  {
    id: 'tech',
    label: 'Tech & Science',
    icon: '🔬',
    accentColor: '#06b6d4',
    accentBg: 'rgba(6,182,212,0.08)',
    routes: [
      {
        label: 'Big Tech & IA',
        href: '/big-tech-ai',
        icon: '🤖',
        description: 'Actu GAFAM, OpenAI, DeepMind et nouveaux modèles IA',
        sources: ['TechCrunch', 'HackerNews', 'OpenAI Blog', 'ArXiv cs.AI'],
      },
      {
        label: 'Cyber Alerts',
        href: '/cyber-alerts',
        icon: '🛡️',
        description: 'Veille Cybersécurité, Legal Hackers et alertes failles mondiales',
        sources: ['BleepingComputer', 'CVE Database', 'CERT'],
      },
      {
        label: 'Space & Ocean',
        href: '/space-ocean',
        icon: '🛸',
        description: 'NASA, ESA, CNSA, Radars NOAA et météo spatiale',
        sources: ['NASA APOD', 'ESA', 'Launch Library 2', 'NOAA'],
      },
      {
        label: 'Health Watch',
        href: '/health-watch',
        icon: '🏥',
        description: 'Flux OMS (WHO), rapports sanitaires et recherche médicale',
        sources: ['WHO/OMS', 'ArXiv q-bio', 'CDC'],
      },
    ],
  },

  // ── PÔLE 6 ─ Music, Culture & Mémoire ──────────────────────
  {
    id: 'music',
    label: 'Music & Culture',
    icon: '🎵',
    accentColor: '#f97316',
    accentBg: 'rgba(249,115,22,0.08)',
    routes: [
      {
        label: 'Music Stream',
        href: '/music-stream',
        icon: '🎶',
        description: 'Charts Spotify, SoundCloud, YouTube Music',
        sources: ['Deezer', 'Billboard', 'YouTube Music'],
      },
      {
        label: 'Music Pro DJ',
        href: '/music-pro-dj',
        icon: '🎧',
        description: 'Plateformes pro (Beatport, Tidal Hi-Fi, Traxsource)',
        sources: ['Beatport', 'Tidal', 'Traxsource'],
      },
      {
        label: 'World Radios',
        href: '/world-radios',
        icon: '📻',
        description: 'Flux Radio Garden + Podcasts (BBC, RFI, FT, Huberman)',
        sources: ['Radio Garden', 'BBC Podcasts', 'RFI', 'FT News'],
      },
      {
        label: 'Literary & Manga',
        href: '/literary-manga',
        icon: '📚',
        description: 'Glénat, Tohei, Marvel, Arte et recommandations de lecture',
        sources: ['Glénat', 'Marvel', 'Arte', 'Open Library'],
      },
      {
        label: 'Time Machine',
        href: '/time-machine',
        icon: '⏳',
        description: 'Archives historiques, Musées (Louvre/Met) et Data du passé',
        sources: ['Wikipedia', 'Chronicling America', 'Louvre', 'Met Museum'],
      },
    ],
  },

  // ── PÔLE 7 ─ Social, Intelligence & Légal ──────────────────
  {
    id: 'social',
    label: 'Social & Légal',
    icon: '🌐',
    accentColor: '#64748b',
    accentBg: 'rgba(100,116,139,0.08)',
    routes: [
      {
        label: 'Social Trends',
        href: '/social-trends',
        icon: '📊',
        description: 'Tendances mondiales X (Twitter), TikTok, Instagram, Reddit',
        sources: ['Reddit RSS', 'Wikipedia Trending', 'Google Trends'],
      },
      {
        label: 'CIA & NGO Vault',
        href: '/cia-ngo-vault',
        icon: '🕵️',
        description: 'Archives déclassifiées CIA (FOIA), rapports Amnesty, Transparency',
        sources: ['CIA FOIA', 'Amnesty', 'HRW', 'Transparency Int.'],
      },
      {
        label: 'Legal Transparency',
        href: '/legal-transparency',
        icon: '⚖️',
        description: 'Page de Transparence Totale — 100+ APIs listées, Copyright © 2026',
        sources: ['100+ APIs référencées'],
      },
    ],
  },
]

/** Helpers dérivés — calculés une seule fois au build */
export const ALL_ROUTES = NAVIGATION.flatMap((pole) =>
  pole.routes.map((route) => ({ ...route, poleId: pole.id, poleLabel: pole.label }))
)

export const ROUTE_MAP = new Map(ALL_ROUTES.map((r) => [r.href, r]))

export function getPoleByHref(href: string): Pole | undefined {
  return NAVIGATION.find((pole) => pole.routes.some((r) => r.href === href || href.startsWith(r.href + '/')))
}
