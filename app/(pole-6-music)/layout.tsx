export default function MusicPoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pole-layout" style={{ '--pole-accent': '#f97316', '--pole-accent-bg': 'rgba(249,115,22,0.08)' } as React.CSSProperties}>
      {children}
    </div>
  )
}
