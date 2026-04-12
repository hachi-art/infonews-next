export default function ScreenPoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pole-layout" style={{ '--pole-accent': '#a855f7', '--pole-accent-bg': 'rgba(168,85,247,0.08)' } as React.CSSProperties}>
      {children}
    </div>
  )
}
