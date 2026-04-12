export default function TechPoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pole-layout" style={{ '--pole-accent': '#06b6d4', '--pole-accent-bg': 'rgba(6,182,212,0.08)' } as React.CSSProperties}>
      {children}
    </div>
  )
}
