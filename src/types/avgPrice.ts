import type { FuelType } from './station'

// 전국 평균가 (실시간 유가 대시보드용). Phase 1은 mock, Phase 2에서 실데이터 연결.
export interface AvgPrice {
  fuelType: FuelType
  price: number
  delta: number // 전일 대비 변동(원), 양수=상승 / 음수=하락 / 0=보합
}

export interface PriceTrendPoint {
  date: string // 'YYYY-MM-DD'
  price: number
}
