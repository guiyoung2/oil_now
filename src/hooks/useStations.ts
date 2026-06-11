import { useQuery } from '@tanstack/react-query'
import type { FuelType, StationWithPrice } from '../types/station'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'http://localhost:54321'

export function useStations(
  lat: number | null,
  lng: number | null,
  fuelType: FuelType,
) {
  return useQuery({
    queryKey: ['stations', lat, lng, fuelType],
    enabled: lat !== null && lng !== null,
    queryFn: async (): Promise<StationWithPrice[]> => {
      const url = new URL(`${SUPABASE_URL}/functions/v1/around-stations`)
      url.searchParams.set('lat', String(lat))
      url.searchParams.set('lng', String(lng))
      url.searchParams.set('fuel', fuelType)

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error(`around-stations: HTTP ${res.status}`)
      return res.json()
    },
  })
}
