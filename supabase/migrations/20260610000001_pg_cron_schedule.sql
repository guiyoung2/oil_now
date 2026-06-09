-- pg_net, pg_cron 확장 활성화
CREATE EXTENSION IF NOT EXISTS pg_net  WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA cron;

-- collect-prices Edge Function 일별 자동 실행 스케줄
-- 실행 시간: 매일 01:00 UTC (= 10:00 KST)
--
-- 사전 준비: Supabase 대시보드 → Database → Vault 에서 시크릿 추가
--   SELECT vault.create_secret('<Functions URL>/functions/v1', 'functions_url');
--   SELECT vault.create_secret('<service_role key>', 'service_role_key');
--
-- functions_url 예시: https://abcdefghij.supabase.co
-- (Project Settings → API → Project URL)
--
-- fix.md #12: service_role 키를 SQL 본문에 평문 저장하지 않고
--             Supabase Vault 시크릿 참조 방식 사용 → git 커밋 안전

-- 중복 실행 방지 (idempotent)
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'collect-prices-daily';

SELECT cron.schedule(
  'collect-prices-daily',
  '0 1 * * *',
  $$
  SELECT net.http_post(
    url     => (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'functions_url')
               || '/functions/v1/collect-prices',
    headers => jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body    => '{}'::jsonb
  );
  $$
);
