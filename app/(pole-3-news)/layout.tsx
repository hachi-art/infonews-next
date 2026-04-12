export default function NewsPoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pole-layout" style={{ '--pole-accent': '#ef4444', '--pole-accent-bg': 'rgba(239,68,68,0.08)' } as React.CSSProperties}>
      {children}
    </div>
  )
}
