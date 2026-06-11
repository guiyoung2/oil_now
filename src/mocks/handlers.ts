import { http, HttpResponse } from 'msw'
import { haversineMeters } from '../lib/distance'
import { stationFixtures } from './stationFixtures'
import type { StationWithPrice } from '../types/station'

const REGIONAL_AVG_MOCK = [
  { date: '2026-06-12', fuel_type: 'gasoline', region: '전국', avg_price: '2009.66', diff: '-0.07' },
  { date: '2026-06-12', fuel_type: 'diesel',   region: '전국', avg_price: '2004.38', diff: '-0.31' },
  { date: '2026-06-12', fuel_type: 'lpg',      region: '전국', avg_price: '1107.57', diff: '-0.10' },
]

// fixtures 원본 기준점(서울 중심). 요청 위치만큼 평행이동해 재배치한다.
const SEOUL = { lat: 37.5665, lng: 126.978 }

export const handlers = [
  http.get(/\/rest\/v1\/regional_avg/, () => HttpResponse.json(REGIONAL_AVG_MOCK)),

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
          gasolinePrice: null,
          dieselPrice: null,
        }
      })
      .filter((s) => s.price !== null)

    return HttpResponse.json(stations)
  }),
]
