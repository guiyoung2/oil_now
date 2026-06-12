import type { NewsItem } from '../../hooks/useNews'

function decodeAndStrip(text: string): string {
  const decoded = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
  return decoded.replace(/<[^>]*>/g, '')
}

function formatElapsed(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffH = Math.floor(diffMs / 3600000)
  if (diffH < 1) return '방금 전'
  if (diffH < 24) return `${diffH}시간 전`
  const diffD = Math.floor(diffH / 24)
  return `${diffD}일 전`
}

interface Props {
  item: NewsItem
}

export function NewsCard({ item }: Props) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 active:bg-gray-100"
    >
      <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
        <span>{item.source}</span>
        <span>{formatElapsed(item.published_at)}</span>
      </div>
      <p className="mb-1 font-medium leading-snug text-gray-900">{decodeAndStrip(item.title)}</p>
      {item.summary && (
        <p className="line-clamp-2 text-sm text-gray-600">{decodeAndStrip(item.summary)}</p>
      )}
    </a>
  )
}
