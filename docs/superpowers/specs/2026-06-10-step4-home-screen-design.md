# Step 4 홈 화면 설계

> 작성일: 2026-06-10
> 단계: Phase 1 — Step 4

---

## 1. 목표

사용자 위치 기반으로 주변 2km 이내 주유소를 지도(상단)와 리스트(하단)로 보여주는 홈 화면.
유종 필터·정렬을 제공하고, 1,000건 이상에서도 스크롤 버벅임 없이 동작한다.

---

## 2. 레이아웃

**상단 지도 + 하단 리스트** (모바일 기준)

```
┌──────────────────────────────┐
│  지도 (카카오맵) — 50vh      │  ← 사용자 위치 기반, 마커 클러스터러
│  주유소 마커 표시             │
├──────────────────────────────┤
│  [유종 토글]        [정렬]    │  ← FilterBar
├──────────────────────────────┤
│  주유소 카드                  │
│  주유소 카드                  │  ← TanStack Virtual 가상 스크롤
│  주유소 카드                  │
│  ...                         │
└──────────────────────────────┘
```

- 지도는 항상 상단에 노출 (사용자 위치 확인 즉시)
- 지도는 항상 노출 (접기/펼치기 없음 — Phase 2 검토)
- Geolocation 거부 시 FilterBar 위에 시/도 드롭다운 노출, 선택 시 해당 중심 좌표 사용

> **Phase 2 메모:** 유종·정렬 상태를 URL 쿼리 파라미터(`?fuel=gasoline&sort=price`)로 관리하면 딥링크·공유 자동 지원. `useSearchParams` 활용. Phase 1은 Zustand로 단순화.

---

## 3. 아키텍처

**접근법 A: 커스텀 훅 + 컴포넌트 UI 분리**

- 커스텀 훅으로 로직 격리 → RTL 테스트 용이
- TanStack Query: 서버 상태(주유소 목록, 가격) 캐싱
- Zustand: 클라이언트 UI 상태(유종, 정렬) 전용
- MSW: 개발 중 Supabase REST 요청 가로채기

---

## 4. 폴더 구조

```
src/
  pages/
    HomePage.tsx
  components/
    home/
      FilterBar.tsx          # 유종 토글 + 정렬
      StationList.tsx        # TanStack Virtual 가상 스크롤 컨테이너
      StationCard.tsx        # 리스트 항목 1개
      EmptyState.tsx         # 0건 안내
  hooks/
    useGeolocation.ts        # Geolocation API + denied 상태 관리
    useStations.ts           # TanStack Query + Supabase 쿼리
  store/
    filterStore.ts           # Zustand: fuelType, sortOrder
  lib/
    supabase.ts              # Supabase 클라이언트 초기화
    distance.ts              # Haversine 거리 계산 (순수 함수)
  mocks/
    handlers.ts              # MSW Supabase REST handler
    stationFixtures.ts       # fixture 데이터 (주유소 20건 내외)
```

---

## 5. 데이터 플로우

```
useGeolocation
  → { lat, lng } or { denied: true }
      ↓
useStations(lat, lng, radius=2000)
  → TanStack Query
  → Supabase: stations bbox 필터 + price_snapshots 최신 join
  → 응답: StationWithPrice[]
      ↓
클라이언트 필터링
  → Haversine 거리 ≤ 2000m
  → fuelType 필터 (filterStore)
  → sortOrder 정렬 (distance | price)
      ↓
StationList → TanStack Virtual → StationCard × N
```

**개발 중 (MSW):** Supabase REST 요청을 MSW가 가로채 stationFixtures 반환.
**프로덕션:** MSW 없이 Supabase가 직접 응답.

---

## 6. Supabase 쿼리 설계

PostGIS 없이 bbox 프리필터 + 클라이언트 Haversine 방식:

