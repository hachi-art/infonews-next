export default function WorldPoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pole-layout" style={{ '--pole-accent': '#3b82f6', '--pole-accent-bg': 'rgba(59,130,246,0.08)' } as React.CSSProperties}>
      {children}
    </div>
  )
}
