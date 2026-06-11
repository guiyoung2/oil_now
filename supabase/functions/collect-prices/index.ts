// @ts-nocheck — Deno 런타임 전용 파일, tsconfig.app.json 범위 외
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { katecToWgs84 } from "../_shared/coord.ts";

// ─── 오피넷 설정 ─────────────────────────────────────────────────────────────
// fix.md #4: 시도 17개 순차 순회. 코드 01-11, 14-19
const SIDO_CODES = ["01","02","03","04","05","06","07","08","09","10","11","14","15","16","17","18","19"];

// fix.md #3, #8: 유종코드 → 내부코드 매핑
const FUEL_MAP: Record<string, string> = {
  B027: "gasoline",
  D047: "diesel",
  B034: "premium",
  C004: "kerosene",
  K015: "lpg",
};
const FUEL_CODES = Object.keys(FUEL_MAP);

const BRAND_MAP: Record<string, string> = {
  SKE: "SK에너지", GSC: "GS칼텍스", HDO: "현대오일뱅크", SOL: "S-OIL",
  RTO: "자영알뜰", RTX: "고속알뜰", NHO: "농협알뜰", E1G: "E1", SKG: "SK가스", ETC: "기타",
};

interface OpinetStation {
  UNI_ID: string; OS_NM: string; NEW_ADR: string;
  POLL_DIV_CD: string; GIS_X_COOR: string; GIS_Y_COOR: string; PRICE: string;
}

async function fetchRegionFuel(
  apiKey: string, sidoCode: string, fuelCode: string,
): Promise<OpinetStation[]> {
  const url = new URL("https://www.opinet.co.kr/api/lowTop10.do");
  url.searchParams.set("code", apiKey);
  url.searchParams.set("siGunGu", sidoCode);
  url.searchParams.set("prodcd", fuelCode);
  url.searchParams.set("cnt", "20");
  url.searchParams.set("out", "json");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  // fix.md #14: RESULT.OIL 경로 — 실호출로 검증 필요
  return (data?.RESULT?.OIL as OpinetStation[]) ?? [];
}

// ─── Edge Function 핸들러 ────────────────────────────────────────────────────
Deno.serve(async (_req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const apiKey = Deno.env.get("OPINET_API_KEY") ?? "";

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPINET_API_KEY not set" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const now = new Date();
  // fix.md #9: date KST 기준
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const dateStr = kstNow.toISOString().slice(0, 10);

  // fix.md #10: collection_logs 단일 행 — 시작 시 INSERT, 종료 시 UPDATE
  const { data: logRow, error: logErr } = await supabase
    .from("collection_logs")
    .insert({ job: "collect-prices", started_at: now.toISOString(), status: "fail", rows: 0 })
    .select("id")
    .single();

  if (logErr || !logRow) {
    return new Response(JSON.stringify({ error: "collection_log INSERT 실패" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  let totalRows = 0;
  const failures: string[] = [];
  const total = SIDO_CODES.length * FUEL_CODES.length;

  for (const sidoCode of SIDO_CODES) {
    for (const fuelCode of FUEL_CODES) {
      try {
        const stations = await fetchRegionFuel(apiKey, sidoCode, fuelCode);

        // fix.md #15: 조합 단위 배치 upsert — 직렬 단건 대비 DB 왕복 1/N 감소
        const stationBatch: object[] = [];
        const priceBatch: object[] = [];

        for (const s of stations) {
          // fix.md #7: price ≤ 0 스킵
          const price = parseInt(s.PRICE, 10);
          if (!price || price <= 0) continue;

          const x = parseFloat(s.GIS_X_COOR);
          const y = parseFloat(s.GIS_Y_COOR);
          const hasCoords = !isNaN(x) && !isNaN(y) && x > 0 && y > 0;
          const coords = hasCoords ? katecToWgs84(x, y) : null;

          stationBatch.push({
            id: s.UNI_ID, name: s.OS_NM,
            brand: BRAND_MAP[s.POLL_DIV_CD] ?? s.POLL_DIV_CD,
            address: s.NEW_ADR,
            lat: coords?.lat ?? null, lng: coords?.lng ?? null,
            is_self: false,
          });

          priceBatch.push({
            station_id: s.UNI_ID, date: dateStr,
            fuel_type: FUEL_MAP[fuelCode],
            price, collected_at: now.toISOString(),
          });
        }

        if (stationBatch.length === 0) continue;

        const { error: stErr } = await supabase.from("stations")
          .upsert(stationBatch, { onConflict: "id" });
        if (stErr) {
          failures.push(`sido:${sidoCode} fuel:${fuelCode} stations — ${stErr.message}`);
          continue;
        }

        const { error: prErr } = await supabase.from("price_snapshots")
          .upsert(priceBatch, { onConflict: "station_id,date,fuel_type" });
        if (prErr) {
          failures.push(`sido:${sidoCode} fuel:${fuelCode} prices — ${prErr.message}`);
        } else {
          totalRows += priceBatch.length;
        }
      } catch (err) {
        // 부분 실패 허용: 해당 조합만 실패로 기록하고 계속 진행
        failures.push(`sido:${sidoCode} fuel:${fuelCode} — ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  // fix.md #13: status 결정
  // - 전체 조합 실패 → fail
  // - 일부 실패 또는 성공했으나 적재 0건(API 이상 의심) → partial
  // - 실패 없고 1건 이상 적재 → success
  const status: "success" | "partial" | "fail" =
    failures.length >= total ? "fail"
    : failures.length > 0 || totalRows === 0 ? "partial"
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
