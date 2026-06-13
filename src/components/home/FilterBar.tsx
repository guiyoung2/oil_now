import { useFilterStore } from '../../store/filterStore'
import type { FuelType, SortOrder } from '../../types/station'

const FUEL_OPTIONS: { value: FuelType; label: string }[] = [
  { value: 'gasoline_diesel' as FuelType, label: '휘발유·경유' },
  { value: 'lpg' as FuelType, label: 'LPG' },
]

export function FilterBar() {
  const { fuelType, sortOrder, setFuelType, setSortOrder } = useFilterStore()

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-line shrink-0">
      <div role="radiogroup" aria-label="유종 선택" className="flex gap-1.5">
        {FUEL_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            role="radio"
            aria-checked={fuelType === opt.value}
            onClick={() => setFuelType(opt.value)}
            className={`inline-flex items-center justify-center px-3.5 rounded-full text-sm font-bold min-h-[44px] transition-colors ${
              fuelType === opt.value
                ? 'bg-primary-700 text-white'
                : 'bg-surface text-sub hover:bg-line'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value as SortOrder)}
        aria-label="정렬 기준"
        className="ml-auto px-3 text-sm font-medium text-sub rounded-lg border border-line bg-white min-h-[44px]"
      >
        <option value="distance">거리순</option>
        <option value="price">가격순</option>
      </select>
    </div>
  )
}
