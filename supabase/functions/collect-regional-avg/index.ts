// @ts-nocheck — Deno 런타임 전용 파일, tsconfig.app.json 범위 외
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parseAvgPriceResponse, parseRecentPriceResponse } from "../_shared/parseAvgPrice.ts";

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

  // Step 1: avgRecentPrice.do — 최근 7일 일별 평균가 (diff=0)
  // 매일 실행 시 7일치가 항상 upsert되어 누락 없이 누적됨
  try {
    const recentUrl = new URL("https://www.opinet.co.kr/api/avgRecentPrice.do");
    recentUrl.searchParams.set("code", apiKey);
    recentUrl.searchParams.set("out", "json");

    const recentRes = await fetch(recentUrl.toString());
    if (!recentRes.ok) throw new Error(`HTTP ${recentRes.status}`);
    const recentJson = await recentRes.json();

    const recentRows = parseRecentPriceResponse(recentJson);
    if (recentRows.length === 0) {
      failures.push("avgRecentPrice.do — 유효 유종 없음");
    } else {
      const { error: upsertErr } = await supabase
        .from("regional_avg")
        .upsert(recentRows, { onConflict: "date,fuel_type,region" });
      if (upsertErr) {
        failures.push(`avgRecentPrice.do upsert — ${upsertErr.message}`);
      } else {
        totalRows += recentRows.length;
      }
    }
  } catch (err) {
    failures.push(`avgRecentPrice.do fetch — ${err instanceof Error ? err.message : String(err)}`);
  }

  // Step 2: avgAllPrice.do — 최신 공시일 가격 + 전일 대비 diff
  // Step 1의 최신 날짜 행을 덮어써서 diff 값을 정확하게 유지
  try {
    const allUrl = new URL("https://www.opinet.co.kr/api/avgAllPrice.do");
    allUrl.searchParams.set("code", apiKey);
    allUrl.searchParams.set("out", "json");

    const allRes = await fetch(allUrl.toString());
    if (!allRes.ok) throw new Error(`HTTP ${allRes.status}`);
    const allJson = await allRes.json();

    const allRows = parseAvgPriceResponse(allJson);
    if (allRows.length === 0) {
      failures.push("avgAllPrice.do — 유효 유종 없음");
    } else {
      const { error: upsertErr } = await supabase
        .from("regional_avg")
        .upsert(allRows, { onConflict: "date,fuel_type,region" });
      if (upsertErr) {
        failures.push(`avgAllPrice.do upsert — ${upsertErr.message}`);
      } else {
        totalRows += allRows.length;
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
