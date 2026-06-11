import { useQuery } from '@tanstack/react-query'
import { avgPriceFixtures, priceTrendFixture } from '../mocks/avgPriceFixtures'
import type { AvgPrice, PriceTrendPoint } from '../types/avgPrice'

interface AvgPricesData {
  avgPrices: AvgPrice[]
  trend: PriceTrendPoint[]
}

export function useAvgPrices() {
  return useQuery<AvgPricesData>({
    queryKey: ['avgPrices'],
    // Phase 2: 이 queryFn 내부를 Supabase regional_avg 쿼리로 교체 (UI 불변)
    queryFn: async () => ({
      avgPrices: avgPriceFixtures,
      trend: priceTrendFixture,
    }),
  })
}
