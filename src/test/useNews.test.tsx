import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useNews } from '../hooks/useNews'

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

test('뉴스 목록을 반환한다', async () => {
  const { result } = renderHook(() => useNews(), { wrapper })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(Array.isArray(result.current.data)).toBe(true)
  expect(result.current.data!.length).toBeGreaterThan(0)
})

test('각 아이템에 title, url, source, published_at 필드가 있다', async () => {
  const { result } = renderHook(() => useNews(), { wrapper })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  const first = result.current.data![0]
  expect(first.title).toBeTruthy()
  expect(first.url).toBeTruthy()
  expect(typeof first.source).toBe('string')
  expect(first.published_at).toBeTruthy()
})
