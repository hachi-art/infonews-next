'use client'

// ============================================================
// components/ai/GlobeGuide.tsx — Agent IA flottant
// RÈGLE STRICTE : historique en sessionStorage uniquement.
// Zéro base de données, zéro cookie, zéro tracking.
// Vercel AI SDK — à connecter à /api/chat (Server Action)
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'

type Role = 'user' | 'assistant' | 'system'

type Message = {
  id: string
  role: Role
  content: string
  timestamp: number
}

const SESSION_KEY = 'globe-guide-history'

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function GlobeGuide() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Chargement depuis sessionStorage (côté client uniquement) ──
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Message[]
        setMessages(parsed)
      }
    } catch {
      // sessionStorage indisponible (mode privé strict) — on ignore
    }
  }, [])

  // ── Persistance dans sessionStorage à chaque message ──────────
  useEffect(() => {
    if (messages.length === 0) return
    try {
      // On garde les 50 derniers messages pour éviter la saturation
      const toSave = messages.slice(-50)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(toSave))
    } catch {
      // sessionStorage plein — on ignore silencieusement
    }
  }, [messages])

  // ── Scroll automatique vers le bas ────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ── Focus sur l'input à l'ouverture ──────────────────────────
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // ── Envoi d'un message ────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({
            role,
            content,
          })),
          currentPage: pathname,
          lang: 'fr',
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status}`)
      }

      // Lecture du stream SSE (Vercel AI SDK format)
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          assistantContent += chunk
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id ? { ...m, content: assistantContent } : m
            )
          )
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, pathname])

  // ── Effacer l'historique ──────────────────────────────────────
  const handleClear = () => {
    setMessages([])
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      // ignore
    }
  }

  return (
    // z-index 9999 — toujours au-dessus de tout le contenu
    <div className="globe-guide-root" style={{ zIndex: 9999 }}>
      {/* ── Panneau de chat ── */}
      {open && (
        <div className="globe-guide-panel" role="dialog" aria-label="Globe-Guide — Assistant IA">
          {/* Header */}
          <div className="globe-guide-header">
            <span className="globe-guide-title">
              <span aria-hidden="true">🌐</span> Globe-Guide IA
            </span>
            <div className="globe-guide-header-actions">
              {messages.length > 0 && (
                <button
                  onClick={handleClear}
                  className="globe-guide-clear-btn"
                  title="Effacer l'historique de session"
                  aria-label="Effacer l'historique"
                >
                  🗑️
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="globe-guide-close-btn"
                aria-label="Fermer Globe-Guide"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="globe-guide-messages" role="log" aria-live="polite">
            {messages.length === 0 && (
              <div className="globe-guide-empty">
                <p>Posez une question sur l&apos;actualité mondiale.</p>
                <p className="globe-guide-empty-sub">
                  Historique de session uniquement — aucune donnée conservée.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`globe-guide-msg globe-guide-msg--${msg.role}`}
              >
                <span className="globe-guide-msg-role" aria-hidden="true">
                  {msg.role === 'user' ? '👤' : '🌐'}
                </span>
                <p className="globe-guide-msg-content">{msg.content}</p>
              </div>
            ))}

            {loading && (
              <div className="globe-guide-msg globe-guide-msg--assistant">
                <span aria-hidden="true">🌐</span>
                <div className="globe-guide-typing" aria-label="En train de répondre…">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {error && (
              <div className="globe-guide-error" role="alert">
                ⚠️ {error}
              </div>
            )}

            <div ref={bottomRef} aria-hidden="true" />
          </div>

          {/* Input */}
          <div className="globe-guide-input-row">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Votre question… (Entrée pour envoyer)"
              className="globe-guide-input"
              disabled={loading}
              aria-label="Message pour Globe-Guide"
              maxLength={1000}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="globe-guide-send-btn"
              aria-label="Envoyer"
            >
              {loading ? '⏳' : '↑'}
            </button>
          </div>
        </div>
      )}

      {/* ── Bouton flottant ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`globe-guide-trigger${open ? ' globe-guide-trigger--open' : ''}`}
        aria-label={open ? 'Fermer Globe-Guide IA' : 'Ouvrir Globe-Guide IA'}
        aria-expanded={open}
      >
        <span aria-hidden="true">{open ? '✕' : '🌐'}</span>
        {!open && <span className="globe-guide-trigger-label">Globe-Guide</span>}
      </button>
    </div>
  )
}
