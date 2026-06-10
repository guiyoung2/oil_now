# Phase 1 실행 계획 — oil_now

> 생성일: 2026-06-03
> 마지막 갱신: 2026-06-10
> 현재 Phase: Phase 1 — MVP
> 현재 Step: Step 5 (미시작)

---

## Phase 1 진행 현황

| Step | 작업 | 상태 |
|------|------|------|
| Step 1 | 프로젝트 스캐폴딩 | ✅ 완료 |
| Step 2 | Supabase 스키마 | ✅ 완료 |
| Step 3 | collect-prices Edge Function | 🔶 구현 완료 (배포 전) |
| Step 4 | 홈 화면 | ✅ 완료 |
| Step 5 | 주유소 상세 화면 | ⬜ 미시작 |
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

**다음 Step:** Step 5 주유소 상세 화면

---

## Step 5: 주유소 상세 화면

**상태:** ⬜ 미시작

**범위:**
- 현재가 표시
- 가격 변동 차트 (Recharts, 누적 price_snapshots)
- 빈 히스토리 empty state ("데이터 누적 중" 안내)
- 즐겨찾기 ☆ 토글 버튼 (localStorage 저장/불러오기, 로그인 없이)
- 즐겨찾기 목록 화면 없음 → Phase 2 보류
- 상세 진입: 리스트 클릭 + URL 파라미터 (딥링크 고려)

**완료 기준:**
- 히스토리 데이터 없을 때 crash 없음
- localStorage 즐겨찾기 저장/불러오기 정상 (새로고침 유지)
- 차트 로딩/empty 상태 처리

**검증 체크리스트:**
- [ ] 빈 히스토리 empty state 렌더링 (crash 없음)
- [ ] localStorage 즐겨찾기 새로고침 후 유지
- [ ] 차트 aria-label 존재
- [ ] 색상 대비 4.5:1 이상
- [ ] 차트 로딩 스켈레톤/스피너 존재
- [ ] 즐겨찾기 토글 aria-pressed 또는 aria-label 상태 반영

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

Step 4 홈 화면 구현 완료. Step 5 주유소 상세 화면으로 진행.
- 테스트: 10 files, 35 tests PASS
- typecheck: 오류 없음
- 미결 이슈: #11(coord 코드 중복), #14(API 파라미터 실호출 검증) — Phase 2 예정
