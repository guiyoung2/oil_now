# Phase 1 단계별 검증 기준

각 Step의 테스트/성능/접근성 검증 기준 상세.
planning-orchestrator와 각 reviewer가 완료 판단 시 참조한다.

---

## Step 1: 프로젝트 스캐폴딩

### 테스트 기준
- `npm run test` 명령이 존재하고 실행 가능
- Vitest 설정 파일(`vitest.config.ts`) 존재
- MSW 핸들러 초기 설정 파일 존재 (`src/mocks/handlers.ts` 또는 동등)
- 샘플 테스트 1개 이상 통과

### 성능 기준
- 해당 없음 (스캐폴딩 단계)

### 접근성 기준
- 해당 없음 (스캐폴딩 단계)

### Phase 2 이관 판단 기준
- 뉴스/로그인/웹푸시 관련 패키지를 이 단계에서 설치하면 Phase 2 보류로 이동

---

## Step 2: Supabase 스키마

### 테스트 기준
- SQL migration 파일 존재 (`supabase/migrations/*.sql` 또는 동등)
- unique constraint `(station_id, date, fuel_type)` 존재 확인
- migration 파일 내 멱등 upsert 쿼리 예시 존재
- RLS 정책 SQL 존재

### 성능 기준
- 인덱스 `(station_id, fuel_type, date)` 존재 → 주유소별 연료별 히스토리 조회 최적화
- 인덱스 `(date)` on `price_snapshots` → 날짜별 최신 스냅샷 조회 최적화

### 접근성 기준
- 해당 없음 (스키마 단계)

### Phase 2 이관 판단 기준
- `regional_avg`, `news`, `favorites`, `price_alerts` 테이블을 이 단계에서 생성하면 Phase 2 보류로 이동

---

## Step 3: collect-prices Edge Function

### 테스트 기준
- **좌표 변환 단위 테스트:** KATEC 좌표 입력 → WGS84 출력 검증 (알려진 기준점 2개 이상)
- **파서 단위 테스트:** Opinet API 응답 fixture 기반, 파싱 결과 shape 검증
  - `station_id`, `name`, `brand`, `lat`, `lng`, `fuel_type`, `price` 필드 존재 확인
- **collection_logs 기록 테스트:** success/partial/fail 케이스별 기록 확인
- **멱등성 테스트:** 동일 `(station_id, date, fuel_type)` 두 번 insert 시 중복 없음 확인

### 성능 기준
- Edge Function 실행시간 목표: 50초 이내 (Supabase Edge Function 한도 고려)
- 실행시간 초과 우려 시: 지역코드 배치 분할 전략 수립 필요

### 접근성 기준
- 해당 없음 (백엔드 단계)

### Phase 2 이관 판단 기준
- `collect-regional-avg`, `collect-news`, `notify-price` 구현을 이 단계에 포함하면 Phase 2 보류로 이동

---

## Step 4: 홈 화면

### 테스트 기준
- **RTL 컴포넌트 테스트:**
  - 유종 토글: 선택 변경 시 리스트 필터링 확인
  - 정렬(거리): 거리 오름차순 렌더링 확인
  - 정렬(가격): 가격 오름차순 렌더링 확인
  - Geolocation 거부 fallback: 드롭다운 표시 확인
- **MSW 통합 테스트:** Supabase 주변 주유소 API mock, 리스트 렌더링 확인

### 성능 기준
- **Lighthouse Performance ≥ 70** (mock 데이터 기준)
- **FCP(First Contentful Paint) < 3s**
- **가상 스크롤:** 1,000건 이상 렌더링 시 FPS 드롭 없음 (목표: 60fps 유지)
- **마커 클러스터링:** 뷰포트 내 마커 수 제한 (클러스터 미적용 시 1.1만 마커 동시 렌더 금지)
- **코드 스플리팅:** 지도 라이브러리, 차트 라이브러리 lazy import 적용

