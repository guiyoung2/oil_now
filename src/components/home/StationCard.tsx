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
      className="w-full flex items-center gap-3 px-4 py-3 min-h-[64px] text-left bg-white rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-colors hover:bg-primary-50 active:bg-primary-50"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[15px] text-ink truncate">{station.name}</span>
          {station.is_self && (
            <span className="text-xs text-sub shrink-0">셀프</span>
          )}
        </div>
        <div className="text-xs text-sub mt-0.5">
          {Math.round(station.distance)}m · {station.brand}
        </div>
      </div>
      <div className="shrink-0 text-right ml-3 space-y-0.5">
        {fuelType === 'lpg' ? (
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-[10px] text-sub">LPG</span>
            <span className={`font-extrabold text-base ${isLowest ? 'text-primary-deep' : 'text-ink'}`}>
              {fmtPrice(station.price)}
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-[10px] text-sub">휘발유</span>
              <span className={`font-extrabold text-base ${gasolineIsLowest ? 'text-primary-deep' : 'text-ink'}`}>
                {fmtPrice(station.gasolinePrice)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-[10px] text-sub">경유</span>
              <span className="text-sm text-sub">
                {fmtPrice(station.dieselPrice)}
              </span>
            </div>
          </>
        )}
      </div>
    </button>
  )
}
