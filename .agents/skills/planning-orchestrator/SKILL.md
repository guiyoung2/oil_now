---
name: planning-orchestrator
description: |
  유가 대시보드 Phase 1 MVP의 계획 작성, 단계 감리, Phase 전환 검토를 수행하는 계획 전용 하네스 스킬.

  반드시 사용자가 "계획 하네스 모드"라는 문구를 정확히 포함한 요청일 때만 사용할 것.

  트리거 O: "계획 하네스 모드로 Phase 1 작업 순서 잡아줘", "계획 하네스 모드로 Step 3 검토해줘",
  "계획 하네스 모드 시작", "계획 하네스 모드로 현재 상태 점검해줘", "계획 하네스 모드로 Phase 전환 검토해줘",
  "계획 하네스 모드로 Step 2 완료 확인해줘", "계획 하네스 모드로 plan.md 갱신해줘",
  "계획 하네스 모드로 다시 검토해줘", "계획 하네스 모드로 이어서 진행해줘"

  트리거 X (절대 사용 금지): "기능 구현해줘", "버그 수정해줘", "UI 수정해줘", "테스트 추가해줘",
  "문구 바꿔줘", "컴포넌트 만들어줘", "Supabase 쿼리 작성해줘", "차트 고쳐줘",
  "스타일 변경해줘", "타입 에러 잡아줘"

  이 스킬은 구현 코드를 작성하지 않는다. 계획, 검토, 감리만 수행한다.
---

# Planning Orchestrator — 유가 대시보드 계획 감리 스킬

## 이 스킬의 목적

Phase 1 MVP의 계획을 생성·갱신하고, `data-pipeline-reviewer` / `frontend-dashboard-reviewer`와 협업하여 각 Step의 완료 기준과 검증 방법을 정의한다.

구현하지 않는다. 계획, 검토, 감리만 수행한다.

## Phase 0: 컨텍스트 확인

시작 시 다음 순서로 읽는다:

1. `AGENTS.md` — 하네스 포인터 + 운영 규칙 확인
2. `.Codex/loop/plan.md` — 존재하면 현재 Phase/Step 확인
3. `.Codex/loop/fix.md` — 존재하면 미결 이슈 확인

**분기 결정:**

| 상황 | 실행 모드 |
|------|----------|
| `.Codex/loop/plan.md` 없음 | 초기 실행: 템플릿으로 plan.md/fix.md 생성 + 6 Step 계획 작성 |
| plan.md 있음 + 특정 Step 요청 | 갱신 실행: 해당 Step 상태 확인 후 갱신 |
| plan.md 있음 + Phase 전환 요청 | Phase 전환 검토: 6개 Step 완료 기준 전체 점검 |
| plan.md 있음 + 재검토/이어서 요청 | 부분 재실행: 마지막 미완료 Step부터 이어서 |

## Phase 1: 현재 구현 상태 스캔

프로젝트 파일 존재 여부로 각 Step 상태를 파악한다.

| Step | 확인 대상 |
|------|----------|
| Step 1 스캐폴딩 | `package.json`, `vite.config.ts`, `vitest.config.ts` |
| Step 2 Supabase 스키마 | `supabase/migrations/` 또는 스키마 SQL 파일 |
| Step 3 collect-prices | `supabase/functions/collect-prices/` |
| Step 4 홈 화면 | `src/pages/Home.tsx` 또는 동등한 파일 |
| Step 5 주유소 상세 | `src/pages/StationDetail.tsx` 또는 동등한 파일 |
| Step 6 QA 패스 | `tests/` 또는 `__tests__/`, Lighthouse 결과 파일 |

## Phase 2: 에이전트 팀 협업

| 요청 유형 | 호출 대상 |
|----------|----------|
| Step 2-3 검토 | data-pipeline-reviewer |
| Step 4-6 검토 | frontend-dashboard-reviewer |
| 전체 초기 계획 생성 / Phase 전환 검토 | 양쪽 모두 |

각 reviewer에게 전달:
- 대상 Step 범위와 내용
- 현재 구현 상태 (Phase 1 스캔 결과)
- 검토 요청 포인트

## Phase 3: plan.md / fix.md 갱신

reviewer 결과를 종합하여 `.Codex/loop/plan.md`와 `.Codex/loop/fix.md`를 갱신한다.

**갱신 규칙:**
- 상태 표기: ⬜ 미시작 / 🔄 진행중 / ✅ 완료
- 완료 기준 미달 항목 → fix.md에 이슈 추가
- Phase 2 항목 발견 시 → plan.md 보류 섹션으로 즉시 이동
- 갱신 후 `마지막 갱신` 날짜를 plan.md 헤더에 기록

**파일 초기 생성 시 읽을 것:**
- `references/plan-template.md` — plan.md 초기 생성 시
- `references/fix-template.md` — fix.md 초기 생성 시
- `references/phase1-criteria.md` — Step별 상세 검증 기준 확인 시

## Phase 4: 결과 보고

사용자에게 다음을 보고한다:
1. Phase 1 진행 현황 (Step별 상태 ⬜/🔄/✅)
2. 다음 수행할 Step
3. 미결 이슈 요약 (fix.md 기준)
4. Phase 2 보류 항목 목록

## 실행 모드: 에이전트 팀

planning-orchestrator가 리더로서 data-pipeline-reviewer, frontend-dashboard-reviewer와 팀을 구성한다.
데이터 전달: 메시지 기반(실시간 검토 요청) + 파일 기반(plan.md/fix.md 산출물).

## 테스트 시나리오

**초기 실행:**
"계획 하네스 모드 시작" → plan.md 없음 확인 → 양쪽 reviewer 검토 요청 → plan.md/fix.md 생성

**Step 갱신:**
"계획 하네스 모드로 Step 3 완료 확인해줘" → plan.md 읽기 → 현재 상태 스캔 → data-pipeline-reviewer 검토 → 완료 여부 판단 → plan.md 갱신

**Phase 전환:**
"계획 하네스 모드로 Phase 2 전환 가능한지 검토해줘" → 6개 Step 완료 기준 전체 확인 → 미완료 항목 fix.md 기록 → 전환 가능/불가 판단 보고
