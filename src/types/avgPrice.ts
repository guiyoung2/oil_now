// 평균가 전용 유종 코드 — UI 필터(FuelType)와 별개로 실제 유종 단위
export type AvgFuelType = 'gasoline' | 'diesel' | 'lpg' | 'premium' | 'kerosene'

// 전국 평균가 (실시간 유가 대시보드용). Phase 1은 mock, Phase 2에서 실데이터 연결.
export interface AvgPrice {
  fuelType: AvgFuelType
  price: number
  delta: number // 전일 대비 변동(원), 양수=상승 / 음수=하락 / 0=보합
}

export interface PriceTrendPoint {
  date: string // 'YYYY-MM-DD'
  price: number
}
