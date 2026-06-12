import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface NewsItem {
  id: string
  title: string
  url: string
  source: string
  published_at: string
  summary: string
  collected_at: string
}

async function fetchNews(): Promise<NewsItem[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('news')
    .select('id,title,url,source,published_at,summary,collected_at')
    .gte('published_at', thirtyDaysAgo)
    .order('published_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return (data ?? []) as NewsItem[]
}

export function useNews() {
  return useQuery<NewsItem[]>({
    queryKey: ['news'],
    queryFn: fetchNews,
  })
}
