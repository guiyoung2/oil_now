import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useStations } from '../hooks/useStations'

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

test('lat/lng가 null이면 쿼리 비활성화', () => {
  const { result } = renderHook(() => useStations(null, null, 'gasoline'), { wrapper })
  expect(result.current.data).toBeUndefined()
  expect(result.current.fetchStatus).toBe('idle')
})

test('lat/lng 제공 시 fixture 주유소 반환 (서울 중심 2km)', async () => {
  // fixtures 5개 모두 서울 중심(37.5665, 126.978) 기준 약 1km 이내
  const { result } = renderHook(
    () => useStations(37.5665, 126.978, 'gasoline'),
    { wrapper },
  )
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data!.length).toBeGreaterThan(0)
  // 모든 항목에 distance 값 존재
  result.current.data!.forEach((s) => expect(s.distance).toBeGreaterThan(0))
})

test('gasoline fuelType 선택 시 price 필드 존재', async () => {
  const { result } = renderHook(
    () => useStations(37.5665, 126.978, 'gasoline'),
    { wrapper },
  )
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  const withPrice = result.current.data!.filter((s) => s.price !== null)
  expect(withPrice.length).toBeGreaterThan(0)
})
