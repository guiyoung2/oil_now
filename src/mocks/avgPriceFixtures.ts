import type { AvgPrice, PriceTrendPoint } from '../types/avgPrice'

// Phase 1 mock 평균가. Phase 2에서 regional_avg 실데이터로 교체.
export const avgPriceFixtures: AvgPrice[] = [
  { fuelType: 'gasoline', price: 1650, delta: 3 },
  { fuelType: 'diesel', price: 1500, delta: -2 },
  { fuelType: 'lpg', price: 880, delta: 0 },
]

// 휘발유 최근 7일 추이 (mock)
export const priceTrendFixture: PriceTrendPoint[] = [
  { date: '2026-06-05', price: 1642 },
  { date: '2026-06-06', price: 1645 },
  { date: '2026-06-07', price: 1640 },
  { date: '2026-06-08', price: 1648 },
  { date: '2026-06-09', price: 1647 },
  { date: '2026-06-10', price: 1647 },
  { date: '2026-06-11', price: 1650 },
]
