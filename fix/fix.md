# Fix 추적 — oil_now

> Phase 1 구현 중 발견된 이슈 및 수정 기록
> 마지막 갱신: 2026-06-10

---

## 미결 이슈

| # | 유형 | 발견 단계 | 심각도 | 상태 | 메모 |
|---|------|----------|-------|------|------|
| 1 | `schema` | 계획 감리 | minor | 미결 | `price_snapshots.fuel_type` 컬럼 타입 미정 — Opinet 유종코드가 숫자(INT)인지 문자열(TEXT)인지 공식 문서 확인 후 결정. Step 2 시작 전 확인 필수. |
| 2 | `schema` | 계획 감리 | minor | 미결 | `stations.updated_at` 자동 갱신 트리거 필요 여부 — upsert 시 자동 갱신이 필요하면 Postgres 트리거 추가, Supabase moddatetime 확장 활용 가능. |
| 3 | `pipeline` | 계획 감리 | major | 미결 | Opinet 정확한 엔드포인트 / 유종코드 미확인 — Step 3 구현 전 오피넷 오픈API 공식 문서 확인 필수. 엔드포인트·파라미터·응답 구조 확인. |
| 4 | `pipeline` | 계획 감리 | major | 미결 | 전국 수집 전략 미정 — 1.1만 주유소 일괄 수집 시 Edge Function 실행시간 한도(기본 150초) 초과 가능. 지역코드 순회 배치 분할 전략 수립 필요. Step 3 설계 단계에서 결정. |
| 5 | `ui` | 계획 감리 | minor | 미결 | 카카오맵 SDK 비동기 로드 처리 — 스크립트 태그 삽입 시 React 생명주기와 충돌 가능. 동적 import 또는 useEffect 내 로드 방식 결정 필요. Step 4 시작 전 확인. |
| 6 | `ui` | 계획 감리 | minor | 미결 | 즐겨찾기 목록 화면 범위 — Phase 1에 localStorage 기반 즐겨찾기 탭/페이지 포함 여부. 현재 plan.md에는 포함으로 가정. 사용자 확인 권장. |

---

## 완료된 수정

| # | 설명 | 수정된 파일 | 검증 결과 | 완료일 |
|---|------|-----------|----------|-------|
| S1 | Step 1 스캐폴딩 완료 — Vite 8 + React 19 + TS, Tailwind v4, TanStack Query/Virtual, Zustand, Recharts, Vitest, MSW, vite-plugin-pwa 설치 및 기본 폴더 구조 생성 | package.json, vite.config.ts, src/index.css, src/App.tsx, tsconfig.app.json | npm run dev ✅ / vitest run 1 passed ✅ / tsc --noEmit ✅ | 2026-06-10 |

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
