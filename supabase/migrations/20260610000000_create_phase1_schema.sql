-- moddatetime 확장 활성화 (stations.updated_at 자동 갱신용)
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- 오피넷 주유소 기본 정보
CREATE TABLE public.stations (
  id         TEXT PRIMARY KEY,          -- 오피넷 UNI_ID
  name       TEXT NOT NULL,
  brand      TEXT,
  address    TEXT,
  lat        DOUBLE PRECISION,          -- WGS84 위도
  lng        DOUBLE PRECISION,          -- WGS84 경도
  is_self    BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- stations.updated_at 자동 갱신 트리거
CREATE TRIGGER stations_updated_at
  BEFORE UPDATE ON public.stations
  FOR EACH ROW
  EXECUTE PROCEDURE extensions.moddatetime(updated_at);

-- 일별 유종별 가격 스냅샷
-- fuel_type: TEXT 사용 (오피넷 유종코드 확인 후 정규화 값 결정 예정, fix.md #8)
-- price: 원 단위 정수, 0·결측 처리 규칙은 Step 3에서 확정 (fix.md #7)
CREATE TABLE public.price_snapshots (
  id           BIGSERIAL   PRIMARY KEY,
  station_id   TEXT        NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  date         DATE        NOT NULL,   -- KST 기준 날짜 (fix.md #9)
  fuel_type    TEXT        NOT NULL,
  price        INTEGER     NOT NULL,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT price_snapshots_unique UNIQUE (station_id, date, fuel_type)
);

-- 수집 작업 로그
-- 부분 실패 투영 방식(단일 행 UPDATE vs 지역별 행 INSERT)은 Step 3에서 결정 (fix.md #10)
CREATE TABLE public.collection_logs (
  id          BIGSERIAL   PRIMARY KEY,
  job         TEXT        NOT NULL,
  started_at  TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  status      TEXT        NOT NULL CHECK (status IN ('success', 'partial', 'fail')),
  rows        INTEGER,
  error       TEXT
);

-- 인덱스: 주유소별 유종별 날짜 조회 (Step 5 가격 추이 차트 쿼리 최적화)
CREATE INDEX price_snapshots_station_fuel_date_idx
  ON public.price_snapshots (station_id, fuel_type, date);

-- RLS 활성화
ALTER TABLE public.stations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_logs ENABLE ROW LEVEL SECURITY;

-- stations: 읽기 공개
CREATE POLICY "stations_select_public"
  ON public.stations FOR SELECT
  TO anon, authenticated
  USING (true);

-- stations: 쓰기 서비스 롤 전용 (Edge Function)
CREATE POLICY "stations_write_service_only"
  ON public.stations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- price_snapshots: 읽기 공개
CREATE POLICY "price_snapshots_select_public"
  ON public.price_snapshots FOR SELECT
  TO anon, authenticated
  USING (true);

-- price_snapshots: 쓰기 서비스 롤 전용 (Edge Function)
CREATE POLICY "price_snapshots_write_service_only"
  ON public.price_snapshots FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- collection_logs: 읽기 공개
CREATE POLICY "collection_logs_select_public"
  ON public.collection_logs FOR SELECT
  TO anon, authenticated
  USING (true);

-- collection_logs: 쓰기 서비스 롤 전용 (Edge Function)
CREATE POLICY "collection_logs_write_service_only"
  ON public.collection_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
