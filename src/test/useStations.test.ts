import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useStations } from '../hooks/useStations'

const LAT = 37.5665
const LNG = 126.978

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

describe('useStations 이중 가격', () => {
  it('휘발유 선택 시 gasolinePrice === price이고 양수', async () => {
    const { result } = renderHook(() => useStations(LAT, LNG, 'gasoline'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const stations = result.current.data ?? []
    expect(stations.length).toBeGreaterThan(0)
    for (const s of stations) {
      expect(s.gasolinePrice).toBeGreaterThan(0)
      expect(s.price).toBe(s.gasolinePrice)
    }
  })

  it('경유 선택 시 dieselPrice === price이고 양수', async () => {
    const { result } = renderHook(() => useStations(LAT, LNG, 'diesel'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const stations = result.current.data ?? []
    expect(stations.length).toBeGreaterThan(0)
    for (const s of stations) {
      expect(s.dieselPrice).toBeGreaterThan(0)
      expect(s.price).toBe(s.dieselPrice)
    }
  })

  it('휘발유 선택 시 경유 가격도 함께 반환된다(병렬 조회)', async () => {
    const { result } = renderHook(() => useStations(LAT, LNG, 'gasoline'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const stations = result.current.data ?? []
    // 경유 가격이 있는 fixture가 존재하므로 최소 1개는 dieselPrice 보유
    const withDiesel = stations.filter((s) => (s.dieselPrice ?? 0) > 0)
    expect(withDiesel.length).toBeGreaterThan(0)
  })
})
