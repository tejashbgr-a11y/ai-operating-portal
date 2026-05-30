
-- 1) Store an internal shared secret used by pg_cron to call edge functions.
DO $$
DECLARE existing uuid;
BEGIN
  SELECT id INTO existing FROM vault.secrets WHERE name = 'internal_cron_key';
  IF existing IS NULL THEN
    PERFORM vault.create_secret('6L9TS4c_7ZS1FL4TdIRY1vbvvGxvSv9ZJqPrqPRZcqcw2zglrzaT8VLnJb1EzOGm', 'internal_cron_key', 'Internal key used by pg_cron jobs to invoke scheduled edge functions');
  END IF;
END $$;

-- 2) Unschedule the old broken cron jobs (they sent anon key which now fails admin check).
DO $$
DECLARE j record;
BEGIN
  FOR j IN SELECT jobid, jobname FROM cron.job WHERE jobname IN ('aop-ingest-hourly','aop-summaries-hourly','aop-weekly-digest') LOOP
    PERFORM cron.unschedule(j.jobid);
  END LOOP;
  -- also unschedule the original unnamed ones by jobid 1,2,3 if still present
  FOR j IN SELECT jobid, jobname FROM cron.job WHERE command LIKE '%ingest-articles%' OR command LIKE '%generate-summaries%' OR command LIKE '%generate-weekly-digest%' LOOP
    PERFORM cron.unschedule(j.jobid);
  END LOOP;
END $$;

-- 3) Re-schedule using the internal key from vault.
SELECT cron.schedule(
  'aop-ingest-hourly',
  '0 * * * *',
  $job$
  SELECT net.http_post(
    url := 'https://vqujpxcfhuaukmhdnayy.supabase.co/functions/v1/ingest-articles',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'x-internal-key', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='internal_cron_key')
    ),
    body := '{"source":"all"}'::jsonb
  );
  $job$
);

SELECT cron.schedule(
  'aop-summaries-hourly',
  '5 * * * *',
  $job$
  SELECT net.http_post(
    url := 'https://vqujpxcfhuaukmhdnayy.supabase.co/functions/v1/generate-summaries',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'x-internal-key', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='internal_cron_key')
    ),
    body := '{}'::jsonb
  );
  $job$
);

SELECT cron.schedule(
  'aop-weekly-digest',
  '0 7 * * 1',
  $job$
  SELECT net.http_post(
    url := 'https://vqujpxcfhuaukmhdnayy.supabase.co/functions/v1/generate-weekly-digest',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'x-internal-key', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='internal_cron_key')
    ),
    body := '{}'::jsonb
  );
  $job$
);
