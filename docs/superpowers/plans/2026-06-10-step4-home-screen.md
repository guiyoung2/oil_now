# Step 4 홈 화면 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 사용자 위치 기반 카카오맵 + 주변 2km 주유소 리스트(TanStack Virtual)를 보여주는 홈 화면 구현

**Architecture:** 커스텀 훅(useGeolocation, useStations)으로 로직 격리, TanStack Query로 Supabase 캐싱, Zustand로 필터/정렬 UI 상태 관리. 개발 중 MSW가 Supabase REST 요청을 가로채 fixture 반환.

**Tech Stack:** React 19, TypeScript, TanStack Query v5, TanStack Virtual v3, Zustand v5, MSW v2, react-router-dom, @supabase/supabase-js, Kakao Maps JS SDK, Tailwind CSS v4, Vitest + RTL

---

## 파일 맵

| 파일 | 역할 |
|------|------|
| `index.html` | 카카오맵 SDK 스크립트 태그 추가 |
| `src/main.tsx` | MSW 브라우저 워커 조건부 시작 |
| `src/App.tsx` | QueryClientProvider + BrowserRouter + Routes |
| `src/types/station.ts` | FuelType, SortOrder, Station, StationWithPrice 타입 |
| `src/lib/distance.ts` | Haversine 거리 계산 순수 함수 |
| `src/lib/regions.ts` | 시/도 중심 좌표 맵 |
| `src/lib/supabase.ts` | Supabase 클라이언트 초기화 |
| `src/mocks/stationFixtures.ts` | 테스트/개발용 주유소 fixture 데이터 |
| `src/mocks/handlers.ts` | MSW 핸들러 (Supabase REST mock) |
| `src/mocks/browser.ts` | MSW 브라우저 워커 설정 |
| `src/test/setup.ts` | MSW Node 서버 설정 추가 |
| `src/store/filterStore.ts` | Zustand: fuelType, sortOrder |
| `src/hooks/useGeolocation.ts` | Geolocation API + denied fallback 상태 |
| `src/hooks/useStations.ts` | TanStack Query + Supabase bbox 쿼리 + Haversine 필터 |
| `src/components/home/FilterBar.tsx` | 유종 토글(radiogroup) + 정렬 select |
| `src/components/home/StationCard.tsx` | 주유소 리스트 항목 1개 |
| `src/components/home/EmptyState.tsx` | 0건 안내 |
| `src/components/home/StationList.tsx` | TanStack Virtual 가상 스크롤 컨테이너 |
| `src/components/home/KakaoMap.tsx` | 카카오맵 인스턴스 + MarkerClusterer |
| `src/pages/HomePage.tsx` | 페이지 루트 — 훅 조합 + 레이아웃 |

---

## Task 1: 의존성 설치 & index.html & main.tsx

**Files:**
- Modify: `package.json` (의존성 추가)
- Modify: `index.html` (카카오맵 SDK)
- Modify: `src/main.tsx` (MSW 브라우저 워커)
- Run: `npx msw init public --save` (서비스 워커 파일 생성)

- [ ] **Step 1: react-router-dom, @supabase/supabase-js 설치**

```bash
npm install react-router-dom @supabase/supabase-js
```

Expected: package.json dependencies에 두 패키지 추가됨

- [ ] **Step 2: MSW 브라우저 워커 파일 생성**

```bash
npx msw init public --save
```

Expected: `public/mockServiceWorker.js` 생성됨

- [ ] **Step 3: index.html에 카카오맵 SDK 추가**

`index.html`을 아래와 같이 수정:

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>오일나우</title>
    <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=%VITE_KAKAO_MAP_KEY%&libraries=clusterer"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: main.tsx — MSW 브라우저 워커 조건부 시작**

`src/main.tsx`를 아래로 교체:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function prepare() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    return worker.start({ onUnhandledRequest: 'bypass' })
  }
}

