import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { KakaoMap } from '../components/home/KakaoMap'
import { FilterBar } from '../components/home/FilterBar'
import { StationList } from '../components/home/StationList'
import { useGeolocation } from '../hooks/useGeolocation'
import { useStations } from '../hooks/useStations'
import { useFilterStore } from '../store/filterStore'
import { REGION_CENTERS } from '../lib/regions'

export function HomePage() {
  const navigate = useNavigate()
  const { status, lat, lng, fallbackRegion, setFallbackRegion } = useGeolocation()
  const { fuelType, sortOrder } = useFilterStore()

  const activeLat = lat ?? (fallbackRegion ? REGION_CENTERS[fallbackRegion]?.lat ?? null : null)
  const activeLng = lng ?? (fallbackRegion ? REGION_CENTERS[fallbackRegion]?.lng ?? null : null)

  const { data: rawStations = [], isError } = useStations(activeLat, activeLng, fuelType)

  const stations = useMemo(
    () =>
      [...rawStations].sort((a, b) => {
        if (sortOrder === 'price') {
          return (a.price ?? Infinity) - (b.price ?? Infinity)
        }
        return a.distance - b.distance
      }),
    [rawStations, sortOrder],
  )

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {activeLat !== null && activeLng !== null ? (
        <KakaoMap
          lat={activeLat}
          lng={activeLng}
          stations={stations}
          fuelType={fuelType}
        />
      ) : (
        <div
          className="flex items-center justify-center bg-sheet shrink-0"
          style={{ height: '50vh' }}
          aria-label="주유소 지도"
          role="img"
        >
          {status === 'pending' && (
            <p className="text-sub text-sm">위치 확인 중...</p>
          )}
          {(status === 'denied' || status === 'unavailable') && (
            <p className="text-sub text-sm">지역을 선택하면 지도가 표시됩니다</p>
          )}
        </div>
      )}

      {(status === 'denied' || status === 'unavailable') && (
        <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 border-b border-line shrink-0">
          <label htmlFor="region-select" className="text-xs font-medium text-sub shrink-0">
            지역 선택
          </label>
          <select
            id="region-select"
            value={fallbackRegion ?? ''}
            onChange={(e) => setFallbackRegion(e.target.value)}
            className="text-sm rounded-lg border border-line bg-white px-2 min-h-[44px]"
          >
            <option value="">시/도 선택</option>
            {Object.keys(REGION_CENTERS).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      )}

      <FilterBar />

      {isError && (
        <p className="text-center text-sm text-red-700 py-4">
          데이터를 불러오지 못했어요
        </p>
      )}

      <StationList
        stations={stations}
        onStationClick={(id) => navigate(`/stations/${id}`)}
        fuelType={fuelType}
      />
    </div>
  )
}
