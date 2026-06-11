import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { StationList } from '../components/home/StationList'
import type { StationWithPrice } from '../types/station'

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count }: { count: number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, i) => ({
        key: i,
        index: i,
        start: i * 64,
        size: 64,
      })),
    getTotalSize: () => count * 64,
  }),
}))

function makeStation(id: string, price: number | null, distance: number): StationWithPrice {
  return {
    id,
    name: `주유소 ${id}`,
    brand: 'SKE',
    address: '서울',
    lat: 37.5,
    lng: 127.0,
    is_self: false,
    distance,
    price,
    latestDate: price ? '2026-06-10' : null,
    gasolinePrice: price,
    dieselPrice: null,
  }
}

describe('StationList', () => {
  test('빈 배열 → EmptyState 렌더링', () => {
    render(<StationList stations={[]} onStationClick={() => {}} fuelType="gasoline_diesel" />)
    expect(screen.getByText(/주변 2km 내 주유소가 없어요/)).toBeInTheDocument()
  })

  test('주유소 있을 때 카드 렌더링', () => {
    const stations = [makeStation('001', 1680, 300), makeStation('002', 1650, 500)]
    render(<StationList stations={stations} onStationClick={() => {}} fuelType="gasoline_diesel" />)
    expect(screen.getByText('주유소 001')).toBeInTheDocument()
    expect(screen.getByText('주유소 002')).toBeInTheDocument()
  })

  test('최저가 주유소 isLowest=true 전달', () => {
    const stations = [makeStation('001', 1680, 300), makeStation('002', 1620, 500)]
    render(<StationList stations={stations} onStationClick={() => {}} fuelType="gasoline_diesel" />)
    // 가격 1620원 카드에 text-blue-600 클래스
    const prices = screen.getAllByText(/원/)
    const lowestPriceEl = prices.find((el) => el.textContent === '1,620원')
    expect(lowestPriceEl).toHaveClass('text-blue-600')
  })
})
