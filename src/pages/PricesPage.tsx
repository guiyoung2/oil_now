import { useState } from 'react'
import { AvgPriceCard } from '../components/prices/AvgPriceCard'
import { PriceTrendChart } from '../components/prices/PriceTrendChart'
import { useAvgPrices } from '../hooks/useAvgPrices'
import type { AvgFuelType } from '../types/avgPrice'

const PERIOD_OPTIONS = [
  { days: 30,  label: '1개월' },
  { days: 90, label: '3개월' },
] as const

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
  const [days, setDays] = useState<30 | 90>(30)
  const { data, isLoading } = useAvgPrices(days)

  if (isLoading || !data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-500">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <h1 className="sr-only">실시간 유가</h1>
      <div className="mb-1 text-xs text-gray-500">{TODAY} 기준</div>
      <h2 className="mb-3 text-base font-semibold text-gray-900">전국 평균가</h2>
      <div className="flex gap-2">
        {data.avgPrices.map((ap) => (
          <AvgPriceCard
            key={ap.fuelType}
            label={FUEL_LABELS[ap.fuelType]}
            price={ap.price}
            delta={ap.delta}
          />
        ))}
      </div>

      <div className="mb-2 mt-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">휘발유 가격 추이</h2>
        <div className="flex overflow-hidden rounded-lg border border-gray-200">
          {PERIOD_OPTIONS.map(({ days: d, label }) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                days === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <PriceTrendChart data={data.trend} />
      {data.trend.length < 3 && (
        <p className="mt-2 text-center text-xs text-gray-400">
          데이터가 누적되고 있습니다. 매일 가격이 기록됩니다.
        </p>
      )}
    </div>
  )
}
