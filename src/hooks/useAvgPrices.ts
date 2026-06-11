import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { AvgPrice, PriceTrendPoint } from '../types/avgPrice'

interface AvgPricesData {
  avgPrices: AvgPrice[]
  trend: PriceTrendPoint[]
}

interface RegionalAvgRow {
  date: string
  fuel_type: string
  avg_price: string | number
  diff: string | number
}

async function fetchAvgPrices(): Promise<AvgPricesData> {
  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const { data, error } = await supabase
    .from('regional_avg')
    .select('date,fuel_type,avg_price,diff')
    .eq('region', '전국')
    .in('fuel_type', ['gasoline', 'diesel', 'lpg'])
    .gte('date', sevenDaysAgo)
    .order('date', { ascending: true })

  if (error) throw error

  const rows = (data ?? []) as RegionalAvgRow[]

  // 최신 날짜 기준 평균가 추출
  const latestDate = rows.reduce((max, r) => (r.date > max ? r.date : max), '')
  const avgPrices: AvgPrice[] = rows
    .filter((r) => r.date === latestDate)
    .map((r) => ({
      fuelType: r.fuel_type as AvgPrice['fuelType'],
      price: Number(r.avg_price),
      delta: Number(r.diff),
    }))

  // 휘발유 7일 추이
  const trend: PriceTrendPoint[] = rows
    .filter((r) => r.fuel_type === 'gasoline')
    .map((r) => ({ date: r.date, price: Number(r.avg_price) }))

  return { avgPrices, trend }
}

export function useAvgPrices() {
  return useQuery<AvgPricesData>({
    queryKey: ['avgPrices'],
    queryFn: fetchAvgPrices,
  })
}
