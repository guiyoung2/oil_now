import type { StationWithPrice } from '../../types/station'

interface Props {
  station: StationWithPrice
  isLowest: boolean
  onClick: () => void
}

export function StationCard({ station, isLowest, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center px-4 py-3 border-b text-left min-h-[64px] hover:bg-gray-50 active:bg-gray-100"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{station.name}</span>
          {station.is_self && (
            <span className="text-xs text-gray-500 shrink-0">셀프</span>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {Math.round(station.distance)}m · {station.brand}
        </div>
      </div>
      <div className="shrink-0 text-right ml-3">
        {station.price != null ? (
          <span className={`font-bold text-sm ${isLowest ? 'text-blue-600' : 'text-gray-900'}`}>
            {station.price.toLocaleString()}원
          </span>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </div>
    </button>
  )
}
