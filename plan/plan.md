# Phase 1 실행 계획 — oil_now

> 생성일: 2026-06-03
> 마지막 갱신: 2026-06-11
> 현재 Phase: Phase 1 — MVP
> 현재 Step: Step 6 QA 패스

---

## Phase 1 진행 현황

| Step | 작업 | 상태 |
|------|------|------|
| Step 1 | 프로젝트 스캐폴딩 | ✅ 완료 |
| Step 2 | Supabase 스키마 | ✅ 완료 |
| Step 3 | collect-prices Edge Function | 🔶 구현 완료 (배포 전) |
| Step 4 | 홈 화면 | ✅ 완료 |
| Step 4.5 | 탭 네비게이션 + 실시간 유가 mock 대시보드 | ✅ 완료 |
| Step 5 | 실시간 주변 주유소(Opinet) + 말풍선 오버레이 | ✅ 완료 |
| Step 6 | QA 패스 | ⬜ 미시작 |

---

## Step 1: 프로젝트 스캐폴딩

**상태:** ✅ 완료 (2026-06-10)

**범위:**
- Vite + React 19 + TypeScript 프로젝트 생성
- Tailwind CSS, TanStack Query, Zustand 설치
- Vitest + Testing Library + MSW 설정
- **TanStack Virtual** 설치 (가상 스크롤, TanStack 생태계 통일)
- **Recharts** 설치 (차트 라이브러리 — React 친화적, 접근성 대응 용이)
- 폴더 구조 정의 및 문서화
- vite-plugin-pwa 기본 설정 (manifest: 아이콘/이름만, 웹푸시 제외)

**완료 기준:**
- `npm run dev` → 앱 정상 실행
- `npm run test` → 테스트 러너 정상 실행
- TypeScript 컴파일 오류 없음
- 폴더 구조 README 또는 주석 존재

**검증 체크리스트:**
- [ ] `npm run dev` 200 응답 확인
- [x] `npm run test` 실행 확인
- [x] `npm run build` TypeScript/Vite 빌드 오류 없음

**다음 Step:** Step 2 Supabase 스키마

---

## Step 2: Supabase 스키마

**상태:** ✅ 완료 (2026-06-10)

**범위:**
- `stations` 테이블: id(오피넷 UNI_ID, PK), name, brand, address, lat, lng(WGS84), is_self, updated_at
- `price_snapshots` 테이블: id, station_id(FK), date, fuel_type, price, collected_at
- `collection_logs` 테이블: id, job, started_at, finished_at, status(success/partial/fail), rows, error
- unique constraint: `(station_id, date, fuel_type)` — 멱등 적재
- 인덱스: `(station_id, fuel_type, date)`
- RLS: 읽기 공개 + 쓰기 Edge Function 전용 정책

