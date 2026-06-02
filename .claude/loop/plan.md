# Phase 1 실행 계획 — oil_now

> 생성일: 2026-06-03
> 마지막 갱신: 2026-06-03
> 현재 Phase: Phase 1 — MVP
> 현재 Step: Step 1 (미시작)

---

## Phase 1 진행 현황

| Step | 작업 | 상태 |
|------|------|------|
| Step 1 | 프로젝트 스캐폴딩 | ⬜ 미시작 |
| Step 2 | Supabase 스키마 | ⬜ 미시작 |
| Step 3 | collect-prices Edge Function | ⬜ 미시작 |
| Step 4 | 홈 화면 | ⬜ 미시작 |
| Step 5 | 주유소 상세 화면 | ⬜ 미시작 |
| Step 6 | QA 패스 | ⬜ 미시작 |

---

## Step 1: 프로젝트 스캐폴딩

**상태:** ⬜ 미시작

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
- [ ] `npm run test` 실행 확인
- [ ] `tsc --noEmit` 오류 없음

**다음 Step:** Step 2 Supabase 스키마

---

## Step 2: Supabase 스키마

**상태:** ⬜ 미시작

**범위:**
- `stations` 테이블: id(오피넷 UNI_ID, PK), name, brand, address, lat, lng(WGS84), is_self, updated_at
- `price_snapshots` 테이블: id, station_id(FK), date, fuel_type, price, collected_at
- `collection_logs` 테이블: id, job, started_at, finished_at, status(success/partial/fail), rows, error
- unique constraint: `(station_id, date, fuel_type)` — 멱등 적재
- 인덱스: `(station_id, fuel_type, date)`
- RLS: 읽기 공개 + 쓰기 Edge Function 전용 정책

**구현 전 확인 필요 (fix.md #1, #2):**
- Opinet `fuel_type` 값 형식 (숫자 코드 vs 문자열) — 공식 문서 확인 후 컬럼 타입 결정
- `stations.updated_at` 자동 갱신 트리거 필요 여부

**완료 기준:**
- SQL migration 파일 존재
- 각 테이블 목적 주석 포함
- `price_snapshots` 멱등 upsert 가능 (ON CONFLICT)
- RLS 정책 명시 (읽기 공개, 쓰기 서비스 롤 전용)

**검증 체크리스트:**
- [ ] migration 실행 성공
- [ ] unique constraint `(station_id, date, fuel_type)` 동작
- [ ] 인덱스 생성 확인
- [ ] RLS 읽기/쓰기 정책 동작

**다음 Step:** Step 3 collect-prices Edge Function

---

## Step 3: collect-prices Edge Function

**상태:** ⬜ 미시작

**범위:**
- Opinet API 클라이언트 (환경변수로 API 키 관리)
- 응답 파싱
- KATEC → WGS84 좌표 변환 (proj4 라이브러리 사용 검토)
- `stations` upsert, `price_snapshots` insert (멱등)
- `collection_logs` 기록 (success/partial/fail)
- 부분 실패 허용: 지역 순회 중 일부 실패해도 나머지 계속 수집
- pg_cron 일별 스케줄 설정

**구현 전 확인 필요 (fix.md #3, #4):**
- Opinet 정확한 엔드포인트 / 유종코드 (공식 문서 확인 필수)
- 전국 수집 전략: 지역코드 순회 vs 반경 누적, Edge Function 실행시간(기본 150초) 초과 대응 배치 분할

**완료 기준:**
- Edge Function 배포 가능
- MSW 또는 fixture로 파서 단위 테스트 통과
- 좌표 변환 단위 테스트 통과
- collection_logs success/partial/fail 기록 확인
- API 키 클라이언트 노출 없음

**검증 체크리스트:**
- [ ] 좌표 변환 단위 테스트 통과 (기준점 2개 이상)
- [ ] 파서 단위 테스트 통과 (MSW/fixture)
- [ ] collection_logs 3가지 status 기록 확인
- [ ] API 키 환경변수 처리 (클라이언트 소스에 키 없음)
- [ ] 배치 분할 전략 적용 (실행시간 한도 대응)

**다음 Step:** Step 4 홈 화면

---

## Step 4: 홈 화면

**상태:** ⬜ 미시작

**범위:**
- Geolocation → 카카오맵 표시 (SDK 비동기 로드 처리 포함)
- Geolocation 거부 시 fallback (시/도 드롭다운)
- 주변 주유소 마커 + **카카오맵 내장 클러스터러** 사용
- 주유소 리스트 (**TanStack Virtual** 가상 스크롤)
- 유종 토글 (휘발유/경유/LPG)
- 정렬 (거리/가격)
- 최저가 가볍게 강조
- 주변 주유소 0건 empty state 처리

**완료 기준:**
- mock 데이터로 화면 정상 렌더링
- Geolocation 거부 시 fallback 정상 동작
- 1,000건 이상 리스트 스크롤 버벅임 없음
- 유종 토글/정렬 동작 및 RTL 테스트 통과

**검증 체크리스트:**
- [ ] Lighthouse FCP < 3s (프로덕션 빌드 기준)
- [ ] 가상 스크롤 1,000건 이상 동작 확인
- [ ] 터치 타깃 ≥ 44px
- [ ] 키보드 내비게이션 (탭 순서)
- [ ] Geolocation fallback 동작
- [ ] 0건 empty state 동작
- [ ] 유종 토글 RTL 테스트 통과
- [ ] 정렬(거리/가격) RTL 테스트 통과

**다음 Step:** Step 5 주유소 상세 화면

---

## Step 5: 주유소 상세 화면

**상태:** ⬜ 미시작

**범위:**
- 현재가 표시
- 가격 변동 차트 (Recharts, 누적 price_snapshots)
- 빈 히스토리 empty state ("데이터 누적 중" 안내)
- 즐겨찾기 localStorage 토글 (로그인 없이)
- 즐겨찾기 목록 화면 포함 여부: **localStorage 기반 탭/페이지 포함** (사용자 결정 필요, 기본 포함으로 가정)
- 상세 진입: 리스트 클릭 + URL 파라미터 (딥링크 고려)

**완료 기준:**
- 히스토리 데이터 없을 때 crash 없음
- localStorage 즐겨찾기 저장/불러오기 정상 (새로고침 유지)
- 차트 로딩/empty 상태 처리
- 즐겨찾기 목록 화면 정상 렌더링

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
| 즐겨찾기 DB 동기화 (`favorites` 테이블 + RLS) | 데이터 | 로그인 도입 시에만 |
| 웹푸시 알림 VAPID (`notify-price`) | 알림 | 비핵심, 보류 |
| `price_alerts` 테이블 | 데이터 | 알림 도입 시에만 |
| `regional_avg` 테이블 | 데이터 | Phase 2 |
| `news` 테이블 | 데이터 | Phase 2 |
| vite-plugin-pwa 웹푸시 설정 | 기능 | Phase 2 (PWA manifest 기본만 Phase 1 포함) |

---

## 다음 작업

Step 1 프로젝트 스캐폴딩 시작.
"계획 하네스 모드로 Step 1 완료 확인해줘" 로 완료 검증 요청 가능.
