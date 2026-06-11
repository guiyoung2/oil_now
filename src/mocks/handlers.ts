import { http, HttpResponse } from 'msw'
import { haversineMeters } from '../lib/distance'
import { stationFixtures } from './stationFixtures'
import type { StationWithPrice } from '../types/station'

// fixtures 원본 기준점(서울 중심). 요청 위치만큼 평행이동해 재배치한다.
const SEOUL = { lat: 37.5665, lng: 126.978 }

export const handlers = [
  http.get(/\/functions\/v1\/around-stations/, ({ request }) => {
    const url = new URL(request.url)
    const lat = parseFloat(url.searchParams.get('lat') ?? String(SEOUL.lat))
    const lng = parseFloat(url.searchParams.get('lng') ?? String(SEOUL.lng))
    const fuel = url.searchParams.get('fuel') ?? 'gasoline'

    const stations: StationWithPrice[] = stationFixtures
      .map((s) => {
        const shiftedLat = lat + (s.lat - SEOUL.lat)
        const shiftedLng = lng + (s.lng - SEOUL.lng)
        const snap = s.price_snapshots.find((p) => p.fuel_type === fuel)
        return {
          id: s.id,
          name: s.name,
          brand: s.brand,
          address: s.address,
          lat: shiftedLat,
          lng: shiftedLng,
          is_self: s.is_self,
          distance: haversineMeters(lat, lng, shiftedLat, shiftedLng),
          price: snap?.price ?? null,
          latestDate: snap?.date ?? null,
        }
      })
      .filter((s) => s.price !== null)

    return HttpResponse.json(stations)
  }),
]