prepare().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
```

- [ ] **Step 5: TypeScript 컴파일 확인**

```bash
npm run typecheck
```

Expected: 오류 없음 (mocks/browser.ts가 아직 없으면 Task 3 이후 재확인)

- [ ] **Step 6: 커밋**

```bash
git add index.html src/main.tsx package.json package-lock.json public/mockServiceWorker.js
git commit -m "chore: react-router-dom, supabase 클라이언트 설치 및 MSW 브라우저 워커 설정"
```

---

## Task 2: 타입 정의 & 유틸리티

**Files:**
- Create: `src/types/station.ts`
- Create: `src/lib/distance.ts`
- Create: `src/lib/regions.ts`
- Create: `src/lib/supabase.ts`
- Create: `src/test/distance.test.ts`

- [ ] **Step 1: distance.test.ts 작성 (실패 확인용)**

`src/test/distance.test.ts` 생성:

```typescript
import { haversineMeters } from '../lib/distance'

test('같은 위치는 0m', () => {
  expect(haversineMeters(37.5665, 126.978, 37.5665, 126.978)).toBe(0)
})

test('서울 → 약 1km 이동', () => {
  // 위도 0.009도 ≈ 1000m
  const dist = haversineMeters(37.5665, 126.978, 37.5755, 126.978)
  expect(dist).toBeGreaterThan(900)
  expect(dist).toBeLessThan(1100)
})

