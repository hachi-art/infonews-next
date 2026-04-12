export default function SocialPoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pole-layout" style={{ '--pole-accent': '#64748b', '--pole-accent-bg': 'rgba(100,116,139,0.08)' } as React.CSSProperties}>
      {children}
    </div>
  )
}
