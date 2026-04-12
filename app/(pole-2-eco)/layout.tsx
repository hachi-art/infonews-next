export default function EcoPoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pole-layout" style={{ '--pole-accent': '#22c55e', '--pole-accent-bg': 'rgba(34,197,94,0.08)' } as React.CSSProperties}>
      {children}
    </div>
  )
}
