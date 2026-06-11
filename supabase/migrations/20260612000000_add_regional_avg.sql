-- 전국/시도별 일별 평균 유가
-- Phase 2-A: avgAllPrice.do → region='전국' 수집, 시도별은 Phase 2-B 이후
CREATE TABLE public.regional_avg (
  id          BIGSERIAL    PRIMARY KEY,
  date        DATE         NOT NULL,
  fuel_type   TEXT         NOT NULL,  -- gasoline/diesel/lpg/premium/kerosene
  region      TEXT         NOT NULL,  -- '전국' or 시도명 (서울, 경기, ...)
  avg_price   NUMERIC(8,2) NOT NULL,
  diff        NUMERIC(8,2) NOT NULL DEFAULT 0,  -- 전일 대비 변동(원)
  CONSTRAINT regional_avg_unique UNIQUE (date, fuel_type, region)
);

-- 추이 차트 쿼리 최적화: fuel_type + date 범위 조회
CREATE INDEX regional_avg_fuel_date_idx
  ON public.regional_avg (fuel_type, date);

-- RLS 활성화
ALTER TABLE public.regional_avg ENABLE ROW LEVEL SECURITY;

-- 읽기 공개
CREATE POLICY "regional_avg_select_public"
  ON public.regional_avg FOR SELECT
  TO anon, authenticated
  USING (true);

-- 쓰기 서비스 롤 전용 (Edge Function)
CREATE POLICY "regional_avg_write_service_only"
  ON public.regional_avg FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
