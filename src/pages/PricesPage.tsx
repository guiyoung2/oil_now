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

export function PricesPage() {
  const [selectedMonth, setSelectedMonth] = useState(RECENT_MONTHS[0].value)
  const { data, isLoading } = useAvgPrices(selectedMonth)

  if (isLoading || !data) {
    return (
      <div className="flex flex-1 items-center justify-center bg-surface">
        <p className="text-sm text-sub">불러오는 중...</p>
      </div>
    )
  }

  const heroFuel = data.avgPrices.find((ap) => ap.fuelType === 'gasoline')
  const restFuels = data.avgPrices.filter((ap) => ap.fuelType !== 'gasoline')

  return (
    <div className="flex-1 overflow-auto bg-surface p-4">
      <h1 className="sr-only">실시간 유가</h1>
      <div className="mb-3 text-xs text-sub">{TODAY} 기준</div>

      {heroFuel && (
        <AvgPriceCard
          variant="hero"
          label={FUEL_LABELS[heroFuel.fuelType]}
          price={heroFuel.price}
          delta={heroFuel.delta}
        />
      )}

      {restFuels.length > 0 && (
        <div className="mt-3 flex gap-3">
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

      <div className="mb-2 mt-7 flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">휘발유 가격 추이</h2>
        <div className="flex overflow-hidden rounded-lg border border-line">
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
      <div className="rounded-xl bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <PriceTrendChart data={data.trend} />
        {data.trend.length < 3 && (
          <p className="mt-2 text-center text-xs text-sub">
            데이터가 누적되고 있습니다. 매일 가격이 기록됩니다.
          </p>
        )}
      </div>
    </div>
  )
}