### 접근성 기준
- **터치 타깃 ≥ 44px:** 유종 토글 버튼, 정렬 버튼, 리스트 항목 전체
- **키보드 내비게이션:** 탭 순서 — 유종 토글 → 정렬 → 리스트 순
- **포커스 표시자:** 모든 인터랙티브 요소에 visible focus ring
- **스크린리더:** 지도 마커에 대체 텍스트 또는 aria-label 존재
- **색상 대비:** 가격 텍스트 4.5:1 이상, 최저가 강조 색상 대비 확인

### Phase 2 이관 판단 기준
- 유가 동향 섹션, 뉴스 섹션, 로그인 버튼을 이 단계에 포함하면 Phase 2 보류로 이동

---

## Step 5: 주유소 상세 화면

### 테스트 기준
- **Empty state 테스트:** `price_snapshots` 데이터 없을 때 "데이터 누적 중" 메시지 렌더링 확인 (crash 없음)
- **차트 테스트:** 1개 데이터 포인트, 30개 데이터 포인트 렌더링 확인
- **즐겨찾기 테스트:**
  - localStorage에 station_id 저장 확인
  - 새로고침 후 즐겨찾기 상태 복원 확인
  - 즐겨찾기 해제 시 localStorage에서 제거 확인

### 성능 기준
- **차트 다운샘플링:** 데이터 포인트 30개 이상 누적 시 다운샘플링 전략 수립
- **Lighthouse Performance ≥ 70** (개별 화면 기준)

### 접근성 기준
- **차트 접근성:** `aria-label` 또는 `<title>` 존재 (스크린리더 대응)
- **차트 색상:** 색맹 사용자 대응 색상 팔레트 (동일 정보 형태로도 구분 가능)
- **즐겨찾기 토글:** `aria-pressed` 또는 `aria-label` 상태 변경 반영
- **색상 대비:** 현재가 텍스트 4.5:1 이상

### Phase 2 이관 판단 기준
- 로그인 연동 즐겨찾기 DB 동기화를 이 단계에 포함하면 Phase 3 보류로 이동

---

## Step 6: QA 패스

### 테스트 기준
- `npm run test` 전체 통과 (0 failures)
- **필수 테스트 존재 여부:**
  - [ ] 좌표 변환 단위 테스트 (Step 3에서 이미 작성)
  - [ ] 유종 토글/정렬 RTL 테스트 (Step 4에서 이미 작성)
  - [ ] empty state RTL 테스트 (Step 5에서 이미 작성)
  - [ ] localStorage 즐겨찾기 테스트 (Step 5에서 이미 작성)

### 성능 기준
- **Lighthouse 측정 결과 파일 존재** (캡처 또는 JSON)
- **Performance ≥ 70**
- **FCP < 3s**
- **LCP(Largest Contentful Paint) < 4s**

### 접근성 기준 (WCAG AA 체크리스트)
- [ ] 모든 이미지/아이콘에 alt 텍스트 또는 aria-label
- [ ] 모든 폼 요소에 label 연결
- [ ] 색상 대비 4.5:1 이상 (일반 텍스트), 3:1 이상 (대형 텍스트)
- [ ] 키보드만으로 모든 기능 이용 가능
- [ ] 포커스 표시자 visible
- [ ] 터치 타깃 ≥ 44px 전체 화면
- [ ] 스크린리더 주요 정보 접근 가능 (지도 대체 콘텐츠, 차트 데이터)

### Lighthouse Accessibility ≥ 90

---

## Phase 전환 판단 기준 (Phase 1 → Phase 2)

다음 조건을 **모두** 충족할 때 Phase 2 전환 가능:

| 조건 | 확인 방법 |
|------|----------|
| Step 1~6 모두 ✅ 완료 | plan.md 상태 확인 |
| `npm run test` 전체 통과 | 직접 실행 |
| Lighthouse Performance ≥ 70 | 결과 파일 확인 |
| Lighthouse Accessibility ≥ 90 | 결과 파일 확인 |
| fix.md 미결 이슈 중 critical 없음 | fix.md 확인 |
| 매일 자동 수집 pg_cron 동작 확인 | collection_logs 기록 확인 |

미충족 항목이 있으면 fix.md에 critical 이슈로 기록하고 Phase 2 전환 불가 판단.
