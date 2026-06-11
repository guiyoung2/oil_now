// @ts-nocheck — Deno 런타임 전용 파일, tsconfig.app.json 범위 외
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parseNewsRss } from "../_shared/parseNews.ts";

const RSS_URL = "https://news.google.com/rss/search?q=%EC%9C%A0%EA%B0%80+%EA%B8%B0%EB%A6%84%EA%B0%92&hl=ko&gl=KR&ceid=KR:ko";

Deno.serve(async (_req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const supabase = createClient(supabaseUrl, serviceKey);
  const now = new Date();

  const { data: logRow, error: logErr } = await supabase
    .from("collection_logs")
    .insert({ job: "collect-news", started_at: now.toISOString(), status: "fail", rows: 0 })
    .select("id")
    .single();

  if (logErr || !logRow) {
    return new Response(JSON.stringify({ error: "collection_log INSERT 실패" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  let totalRows = 0;
  const failures: string[] = [];

  try {
    const res = await fetch(RSS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();

    const items = parseNewsRss(xml);

    if (items.length === 0) {
      failures.push("RSS 파싱 결과 0건");
    } else {
      const rows = items.slice(0, 20).map((item) => ({
        title:        item.title,
        url:          item.url,
        source:       item.source,
        published_at: item.published_at,
        summary:      item.summary,
        collected_at: now.toISOString(),
      }));

      const { error: upsertErr } = await supabase
        .from("news")
        .upsert(rows, { onConflict: "url", ignoreDuplicates: true });

      if (upsertErr) {
        failures.push(`news upsert — ${upsertErr.message}`);
      } else {
        totalRows = rows.length;
      }
    }
  } catch (err) {
    failures.push(`RSS fetch — ${err instanceof Error ? err.message : String(err)}`);
  }

  const status: "success" | "partial" | "fail" =
    failures.length > 0 && totalRows === 0 ? "fail"
    : failures.length > 0 ? "partial"
    : "success";

  await supabase.from("collection_logs").update({
    finished_at: new Date().toISOString(),
    status,
    rows: totalRows,
    error: failures.length > 0 ? JSON.stringify(failures) : null,
  }).eq("id", logRow.id);

  return new Response(JSON.stringify({ status, rows: totalRows, failures }), {
    headers: { "Content-Type": "application/json" },
  });
});
