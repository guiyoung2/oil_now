# Fix 추적 — oil_now

> Phase 1 구현 중 발견된 이슈 및 수정 기록
> 마지막 갱신: 2026-06-10

---

## 미결 이슈

| # | 유형 | 발견 단계 | 심각도 | 상태 | 메모 |
|---|------|----------|-------|------|------|
| 1 | `schema` | 계획 감리 | minor | ✅ 결정 | `price_snapshots.fuel_type` → `TEXT` 타입 채택. API 확인 전 안전한 선택. 숫자 코드 확인 시 마이그레이션으로 변경. |
| 2 | `schema` | 계획 감리 | minor | ✅ 결정 | `stations.updated_at` 자동 갱신 트리거 추가. Supabase `moddatetime` 확장 사용. |
| 3 | `pipeline` | 계획 감리 | minor | ✅ 해소 | 엔드포인트·유종코드·응답필드·Key 모두 확인 완료. Base URL: https://www.opinet.co.kr/api/ / 엔드포인트: lowTop10.do(시도별 최저가 TOP20), aroundAll.do(반경 주유소), detailById.do, avgAllPrice.do / 유종코드: B027(휘발유) D047(경유) B034(고급휘발유) C004(등유) K015(자동차부탄) / 시도코드: 01~19(18개) / 응답필드: UNI_ID OS_NM NEW_ADR POLL_DIV_CD(브랜드) GIS_X_COOR GIS_Y_COOR PRICE / 좌표: KATEC→WGS84 변환 필요 / 일일한도: 1,500회 / 수집전략: lowTop10.do cnt=20 per 시도(18) per 유종(5) = 90회/일 |
| 4 | `pipeline` | 계획 감리 | minor | ✅ 결정 | 전국 수집 전략: 시도 17개 순차 순회(A). pg_cron → 함수 1개 → 시도별 루프. 속도 문제 시 Phase 2에서 지역별 병렬 분할로 개선. 일일한도 1,500회/API키 감안하여 유종 1개씩 per 시도 요청 설계. |
| 5 | `ui` | 계획 감리 | minor | ✅ 결정 | 카카오맵 SDK → `index.html` 정적 스크립트 태그 방식 채택. 공식 가이드 방식, 단순. 성능 최적화(동적 로드)는 Phase 2 검토. |
| 6 | `ui` | 계획 감리 | minor | ✅ 결정 | 즐겨찾기 목록 화면 → Phase 1 제외. 로그인 없는 MVP에서 목록 관리 불필요. 각 주유소 상세 화면에 ☆ 토글 버튼만 포함. 목록 화면은 Phase 2 보류. |
| 7 | `pipeline` | Step 2 검토 | minor | ✅ 결정 | price 0·결측 처리: 수집 시 price ≤ 0 행 스킵(적재 안 함). Step 3 완료 기준에 명시. |
| 8 | `pipeline` | Step 2 검토 | minor | ✅ 결정 | fuel_type 정규화: 오피넷 코드 → 앱 내부 코드 변환. 매핑: B027→gasoline / D047→diesel / B034→premium / C004→kerosene / K015→lpg. |
| 9 | `pipeline` | Step 2 검토 | minor | ✅ 결정 | date KST 기준: 수집 함수에서 now() AT TIME ZONE 'Asia/Seoul' 으로 date 계산. |
| 10 | `pipeline` | Step 2 검토 | minor | ✅ 결정 | collection_logs: 단일 행 관리(job 시작 시 INSERT, 종료 시 UPDATE). error TEXT에 실패 시도 목록 JSON 문자열로 기록. partial 기준: 1개 이상 시도 실패 시. |
| 11 | `pipeline` | Step 3 검토 | major | 미결 | 좌표 변환 코드(`coord.ts`와 `index.ts`)가 완전 중복. 테스트는 coord.ts만 검증하므로 프로덕션 복사본 drift 가능. Phase 2에서 단일 출처화 검토. |
| 12 | `pipeline` | Step 3 검토 | critical | ✅ 해소 | pg_cron 마이그레이션의 service_role 키 평문 저장 문제. Supabase Vault 시크릿 참조 방식으로 전환 완료. git 커밋 안전. |
| 13 | `pipeline` | Step 3 검토 | critical | ✅ 해소 | collection_logs status 오분류: API HTTP 200이나 rows=0이어도 success 기록 문제. totalRows===0 → partial, DB write 에러 failures에 반영 완료. |
| 14 | `pipeline` | Step 3 검토 | major | 미결 | lowTop10.do 시도 필터 파라미터명(siGunGu), 응답 경로(RESULT.OIL), cnt=20 의미가 실호출로 미검증. 파라미터 오류 시 전체 시도 동일 결과 반환 가능. 최초 배포 후 1회 실호출로 검증 필요. |
| 15 | `pipeline` | Step 3 검토 | major | ✅ 해소 | Edge Function 실행시간 한도 초과 위험. 조합 단위 배치 upsert로 DB 왕복 수 대폭 감소(N→2/조합). 배포 후 실행시간 실측 권장. |