test('2km 초과 지점 감지', () => {
  // 위도 0.018도 ≈ 2000m
  const dist = haversineMeters(37.5665, 126.978, 37.5845, 126.978)
  expect(dist).toBeGreaterThan(2000)
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm test -- src/test/distance.test.ts
```

Expected: FAIL — "Cannot find module '../lib/distance'"

- [ ] **Step 3: src/types/station.ts 생성**

```typescript
export type FuelType = 'gasoline' | 'diesel' | 'lpg' | 'premium' | 'kerosene'
export type SortOrder = 'distance' | 'price'

export interface Station {
  id: string
  name: string
  brand: string
  address: string
  lat: number
  lng: number
  is_self: boolean
}

export interface PriceSnapshot {
  fuel_type: string
  price: number
  date: string
}

export interface StationWithPrice extends Station {
  distance: number
  price: number | null
  latestDate: string | null
}
```

- [ ] **Step 4: src/lib/distance.ts 생성**

```typescript
export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
```

- [ ] **Step 5: 테스트 실행 — 통과 확인**

```bash
npm test -- src/test/distance.test.ts
```

Expected: PASS (3 tests)

- [ ] **Step 6: src/lib/regions.ts 생성**

```typescript
export const REGION_CENTERS: Record<string, { lat: number; lng: number }> = {
  서울: { lat: 37.5665, lng: 126.978 },
  부산: { lat: 35.1796, lng: 129.0756 },
  대구: { lat: 35.8714, lng: 128.6014 },
  인천: { lat: 37.4563, lng: 126.7052 },
  광주: { lat: 35.1595, lng: 126.8526 },
  대전: { lat: 36.3504, lng: 127.3845 },
  울산: { lat: 35.5384, lng: 129.3114 },
  세종: { lat: 36.4801, lng: 127.289 },
  경기: { lat: 37.4138, lng: 127.5183 },
  강원: { lat: 37.8228, lng: 128.1555 },
  충북: { lat: 36.6358, lng: 127.4914 },
  충남: { lat: 36.5184, lng: 126.8 },
  전북: { lat: 35.7175, lng: 127.153 },
  전남: { lat: 34.8679, lng: 126.991 },
  경북: { lat: 36.4919, lng: 128.8889 },
  경남: { lat: 35.4606, lng: 128.2132 },
  제주: { lat: 33.4996, lng: 126.5312 },
}
```

- [ ] **Step 7: src/lib/supabase.ts 생성**

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? 'http://localhost:54321',
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'test-anon-key',
)
```

- [ ] **Step 8: typecheck & 커밋**

```bash
npm run typecheck
git add src/types/station.ts src/lib/distance.ts src/lib/regions.ts src/lib/supabase.ts src/test/distance.test.ts
git commit -m "feat: 타입 정의, Haversine 거리 계산, 지역 중심 좌표, Supabase 클라이언트"
```

---

## Task 3: MSW fixture & 핸들러 & 테스트 설정

**Files:**
- Create: `src/mocks/stationFixtures.ts`
- Create: `src/mocks/handlers.ts`
- Create: `src/mocks/browser.ts`
- Modify: `src/test/setup.ts`

- [ ] **Step 1: src/mocks/stationFixtures.ts 생성**

```typescript
import type { Station, PriceSnapshot } from '../types/station'

export interface StationRow extends Station {
  price_snapshots: PriceSnapshot[]
}

// 모든 좌표는 서울 중심(37.5665, 126.978) 기준 약 1km 이내
export const stationFixtures: StationRow[] = [
  {
    id: 'A0000001',
    name: '강남 SK에너지',
    brand: 'SKE',
    address: '서울 강남구 테헤란로 123',
    lat: 37.5745,
    lng: 126.984,
    is_self: false,
    price_snapshots: [
      { fuel_type: 'gasoline', price: 1680, date: '2026-06-10' },
      { fuel_type: 'diesel', price: 1520, date: '2026-06-10' },
      { fuel_type: 'lpg', price: 890, date: '2026-06-10' },
    ],
  },
  {
    id: 'A0000002',
    name: '종로 GS칼텍스',
    brand: 'GSC',
    address: '서울 종로구 종로 456',
    lat: 37.5615,
    lng: 126.987,
    is_self: true,
    price_snapshots: [
      { fuel_type: 'gasoline', price: 1650, date: '2026-06-10' },
      { fuel_type: 'diesel', price: 1500, date: '2026-06-10' },
    ],
  },
  {
    id: 'A0000003',
    name: '용산 현대오일뱅크',
    brand: 'HDO',
    address: '서울 용산구 한강대로 789',
    lat: 37.5705,
    lng: 126.968,
    is_self: false,
    price_snapshots: [
      { fuel_type: 'gasoline', price: 1700, date: '2026-06-10' },
      { fuel_type: 'lpg', price: 900, date: '2026-06-10' },
    ],
  },
  {
    id: 'A0000004',
    name: '마포 S-OIL',
    brand: 'SOL',
    address: '서울 마포구 마포대로 321',
    lat: 37.5595,
    lng: 126.971,
    is_self: false,
    price_snapshots: [
      { fuel_type: 'gasoline', price: 1660, date: '2026-06-10' },
      { fuel_type: 'diesel', price: 1510, date: '2026-06-10' },
    ],
  },
  {
    id: 'A0000005',
    name: '성북 알뜰주유소',
    brand: 'ETC',
    address: '서울 성북구 성북로 567',
    lat: 37.5785,
    lng: 126.982,
    is_self: true,
    price_snapshots: [
      { fuel_type: 'gasoline', price: 1620, date: '2026-06-10' },
      { fuel_type: 'diesel', price: 1480, date: '2026-06-10' },
      { fuel_type: 'lpg', price: 870, date: '2026-06-10' },
    ],
  },
]
```

- [ ] **Step 2: src/mocks/handlers.ts 생성**

```typescript
import { http, HttpResponse } from 'msw'
import { stationFixtures } from './stationFixtures'

export const handlers = [
  http.get(/\/rest\/v1\/stations/, () => {
    return HttpResponse.json(stationFixtures, {
      headers: { 'Content-Range': '0-4/5' },
    })
  }),
]
```

- [ ] **Step 3: src/mocks/browser.ts 생성**

```typescript
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

- [ ] **Step 4: src/test/setup.ts 수정 — MSW Node 서버 추가**

```typescript
import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { handlers } from '../mocks/handlers'

export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

- [ ] **Step 5: 기존 smoke test 유지 확인**

```bash
npm test -- src/test/smoke.test.tsx
```

Expected: PASS (App이 아직 '오일나우' 렌더링 유지 중)

- [ ] **Step 6: typecheck & 커밋**

```bash
npm run typecheck
git add src/mocks/ src/test/setup.ts
git commit -m "feat: MSW fixture, 핸들러, 브라우저 워커, 테스트 서버 설정"
```

---

## Task 4: Zustand filterStore

**Files:**
- Create: `src/store/filterStore.ts`
- Create: `src/test/filterStore.test.ts`

- [ ] **Step 1: filterStore.test.ts 작성 (실패 확인용)**

`src/test/filterStore.test.ts` 생성:

```typescript
import { act } from 'react'
import { useFilterStore } from '../store/filterStore'

beforeEach(() => {
  useFilterStore.setState({ fuelType: 'gasoline', sortOrder: 'distance' })
})

test('초기값 gasoline, distance', () => {
  const state = useFilterStore.getState()
  expect(state.fuelType).toBe('gasoline')
  expect(state.sortOrder).toBe('distance')
})

test('setFuelType → diesel로 변경', () => {
  act(() => useFilterStore.getState().setFuelType('diesel'))
  expect(useFilterStore.getState().fuelType).toBe('diesel')
})

test('setSortOrder → price로 변경', () => {
  act(() => useFilterStore.getState().setSortOrder('price'))
  expect(useFilterStore.getState().sortOrder).toBe('price')
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm test -- src/test/filterStore.test.ts
```

Expected: FAIL

- [ ] **Step 3: src/store/filterStore.ts 생성**

```typescript
import { create } from 'zustand'
import type { FuelType, SortOrder } from '../types/station'

interface FilterState {
  fuelType: FuelType
  sortOrder: SortOrder
  setFuelType: (fuelType: FuelType) => void
  setSortOrder: (sortOrder: SortOrder) => void
}

export const useFilterStore = create<FilterState>((set) => ({
  fuelType: 'gasoline',
  sortOrder: 'distance',
  setFuelType: (fuelType) => set({ fuelType }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
}))
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm test -- src/test/filterStore.test.ts
```

Expected: PASS (3 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/store/filterStore.ts src/test/filterStore.test.ts
git commit -m "feat: Zustand filterStore — 유종/정렬 상태 관리"
```

---

## Task 5: useGeolocation 훅

**Files:**
- Create: `src/hooks/useGeolocation.ts`
- Create: `src/test/useGeolocation.test.ts`

- [ ] **Step 1: useGeolocation.test.ts 작성 (실패 확인용)**

`src/test/useGeolocation.test.ts` 생성:

```typescript
import { renderHook, act, waitFor } from '@testing-library/react'
import { useGeolocation } from '../hooks/useGeolocation'

const mockGetCurrentPosition = vi.fn()

beforeEach(() => {
  Object.defineProperty(global.navigator, 'geolocation', {
    configurable: true,
    value: { getCurrentPosition: mockGetCurrentPosition },
  })
})

test('위치 허용 시 granted + 좌표 반환', async () => {
  mockGetCurrentPosition.mockImplementation((success: PositionCallback) => {
    success({ coords: { latitude: 37.5665, longitude: 126.978 } } as GeolocationPosition)
  })
  const { result } = renderHook(() => useGeolocation())
  await waitFor(() => expect(result.current.status).toBe('granted'))
  expect(result.current.lat).toBe(37.5665)
  expect(result.current.lng).toBe(126.978)
})

test('위치 거부 시 denied + 좌표 null', async () => {
  mockGetCurrentPosition.mockImplementation(
    (_: PositionCallback, error: PositionErrorCallback) => {
      error({ code: 1, message: 'denied' } as GeolocationPositionError)
    },
  )
  const { result } = renderHook(() => useGeolocation())
  await waitFor(() => expect(result.current.status).toBe('denied'))
  expect(result.current.lat).toBeNull()
})

test('geolocation 미지원 시 unavailable', async () => {
  Object.defineProperty(global.navigator, 'geolocation', {
    configurable: true,
    value: undefined,
  })
  const { result } = renderHook(() => useGeolocation())
  await waitFor(() => expect(result.current.status).toBe('unavailable'))
})

test('setFallbackRegion으로 fallback 지역 설정', async () => {
  mockGetCurrentPosition.mockImplementation(
    (_: PositionCallback, error: PositionErrorCallback) => {
      error({ code: 1, message: 'denied' } as GeolocationPositionError)
    },
  )
  const { result } = renderHook(() => useGeolocation())
  await waitFor(() => expect(result.current.status).toBe('denied'))
  act(() => result.current.setFallbackRegion('서울'))
  expect(result.current.fallbackRegion).toBe('서울')
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm test -- src/test/useGeolocation.test.ts
```

Expected: FAIL

- [ ] **Step 3: src/hooks/useGeolocation.ts 생성**

```typescript
import { useState, useEffect } from 'react'

export type GeolocationStatus = 'pending' | 'granted' | 'denied' | 'unavailable'

export interface UseGeolocationResult {
  status: GeolocationStatus
  lat: number | null
  lng: number | null
  fallbackRegion: string | null
  setFallbackRegion: (region: string) => void
}

export function useGeolocation(): UseGeolocationResult {
  const [status, setStatus] = useState<GeolocationStatus>('pending')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [fallbackRegion, setFallbackRegion] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('unavailable')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        setStatus('granted')
      },
      () => {
        setStatus('denied')
      },
    )
  }, [])

  return { status, lat, lng, fallbackRegion, setFallbackRegion }
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm test -- src/test/useGeolocation.test.ts
```

Expected: PASS (4 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/hooks/useGeolocation.ts src/test/useGeolocation.test.ts
git commit -m "feat: useGeolocation 훅 — Geolocation API + denied fallback"
```

---

## Task 6: useStations 훅

**Files:**
- Create: `src/hooks/useStations.ts`
- Create: `src/test/useStations.test.ts`

- [ ] **Step 1: useStations.test.ts 작성 (실패 확인용)**

`src/test/useStations.test.ts` 생성:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useStations } from '../hooks/useStations'

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

test('lat/lng가 null이면 쿼리 비활성화', () => {
  const { result } = renderHook(() => useStations(null, null, 'gasoline'), { wrapper })
  expect(result.current.data).toBeUndefined()
  expect(result.current.fetchStatus).toBe('idle')
})

test('lat/lng 제공 시 fixture 주유소 반환 (서울 중심 2km)', async () => {
  // fixtures 5개 모두 서울 중심(37.5665, 126.978) 기준 약 1km 이내
  const { result } = renderHook(
    () => useStations(37.5665, 126.978, 'gasoline'),
    { wrapper },
  )
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data!.length).toBeGreaterThan(0)
  // 모든 항목에 distance 값 존재
  result.current.data!.forEach((s) => expect(s.distance).toBeGreaterThan(0))
})

