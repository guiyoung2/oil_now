import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { StationCard } from './StationCard'
import { EmptyState } from './EmptyState'
import type { FuelType, StationWithPrice } from '../../types/station'

interface Props {
  stations: StationWithPrice[]
  onStationClick: (id: string) => void
  fuelType: FuelType
}

export function StationList({ stations, onStationClick, fuelType }: Props) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: stations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
  })

  if (stations.length === 0) return <EmptyState />

  const prices = stations.map((s) => s.price).filter((p): p is number => p !== null)
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : null

  return (
    <div ref={parentRef} className="overflow-auto flex-1">
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((item) => {
          const station = stations[item.index]
          return (
            <div
              key={item.key}
              style={{ position: 'absolute', top: item.start, left: 0, right: 0 }}
            >
              <StationCard
                station={station}
                isLowest={lowestPrice !== null && station.price === lowestPrice}
                onClick={() => onStationClick(station.id)}
                fuelType={fuelType}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