---

## 완료된 수정

| # | 설명 | 수정된 파일 | 검증 결과 | 완료일 |
|---|------|-----------|----------|-------|
| S1 | Step 1 스캐폴딩 완료 — Vite 8 + React 19 + TS, Tailwind v4, TanStack Query/Virtual, Zustand, Recharts, Vitest, MSW, vite-plugin-pwa 설치 및 기본 폴더 구조 생성 | package.json, vite.config.ts, src/index.css, src/App.tsx, tsconfig.app.json | npm run dev ✅ / vitest run 1 passed ✅ / tsc --noEmit ✅ | 2026-06-10 |
| S2 | Step 2 Supabase 스키마 완료 — stations/price_snapshots/collection_logs 테이블 생성, unique constraint (station_id,date,fuel_type), 인덱스, RLS 정책(읽기 공개/쓰기 service_role), moddatetime 트리거 | Supabase migration: create_phase1_schema | 테이블 3개 ✅ / unique constraint ✅ / 인덱스 ✅ / RLS 6개 정책 ✅ / 멱등 upsert ✅ | 2026-06-10 |
| S3 | Step 3 collect-prices Edge Function 구현 — KATEC→WGS84 순수 수학 변환, 오피넷 파서, 배치 upsert, collection_logs 3-status, Vault 기반 pg_cron 마이그레이션 | supabase/functions/collect-prices/index.ts, src/lib/coord.ts, src/lib/parseOpinet.ts, src/test/coord.test.ts, src/test/parseOpinet.test.ts, supabase/migrations/20260610000001 | vitest 10/10 ✅ / tsc --noEmit ✅ / 미결: #14(API 파라미터 실호출 검증), #11(coord 코드 중복) | 2026-06-10 |
| S4 | Vercel 배포 빌드 실패 수정 — `vite.config.ts`의 `test` 설정 타입이 Vite `defineConfig`에서 인식되지 않던 문제를 Vitest config helper로 전환 | vite.config.ts, plan/plan.md, fix/fix.md | npm run build ✅ / npm run test -- --run ✅ | 2026-06-10 |

---

## 이슈 유형 분류

| 유형 | 설명 |
|------|------|
| `schema` | 데이터베이스 스키마 관련 |
| `pipeline` | 수집 파이프라인 관련 |
| `ui` | 화면 렌더링 관련 |
| `perf` | 성능 관련 |
| `a11y` | 접근성 관련 |
| `test` | 테스트 관련 |
| `scope` | Phase 1 범위 이탈 경고 |

## 심각도 기준

| 심각도 | 기준 |
|-------|------|
| `critical` | Phase 1 완료 기준 미달, 즉시 수정 필요 |
| `major` | 구현 전 결정 필요, 방치 시 재작업 발생 |
| `minor` | 개선 사항, Step 시작 전 확인 권장 |
| `deferred` | Phase 2 이관 결정 |
