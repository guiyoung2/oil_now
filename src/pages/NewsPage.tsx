import { useNews } from '../hooks/useNews'
import { NewsCard } from '../components/news/NewsCard'

function NewsSkeleton() {
  return (
    <div data-testid="news-skeleton" className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-2 flex justify-between">
        <div className="h-3 w-16 rounded bg-gray-200" />
        <div className="h-3 w-12 rounded bg-gray-200" />
      </div>
      <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
      <div className="h-3 w-full rounded bg-gray-200" />
    </div>
  )
}

export function NewsPage() {
  const { data: news, isLoading, isError } = useNews()

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <div className="space-y-3 p-4">
        {isLoading && (
          <>
            <NewsSkeleton />
            <NewsSkeleton />
            <NewsSkeleton />
          </>
        )}
        {isError && (
          <p className="text-center text-sm text-gray-500">뉴스를 불러오지 못했습니다</p>
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
