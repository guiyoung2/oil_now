-- collect-regional-avg Edge Function 일별 자동 실행 스케줄
-- 실행 시간: 매일 01:30 UTC (= 10:30 KST) — collect-prices(01:00) 이후 30분 텀
--
-- 사전 준비: Supabase 대시보드 → Database → Vault 에서 시크릿 등록
--   SELECT vault.create_secret('<Functions URL>/functions/v1', 'functions_url');
--   SELECT vault.create_secret('<service_role key>', 'service_role_key');

-- pg_net, pg_cron 확장 활성화 (미활성화 환경 재현성 보장, IF NOT EXISTS로 멱등)
CREATE EXTENSION IF NOT EXISTS pg_net  WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA cron;

SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'collect-regional-avg-daily';

SELECT cron.schedule(
  'collect-regional-avg-daily',
  '30 1 * * *',
  $$
  SELECT net.http_post(
    url     => (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'functions_url')
               || '/functions/v1/collect-regional-avg',
    headers => jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body    => '{}'::jsonb
  );
  $$
);
