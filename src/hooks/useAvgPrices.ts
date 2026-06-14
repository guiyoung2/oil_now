import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { AvgPrice, PriceTrendPoint } from '../types/avgPrice'

interface AvgPricesData {
  avgPrices: AvgPrice[]
  trend: PriceTrendPoint[]
  latestDate: string // 평균가의 실제 공시 기준일 'YYYY-MM-DD' (없으면 '')
}

interface RegionalAvgRow {
  date: string
  fuel_type: string
  avg_price: string | number
  diff: string | number
}

// Opinet은 일별 평균가 시계열을 최근 7일까지만 제공(avgRecentPrice.do).
// 과거 소급 적재가 불가능하므로 추이도 최근 7일로 고정한다.
const TREND_DAYS = 7

async function fetchAvgPrices(): Promise<AvgPricesData> {
  // 적재 지연(당일 데이터 부재)을 감안해 넉넉히 조회한 뒤 최근 7개만 사용한다.
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 14)
  const cutoffDate = cutoff.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('regional_avg')
    .select('date,fuel_type,avg_price,diff')
    .eq('region', '전국')
    .in('fuel_type', ['gasoline', 'diesel', 'lpg'])
    .gte('date', cutoffDate)
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

  // 휘발유 최근 7일 추이
  const trend: PriceTrendPoint[] = rows
    .filter((r) => r.fuel_type === 'gasoline')
    .map((r) => ({ date: r.date, price: Number(r.avg_price) }))
    .slice(-TREND_DAYS)

  return { avgPrices, trend, latestDate }
}

export function useAvgPrices() {
  return useQuery<AvgPricesData>({
    queryKey: ['avgPrices', 'recent7'],
    queryFn: fetchAvgPrices,
  })
}
