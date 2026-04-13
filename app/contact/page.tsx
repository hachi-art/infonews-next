'use client'

// ============================================================
// app/contact/page.tsx
// Formulaire de contact public — conforme Art. 10 LSSI (ES) / Art. 6 LCEN (FR)
// L'email de destination reste côté serveur (jamais exposé)
// ============================================================

import type { Metadata } from 'next'
import { useState, useRef } from 'react'

// metadata ne peut pas être exporté d'un Client Component
// → géré dans layout ou via generateMetadata si besoin SEO poussé

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function ContactPage() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    const fd = new FormData(e.currentTarget)
    const payload = {
      name:    fd.get('name')    as string,
      email:   fd.get('email')   as string,
      subject: fd.get('subject') as string,
      message: fd.get('message') as string,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        formRef.current?.reset()
      } else {
        setStatus('error')
        setErrorMsg(data.error ?? 'Erreur inconnue.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Impossible de contacter le serveur.')
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: 640 }}>

      <div className="page-header">
        <h1 className="page-title">✉️ Contact</h1>
        <p className="page-description">
          Une question, un signalement de source, un partenariat ?
          Ton message arrivera directement à l&apos;équipe éditoriale.
        </p>
      </div>

      {/* Infos légales */}
      <div style={{
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        background: 'rgba(56,189,248,0.05)',
        border: '1px solid rgba(56,189,248,0.15)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.6rem 1rem',
        marginBottom: '1.8rem',
        lineHeight: 1.6,
      }}>
        📋 <strong>Contact éditorial</strong> — infonews.day · Hébergé par Vercel Inc. (USA) ·
        Aucune donnée stockée · Conformité RGPD / LSSI / LCEN
      </div>

      {status === 'success' ? (
        <div style={{
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <p style={{ fontWeight: 600, color: '#22c55e', marginBottom: '0.3rem' }}>Message envoyé !</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Nous reviendrons vers toi dans les meilleurs délais.
          </p>
          <button
            onClick={() => setStatus('idle')}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1.2rem',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Nouveau message
          </button>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Nom */}
          <div>
            <label htmlFor="name" style={labelStyle}>Nom *</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={100}
              placeholder="Votre nom"
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" style={labelStyle}>Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={200}
              placeholder="votre@email.com"
              style={inputStyle}
            />
          </div>

          {/* Sujet */}
          <div>
            <label htmlFor="subject" style={labelStyle}>Sujet</label>
            <input
              id="subject"
              name="subject"
              type="text"
              maxLength={200}
              placeholder="Signalement · Partenariat · Question · Autre"
              style={inputStyle}
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" style={labelStyle}>Message *</label>
            <textarea
              id="message"
              name="message"
              required
              maxLength={2000}
              rows={6}
              placeholder="Ton message..."
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* Erreur */}
          {status === 'error' && (
            <div style={{
              fontSize: '0.82rem',
              color: '#ef4444',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0.9rem',
            }}>
              ❌ {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'sending'}
            style={{
              padding: '0.7rem 1.5rem',
              background: status === 'sending' ? 'var(--text-muted)' : 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: status === 'sending' ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              alignSelf: 'flex-start',
              transition: 'background 0.2s',
            }}
          >
            {status === 'sending' ? '⏳ Envoi...' : '✉️ Envoyer'}
          </button>

          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            * Champs obligatoires · Ton email ne sera jamais publié
          </p>
        </form>
      )}
    </div>
  )
}

// ── Styles inline ──────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  marginBottom: '0.35rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.85rem',
  background: 'var(--card-bg)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text)',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
}
