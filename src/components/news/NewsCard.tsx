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
  // >? : 닫는 꺽쇠가 없는 불완전 태그(DB 잘림)도 제거
  return decoded.replace(/<[^>]*>?/g, '').replace(/\s+/g, ' ').trim()
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
  const cleanSummary = item.summary ? decodeAndStrip(item.summary) : ''

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {item.source}
        </span>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>{formatElapsed(item.published_at)}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </div>
      </div>
      <p className="line-clamp-2 font-semibold leading-snug text-gray-900">
        {decodeAndStrip(item.title)}
      </p>
      {cleanSummary && (
        <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">{cleanSummary}</p>
      )}
    </a>
  )
}
