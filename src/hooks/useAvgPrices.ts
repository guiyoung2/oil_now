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

async function fetchAvgPrices(month: string): Promise<AvgPricesData> {
  const [y, m] = month.split('-').map(Number)
  const startDate = `${month}-01`
  const nextYear = m === 12 ? y + 1 : y
  const nextM = m === 12 ? 1 : m + 1
  const endDate = `${nextYear}-${String(nextM).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('regional_avg')
    .select('date,fuel_type,avg_price,diff')
    .eq('region', '전국')
    .in('fuel_type', ['gasoline', 'diesel', 'lpg'])
    .gte('date', startDate)
    .lt('date', endDate)
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

  // 휘발유 추이
  const trend: PriceTrendPoint[] = rows
    .filter((r) => r.fuel_type === 'gasoline')
    .map((r) => ({ date: r.date, price: Number(r.avg_price) }))

  return { avgPrices, trend }
}

export function useAvgPrices(month?: string) {
  const targetMonth = month ?? new Date().toISOString().slice(0, 7)
  return useQuery<AvgPricesData>({
    queryKey: ['avgPrices', targetMonth],
    queryFn: () => fetchAvgPrices(targetMonth),
  })
}
