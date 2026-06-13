import { useState } from 'react'
import { AvgPriceCard } from '../components/prices/AvgPriceCard'
import { PriceTrendChart } from '../components/prices/PriceTrendChart'
import { useAvgPrices } from '../hooks/useAvgPrices'
import type { AvgFuelType } from '../types/avgPrice'

function getRecentMonths(count: number): Array<{ value: string; label: string }> {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = `${d.getMonth() + 1}월`
    return { value, label }
  })
}

const RECENT_MONTHS = getRecentMonths(6)

const FUEL_LABELS: Record<AvgFuelType, string> = {
  gasoline: '휘발유',
  diesel: '경유',
  lpg: 'LPG',
  premium: '고급휘발유',
  kerosene: '등유',
}

const TODAY = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

function heroDeltaText(delta: number): string {
  if (delta > 0) return `어제보다 ${delta}원 올랐어요`
  if (delta < 0) return `어제보다 ${Math.abs(delta)}원 내렸어요`
  return '어제와 같아요'
}

export function PricesPage() {
  const [selectedMonth, setSelectedMonth] = useState(RECENT_MONTHS[0].value)
  const { data, isLoading } = useAvgPrices(selectedMonth)

  if (isLoading || !data) {
    return (
      <div className="flex flex-1 items-center justify-center bg-sheet">
        <p className="text-sm text-sub">불러오는 중...</p>
      </div>
    )
  }

  const heroFuel = data.avgPrices.find((ap) => ap.fuelType === 'gasoline')
  const restFuels = data.avgPrices.filter((ap) => ap.fuelType !== 'gasoline')

  return (
    <div className="flex-1 overflow-auto bg-sheet">
      <h1 className="sr-only">실시간 유가</h1>

      {/* 그린 헤더 존 — 전국 평균(휘발유) */}
      <header className="bg-gradient-to-br from-primary-deep to-primary-700 px-4 pt-4 pb-8 text-white">
        <div className="text-xs text-white/80">{TODAY} 기준</div>
        {heroFuel && (
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1.5 text-sm font-bold">
              <span className="opacity-90">전국 평균</span>
              <span className="opacity-60">·</span>
              <span>{FUEL_LABELS[heroFuel.fuelType]}</span>
            </div>
            <div className="mt-1.5 text-[2rem] font-extrabold leading-tight tracking-tight">
              {heroFuel.price.toLocaleString()}
              <span className="ml-1 text-lg font-bold">원</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
              {heroFuel.delta !== 0 && (
                <span aria-hidden="true">{heroFuel.delta > 0 ? '▲' : '▼'}</span>
              )}
              <span>{heroDeltaText(heroFuel.delta)}</span>
            </div>
          </div>
        )}
      </header>

      {/* 옅은 그린 틴트 시트 + 흰 카드 */}
      <div className="-mt-5 rounded-t-[20px] bg-sheet px-4 pt-5 pb-6">
        {restFuels.length > 0 && (
          <div className="flex gap-3">
            {restFuels.map((ap) => (
              <AvgPriceCard
                key={ap.fuelType}
                label={FUEL_LABELS[ap.fuelType]}
                price={ap.price}
                delta={ap.delta}
              />
            ))}
          </div>
        )}

        <div className="mb-2 mt-6 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">휘발유 가격 추이</h2>
          <div className="flex overflow-hidden rounded-lg border border-line bg-white">
            {RECENT_MONTHS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSelectedMonth(value)}
                className={`px-3 py-1 text-xs font-bold transition-colors ${
                  selectedMonth === value
                    ? 'bg-primary-50 text-primary-700'
                    : 'bg-white text-sub hover:bg-primary-50/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-[0_2px_12px_rgba(20,80,50,0.08)]">
          <PriceTrendChart data={data.trend} />
          {data.trend.length < 3 && (
            <p className="mt-2 text-center text-xs text-sub">
              데이터가 누적되고 있습니다. 매일 가격이 기록됩니다.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
