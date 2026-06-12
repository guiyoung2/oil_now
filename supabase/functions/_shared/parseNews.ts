export interface NewsItem {
  title: string
  url: string
  source: string
  published_at: string   // ISO string (pubDate를 ISO로 변환)
  summary: string        // description 150자 truncate (HTML 태그 제거)
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

/** XML 태그 사이 텍스트 추출 (CDATA 포함) */
function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const m = re.exec(xml)
  if (!m) return ''
  const raw = m[1].trim()
  // CDATA 언래핑
  const cdata = /^<!\[CDATA\[([\s\S]*?)]]>$/.exec(raw)
  return cdata ? cdata[1].trim() : raw
}

/** <source> 태그 텍스트 추출 (속성 포함 형태 처리) */
function extractSource(xml: string): string {
  const m = /<source[^>]*>([\s\S]*?)<\/source>/i.exec(xml)
  if (!m) return ''
  const raw = m[1].trim()
  const cdata = /^<!\[CDATA\[([\s\S]*?)]]>$/.exec(raw)
  return cdata ? cdata[1].trim() : raw
}

export function parseNewsRss(xml: string): NewsItem[] {
  // <item>...</item> 블록 분리 (정규식 기반 — Deno + jsdom 모두 동작)
  const itemRe = /<item>([\s\S]*?)<\/item>/gi
  const results: NewsItem[] = []
  let match: RegExpExecArray | null

  while ((match = itemRe.exec(xml)) !== null) {
    const block = match[1]

    const title = decodeHtmlEntities(extractTag(block, 'title'))
    const url   = extractTag(block, 'link')
    if (!title || !url) continue

    const source  = extractSource(block)
    const pubDate = extractTag(block, 'pubDate')
    const rawDesc = extractTag(block, 'description')

    // HTML 태그 제거 → 엔티티 디코딩 → 엔티티 인코딩 태그 재제거 → 150자 truncate
    const stripped  = rawDesc.replace(/<[^>]*>/g, '')
    const decoded   = decodeHtmlEntities(stripped)
    const cleanDesc = decoded.replace(/<[^>]*>/g, '').trim()
    const summary   = cleanDesc.slice(0, 150)

    let published_at: string
    try {
      const d = new Date(pubDate)
      published_at = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
    } catch {
      published_at = new Date().toISOString()
    }

    results.push({ title, url, source, published_at, summary })
  }

  return results
}
