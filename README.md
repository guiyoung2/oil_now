# 오일나우 (Oil Now)

> 내 주변 주유소의 현재가와 가격 추이를, 전국 평균 유가·유가 뉴스와 함께 한눈에.

오피넷 공식 오픈 API를 매일 자동 수집해 **시계열로 누적**하고,
**내 위치 주변 주유소 최저가 · 전국/지역 평균가 추이 · 유가 뉴스**를 하나의 화면에서 보여주는 **모바일 우선 PWA**.

크롤링이 아니라 **"데이터를 다루는 프론트엔드"** — 외부 API 연동(KATEC↔WGS84 좌표 변환), 대용량 렌더 성능(클러스터링·가상 스크롤), 시각화(시계열 차트), 데이터 파이프라인(매일 자동 수집·멱등 적재)이 주인공입니다.

**→ 배포 주소: [https://oil-now.vercel.app](https://oil-now.vercel.app)**
**→ 레포지토리: [github.com/guiyoung2/oil_now](https://github.com/guiyoung2/oil_now)**

---

## 목차

- [모바일 앱으로 설치하기](#모바일-앱으로-설치하기)
- [프로젝트 배경](#프로젝트-배경)
- [핵심 기능](#핵심-기능)
- [기술 스택과 선택 이유](#기술-스택과-선택-이유)
- [주요 구현 포인트](#주요-구현-포인트)
- [성능 및 품질 지표](#성능-및-품질-지표)
- [아키텍처](#아키텍처)
- [화면 구조](#화면-구조)
- [로컬 실행](#로컬-실행)
- [개발 과정 기록](#개발-과정-기록)

---

## 모바일 앱으로 설치하기

PWA(Progressive Web App)로 제작되어 **홈 화면에 설치하면 앱스토어 없이 네이티브 앱과 동일한 UX**로 사용할 수 있습니다. 위치 권한을 허용하면 내 주변 주유소가, 거부하면 시/도 드롭다운으로 fallback 됩니다.

### iOS (Safari)

1. Safari에서 **[oil-now.vercel.app](https://oil-now.vercel.app)** 접속
2. 하단 **공유 버튼** (□↑) 탭
3. **"홈 화면에 추가"** 선택
4. 이름 확인 후 오른쪽 위 **추가** 탭

### Android (Chrome)

1. Chrome에서 **[oil-now.vercel.app](https://oil-now.vercel.app)** 접속
2. 주소창 오른쪽 **설치 버튼** 탭 (또는 우상단 메뉴 → **앱 설치**)
3. **설치** 확인

---

## 프로젝트 배경

**"FE 채용 시장에서 차별점이 되는 데이터 역량"** 을 고민하다 출발했습니다.

| 가설 | 검증 결과 | 방향 조정 |
|---|---|---|
| 크롤링이 차별점이 된다 | FE에서 크롤링(수집)은 신호가 약함 — 백엔드/데이터 엔지니어링 영역 | 수집은 공공 API로 충분히 대체, **화면에서 데이터를 다루는 능력**에 집중 |
| 어떤 도메인이 좋은가 | 가격은 100% 객관적 사실(fact) — 사용자 수동 입력 데이터의 함정 없음 | **유가**로 확정 (오피넷 공식 오픈 API = 합법) |
| 오피넷 앱과 뭐가 다른가 | 오피넷은 "현재가" 위주, 가격 변동 추이·개인화는 약함 | **가격 추이 + 내 위치 개인화**를 틈새로 |

**핵심 제약이자 핵심 가치**: 오피넷은 **주유소별 일별 히스토리를 제공하지 않습니다.** 그래서 매일 스냅샷을 직접 적재해 시계열을 누적합니다 — 이 데이터 파이프라인이 프로젝트의 엔지니어링 중심축입니다.

---

## 핵심 기능

### 실시간 유가 대시보드 — 전국 평균가 + 최근 7일 추이
전국 평균가(휘발유/경유/LPG) **그린 히어로 카드** + 전일 대비 변동 + 최근 7일 추이 **area 차트**(Recharts).
우리 DB에 누적된 시계열에서 읽어오며, 전일 대비(diff)는 오피넷 미제공이라 **인접일 차이를 직접 계산**합니다.

### 내 주변 주유소 — 위치 기반 최저가 + 지도
Geolocation → 카카오맵에 주변 주유소 **마커 클러스터링** + 거리순/가격순 리스트.
마커 클릭 시 지도 위 **말풍선 오버레이**(상호·브랜드·현재가·거리), 유종 토글(휘발유/경유/LPG), 최저가 강조.
위치 거부 시 시/도 드롭다운 fallback.

### 유가 뉴스 — Google News RSS 수집
`유가+기름값` 키워드로 하루 2회(KST 0시·12시) 수집해 최신 20건을 카드형으로 노출.
저작권을 고려해 **제목 + 짧은 요약 + 원문 링크**만, 클릭 시 새 탭(`rel="noopener noreferrer"`).

### 매일 자동 수집 파이프라인
`pg_cron` → Supabase Edge Function → 오피넷/RSS 호출 → 멱등 upsert → `collection_logs`에 success/partial/fail 기록.
앱은 오피넷을 **직접 호출하지 않고** 우리 DB에서 읽습니다 (API 키 노출·좌표 변환·rate limit을 서버에서 흡수).

### 접근성 (WCAG AA 기준)
- 모든 인터랙티브 요소 **터치 타깃 ≥44px**, 키보드 네비게이션 전수 검토
- `axe-core` 자동 테스트 + Lighthouse Accessibility **100**
- 색 대비 4.5:1 충족 (밝은 그린 위 흰 텍스트 AA 미달 → 진한 그린 그라데이션으로 보정)

---

## 기술 스택과 선택 이유

| 분류 | 선택 | 핵심 이유 |
|---|---|---|
| **UI** | React 19 | — |
| **빌드** | Vite 8 | `vite-plugin-pwa` 통합, CSR 중심 앱에 SSR 오버헤드 불필요 |
| **언어** | TypeScript 6 | Supabase 자동 생성 타입으로 DB↔프론트 정합성 보장 |
| **스타일** | Tailwind CSS v4 | `@theme` 토큰으로 디자인 시스템(프레시 그린) 통합 |
| **서버 상태** | TanStack Query v5 | 캐싱·리페치 자동 처리, 수집 데이터 조회에 적합 |
| **UI 상태** | Zustand v5 | Provider 없이 유종/정렬 필터 등 클라이언트 상태 관리 |
| **가상 스크롤** | TanStack Virtual | 긴 주유소 리스트를 뷰포트 기준만 렌더 (TanStack 생태계 통일) |
| **차트** | Recharts | React 친화적·접근성 대응 용이, 시계열 area 차트 |
| **지도** | 카카오맵 SDK | 마커 클러스터러 내장, 국내 좌표/주소 정합 |
| **백엔드** | Supabase | Postgres가 시계열 적재/집계에 최적, `pg_cron` 무료 스케줄러, RLS |
| **PWA** | vite-plugin-pwa | manifest/Service Worker 자동 생성 |
| **테스트** | Vitest v4 + Testing Library + MSW | Vite 동일 진영, 외부 API 모킹으로 결정적 테스트 |
| **배포** | Vercel | GitHub push → 자동 HTTPS 배포 |

**Next.js를 선택하지 않은 이유**: 메인이 개인화·Geolocation 화면이라 SSR/SEO 효용이 낮고 본질적으로 CSR입니다. 수집 스케줄러는 Supabase `pg_cron`이 담당하므로 풀스택 이점이 중복됩니다.

**Firebase를 선택하지 않은 이유**: 시계열 적재·집계는 Postgres가 최적입니다. Firestore(NoSQL)는 부적합하고, `pg_cron` 같은 무료 스케줄러도 없습니다.

---

## 주요 구현 포인트

### 1. KATEC ↔ WGS84 좌표 변환 — 외부 의존성 없는 순수 수학 구현

**문제**: 오피넷은 좌표를 **KATEC(TM, Bessel 1841 / Tokyo datum)** 으로 반환합니다. GPS는 WGS84라 변환이 필수이고, Edge Function(Deno)·브라우저·테스트가 모두 같은 로직을 써야 합니다.

**해결**: `proj4` 같은 라이브러리 없이 TM 투영 + Molodensky 3-파라미터 datum shift를 직접 구현하고, `supabase/functions/_shared/coord.ts` **단일 출처**에 두어 Edge Function은 import, 브라우저/테스트는 re-export 배럴로 공유합니다.

```typescript
export function wgs84ToKatec(lat: number, lng: number): { x: number; y: number } {
  const phi = lat * (Math.PI / 180);
  const lambda = lng * (Math.PI / 180);
  const [phiBessel, lambdaBessel] = molodenskyInverse(phi, lambda);
  const [x, y] = tmForward(phiBessel, lambdaBessel);
  return { x, y };
}
```

서울·부산·제주 3개 기준점 **왕복 변환 테스트**(오차 < 5m)로 검증했습니다.

---

### 2. 시계열 직접 누적 — 오피넷이 안 주는 히스토리를 매일 적재

**문제**: 오피넷은 주유소별 일별 가격 히스토리를 제공하지 않습니다. "가격 추이" 자체가 불가능해 보이는 제약.

**해결**: `pg_cron`이 매일 `collect-prices` Edge Function을 트리거 → 오늘자 스냅샷을 `price_snapshots`에 적재해 시계열을 **직접 만들어** 누적합니다. 실호출 기준 하루 **1,667행 / 고유 주유소 약 1,356개**가 쌓입니다.

```sql
CREATE TABLE public.price_snapshots (
  id           BIGSERIAL   PRIMARY KEY,
  station_id   TEXT        NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  date         DATE        NOT NULL,   -- KST 기준 날짜
  fuel_type    TEXT        NOT NULL,
  price        INTEGER     NOT NULL,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT price_snapshots_unique UNIQUE (station_id, date, fuel_type)
);
```

---

### 3. 멱등 적재 + 부분 실패 격리 — 재실행해도 안전한 수집

**문제**: cron이 같은 날 두 번 돌거나, 특정 지역/유종 호출만 실패할 수 있습니다.

**해결**:
- `UNIQUE (station_id, date, fuel_type)` + `ON CONFLICT`로 **멱등 upsert** (몇 번을 돌려도 행이 중복되지 않음)
- 지역/유종 조합별 `try/catch` 격리 → 일부가 실패해도 나머지는 적재되고, `collection_logs`에 `partial` 기록
- `success / partial / fail` 3-status + `rows=0` 가드로 수집 신뢰성을 운영 관점에서 추적

---

### 4. around-stations Edge Function — 클라이언트는 우리 서버만 본다

오피넷 API 키·좌표 변환·rate limit을 **클라이언트에 노출하지 않기 위해**, 주변 주유소 조회를 Edge Function 한 겹으로 감쌌습니다.

```
lat/lng/fuel
  → wgs84ToKatec (서버에서 좌표 변환)
  → 오피넷 aroundAll.do (API 키는 환경변수)
  → KATEC→WGS84 역변환 + 브랜드 매핑 정규화
  → StationWithPrice[] 반환
```

거리(DISTANCE)도 오피넷이 계산해 주므로 클라이언트의 haversine 계산을 제거했습니다.

---

### 5. 대용량 렌더 성능 — 클러스터링 + 가상 스크롤 + 코드 스플리팅

- **지도**: 카카오맵 내장 클러스터러로 마커를 그룹화해 뷰포트 기준만 렌더
- **리스트**: TanStack Virtual로 긴 주유소 리스트를 보이는 만큼만 DOM에 그림
- **번들**: 3개 라우트 + Recharts 차트를 `React.lazy`로 분리. 단일 835KB 청크를 `index`(250KB) + `supabase`(200KB) + `recharts`(319KB, 지연 로드)로 쪼개 랜딩 초기 JS를 약 455KB로 축소 (Lighthouse Performance 79 → 82)

---

## 성능 및 품질 지표

| 지표 | 수치 |
|---|---|
| **테스트** | 101개 전체 통과 (Vitest + Testing Library + MSW) |
| **빌드** | TypeScript 타입 에러 0건 (`tsc --noEmit` 포함) |
| **AI 안티패턴** | impeccable 오프라인 탐지기 스캔 결과 **0건** |
| **데이터 파이프라인** | 좌표 변환 왕복 테스트, 파서 단위 테스트(fixture), 멱등 적재 검증 |
| **접근성** | WCAG AA 기준, 터치 타깃 ≥44px, 키보드 네비게이션, `axe-core` 테스트 |

### Lighthouse 실측 (모바일 · 프로덕션 빌드)

| 카테고리 | 점수 |
|---|---|
| Accessibility | **100** |
| Best Practices | **100** |
| Performance | 82 |

### Core Web Vitals (코드 스플리팅 후)

| 지표 | 값 | 비고 |
|---|---|---|
| FCP (최초 콘텐츠 페인트) | 2.3 s | 코드 스플리팅 전 2.7s → 개선 |
| LCP (최대 콘텐츠 페인트) | 4.4 s | 데이터 패칭 의존(CSR) — 추가 개선은 SSR/프리렌더 필요 |

> 폰트 로딩을 `@import` → `index.html`의 `link` + `preconnect`로 옮겨 렌더 블로킹을 제거했고, 스켈레톤에 `prefers-reduced-motion` 대응을 넣었습니다. LCP는 CSR 구조상 데이터 패칭 이후 렌더되는 데서 발생하며, **SSR/프리렌더를 다음 개선 과제로 식별**했습니다.

---

## 아키텍처

```
[pg_cron (매일/매시)]
        │
        ▼
[Supabase Edge Functions]
  ├ collect-prices        오피넷 가격 수집 → upsert stations / insert price_snapshots
  ├ collect-regional-avg  오피넷 평균·추이 수집 → regional_avg
  ├ collect-news          Google News RSS 수집 → news
  └ around-stations       (앱 요청 시) 좌표 변환 + 주변 주유소 실시간 조회
        │ 적재
        ▼
[Supabase Postgres + RLS]   stations / price_snapshots / regional_avg / news / collection_logs
        ▲ 읽기 (TanStack Query)
        │
[Vite + React PWA]   카카오맵·클러스터링 · Recharts 차트 · TanStack Virtual
```

**좌표 변환 단일 출처**: `supabase/functions/_shared/coord.ts` 한 곳에 본문을 두고, Edge Function은 import / 브라우저·테스트는 `src/lib/coord.ts` re-export 배럴로 공유 (drift 방지).

**보안 — RLS**: 모든 테이블은 **읽기 공개 + 쓰기 `service_role` 전용**. 수집 Edge Function만 데이터를 쓰고, API 키는 Edge Function 환경변수에만 둡니다(클라이언트 노출 없음).

```
src/
 ├ pages/         라우트 컴포넌트 (실시간 유가 / 주변 주유소 / 유가 뉴스)
 ├ components/
 │  ├ prices/     평균가 카드 · 가격 추이 차트
 │  ├ home/       카카오맵 · 주유소 리스트 · 필터바 · 빈 상태
 │  ├ news/       뉴스 카드
 │  └ layout/     탭바 · 메인 레이아웃
 ├ hooks/         TanStack Query 훅 (useStations, useAvgPrices, useNews, useGeolocation)
 ├ lib/           좌표 변환 · 거리 · 파서(parseOpinet/parseAvgPrice/parseNews) · supabase client
 ├ store/         Zustand (filterStore)
 └ types/         도메인 타입 (station, avgPrice)

supabase/
 ├ functions/     Edge Functions + _shared (좌표·파서 단일 출처)
 └ migrations/    스키마 · pg_cron 스케줄
```

---

## 화면 구조

| 경로 | 화면 | 비고 |
|---|---|---|
| `/` | 실시간 유가 | 전국 평균가 히어로 카드 + 전일 대비 + 최근 7일 추이 차트 |
| `/nearby` | 주변 주유소 | 카카오맵 클러스터링 + 가상 스크롤 리스트 + 유종/정렬 필터 + 말풍선 |
| `/news` | 유가 뉴스 | Google News RSS 최신 20건, 스켈레톤 로딩, 새 탭 외부 링크 |

---

## 로컬 실행

### 환경 변수

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_KAKAO_MAP_KEY=your-kakao-js-key
```

> 개발 모드(`npm run dev`)에서는 MSW가 `around-stations`·`regional_avg`·`news` 요청을 가로채 fixture를 반환하므로, Supabase 없이도 UI를 확인할 수 있습니다.
> 오피넷 API 키(`OPINET_API_KEY`)는 Supabase Edge Function secret에만 등록되며 클라이언트에는 들어가지 않습니다.

### 명령어

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # 프로덕션 빌드 (tsc + vite)
npm run test         # 테스트 전체 실행
npm run typecheck    # tsc --noEmit
npm run lint
npm run preview      # http://localhost:4173
npm run lighthouse   # preview 서버 대상 Lighthouse 측정
```

### Supabase 스키마

`supabase/migrations/`에 스키마와 `pg_cron` 스케줄 마이그레이션이 포함되어 있습니다.

```sql
-- 주유소 마스터 (오피넷 UNI_ID = PK, WGS84 좌표로 변환 저장)
CREATE TABLE public.stations (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, brand TEXT, address TEXT,
  lat DOUBLE PRECISION, lng DOUBLE PRECISION,
  is_self BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 일별 가격 스냅샷 (멱등 적재용 unique 제약)
CREATE TABLE public.price_snapshots (
  id BIGSERIAL PRIMARY KEY,
  station_id TEXT NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  date DATE NOT NULL, fuel_type TEXT NOT NULL, price INTEGER NOT NULL,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT price_snapshots_unique UNIQUE (station_id, date, fuel_type)
);

-- 읽기 공개 + 쓰기 service_role 전용 (수집 Edge Function만 적재)
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stations_select_public" ON public.stations
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "stations_write_service_only" ON public.stations
  FOR ALL TO service_role USING (true) WITH CHECK (true);
```

---

## 개발 과정 기록

**계획 하네스(Planning Harness)** 로 전체 개발을 Phase → Step 단위로 설계·검토·검증했습니다.
각 Step은 범위/완료 기준/검증 체크리스트를 가진 자기완결적 지시로 작성되어 세션 간 맥락을 유지합니다.

| Phase | 주요 작업 |
|---|---|
| **Phase 1 (MVP)** | 스캐폴딩 · Supabase 스키마 · `collect-prices` 수집 파이프라인 · 홈(주변 주유소) · 실시간 유가 대시보드 · QA |
| **Phase 2** | 실시간 유가 실데이터화(`collect-regional-avg`) · 유가 뉴스(`collect-news` + Google News RSS) |
| **디자인 개편** | 프레시 그린 디자인 시스템(`@theme` 토큰) · 컴포넌트 스킨 · 접근성/성능 마감 · 코드 스플리팅 |

- `plan/plan.md` — 현재 Phase, 진행 중인 Step, 완료 기준
- `fix/fix.md` — 완료 작업, 수정 파일, 검증 결과, 남은 이슈

데이터 파이프라인(스키마·Edge Function)과 프론트엔드(지도·차트·접근성)는 각각 **전용 리뷰 에이전트**(`data-pipeline-reviewer`, `frontend-dashboard-reviewer`)가 Step 완료 시 검토했습니다.