test('gasoline fuelType 선택 시 price 필드 존재', async () => {
  const { result } = renderHook(
    () => useStations(37.5665, 126.978, 'gasoline'),
    { wrapper },
  )
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  const withPrice = result.current.data!.filter((s) => s.price !== null)
  expect(withPrice.length).toBeGreaterThan(0)
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm test -- src/test/useStations.test.ts
```

Expected: FAIL

- [ ] **Step 3: src/hooks/useStations.ts 생성**

```typescript
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
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm test -- src/test/useStations.test.ts
```

Expected: PASS (3 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/hooks/useStations.ts src/test/useStations.test.ts
git commit -m "feat: useStations 훅 — TanStack Query + Supabase bbox 쿼리 + Haversine 필터"
```

---

## Task 7: FilterBar 컴포넌트

**Files:**
- Create: `src/components/home/FilterBar.tsx`
- Create: `src/test/FilterBar.test.tsx`

- [ ] **Step 1: FilterBar.test.tsx 작성 (실패 확인용)**

`src/test/FilterBar.test.tsx` 생성:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBar } from '../components/home/FilterBar'
import { useFilterStore } from '../store/filterStore'

beforeEach(() => {
  useFilterStore.setState({ fuelType: 'gasoline', sortOrder: 'distance' })
})

test('유종 버튼 3개 렌더링', () => {
  render(<FilterBar />)
  expect(screen.getByRole('radio', { name: '휘발유' })).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: '경유' })).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: 'LPG' })).toBeInTheDocument()
})

