// ============================================================
// app/api/chat/route.ts — Globe-Guide IA Backend
// Reçoit : { messages, currentPage, lang, pageHeadlines? }
// Retourne : stream text/plain (lecture token par token côté client)
//
// Contexte de page :
//   - pageHeadlines envoyés par le client (titres de la page active)
//   - Fallback : description statique tirée de navigation.ts
// ============================================================

import Anthropic from '@anthropic-ai/sdk'
import { ROUTE_MAP } from '@/lib/config/navigation'
import { NextRequest } from 'next/server'

// Runtime Edge pour la latence minimale sur le streaming
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ── Types ─────────────────────────────────────────────────────

type IncomingMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ChatBody = {
  messages: IncomingMessage[]
  currentPage?: string
  lang?: string
  pageHeadlines?: string[]
}

// ── Prompt système ────────────────────────────────────────────

function buildSystemPrompt(
  currentPage: string,
  pageHeadlines: string[],
  lang: string,
): string {
  const routeInfo = ROUTE_MAP.get(currentPage)
  const pageLabel   = routeInfo?.label       ?? 'InfoNews.day'
  const pageDesc    = routeInfo?.description ?? "portail d'actualité mondiale"
  const pageSources = routeInfo?.sources?.join(', ') ?? 'sources multiples'

  const headlinesBlock =
    pageHeadlines.length > 0
      ? `\nActualités visibles sur cette page en ce moment :\n${pageHeadlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}`
      : ''

  const languageInstruction =
    lang === 'fr'
      ? "Réponds toujours en français, de façon concise et factuelle."
      : `Réponds en ${lang}, de façon concise et factuelle.`

  return `Tu es Globe-Guide, l'assistant IA intégré à InfoNews.day — un portail d'actualité mondiale en temps réel.
Tu aides l'utilisateur à comprendre l'actualité, analyser les événements, et naviguer entre les pôles d'information.

Page active : "${pageLabel}" — ${pageDesc}
Sources de cette page : ${pageSources}${headlinesBlock}

Consignes :
- ${languageInstruction}
- Tes réponses sont courtes (3-6 phrases max) sauf si l'utilisateur demande une analyse longue.
- Tu ne fabrices jamais de faits. Si tu ne sais pas, dis-le.
- Tu peux suggérer d'autres pages InfoNews.day pertinentes.
- Aucune donnée personnelle n'est stockée — tu n'as accès qu'à la conversation de cette session.
- Tu n'effectues aucune action réelle (pas d'achat, pas de commande, pas de partage).`
}

// ── Route Handler ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ChatBody
    const { messages = [], currentPage = '/home', lang = 'fr', pageHeadlines = [] } = body

    // Validation minimale
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages requis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return new Response(
        "Globe-Guide non configuré (ANTHROPIC_API_KEY manquante). Ajoutez-la dans .env.local.",
        { status: 503, headers: { 'Content-Type': 'text/plain' } },
      )
    }

    // Filtre et sanitize les messages (évite injection de rôle 'system')
    const safeMessages = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .filter((m) => typeof m.content === 'string' && m.content.trim().length > 0)
      .slice(-20) // max 20 messages d'historique
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))

    const systemPrompt = buildSystemPrompt(currentPage, pageHeadlines, lang)

    // Stream Anthropic → Response stream
    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001', // rapide + économique pour le chat
      max_tokens: 1024,
      system: systemPrompt,
      messages: safeMessages,
    })

    // Encode le stream en text/plain (token par token)
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
        } catch (e) {
          controller.error(e)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Accel-Buffering': 'no', // désactive le buffering Nginx
      },
    })

  } catch (e) {
    console.error('[/api/chat]', e)
    return new Response(
      JSON.stringify({ error: 'Erreur serveur interne' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