```ts
// bbox: lat ± 0.018도(~2km), lng ± 0.022도(~2km)
supabase
  .from('stations')
  .select(`
    id, name, brand, address, lat, lng, is_self,
    price_snapshots(fuel_type, price, date)
  `)
  .gte('lat', lat - 0.018).lte('lat', lat + 0.018)
  .gte('lng', lng - 0.022).lte('lng', lng + 0.022)
```

- `price_snapshots`는 가장 최근 날짜 1행만 (TanStack Query로 클라이언트 정렬)
- 오늘 스냅샷 없는 주유소 → 가장 최근 스냅샷 표시, 완전 없으면 `—`

---

## 7. 카카오맵 통합

- `index.html`에 정적 스크립트 태그로 SDK 로드 (공식 권장 방식)
- Vite는 `index.html`에서 `%VITE_*%` 치환을 네이티브 지원 → 별도 플러그인 불필요
- 지도 인스턴스는 `useRef`로 관리, `useEffect`에서 초기화
- 마커 클러스터러: 카카오맵 내장 MarkerClusterer 사용
- 마커 클릭 → `navigate('/stations/:id')`

**Vite HTML 환경변수 주입 방식:**
```html
<!-- index.html -->
<script>
  window.KAKAO_MAP_KEY = '%VITE_KAKAO_MAP_KEY%'
</script>
<script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=%VITE_KAKAO_MAP_KEY%&libraries=clusterer"></script>
```

---

## 8. 상태 관리

| 상태 | 관리 주체 | 내용 |
|------|----------|------|
| 사용자 위치 | `useGeolocation` (local) | lat, lng, status |
| 주유소 목록 | TanStack Query | StationWithPrice[] |
| 유종 필터 | Zustand `filterStore` | `'gasoline' \| 'diesel' \| 'lpg'` |
| 정렬 순서 | Zustand `filterStore` | `'distance' \| 'price'` |
| fallback 시/도 | `useGeolocation` (local) | 드롭다운 선택값 |

---

## 9. 에러 처리

| 케이스 | 처리 |
|--------|------|
| Geolocation 거부 | 시/도 드롭다운 fallback 표시 |
| 주변 주유소 0건 | EmptyState 컴포넌트 ("주변에 주유소가 없어요") |
| Supabase 쿼리 실패 | TanStack Query 에러 상태 → 재시도 버튼 |
| 카카오맵 로드 실패 | 지도 영역에 안내 문구 ("지도를 불러오지 못했어요") |
| 가격 데이터 없음 | 카드에 `—` 표시 |

---

## 10. 접근성 & 성능

- 터치 타깃 ≥ 44px (FilterBar 버튼, StationCard)
- 유종 토글: `role="radiogroup"` + `aria-checked`
- 정렬: `<select>` 또는 `role="listbox"`
- 카드 클릭: `<button>` 또는 `role="button"` + `onKeyDown`
- 가상 스크롤: 1,000건 기준 렌더 행 ≤ 15개

---

## 11. 테스트 계획

| 대상 | 방식 | 검증 내용 |
|------|------|----------|
| `useGeolocation` | RTL | denied 시 fallback 상태 반환 |
| `FilterBar` | RTL | 유종 토글 클릭 → filterStore 업데이트 |
| `FilterBar` | RTL | 정렬 변경 → filterStore 업데이트 |
| `StationList` | RTL + MSW | 0건 → EmptyState, N건 → 카드 렌더 |
| `distance.ts` | Vitest | Haversine 기준점 검증 |

---

## 12. 완료 기준 (plan.md 동기)

- [ ] mock 데이터로 화면 정상 렌더링
- [ ] Geolocation 거부 시 fallback 동작
- [ ] 1,000건 이상 가상 스크롤 버벅임 없음
- [ ] 유종 토글 RTL 테스트 통과
- [ ] 정렬(거리/가격) RTL 테스트 통과
- [ ] 터치 타깃 ≥ 44px
- [ ] 키보드 내비게이션 (탭 순서)
- [ ] 0건 empty state 동작
