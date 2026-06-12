import { useNews } from '../hooks/useNews'
import { NewsCard } from '../components/news/NewsCard'

function NewsSkeleton() {
  return (
    <div data-testid="news-skeleton" className="animate-pulse rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
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
    <div className="flex flex-1 flex-col overflow-auto bg-gray-50">
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3">
        <h1 className="text-base font-semibold text-gray-900">유가 뉴스</h1>
        {!isLoading && !isError && news && (
          <p className="text-xs text-gray-400">최신 {news.length}건</p>
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
          <p className="py-8 text-center text-sm text-gray-500">뉴스를 불러오지 못했습니다</p>
        )}
        {!isLoading && !isError && news?.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">등록된 뉴스가 없습니다</p>
        )}
        {news?.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