test('경유 클릭 → filterStore fuelType=diesel', async () => {
  const user = userEvent.setup()
  render(<FilterBar />)
  await user.click(screen.getByRole('radio', { name: '경유' }))
  expect(useFilterStore.getState().fuelType).toBe('diesel')
})

test('정렬 select → price 선택', async () => {
  const user = userEvent.setup()
  render(<FilterBar />)
  await user.selectOptions(screen.getByRole('combobox', { name: '정렬 기준' }), 'price')
  expect(useFilterStore.getState().sortOrder).toBe('price')
})

test('선택된 유종 버튼 aria-checked=true', () => {
  render(<FilterBar />)
  expect(screen.getByRole('radio', { name: '휘발유' })).toHaveAttribute('aria-checked', 'true')
  expect(screen.getByRole('radio', { name: '경유' })).toHaveAttribute('aria-checked', 'false')
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm test -- src/test/FilterBar.test.tsx
```

Expected: FAIL

- [ ] **Step 3: src/components/home/FilterBar.tsx 생성**

```typescript
import { useFilterStore } from '../../store/filterStore'
import type { FuelType, SortOrder } from '../../types/station'

const FUEL_OPTIONS: { value: FuelType; label: string }[] = [
  { value: 'gasoline', label: '휘발유' },
  { value: 'diesel', label: '경유' },
  { value: 'lpg', label: 'LPG' },
]

export function FilterBar() {
  const { fuelType, sortOrder, setFuelType, setSortOrder } = useFilterStore()

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b shrink-0">
      <div role="radiogroup" aria-label="유종 선택" className="flex gap-1">
        {FUEL_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            role="radio"
            aria-checked={fuelType === opt.value}
            onClick={() => setFuelType(opt.value)}
            className={`px-3 rounded-full text-sm font-medium min-h-[44px] ${
              fuelType === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value as SortOrder)}
        aria-label="정렬 기준"
        className="ml-auto px-3 text-sm rounded border min-h-[44px]"
      >
        <option value="distance">거리순</option>
        <option value="price">가격순</option>
      </select>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm test -- src/test/FilterBar.test.tsx
```

Expected: PASS (4 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/components/home/FilterBar.tsx src/test/FilterBar.test.tsx
git commit -m "feat: FilterBar 컴포넌트 — 유종 토글, 정렬, 접근성"
```

---

## Task 8: StationCard + EmptyState 컴포넌트

**Files:**
- Create: `src/components/home/StationCard.tsx`
- Create: `src/components/home/EmptyState.tsx`
- Create: `src/test/StationCard.test.tsx`

- [ ] **Step 1: StationCard.test.tsx 작성 (실패 확인용)**

`src/test/StationCard.test.tsx` 생성:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StationCard } from '../components/home/StationCard'
import type { StationWithPrice } from '../types/station'

const station: StationWithPrice = {
  id: 'A0000001',
  name: '강남 SK에너지',
  brand: 'SKE',
  address: '서울 강남구',
  lat: 37.568,
  lng: 127.0,
  is_self: false,
  distance: 340,
  price: 1680,
  latestDate: '2026-06-10',
}

test('이름, 거리, 가격 렌더링', () => {
  render(<StationCard station={station} isLowest={false} onClick={() => {}} />)
  expect(screen.getByText('강남 SK에너지')).toBeInTheDocument()
  expect(screen.getByText(/340m/)).toBeInTheDocument()
  expect(screen.getByText(/1,680원/)).toBeInTheDocument()
})

test('price null → — 표시', () => {
  render(<StationCard station={{ ...station, price: null }} isLowest={false} onClick={() => {}} />)
  expect(screen.getByText('—')).toBeInTheDocument()
})

test('isLowest=true → 가격에 text-blue-600 클래스', () => {
  render(<StationCard station={station} isLowest={true} onClick={() => {}} />)
  expect(screen.getByText(/1,680원/)).toHaveClass('text-blue-600')
})

test('셀프 주유소 표시', () => {
  render(<StationCard station={{ ...station, is_self: true }} isLowest={false} onClick={() => {}} />)
  expect(screen.getByText('셀프')).toBeInTheDocument()
})

test('onClick 핸들러 호출', async () => {
  const onClick = vi.fn()
  const user = userEvent.setup()
  render(<StationCard station={station} isLowest={false} onClick={onClick} />)
  await user.click(screen.getByRole('button'))
  expect(onClick).toHaveBeenCalledTimes(1)
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm test -- src/test/StationCard.test.tsx
```

Expected: FAIL

- [ ] **Step 3: src/components/home/StationCard.tsx 생성**

```typescript
import type { StationWithPrice } from '../../types/station'

interface Props {
  station: StationWithPrice
  isLowest: boolean
  onClick: () => void
}

export function StationCard({ station, isLowest, onClick }: Props) {
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
        <div className="text-xs text-gray-400 mt-0.5">
          {Math.round(station.distance)}m · {station.brand}
        </div>
      </div>
      <div className="shrink-0 text-right ml-3">
        {station.price != null ? (
          <span className={`font-bold text-sm ${isLowest ? 'text-blue-600' : 'text-gray-900'}`}>
            {station.price.toLocaleString()}원
          </span>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </div>
    </button>
  )
}
```

- [ ] **Step 4: src/components/home/EmptyState.tsx 생성**

```typescript
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <p className="text-gray-500 text-sm">주변 2km 내 주유소가 없어요</p>
      <p className="text-gray-400 text-xs mt-1">지역을 변경하거나 다른 유종을 선택해 보세요</p>
    </div>
  )
}
```

- [ ] **Step 5: 테스트 실행 — 통과 확인**

```bash
npm test -- src/test/StationCard.test.tsx
```

Expected: PASS (5 tests)

- [ ] **Step 6: 커밋**

```bash
git add src/components/home/StationCard.tsx src/components/home/EmptyState.tsx src/test/StationCard.test.tsx
git commit -m "feat: StationCard, EmptyState 컴포넌트"
```

---

## Task 9: StationList (TanStack Virtual)

**Files:**
- Create: `src/components/home/StationList.tsx`
- Create: `src/test/StationList.test.tsx`

- [ ] **Step 1: StationList.test.tsx 작성 (실패 확인용)**

`src/test/StationList.test.tsx` 생성:

```typescript
import { render, screen } from '@testing-library/react'
import { StationList } from '../components/home/StationList'
import type { StationWithPrice } from '../types/station'

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count }: { count: number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, i) => ({
        key: i,
        index: i,
        start: i * 64,
        size: 64,
      })),
    getTotalSize: () => count * 64,
  }),
}))

function makeStation(id: string, price: number | null, distance: number): StationWithPrice {
  return {
    id,
    name: `주유소 ${id}`,
    brand: 'SKE',
    address: '서울',
    lat: 37.5,
    lng: 127.0,
    is_self: false,
    distance,
    price,
    latestDate: price ? '2026-06-10' : null,
  }
}

test('빈 배열 → EmptyState 렌더링', () => {
  render(<StationList stations={[]} onStationClick={() => {}} />)
  expect(screen.getByText(/주변 2km 내 주유소가 없어요/)).toBeInTheDocument()
})

test('주유소 있을 때 카드 렌더링', () => {
  const stations = [makeStation('001', 1680, 300), makeStation('002', 1650, 500)]
  render(<StationList stations={stations} onStationClick={() => {}} />)
  expect(screen.getByText('주유소 001')).toBeInTheDocument()
  expect(screen.getByText('주유소 002')).toBeInTheDocument()
})

test('최저가 주유소 isLowest=true 전달', () => {
  const stations = [
    makeStation('001', 1680, 300),
    makeStation('002', 1620, 500),
  ]
  render(<StationList stations={stations} onStationClick={() => {}} />)
  // 가격 1620원 카드에 text-blue-600 클래스
  const prices = screen.getAllByText(/원/)
  const lowestPriceEl = prices.find((el) => el.textContent === '1,620원')
  expect(lowestPriceEl).toHaveClass('text-blue-600')
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm test -- src/test/StationList.test.tsx
```

Expected: FAIL

- [ ] **Step 3: src/components/home/StationList.tsx 생성**

```typescript
import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { StationCard } from './StationCard'
import { EmptyState } from './EmptyState'
import type { StationWithPrice } from '../../types/station'

interface Props {
  stations: StationWithPrice[]
  onStationClick: (id: string) => void
}

export function StationList({ stations, onStationClick }: Props) {
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
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm test -- src/test/StationList.test.tsx
```

Expected: PASS (3 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/components/home/StationList.tsx src/test/StationList.test.tsx
git commit -m "feat: StationList — TanStack Virtual 가상 스크롤, 최저가 강조"
```

---

## Task 10: KakaoMap 컴포넌트

**Files:**
- Create: `src/components/home/KakaoMap.tsx`

> 카카오맵 SDK는 jsdom에서 동작하지 않아 단위 테스트 없음.
> window.kakao?.maps 체크로 SDK 미로드 시 빈 div 렌더링.

- [ ] **Step 1: src/components/home/KakaoMap.tsx 생성**

```typescript
import { useEffect, useRef } from 'react'
import type { StationWithPrice } from '../../types/station'

declare global {
  interface Window {
    kakao: any
  }
}

interface Props {
  lat: number
  lng: number
  stations: StationWithPrice[]
  onMarkerClick: (stationId: string) => void
}

export function KakaoMap({ lat, lng, stations, onMarkerClick }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const clustererRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps) return
    const center = new window.kakao.maps.LatLng(lat, lng)
    mapInstanceRef.current = new window.kakao.maps.Map(mapRef.current, {
      center,
      level: 5,
    })
    clustererRef.current = new window.kakao.maps.MarkerClusterer({
      map: mapInstanceRef.current,
      averageCenter: true,
      minLevel: 6,
    })
  }, [lat, lng])

  useEffect(() => {
    if (!mapInstanceRef.current || !clustererRef.current || !window.kakao?.maps) return
    clustererRef.current.clear()
    const markers = stations.map((station) => {
      const position = new window.kakao.maps.LatLng(station.lat, station.lng)
      const marker = new window.kakao.maps.Marker({ position })
      window.kakao.maps.event.addListener(marker, 'click', () => {
        onMarkerClick(station.id)
      })
      return marker
    })
    clustererRef.current.addMarkers(markers)
  }, [stations, onMarkerClick])

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '50vh' }}
      aria-label="주유소 지도"
      role="img"
    />
  )
}
```

- [ ] **Step 2: typecheck 확인**

```bash
npm run typecheck
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add src/components/home/KakaoMap.tsx
git commit -m "feat: KakaoMap 컴포넌트 — 마커 클러스터러, 마커 클릭 네비게이션"
```

---

## Task 11: HomePage 조립 & App.tsx 라우팅

**Files:**
- Create: `src/pages/HomePage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/test/smoke.test.tsx`

- [ ] **Step 1: src/pages/HomePage.tsx 생성**

```typescript
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
    <div className="flex flex-col h-svh">
      {activeLat !== null && activeLng !== null ? (
        <KakaoMap
          lat={activeLat}
          lng={activeLng}
          stations={stations}
          onMarkerClick={(id) => navigate(`/stations/${id}`)}
        />
      ) : (
        <div
          className="flex items-center justify-center bg-gray-100 shrink-0"
          style={{ height: '50vh' }}
          aria-label="주유소 지도"
          role="img"
        >
          {status === 'pending' && (
            <p className="text-gray-400 text-sm">위치 확인 중...</p>
          )}
          {(status === 'denied' || status === 'unavailable') && (
            <p className="text-gray-400 text-sm">지역을 선택하면 지도가 표시됩니다</p>
          )}
        </div>
      )}

      {(status === 'denied' || status === 'unavailable') && (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border-b shrink-0">
          <label htmlFor="region-select" className="text-xs text-gray-600 shrink-0">
            지역 선택
          </label>
          <select
            id="region-select"
            value={fallbackRegion ?? ''}
            onChange={(e) => setFallbackRegion(e.target.value)}
            className="text-sm border rounded px-2 min-h-[44px]"
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
        <p className="text-center text-sm text-red-500 py-4">
          데이터를 불러오지 못했어요
        </p>
      )}

      <StationList
        stations={stations}
        onStationClick={(id) => navigate(`/stations/${id}`)}
      />
    </div>
  )
}
```

- [ ] **Step 2: src/App.tsx 교체**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HomePage } from './pages/HomePage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stations/:id" element={<div className="p-4">상세 화면 (Step 5)</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 3: smoke test 업데이트**

`src/test/smoke.test.tsx`를 아래로 교체:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'

beforeEach(() => {
  Object.defineProperty(global.navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: vi.fn(
        (_: PositionCallback, error: PositionErrorCallback) => {
          error({ code: 1, message: 'denied' } as GeolocationPositionError)
        },
      ),
    },
  })
})

test('앱 렌더링 — FilterBar 유종 버튼 표시', async () => {
  render(<App />)
  await waitFor(() => {
    expect(screen.getByRole('radio', { name: '휘발유' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: 전체 테스트 실행 — 통과 확인**

```bash
npm test
```

Expected: 모든 테스트 PASS

- [ ] **Step 5: typecheck 확인**

```bash
npm run typecheck
```

Expected: 오류 없음

- [ ] **Step 6: 커밋**

```bash
git add src/pages/HomePage.tsx src/App.tsx src/test/smoke.test.tsx
git commit -m "feat: Step 4 홈 화면 — 지도, 필터, 가상 스크롤 리스트 조립"
```

---

## 완료 체크리스트

- [ ] `npm test` 전체 통과
- [ ] `npm run typecheck` 오류 없음
- [ ] `npm run dev` 실행 후 화면 렌더링 확인
- [ ] Geolocation 허용 시 지도에 사용자 위치 표시
- [ ] Geolocation 거부 시 시/도 드롭다운 표시
- [ ] 유종 토글 클릭 → 리스트 변경 확인
- [ ] 정렬 변경 → 리스트 순서 변경 확인
- [ ] 주유소 카드 클릭 → `/stations/:id` 이동 확인
- [ ] 0건 empty state 표시 확인 (LPG 선택 후 해당 주유소 없는 fixture 확인)
