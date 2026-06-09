# 에이전트 하네스 설정 가이드

> 작성일: 2026-06-10
> 목적: 개발 작업 시 reviewer 에이전트 활성화/비활성화 방법 기록
> 사용법: agent-harness.md 첨부 후 "트리거 제한해줘"

---

## 현재 에이전트 구성

| 에이전트                      | 파일 위치                                       | 역할                                |
| ----------------------------- | ----------------------------------------------- | ----------------------------------- |
| `planning-orchestrator`       | `.claude/agents/planning-orchestrator.md`       | 계획/감리 전용                      |
| `data-pipeline-reviewer`      | `.claude/agents/data-pipeline-reviewer.md`      | Supabase 스키마, Edge Function 검증 |
| `frontend-dashboard-reviewer` | `.claude/agents/frontend-dashboard-reviewer.md` | 카카오맵, 가상스크롤, UI 품질 검증  |

---

## 트리거 제한 해제 방법 (개발 작업 시 활성화)

### CLAUDE.md / AGENTS.md 수정

**현재 (계획 모드만):**

```
**트리거:** 사용자가 "계획 하네스 모드"라고 명시할 때만 `planning-orchestrator` 스킬을 사용.
다음에는 사용하지 않음: 기능 구현, 버그 수정, UI 수정, 단일 테스트 추가, 문구 수정.
```

**개발 활성화 시 교체할 내용:**

```
## 에이전트 운영 규칙

### planning-orchestrator
트리거: "계획 하네스 모드"라고 명시할 때만 사용.
역할: 계획/검토/감리만 수행. 구현 없음.

### data-pipeline-reviewer
트리거: Supabase 스키마, Edge Function, 데이터 파이프라인 작업 완료 후 자동 검토.
적용 Step: Step 2 (Supabase 스키마), Step 3 (collect-prices Edge Function)
역할: 스키마 타당성, 멱등 적재, RLS 정책, API 연동 검증.

### frontend-dashboard-reviewer
트리거: 홈 화면, 주유소 상세 화면 작업 완료 후 자동 검토.
적용 Step: Step 4 (홈 화면), Step 5 (주유소 상세 화면)
역할: 카카오맵, 가상 스크롤, 차트, 즐겨찾기, UX, 접근성 검증.
```

---

## 다시 제한하는 방법 (원복)

CLAUDE.md / AGENTS.md의 에이전트 운영 규칙 섹션을 아래로 교체:

```
**트리거:** 사용자가 "계획 하네스 모드"라고 명시할 때만 `planning-orchestrator` 스킬을 사용.
다음에는 사용하지 않음: 기능 구현, 버그 수정, UI 수정, 단일 테스트 추가, 문구 수정.
```

---

## 개발 시 reviewer 호출 프롬프트 예시

### data-pipeline-reviewer 수동 호출

```
Step 2 완료 — data-pipeline-reviewer로 Supabase 스키마 검토해줘
Step 3 완료 — data-pipeline-reviewer로 Edge Function 검토해줘
```

### frontend-dashboard-reviewer 수동 호출

```
Step 4 완료 — frontend-dashboard-reviewer로 홈 화면 검토해줘
Step 5 완료 — frontend-dashboard-reviewer로 주유소 상세 검토해줘
```

### planning-orchestrator 호출 (변경 없음)

```
계획 하네스 모드로 Step N 완료 확인해줘
계획 하네스 모드로 plan.md 갱신해줘
```

---

## 토큰 비용 참고

| 모드               | 토큰 소모 | 비고                      |
| ------------------ | --------- | ------------------------- |
| 계획 모드만        | 낮음      | 현재 설정                 |
| 개발 reviewer 활성 | 중간      | Step 완료 시점에만 호출   |
| 전체 자동 트리거   | 높음      | 모든 작업에 reviewer 발동 |

Step 완료 시점에만 수동 호출하는 방식이 품질과 토큰 비용의 균형점.

---

## guiyoung2/harness_framework 도입 시 참고

- 에이전트 없는 태스크 세분화/자동화 구조
- 현재 reviewer 에이전트와 병행 가능
- Phase 2 이후 병렬 구현 태스크가 늘어날 때 도입 검토
