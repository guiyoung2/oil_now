# Phase 2-B 유가 뉴스 설계

> 작성일: 2026-06-12
> 단계: Phase 2-B

---

## 1. 목표

Google News RSS에서 유가 관련 기사를 12시간마다 수집해 DB에 저장하고, NewsPage에서 최신 20건을 카드형으로 표시한다.

---

## 2. 결정 사항

| 항목 | 결정 |
|------|------|
| 뉴스 소스 | Google News RSS — `유가+기름값` 단일 키워드 |
| 수집 방식 | DB 경유 (collect-news → news 테이블 → Frontend) |
| 수집 주기 | pg_cron `0 0,12 * * *` (KST 0시·12시) |
| summary | RSS description 150자 truncate |
| UI | 카드형, 최신 20건 전체 로드, 스켈레톤 로딩 |
| 페이지네이션 | 없음 (20건 스크롤) |
| 외부 링크 | 새 탭 (`target="_blank" rel="noopener noreferrer"`) |

---

## 3. 데이터 계층

### `news` 테이블

```sql
id            uuid PK default gen_random_uuid()
title         text NOT NULL
url           text NOT NULL UNIQUE   -- 멱등 upsert 기준
source        text                   -- RSS <source> 태그 (언론사명)
published_at  timestamptz
summary       text                   -- description 150자 truncate
collected_at  timestamptz default now()
```

- unique constraint on `url`
- RLS: 읽기 공개, 쓰기 service_role 전용
- `collection_logs` 3-status 패턴 재사용 (success/partial/fail)

### `collect-news` Edge Function

- RSS URL: `https://news.google.com/rss/search?q=유가+기름값&hl=ko&gl=KR&ceid=KR:ko`
- `_shared/parseNews.ts` 단일 출처 파서 (coord, parseAvgPrice 패턴 동일)
- `ON CONFLICT (url) DO NOTHING` 멱등 upsert
- pg_cron: `0 0,12 * * *`

### `src/lib/parseNews.ts` — re-export 배럴 (테스트·훅 import 경로 불변)

---

## 4. Frontend

### `useNews` 훅

- Supabase REST: `news` 테이블 `published_at DESC` 최신 20건
- TanStack Query 캐싱 (useAvgPrices 패턴 동일)

### `NewsCard` 컴포넌트

```
┌─────────────────────────────────┐
│ [연합뉴스]              2시간 전 │
│ 국제 유가 3% 급락…WTI 배럴당    │
│ 70달러 하회                     │
│ 미국 원유 재고 증가로 국제 유가  │
│ 가 큰 폭으로 하락했다…          │
└─────────────────────────────────┘
```

- 클릭 시 새 탭 외부 링크
- 로딩: 스켈레톤 (3개 카드 skeleton)
- 빈 상태: "등록된 뉴스가 없습니다"

### `NewsPage`

- `useNews` → `NewsCard` 리스트
- 스크롤 가능 (`overflow-auto`)

### MSW handler 추가

- `news` 테이블 GET 요청 → fixture 반환 (테스트 결정적 동작)

---

## 5. 테스트

| 파일 | 내용 |
|------|------|
| `src/test/parseNews.test.ts` | RSS XML fixture → 파싱 결과 단위 테스트 |
| `src/test/useNews.test.tsx` | MSW mock → 훅 데이터 반환 테스트 |
| `src/test/NewsCard.test.tsx` | 제목·언론사·날짜·링크 렌더 테스트 |
| `src/test/NewsPage.test.tsx` | 전체 페이지 렌더 + 빈 상태 + 스켈레톤 테스트 |

---

## 6. 완료 기준

- 뉴스 리스트 실데이터 렌더 (collect-news 실호출 후)
- 카드 클릭 → 새 탭 외부 링크 동작
- `npm run test` / `npm run build` 통과
- 스켈레톤 로딩 → 데이터 전환 동작
