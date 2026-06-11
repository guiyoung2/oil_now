import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { NewsPage } from '../pages/NewsPage'

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

test('뉴스 카드 목록 렌더링', async () => {
  render(<NewsPage />, { wrapper })
  await waitFor(() => {
    expect(screen.getByText('국제 유가 3% 급락…WTI 배럴당 70달러 하회')).toBeInTheDocument()
  })
})

test('로딩 중 스켈레톤 표시', () => {
  render(<NewsPage />, { wrapper })
  // 스켈레톤: data-testid="news-skeleton"
  expect(screen.getAllByTestId('news-skeleton').length).toBeGreaterThan(0)
})

test('뉴스 0건 빈 상태 표시', async () => {
  // MSW handler를 일시적으로 빈 배열로 교체
  const { server } = await import('./setup')
  const { http, HttpResponse } = await import('msw')
  server.use(http.get(/\/rest\/v1\/news/, () => HttpResponse.json([])))

  render(<NewsPage />, { wrapper })
  await waitFor(() => {
    expect(screen.getByText('등록된 뉴스가 없습니다')).toBeInTheDocument()
  })
})
