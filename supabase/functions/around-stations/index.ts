// @ts-nocheck — Deno 런타임 전용 파일, tsconfig.app.json 범위 외
import { wgs84ToKatec, katecToWgs84 } from "../_shared/coord.ts";

// ─── 오피넷 설정 ─────────────────────────────────────────────────────────────
const FUEL_PRODCD: Record<string, string> = {
  gasoline: "B027",
  diesel: "D047",
  lpg: "K015",
};

const BRAND_MAP: Record<string, string> = {
  SKE: "SK에너지", GSC: "GS칼텍스", HDO: "현대오일뱅크", SOL: "S-OIL",
  RTO: "자영알뜰", RTX: "고속알뜰", NHO: "농협알뜰", E1G: "E1", SKG: "SK가스", ETC: "기타",
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Edge Function 핸들러 ────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const lat = parseFloat(url.searchParams.get("lat") ?? "");
  const lng = parseFloat(url.searchParams.get("lng") ?? "");
  const fuel = url.searchParams.get("fuel") ?? "gasoline";

  if (isNaN(lat) || isNaN(lng)) {
    return new Response(JSON.stringify({ error: "lat, lng 파라미터 필요" }), {
      status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const prodcd = FUEL_PRODCD[fuel];
  if (!prodcd) {
    return new Response(JSON.stringify({ error: `지원하지 않는 유종: ${fuel}` }), {
      status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const apiKey = Deno.env.get("OPINET_API_KEY") ?? "";
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPINET_API_KEY not set" }), {
      status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const { x: katecX, y: katecY } = wgs84ToKatec(lat, lng);

  const apiUrl = new URL("https://www.opinet.co.kr/api/aroundAll.do");
  apiUrl.searchParams.set("code", apiKey);
  apiUrl.searchParams.set("x", String(Math.round(katecX)));
  apiUrl.searchParams.set("y", String(Math.round(katecY)));
  apiUrl.searchParams.set("radius", "5000");
  apiUrl.searchParams.set("sort", "1");
  apiUrl.searchParams.set("prodcd", prodcd);
  apiUrl.searchParams.set("out", "json");

  let oilList: any[] = [];
  try {
    const res = await fetch(apiUrl.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    oilList = data?.RESULT?.OIL ?? [];
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Opinet API 오류: ${err instanceof Error ? err.message : String(err)}` }),
      { status: 502, headers: { "Content-Type": "application/json", ...CORS_HEADERS } },
    );
  }

  // 오늘 날짜 KST
  const kstDate = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const stations = oilList
    .filter((s) => Number(s.PRICE) > 0)
    .map((s) => {
      const gx = parseFloat(s.GIS_X_COOR);
      const gy = parseFloat(s.GIS_Y_COOR);
      const hasCoords = !isNaN(gx) && !isNaN(gy) && gx > 0 && gy > 0;
      const coords = hasCoords ? katecToWgs84(gx, gy) : { lat, lng };
      return {
        id: s.UNI_ID,
        name: s.OS_NM,
        brand: BRAND_MAP[s.POLL_DIV_CD] ?? s.POLL_DIV_CD,
        address: "",
        lat: coords.lat,
        lng: coords.lng,
        is_self: false,
        distance: parseFloat(s.DISTANCE) || 0,
        price: parseInt(s.PRICE, 10),
        latestDate: kstDate,
      };
    });

  return new Response(JSON.stringify(stations), {
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
});
