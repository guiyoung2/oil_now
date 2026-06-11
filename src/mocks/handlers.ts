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

const NEWS_MOCK = [
  {
    id: 'uuid-1',
    title: '국제 유가 3% 급락…WTI 배럴당 70달러 하회',
    url: 'https://example.com/news/1',
    source: '연합뉴스',
    published_at: '2026-06-12T03:00:00Z',
    summary: '미국 원유 재고 증가로 국제 유가가 큰 폭으로 하락했다.',
    collected_at: '2026-06-12T06:00:00Z',
  },
  {
    id: 'uuid-2',
    title: '국내 주유소 휘발유 가격 소폭 하락',
    url: 'https://example.com/news/2',
    source: 'KBS',
    published_at: '2026-06-11T12:00:00Z',
    summary: '전국 주유소 평균 휘발유 판매가격이 소폭 하락하며 2천원대 초반을 유지하고 있다.',
    collected_at: '2026-06-11T15:00:00Z',
  },
  {
    id: 'uuid-3',
    title: '유가 하락에 물가 안정 기대감 고조',
    url: 'https://example.com/news/3',
    source: '한국경제',
    published_at: '2026-06-11T06:00:00Z',
    summary: '국제 유가 하락세가 이어지며 국내 물가 안정에 긍정적 영향을 미칠 것으로 전망된다.',
    collected_at: '2026-06-11T09:00:00Z',
  },
]

export const handlers = [
  http.get(/\/rest\/v1\/regional_avg/, () => HttpResponse.json(REGIONAL_AVG_MOCK)),
  http.get(/\/rest\/v1\/news/, () => HttpResponse.json(NEWS_MOCK)),

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
