import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from './setup'
import { useAvgPrices } from '../hooks/useAvgPrices'

// 2일 × 3유종 fixture
const FIXTURE = [
  { date: '2026-06-11', fuel_type: 'gasoline', avg_price: '2008.00', diff: '0.10' },
  { date: '2026-06-11', fuel_type: 'diesel',   avg_price: '2002.00', diff: '-0.20' },
  { date: '2026-06-11', fuel_type: 'lpg',      avg_price: '1105.00', diff: '-0.05' },
  { date: '2026-06-12', fuel_type: 'gasoline', avg_price: '2009.66', diff: '-0.07' },
  { date: '2026-06-12', fuel_type: 'diesel',   avg_price: '2004.38', diff: '-0.31' },
  { date: '2026-06-12', fuel_type: 'lpg',      avg_price: '1107.57', diff: '-0.10' },
]

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

describe('useAvgPrices Supabase 연동', () => {
  beforeEach(() => {
    server.use(
      http.get(/\/rest\/v1\/regional_avg/, () => HttpResponse.json(FIXTURE)),
    )
  })

  it('avgPrices — 최신 날짜 전국 평균가 3종 반환', async () => {
    const { result } = renderHook(() => useAvgPrices(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const { avgPrices } = result.current.data!
    const gasoline = avgPrices.find((p) => p.fuelType === 'gasoline')
    const diesel   = avgPrices.find((p) => p.fuelType === 'diesel')
    const lpg      = avgPrices.find((p) => p.fuelType === 'lpg')

    expect(gasoline!.price).toBe(2009.66)
    expect(gasoline!.delta).toBe(-0.07)
    expect(diesel!.price).toBe(2004.38)
    expect(diesel!.delta).toBe(-0.31)
    expect(lpg!.price).toBe(1107.57)
  })

  it('trend — gasoline 날짜 오름차순 추이 반환', async () => {
    const { result } = renderHook(() => useAvgPrices(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const { trend } = result.current.data!
    expect(trend.length).toBe(2)
    expect(trend[0].date).toBe('2026-06-11')
    expect(trend[0].price).toBe(2008.00)
    expect(trend[1].date).toBe('2026-06-12')
    expect(trend[1].price).toBe(2009.66)
  })

  it('isLoading 초기 true → 데이터 수신 후 false', async () => {
    const { result } = renderHook(() => useAvgPrices(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.isLoading).toBe(false)
  })
})
