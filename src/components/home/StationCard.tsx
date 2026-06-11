import type { FuelType, StationWithPrice } from '../../types/station'

interface Props {
  station: StationWithPrice
  isLowest: boolean
  onClick: () => void
  fuelType: FuelType
}

function fmtPrice(price: number | null | undefined): string {
  return price != null ? price.toLocaleString() + '원' : '—'
}

export function StationCard({ station, isLowest, onClick, fuelType }: Props) {
  const gasolineIsLowest = isLowest && station.price != null && station.price === station.gasolinePrice

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
        <div className="text-xs text-gray-600 mt-0.5">
          {Math.round(station.distance)}m · {station.brand}
        </div>
      </div>
      <div className="shrink-0 text-right ml-3 space-y-0.5">
        {fuelType === 'lpg' ? (
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-[10px] text-gray-600">LPG</span>
            <span className={`font-bold text-sm ${isLowest ? 'text-blue-600' : 'text-gray-900'}`}>
              {fmtPrice(station.price)}
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-[10px] text-gray-600">휘발유</span>
              <span className={`font-bold text-sm ${gasolineIsLowest ? 'text-blue-600' : 'text-gray-900'}`}>
                {fmtPrice(station.gasolinePrice)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-[10px] text-gray-600">경유</span>
              <span className="text-sm text-gray-700">
                {fmtPrice(station.dieselPrice)}
              </span>
            </div>
          </>
        )}
      </div>
    </button>
  )
}
