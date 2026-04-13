// ============================================================
// app/api/contact/route.ts
// Endpoint formulaire de contact — envoi via Resend
// TO: sebmrqtx@gmail.com (privé, jamais exposé publiquement)
// FROM: contact@infonews.day (domaine vérifié Resend requis)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TO_EMAIL = 'sebmrqtx@gmail.com'
const FROM_EMAIL = 'contact@infonews.day'

// Validation basique anti-spam
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length < 200
}

function sanitize(str: string, max: number): string {
  return str.replace(/<[^>]*>/g, '').trim().slice(0, max)
}

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Service indisponible.' }, { status: 503 })
  }

  let body: { name?: string; email?: string; subject?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  const name    = sanitize(body.name    ?? '', 100)
  const email   = sanitize(body.email   ?? '', 200)
  const subject = sanitize(body.subject ?? '', 200)
  const message = sanitize(body.message ?? '', 2000)

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
  }

  const emailSubject = subject
    ? `[InfoNews.day] ${subject}`
    : `[InfoNews.day] Message de ${name}`

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <div style="background:#0f172a;padding:1.2rem 1.5rem;border-radius:8px 8px 0 0">
        <span style="color:#38bdf8;font-weight:700;font-size:1.1rem">InfoNews.day</span>
        <span style="color:#94a3b8;font-size:0.85rem;margin-left:0.8rem">Formulaire de contact</span>
      </div>
      <div style="border:1px solid #e2e8f0;border-top:none;padding:1.5rem;border-radius:0 0 8px 8px">
        <table style="width:100%;border-collapse:collapse;margin-bottom:1.2rem">
          <tr>
            <td style="padding:0.4rem 0.8rem 0.4rem 0;color:#64748b;font-size:0.85rem;white-space:nowrap">Nom</td>
            <td style="padding:0.4rem 0;font-weight:500">${name}</td>
          </tr>
          <tr>
            <td style="padding:0.4rem 0.8rem 0.4rem 0;color:#64748b;font-size:0.85rem">Email</td>
            <td style="padding:0.4rem 0"><a href="mailto:${email}" style="color:#3b82f6">${email}</a></td>
          </tr>
          ${subject ? `<tr>
            <td style="padding:0.4rem 0.8rem 0.4rem 0;color:#64748b;font-size:0.85rem">Sujet</td>
            <td style="padding:0.4rem 0">${subject}</td>
          </tr>` : ''}
        </table>
        <div style="background:#f8fafc;border-left:3px solid #38bdf8;padding:1rem;border-radius:0 6px 6px 0;white-space:pre-wrap;font-size:0.9rem;line-height:1.6">${message}</div>
        <p style="font-size:0.75rem;color:#94a3b8;margin-top:1.5rem">
          Envoyé depuis infonews.day · ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
        </p>
      </div>
    </div>
  `

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: emailSubject,
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact] Resend error:', err)
    return NextResponse.json({ error: 'Échec de l\'envoi. Réessaie plus tard.' }, { status: 500 })
  }
}
