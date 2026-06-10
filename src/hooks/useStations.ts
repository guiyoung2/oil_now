import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { haversineMeters } from '../lib/distance'
import type { FuelType, StationWithPrice } from '../types/station'

const RADIUS_M = 2000
const LAT_DELTA = 0.018
const LNG_DELTA = 0.022

export function useStations(
  lat: number | null,
  lng: number | null,
  fuelType: FuelType,
) {
  return useQuery({
    queryKey: ['stations', lat, lng, fuelType],
    enabled: lat !== null && lng !== null,
    queryFn: async (): Promise<StationWithPrice[]> => {
      const { data, error } = await supabase
        .from('stations')
        .select(
          'id, name, brand, address, lat, lng, is_self, price_snapshots(fuel_type, price, date)',
        )
        .gte('lat', lat! - LAT_DELTA)
        .lte('lat', lat! + LAT_DELTA)
        .gte('lng', lng! - LNG_DELTA)
        .lte('lng', lng! + LNG_DELTA)

      if (error) throw error

      return (data as any[])
        .map((s) => {
          const dist = haversineMeters(lat!, lng!, s.lat, s.lng)
          const snaps: Array<{ fuel_type: string; price: number; date: string }> = (
            s.price_snapshots ?? []
          )
            .filter((p: any) => p.fuel_type === fuelType)
            .sort((a: any, b: any) => b.date.localeCompare(a.date))
          const latest = snaps[0] ?? null
          return {
            id: s.id,
            name: s.name,
            brand: s.brand,
            address: s.address,
            lat: s.lat,
            lng: s.lng,
            is_self: s.is_self,
            distance: dist,
            price: latest?.price ?? null,
            latestDate: latest?.date ?? null,
          } satisfies StationWithPrice
        })
        .filter((s) => s.distance <= RADIUS_M)
    },
  })
}
