import { useQuery } from '@tanstack/react-query'
import type { FuelType, StationWithPrice } from '../types/station'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'http://localhost:54321'

async function fetchFuel(
  lat: number,
  lng: number,
  fuel: FuelType,
): Promise<StationWithPrice[]> {
  const url = new URL(`${SUPABASE_URL}/functions/v1/around-stations`)
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lng', String(lng))
  url.searchParams.set('fuel', fuel)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`around-stations: HTTP ${res.status}`)
  return res.json()
}

export function useStations(
  lat: number | null,
  lng: number | null,
  fuelType: FuelType,
) {
  return useQuery({
    queryKey: ['stations', lat, lng, fuelType],
    enabled: lat !== null && lng !== null,
    queryFn: async (): Promise<StationWithPrice[]> => {
      // 휘발유·경유는 항상 병렬 조회해 두 가격을 함께 표시
      const fuels: FuelType[] = ['gasoline', 'diesel']
      if (fuelType !== 'gasoline' && fuelType !== 'diesel') fuels.push(fuelType)

      const results = await Promise.all(fuels.map((f) => fetchFuel(lat!, lng!, f)))

      const map = new Map<string, StationWithPrice>()

      fuels.forEach((fuel, i) => {
        for (const s of results[i]) {
          if (!map.has(s.id)) {
            map.set(s.id, { ...s, gasolinePrice: null, dieselPrice: null, price: null })
          }
          const entry = map.get(s.id)!
          if (fuel === 'gasoline') entry.gasolinePrice = s.price
          else if (fuel === 'diesel') entry.dieselPrice = s.price
          if (fuel === fuelType) {
            entry.price = s.price
            entry.latestDate = s.latestDate
          }
        }
      })

      // 선택된 유종 가격이 있는 주유소만 표시
      return Array.from(map.values()).filter((s) => s.price !== null)
    },
  })
}
