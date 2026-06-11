// @ts-nocheck — Deno 런타임 전용 파일, tsconfig.app.json 범위 외
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parseAvgPriceResponse } from "../_shared/parseAvgPrice.ts";

Deno.serve(async (_req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const apiKey      = Deno.env.get("OPINET_API_KEY") ?? "";

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPINET_API_KEY not set" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const now = new Date();

  const { data: logRow, error: logErr } = await supabase
    .from("collection_logs")
    .insert({ job: "collect-regional-avg", started_at: now.toISOString(), status: "fail", rows: 0 })
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
    const url = new URL("https://www.opinet.co.kr/api/avgAllPrice.do");
    url.searchParams.set("code", apiKey);
    url.searchParams.set("out", "json");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const rows = parseAvgPriceResponse(json);

    if (rows.length === 0) {
      failures.push("avgAllPrice.do 응답에 유효한 유종 없음");
    } else {
      const { error: upsertErr } = await supabase
        .from("regional_avg")
        .upsert(rows, { onConflict: "date,fuel_type,region" });

      if (upsertErr) {
        failures.push(`regional_avg upsert — ${upsertErr.message}`);
      } else {
        totalRows = rows.length;
      }
    }
  } catch (err) {
    failures.push(`avgAllPrice.do fetch — ${err instanceof Error ? err.message : String(err)}`);
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
