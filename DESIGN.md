---
name: oil_now
description: 한눈에 읽어주는 동네 친구 — 친근하고 명료한 한국 유가 대시보드
colors:
  primary: "#16B364"
  primary-50: "#EAF7F0"
  primary-200: "#A7E8C6"
  primary-deep: "#0E9F58"
  primary-700: "#0A7D45"
  ink: "#1F1F1F"
  sub: "#6B7280"
  muted: "#9A9A9E"
  line: "#F2F4F6"
  surface: "#F6F7F9"
  white: "#FFFFFF"
  price-up: "#F03E3E"
  price-down: "#3182F6"
typography:
  display:
    fontFamily: "Pretendard, -apple-system, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Pretendard, -apple-system, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body-strong:
    fontFamily: "Pretendard, -apple-system, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Pretendard, -apple-system, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  caption:
    fontFamily: "Pretendard, -apple-system, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "14px"
  lg: "18px"
  xl: "20px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: "{colors.primary-50}"
    textColor: "{colors.primary-deep}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  chip:
    backgroundColor: "{colors.white}"
    textColor: "{colors.muted}"
    rounded: "{rounded.full}"
    padding: "7px 14px"
  chip-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    padding: "7px 14px"
  badge-lowest:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "3px 8px"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "15px"
  hero-card:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.xl}"
    padding: "20px"
---

# Design System: oil_now

## 1. Overview

**Creative North Star: "한눈에 읽어주는 동네 친구"**

운전 중 잠깐 흘긋 보는 사용자에게, 가격을 잘 아는 다정한 친구가 옆에서 "여기가 제일 싸"라고 한눈에 짚어주는 경험. 따뜻함(친구)과 명료함(가격표)을 동시에 만족해야 한다. 친근한 둥근 카드와 부드러운 그림자로 다정함을 주되, 정보 위계는 칼같이 정돈해 3초 안에 "어디가 싼가"를 답한다. 화면의 주인공은 언제나 **숫자(가격·거리)**이며, 색과 장식은 그 숫자를 받쳐줄 뿐이다.

이 시스템은 명시적으로 거부한다: 크림/베이지 배경 + 점토색 테라코타 + 세리프로 이뤄진 **클로드 홈페이지 룩**, 그리고 보라→파랑 그라데이션·장식용 글래스모피즘·중첩 카드·색 위 회색 텍스트로 대표되는 **전형적 AI 슬롭**. 따뜻함은 베이지 배경이 아니라 채도 높은 그린 강조색과 둥근 형태에서 나온다.

**Key Characteristics:**
- 순백/쿨그레이 배경 위, 채도 높은 프레시 그린 강조
- 둥근 카드(18px) + 은은한 그림자로 만드는 다정함
- 숫자 우선 위계: 가장 큰 타입은 항상 가격
- 색은 역할이 명확 — 그린=브랜드/액션, 빨강·파랑=가격 변동
- 모바일 글랜스 우선, 표준 어포던스 존중

## 2. Colors

밝은 순백/쿨그레이 바탕에 단 하나의 채도 높은 그린이 액션과 강조를 도맡는 Restrained 전략이다.

