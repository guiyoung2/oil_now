import { AvgPriceCard } from '../components/prices/AvgPriceCard'
import { PriceTrendChart } from '../components/prices/PriceTrendChart'
import { useAvgPrices } from '../hooks/useAvgPrices'
import type { AvgFuelType } from '../types/avgPrice'

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
  const { data, isLoading } = useAvgPrices()

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

      <h2 className="mb-2 mt-6 text-base font-semibold text-gray-900">
        휘발유 가격 변동
      </h2>
      <PriceTrendChart data={data.trend} />
    </div>
  )
}
