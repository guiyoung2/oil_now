import { useFilterStore } from '../../store/filterStore'
import type { FuelType, SortOrder } from '../../types/station'

const FUEL_OPTIONS: { value: FuelType; label: string }[] = [
  { value: 'gasoline_diesel' as FuelType, label: '휘발유·경유' },
  { value: 'lpg' as FuelType, label: 'LPG' },
]

export function FilterBar() {
  const { fuelType, sortOrder, setFuelType, setSortOrder } = useFilterStore()

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b shrink-0">
      <div role="radiogroup" aria-label="유종 선택" className="flex gap-1">
        {FUEL_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            role="radio"
            aria-checked={fuelType === opt.value}
            onClick={() => setFuelType(opt.value)}
            className={`px-3 rounded-full text-sm font-medium min-h-[44px] ${
              fuelType === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
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
        className="ml-auto px-3 text-sm rounded border min-h-[44px]"
      >
        <option value="distance">거리순</option>
        <option value="price">가격순</option>
      </select>
    </div>
  )
}