### Primary
- **프레시 그린** (#16B364): 선택된 칩, 주 버튼, 최저가 배지, 가격 추이 차트 라인 등 브랜드·액션·강조의 모든 곳. 화면의 정체성을 담는 단 하나의 색.
- **딥 그린** (#0E9F58): 최저가 가격 텍스트, 버튼 hover/press 등 그린이 한 단계 더 진해져야 할 때.
- **그린 50** (#EAF7F0): 보조 버튼 배경, 그린 틴트 영역.
- **그린 200 / 700** (#A7E8C6 / #0A7D45): 약한 강조 ~ 가장 진한 강조의 양 끝.

### Neutral
- **잉크** (#1F1F1F): 본문·제목·가격 등 기본 텍스트.
- **서브** (#6B7280): 보조 텍스트, 라벨.
- **뮤트** (#9A9A9E): 거리·캡션 등 메타 정보.
- **라인** (#F2F4F6): 카드 내부 구분선.
- **서피스** (#F6F7F9): 카드 뒤 배경 영역.
- **화이트** (#FFFFFF): 카드·헤더 표면.

### Tertiary (가격 변동 시맨틱)
- **상승 레드** (#F03E3E): 가격 상승 ▲ (한국 관례).
- **하락 블루** (#3182F6): 가격 하락 ▼ (한국 관례).

### Named Rules
**역할 분리 규칙 (The Role-Split Rule).** 그린은 브랜드·액션·강조에만 쓴다. 빨강과 파랑은 오직 가격 변동(상승/하락) 신호에만 쓴다. 두 역할을 섞거나, 색을 장식으로 쓰는 것은 금지한다.

## 3. Typography

**Body Font:** Pretendard (with -apple-system, 'Apple SD Gothic Neo', sans-serif)

**Character:** 한글과 숫자 가독성이 뛰어난 단일 산세리프 패밀리를, 무게(400/700/800)와 음수 자간만으로 위계를 만든다. 제품 UI이므로 디스플레이/본문 폰트 페어링이 필요 없다. 고정 rem 스케일(유동 clamp 아님).

### Hierarchy
- **Display** (800, 2rem/32px, -0.03em): 히어로의 큰 가격 숫자. 화면당 1개.
- **Title** (800, 1.1875rem/19px, -0.02em): 화면 제목.
- **Body-strong** (700, 0.9375rem/15px, -0.01em): 주유소명 등 강조 본문.
- **Body** (400, 0.875rem/14px): 일반 본문 (산문은 65–75ch 제한).
- **Caption** (400, 0.75rem/12px): 거리·메타, 뮤트 색으로.

### Named Rules
**숫자 우선 규칙 (The Numbers-First Rule).** 어느 화면에서든 가장 큰 타입은 가격 숫자다. 제목·라벨이 가격보다 커지면 위계가 틀어진 것이다.

## 4. Elevation

평면을 기본으로 하되, 카드에만 은은한 단일 그림자를 얹어 다정한 부유감을 준다. 그림자는 깊이 표현이 아니라 "만질 수 있을 것 같은" 친근함의 장치다.

### Shadow Vocabulary
- **카드 그림자** (`box-shadow: 0 2px 10px rgba(0,0,0,0.05)`): 모든 둥근 카드의 기본. 은은하게.

### Named Rules
**둘 중 하나 규칙 (The Either-Or Rule).** 한 요소에 그림자와 1px 초과 테두리를 동시에 쓰지 않는다. 카드는 그림자로, 칩은 얇은 라인으로 — 둘을 겹치면 무거워진다.

## 5. Components

### Buttons
- **Shape:** 둥근 모서리 (14px radius).
- **Primary:** 프레시 그린(#16B364) 채움 + 흰 텍스트, 패딩 12px 20px, 굵기 700.
- **Hover / Focus:** 배경을 딥 그린(#0E9F58)으로. 포커스는 가시적 링.
- **Secondary:** 그린 50(#EAF7F0) 배경 + 딥 그린(#0E9F58) 텍스트.

### Chips
- **Style:** pill 형태(999px). 비선택은 흰 배경 + 뮤트 텍스트 + 얇은 라인.
- **State:** 선택 시 프레시 그린 채움 + 흰 텍스트. 유종/정렬 필터에 사용.

### Cards / Containers
- **Corner Style:** 18px radius (히어로 카드는 20px).
- **Background:** 흰색, 카드 뒤 영역은 서피스(#F6F7F9).
- **Shadow Strategy:** Elevation의 카드 그림자 1종만.
- **Border:** 없음 (그림자로 분리). 내부 구분은 라인(#F2F4F6).
- **Internal Padding:** 15px (카드), 20px (히어로).

### Navigation
- **Style:** 상단 탭 바(실시간 유가 / 주변 주유소 / 유가 뉴스). 산세리프 라벨.
- **States:** 활성 탭은 잉크 텍스트 + 하단 그린 인디케이터, 비활성은 뮤트 텍스트. 터치 타깃 ≥ 44px.

### Hero Card (전국 평균) — Signature
- 프레시 그린 표면(#16B364) + 흰 텍스트. 큰 가격(Display) + 반투명 흰색 pill 변동 배지(▲/▼ + 텍스트). 화면당 1개.

### Price Trend Chart (recharts) — Signature
- 라인: 프레시 그린 2.5px. 하단 area는 그린 그라데이션(0.25→0). 마지막 포인트에 점.

## 6. Do's and Don'ts

### Do:
- **Do** 강조색은 프레시 그린(#16B364) 하나로 통일하고, 가격 변동만 상승 레드(#F03E3E)/하락 블루(#3182F6)로 표시한다.
- **Do** 가장 큰 타입은 항상 가격 숫자로 둔다(숫자 우선 규칙).
- **Do** 카드는 은은한 그림자(`0 2px 10px rgba(0,0,0,0.05)`) 하나로만 띄운다.
- **Do** 가격 변동은 색에 더해 ▲▼ 화살표·텍스트로도 구분해 색약 사용자를 배려한다(WCAG AA).
- **Do** 본문 명도대비 ≥ 4.5:1을 지킨다. 뮤트 그레이를 본문에 쓰지 않는다.

### Don't:
- **Don't** 크림/베이지(#F0EEE6 계열) 배경 + 점토색 테라코타(#D97757 계열) + 세리프의 **클로드 홈페이지 룩**을 쓰지 않는다.
- **Don't** 보라→파랑 그라데이션, 장식용 글래스모피즘, 중첩 카드, 색 위 회색 텍스트, bounce/elastic 이징 같은 **전형적 AI 슬롭**을 쓰지 않는다.
- **Don't** 그린을 장식으로 흩뿌리거나, 빨강/파랑을 가격 변동 외 용도로 쓰지 않는다.
- **Don't** 한 요소에 그림자와 1px 초과 테두리를 동시에 쓰지 않는다.
- **Don't** 유동 clamp로 제목 크기를 흔들지 않는다 — 제품 UI는 고정 rem 스케일.
