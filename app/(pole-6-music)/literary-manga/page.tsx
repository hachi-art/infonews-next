import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Literary & Manga — Glénat, Marvel & Arte',
  description: 'Recommandations de lecture, Glénat, Tohei Animation, Marvel Comics et Arte.',
}

export default function LiteraryMangaPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📚 Literary & Manga</h1>
        <p className="page-description">
          Glénat · Tohei Animation · Marvel · Arte · Open Library
        </p>
        <div className="page-sources">
          {['Glénat', 'Marvel', 'Arte', 'Open Library'].map((s) => (
            <span key={s} className="source-badge">{s}</span>
          ))}
        </div>
      </div>
      {/* TODO: ComicsGrid + MangaReleases + ArteWidget — portage + enrichissement depuis s-art */}
    </div>
  )
}