**결정 사항 (fix.md #1, #2 해소):**
- `price_snapshots.fuel_type` → `TEXT` 타입 (API 확인 전 안전한 선택, 숫자 확인 시 마이그레이션)
- `stations.updated_at` → Supabase `moddatetime` 확장으로 자동 갱신 트리거 추가

**완료 기준:**
- SQL migration 파일 존재
- 각 테이블 목적 주석 포함
- `price_snapshots` 멱등 upsert 가능 (ON CONFLICT)
- RLS 정책 명시 (읽기 공개, 쓰기 서비스 롤 전용)

**검증 체크리스트:**
- [x] migration 실행 성공
- [x] unique constraint `(station_id, date, fuel_type)` 동작
- [x] 인덱스 생성 확인
- [x] RLS 읽기/쓰기 정책 동작

**다음 Step:** Step 3 collect-prices Edge Function

---

## Step 3: collect-prices Edge Function

**상태:** 🔶 구현 완료 / 배포 미실시 (2026-06-10)

**범위:**
- Opinet API 클라이언트 (환경변수로 API 키 관리) ✅
- 응답 파싱 (`src/lib/parseOpinet.ts`) ✅
- KATEC → WGS84 좌표 변환 — 순수 수학 구현, 외부 의존성 없음 (`src/lib/coord.ts`) ✅
- `stations` + `price_snapshots` 조합 단위 배치 upsert (멱등) ✅
- `collection_logs` 3-status (success/partial/fail) 기록, rows=0 가드 포함 ✅
- 부분 실패 허용: 시도/유종 조합별 try/catch 격리 ✅
- pg_cron 마이그레이션 — Vault 시크릿 참조 방식, git 커밋 안전 ✅

**미결 이슈:**
- fix.md #14: lowTop10.do 파라미터명 실호출 미검증 → 최초 배포 후 확인 필요
- fix.md #11: coord 코드 중복 → Phase 2 개선 예정

**완료 기준:**
- Edge Function 배포 가능
- MSW 또는 fixture로 파서 단위 테스트 통과
- 좌표 변환 단위 테스트 통과
- collection_logs success/partial/fail 기록 확인
- API 키 클라이언트 노출 없음

**검증 체크리스트:**
- [x] 좌표 변환 단위 테스트 통과 (기준점 3개 — TM원점/서울/제주)
- [x] 파서 단위 테스트 통과 (fixture 6개)
- [x] collection_logs 3가지 status 코드 로직 구현 + rows=0 가드
- [x] API 키 환경변수 처리 (클라이언트 소스에 키 없음)
- [x] 배치 upsert 적용 (조합 단위 일괄 처리)
- [ ] 실제 배포 후 Opinet API 파라미터·응답 경로 실호출 검증 (fix.md #14)

**다음 Step:** Step 4 홈 화면

---

## Step 4: 홈 화면

**상태:** ✅ 완료 (2026-06-10)

**범위:**
- Geolocation → 카카오맵 표시 (index.html 정적 스크립트 태그 로드) ✅
- Geolocation 거부 시 fallback (시/도 드롭다운) ✅
- 주변 주유소 마커 + **카카오맵 내장 클러스터러** 사용 ✅
- 주유소 리스트 (**TanStack Virtual** 가상 스크롤) ✅
- 유종 토글 (휘발유/경유/LPG) ✅
- 정렬 (거리/가격) ✅
- 최저가 가볍게 강조 ✅
- 주변 주유소 0건 empty state 처리 ✅

**구현 파일:**
- `src/types/station.ts`, `src/lib/distance.ts`, `src/lib/regions.ts`, `src/lib/supabase.ts`
- `src/mocks/stationFixtures.ts`, `src/mocks/handlers.ts`, `src/mocks/browser.ts`
- `src/store/filterStore.ts`
- `src/hooks/useGeolocation.ts`, `src/hooks/useStations.ts`
- `src/components/home/FilterBar.tsx`, `src/components/home/StationCard.tsx`, `src/components/home/EmptyState.tsx`, `src/components/home/StationList.tsx`, `src/components/home/KakaoMap.tsx`
- `src/pages/HomePage.tsx`, `src/App.tsx`

**검증 체크리스트:**
- [ ] Lighthouse FCP < 3s (프로덕션 빌드 기준 — Step 6 QA에서 측정)
- [ ] 가상 스크롤 1,000건 이상 동작 확인 (Step 6 QA)
- [x] 터치 타깃 ≥ 44px (FilterBar min-h-[44px], StationCard min-h-[64px])
- [ ] 키보드 내비게이션 (탭 순서 — Step 6 QA)
- [x] Geolocation fallback 동작 (smoke test + useGeolocation.test.ts 4개 통과)
- [x] 0건 empty state 동작 (StationList.test.tsx 통과)
- [x] 유종 토글 RTL 테스트 통과 (FilterBar.test.tsx 4개 통과)
- [x] 정렬(거리/가격) RTL 테스트 통과 (FilterBar.test.tsx 통과)

**다음 Step:** Step 4.5 탭 네비게이션 + 실시간 유가 mock 대시보드

---

## Step 4.5: 탭 네비게이션 + 실시간 유가 mock 대시보드

**상태:** ✅ 완료 (2026-06-11)

**배경:** 홈이 지도+유종 토글만 노출되어 정보 구조가 빈약. 상단 탭으로 섹션을 분리하고, 첫 화면을 실시간 유가로 전환.

**범위:**
- 상단 3탭 네비게이션 (실시간 유가 / 주변 주유소 / 유가 뉴스)
- 라우팅 재구성: `/`=실시간 유가, `/nearby`=주변 주유소(기존 HomePage), `/news`=유가 뉴스
- 실시간 유가 대시보드 (mock): 전국 평균가 카드 3종(휘발유/경유/LPG) + 전일 대비 변동 + 최근 7일 추이 차트(Recharts)
- `useAvgPrices` 훅으로 데이터 추상화 — Phase 2에서 훅 내부만 Supabase 쿼리로 교체(UI 불변)
- 유가 뉴스 탭: "준비 중(Phase 2)" placeholder
- `/stations/:id` 상세는 탭바 밖 유지

**범위 경계 (Phase 2 유지):**
- 평균가 데이터 수집 백엔드(`collect-regional-avg`, `regional_avg` 테이블) — Phase 2
- 뉴스 크롤링(`collect-news`, `news` 테이블) — Phase 2

**구현 파일:**
- 신규: `components/layout/TabBar.tsx`, `components/layout/MainLayout.tsx`, `pages/PricesPage.tsx`, `pages/NewsPage.tsx`, `components/prices/AvgPriceCard.tsx`, `components/prices/PriceTrendChart.tsx`, `hooks/useAvgPrices.ts`, `mocks/avgPriceFixtures.ts`
- 수정: `App.tsx`(라우팅), `HomePage.tsx`(h-svh→flex-1)

**완료 기준:**
- 3탭 전환 동작, 첫 화면 실시간 유가
- 실시간 유가 대시보드 평균가 카드 + 추이 차트 렌더 (mock)
- 주변 주유소(`/nearby`) 기존 기능 회귀 없음
- 뉴스 placeholder crash 없음
- `npm run test` 전체 통과, `tsc --noEmit` 오류 없음

**검증 체크리스트:**
- [x] TabBar 3탭 렌더 + 활성 탭 aria-current RTL 테스트 (TabBar.test.tsx 3개)
- [x] AvgPriceCard 가격·변동 렌더 테스트 (AvgPriceCard.test.tsx 4개)
- [x] PricesPage mock 대시보드 렌더 + 차트 영역 (PricesPage.test.tsx 2개)
- [x] NewsPage placeholder 렌더 테스트 (NewsPage.test.tsx 1개)
- [x] 주변 주유소 기존 테스트 회귀 없음 (전체 14 files 45 tests PASS)
- [x] tsc --noEmit / npm run build 통과 (build 차단하던 기존 global 타입 에러도 해소 — fix.md S8)
- [ ] 브라우저 실물 확인: 탭 전환·차트 표시 (사용자 확인 대기)

**다음 Step:** Step 5 주유소 상세 화면

---

## Step 5: 실시간 주변 주유소 (Opinet 실연동) + 말풍선 오버레이

**상태:** ✅ 완료 (2026-06-11)

**배경:** 기존 홈은 mock 주유소(서울 고정 좌표)라 실제 주변 주유소가 아님. Opinet `aroundAll.do`로 실시간 반경 조회 + 마커 클릭 시 지도 위 말풍선 상세.

**검증 완료 (fix.md #14 해소, S10):** `aroundAll.do` 1회 호출로 주유소+현재가(PRICE 숫자)+거리(DISTANCE m)+KATEC좌표(GIS_X/Y_COOR) 반환 확인. **주소·셀프여부는 미제공.**

**전제 (이미 준비됨):**
- Opinet 키: Supabase Edge Function secret `OPINET_API_KEY` 등록 완료 (키 값: F260610744)
- 응답 필드: `UNI_ID, OS_NM, POLL_DIV_CD(브랜드코드), PRICE, DISTANCE, GIS_X_COOR, GIS_Y_COOR`
- 응답 경로: `RESULT.OIL[]` / 파라미터: `code, x, y, radius(≤5000), sort(1:가격), prodcd, out=json`
- 유종 매핑: `gasoline→B027 / diesel→D047 / lpg→K015` (collect-prices FUEL_MAP 재사용)
- 브랜드 매핑: collect-prices BRAND_MAP 재사용 (SKE/GSC/HDO/SOL...)

**범위:**
- Edge Function `around-stations`: `lat/lng/fuel` → `wgs84ToKatec` → `aroundAll.do(radius=5000, prodcd)` → 정규화(KATEC→WGS84, 브랜드 매핑, `address=''·is_self=false` 채움) → `StationWithPrice[]` 반환
- `wgs84ToKatec` 좌표 역변환 (`coord.ts`) + 왕복 테스트
- `useStations`: Supabase 테이블 쿼리 → `around-stations` 호출로 전환 (서버 DISTANCE 사용, 클라 haversine 제거)
- `KakaoMap`: 마커 클릭 시 `navigate('/stations/:id')` **제거** → 말풍선 오버레이(CustomOverlay: 상호/브랜드/현재가/거리), 다른 곳 클릭 시 닫힘
- `StationList`/`StationCard`/정렬: `StationWithPrice` 형태 유지로 거의 그대로

**범위 밖 (후속/Phase 2):**
- 가격 변동 차트, 즐겨찾기 ☆ 토글 (말풍선 요약엔 미포함 — 기존 Step 5 상세화면 항목은 Phase 2 보류로 이관)

**작업 순서 (TDD):**
1. `wgs84ToKatec` + 왕복 테스트 → 검증: `katecToWgs84(wgs84ToKatec(37.5665,126.978)) ≈ (37.5665,126.978)` 오차 < 수 m
2. `around-stations` Edge Function 작성 (`supabase/functions/around-stations/index.ts`)
3. 배포 (Supabase 대시보드 또는 supabase MCP 대행) + 실호출 1회 확인
4. MSW handler를 `around-stations` 응답 형태로 교체 + `useStations` 전환
5. `KakaoMap` 말풍선 오버레이 (CustomOverlay)
6. 검증 (`npm run test`, `npm run build`, 브라우저 실물)

**완료 기준:**
- 실제 내 위치 주변 주유소가 거리순 리스트 + 지도 마커로 표시
- 마커 클릭 시 지도 위 말풍선에 상호/브랜드/현재가/거리
- `around-stations` 배포되어 실데이터 반환
- `npm run test` / `npm run build` 통과

**검증 체크리스트:**
- [x] `wgs84ToKatec` 왕복 테스트 통과 (서울/부산/제주 3개, 오차 < 5m)
- [x] `around-stations` 배포 + 실호출 200 + 정규화 응답 확인 (서울 기준 실주유소 반환)
- [x] `useStations` Edge Function 전환 (MSW mock + 실연동)
- [ ] 마커 클릭 → 말풍선 표시 (브라우저 수동 확인)
- [x] `npm run test` 전체 통과 (49 tests) / `npm run build` 통과

**다음 Step:** Step 6 QA 패스

---

## Step 6: QA 패스

**상태:** ⬜ 미시작

**범위:**
- Vitest + RTL + MSW 테스트 전체 확인
- 좌표 변환 단위 테스트 (Step 3에서 작성)
- 정렬/필터 컴포넌트 RTL 테스트 (Step 4에서 작성)
- Lighthouse 측정 기록 **(프로덕션 빌드 기준, 개발 모드 아님)**
- 접근성 체크리스트 완료

**완료 기준:**
- `npm run test` 전체 통과 (0 failures)
- Lighthouse Performance ≥ 70 (프로덕션 빌드)
- Lighthouse Accessibility ≥ 90
- WCAG AA 주요 항목 통과
- fix.md 미결 이슈 중 critical 없음

**검증 체크리스트:**
- [ ] `npm run test` 전체 통과
- [ ] Lighthouse 측정 결과 파일 존재 (프로덕션 빌드)
- [ ] Lighthouse Performance ≥ 70
- [ ] Lighthouse Accessibility ≥ 90
- [ ] 터치 타깃 ≥ 44px 전체 화면
- [ ] 키보드 내비게이션 전체 화면
- [ ] 색상 대비 4.5:1 이상
- [ ] fix.md critical 이슈 없음

---

## Phase 2 보류 항목

| 항목 | 유형 | 이유 |
|------|------|------|
| `collect-regional-avg` Edge Function | 데이터 파이프라인 | Phase 2 부가 섹션 |
| 유가 동향 화면 | 프론트엔드 | Phase 2 부가 섹션 |
| `collect-news` Edge Function | 데이터 파이프라인 | Phase 2 보조 기능 |
| 뉴스 섹션 화면 | 프론트엔드 | Phase 2 보조 기능 |
| Supabase Auth 로그인 | 인증 | Phase 3 선택 기능 |
| 즐겨찾기 목록 화면 (탭/페이지) | 프론트엔드 | Phase 2 보류 — Phase 1은 상세화면 ☆ 토글만 |
| 즐겨찾기 DB 동기화 (`favorites` 테이블 + RLS) | 데이터 | 로그인 도입 시에만 |
| 웹푸시 알림 VAPID (`notify-price`) | 알림 | 비핵심, 보류 |
| `price_alerts` 테이블 | 데이터 | 알림 도입 시에만 |
| `regional_avg` 테이블 | 데이터 | Phase 2 |
| `news` 테이블 | 데이터 | Phase 2 |
| vite-plugin-pwa 웹푸시 설정 | 기능 | Phase 2 (PWA manifest 기본만 Phase 1 포함) |

---

## 다음 작업

Step 5 완료(2026-06-11). 다음 단계는 Step 6 QA 패스.
- `npm run test` 49/49 통과, `npm run build` 통과, tsc --noEmit 오류 없음.
- 브라우저 수동 확인 잔여: 마커 클릭 말풍선 표시 (사용자 확인 대기).
- 미결 이슈: #11(coord 코드 중복 — around-stations/collect-prices 모두 좌표 변환 인라인) — Phase 2 단일 출처화 예정.
