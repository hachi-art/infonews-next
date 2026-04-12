// ============================================================
// lib/services/rssService.ts
// Parser RSS 2.0 + Atom 1.0 — fetch natif, zéro dépendances.
// Gère : CDATA, tags namespaced (gdacs:, georss:, media:),
//        enclosure, <link href="...">, pubDate/published/updated.
// ============================================================

export type RssItem = {
  id: string
  title: string
  url: string
  description: string
  publishedAt: string
  imageUrl: string | null
  source: string
  badge: string
}

// ── Helpers XML ───────────────────────────────────────────────

function extractCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
}

/** Extrait le texte d'un tag XML (supporte namespaces avec ':') */
export function getTag(block: string, tag: string): string {
  const esc = tag.replace(/:/g, '\\:')
  const re = new RegExp(`<${esc}(?:\\s[^>]*)?>([\\s\\S]*?)</${esc}>`, 'i')
  const m = block.match(re)
  return m ? extractCdata(m[1]).trim() : ''
}

/** Extrait un attribut d'un tag self-closing ou non */
export function getAttr(block: string, tag: string, attr: string): string {
  const esc = tag.replace(/:/g, '\\:')
  const re = new RegExp(`<${esc}[^>]*\\s${attr}=["']([^"']+)["']`, 'i')
  const m = block.match(re)
  return m ? m[1] : ''
}

/** Découpe le XML en blocs <tag>…</tag> */
function splitBlocks(xml: string, tag: string): string[] {
  const blocks: string[] = []
  const openRe = new RegExp(`<${tag}(?:\\s[^>]*)?>`, 'gi')
  const closeTag = `</${tag}>`
  let match: RegExpExecArray | null
  while ((match = openRe.exec(xml)) !== null) {
    const start = match.index + match[0].length
    const closeIdx = xml.indexOf(closeTag, start)
    if (closeIdx >= 0) blocks.push(xml.slice(start, closeIdx))
  }
  return blocks
}

function getLink(block: string): string {
  // Atom : <link href="..." /> ou <link rel="alternate" href="..." />
  const atomAlt = block.match(/<link[^>]+rel=["']alternate["'][^>]+href=["']([^"']+)["']/i)
  if (atomAlt) return atomAlt[1]
  const atomHref = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i)
  if (atomHref) return atomHref[1]
  // RSS 2.0 : <link>url</link>
  const rss = block.match(/<link>([^<]+)<\/link>/i)
  if (rss) return rss[1].trim()
  return ''
}

function getDate(block: string): string {
  const raw = getTag(block, 'pubDate')
    || getTag(block, 'published')
    || getTag(block, 'updated')
    || getTag(block, 'dc:date')
  if (!raw) return new Date().toISOString()
  try { return new Date(raw).toISOString() }
  catch { return new Date().toISOString() }
}

function getImage(block: string): string | null {
  const media = block.match(/<media:content[^>]+url=["']([^"']+)["']/i)
  if (media) return media[1]
  const thumb = block.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i)
  if (thumb) return thumb[1]
  const enc = block.match(/<enclosure[^>]+url=["']([^"']+\.(jpg|jpeg|png|webp)[^"']*)["']/i)
  if (enc) return enc[1]
  const img = block.match(/src=["']([^"']+\.(jpg|jpeg|png|webp))["']/i)
  if (img) return img[1]
  return null
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()
}

// ── Déduplication ─────────────────────────────────────────────

function normKey(s: string): string {
  return s.toLowerCase().replace(/[^\w]/g, '').slice(0, 70)
}

export function mergeAndDeduplicate(articles: RssItem[], limit = 60): RssItem[] {
  articles.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
  const seenUrls = new Set<string>()
  const seenTitles = new Set<string>()
  return articles.filter((a) => {
    let urlKey = a.url
    try { const u = new URL(a.url); urlKey = u.hostname + u.pathname } catch { /* ok */ }
    const titleKey = normKey(a.title)
    if (seenUrls.has(urlKey) || seenTitles.has(titleKey)) return false
    seenUrls.add(urlKey)
    seenTitles.add(titleKey)
    return true
  }).slice(0, limit)
}

// ── Fetch principal ───────────────────────────────────────────

export async function fetchRssFeed(
  url: string,
  source: string,
  badge: string,
  limit = 15,
): Promise<RssItem[]> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      headers: {
        'User-Agent': 'infonews.day/10.0 (+https://infonews.day)',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()

    const isAtom = /<feed[\s>]/.test(xml) || /<entry[\s>]/.test(xml)
    const tag = isAtom ? 'entry' : 'item'
    const blocks = splitBlocks(xml, tag)

    return blocks.slice(0, limit).map((block) => {
      const title = stripHtml(getTag(block, 'title')) || 'Sans titre'
      const urlVal = getLink(block) || getTag(block, 'id')
      const description = stripHtml(
        getTag(block, 'description') || getTag(block, 'summary') || getTag(block, 'content')
      ).slice(0, 220)
      const publishedAt = getDate(block)
      const imageUrl = getImage(block)
      const id = getTag(block, 'guid') || getTag(block, 'id') || urlVal

      return { id, title, url: urlVal, description, publishedAt, imageUrl, source, badge }
    }).filter((a) => Boolean(a.url))

  } catch (e) {
    console.warn(`[RSS ${source}]`, e instanceof Error ? e.message : String(e))
    return []
  }
}
