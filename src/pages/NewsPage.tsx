import { useNews } from '../hooks/useNews'
import { NewsCard } from '../components/news/NewsCard'

function NewsSkeleton() {
  return (
    <div data-testid="news-skeleton" className="animate-pulse motion-reduce:animate-none rounded-xl border border-line bg-white p-4 shadow-[0_2px_12px_rgba(20,80,50,0.08)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-5 w-20 rounded-full bg-gray-200" />
        <div className="h-4 w-12 rounded bg-gray-200" />
      </div>
      <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
      <div className="mb-1 h-4 w-full rounded bg-gray-200" />
      <div className="h-4 w-2/3 rounded bg-gray-200" />
    </div>
  )
}

export function NewsPage() {
  const { data: news, isLoading, isError } = useNews()

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-sheet">
      <div className="sticky top-0 z-10 border-b border-line bg-white px-4 py-3">
        <h1 className="text-base font-bold text-ink">유가 뉴스</h1>
        {!isLoading && !isError && news && (
          <p className="text-xs text-sub">최신 {news.length}건</p>
        )}
      </div>
      <div className="space-y-3 p-4">
        {isLoading && (
          <>
            <NewsSkeleton />
            <NewsSkeleton />
            <NewsSkeleton />
          </>
        )}
        {isError && (
          <p className="py-8 text-center text-sm text-sub">뉴스를 불러오지 못했습니다</p>
        )}
        {!isLoading && !isError && news?.length === 0 && (
          <p className="py-8 text-center text-sm text-sub">등록된 뉴스가 없습니다</p>
        )}
        {news?.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
