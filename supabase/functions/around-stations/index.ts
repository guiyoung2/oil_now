// @ts-nocheck — Deno 런타임 전용 파일, tsconfig.app.json 범위 외

// ─── 좌표 변환 ───────────────────────────────────────────────────────────────
// src/lib/coord.ts 와 동일 — fix.md #11 Phase 2에서 단일 출처화 예정
const BESSEL_A = 6377397.155;
const BESSEL_F = 1 / 299.1528128;
const BESSEL_B = BESSEL_A * (1 - BESSEL_F);
const BESSEL_E2 = 2 * BESSEL_F - BESSEL_F ** 2;
const LAT0 = 38 * (Math.PI / 180);
const LNG0 = 128 * (Math.PI / 180);
const K0 = 0.9999;
const FE = 400000;
const FN = 600000;
const DX = -146.43, DY = 507.89, DZ = 681.46;
const WGS84_A = 6378137.0;
const WGS84_F = 1 / 298.257223563;
const WGS84_B = WGS84_A * (1 - WGS84_F);
const WGS84_E2 = 2 * WGS84_F - WGS84_F ** 2;

function meridianArc(phi: number): number {
  const e2 = BESSEL_E2;
  return BESSEL_A * (
    (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256) * phi
    - (3 * e2 / 8 + 3 * e2 ** 2 / 32 + 45 * e2 ** 3 / 1024) * Math.sin(2 * phi)
    + (15 * e2 ** 2 / 256 + 45 * e2 ** 3 / 1024) * Math.sin(4 * phi)
    - (35 * e2 ** 3 / 3072) * Math.sin(6 * phi)
  );
}

function wgs84ToKatec(lat: number, lng: number): { x: number; y: number } {
  const phi = lat * (Math.PI / 180);
  const lambda = lng * (Math.PI / 180);

  // Molodensky inverse: WGS84 → Bessel
  const sp = Math.sin(phi), cp = Math.cos(phi), sl = Math.sin(lambda), cl = Math.cos(lambda);
  const e2w = WGS84_E2;
  const Nw = WGS84_A / Math.sqrt(1 - e2w * sp ** 2);
  const Mw = WGS84_A * (1 - e2w) / (1 - e2w * sp ** 2) ** 1.5;
  const da = BESSEL_A - WGS84_A;
  const df = BESSEL_F - WGS84_F;
  const dPhi = (
    DX * sp * cl + DY * sp * sl - DZ * cp
    + da * (Nw * e2w * sp * cp) / WGS84_A
    + df * (Mw * (WGS84_A / WGS84_B) + Nw * (WGS84_B / WGS84_A)) * sp * cp
  ) / Mw;
  const dLam = (DX * sl - DY * cl) / (Nw * cp);
  const phiB = phi + dPhi;
  const lamB = lambda + dLam;

  // TM forward: Bessel → KATEC
  const sp2 = Math.sin(phiB), cp2 = Math.cos(phiB), tp2 = Math.tan(phiB);
  const e2b = BESSEL_E2;
  const ep2 = e2b / (1 - e2b);
  const Nv = BESSEL_A / Math.sqrt(1 - e2b * sp2 ** 2);
  const T = tp2 ** 2;
  const C = ep2 * cp2 ** 2;
  const A = cp2 * (lamB - LNG0);
  const Mv = meridianArc(phiB);
  const M0 = meridianArc(LAT0);

  const x = K0 * Nv * (A + (1 - T + C) * A ** 3 / 6 + (5 - 18 * T + T ** 2 + 72 * C - 58 * ep2) * A ** 5 / 120) + FE;
  const y = K0 * (Mv - M0 + Nv * tp2 * (A ** 2 / 2 + (5 - T + 9 * C + 4 * C ** 2) * A ** 4 / 24 + (61 - 58 * T + T ** 2 + 600 * C - 330 * ep2) * A ** 6 / 720)) + FN;

  return { x, y };
}

function katecToWgs84(x: number, y: number): { lat: number; lng: number } {
  // TM inverse
  const e2 = BESSEL_E2;
  const M = meridianArc(LAT0) + (y - FN) / K0;
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const mu = M / (BESSEL_A * (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256));
  const phi1 = mu
    + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu)
    + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu)
    + (151 * e1 ** 3 / 96) * Math.sin(6 * mu)
    + (1097 * e1 ** 4 / 512) * Math.sin(8 * mu);

  const sp1 = Math.sin(phi1), cp1 = Math.cos(phi1), tp1 = Math.tan(phi1);
  const N1 = BESSEL_A / Math.sqrt(1 - e2 * sp1 ** 2);
  const R1 = BESSEL_A * (1 - e2) / (1 - e2 * sp1 ** 2) ** 1.5;
  const T1 = tp1 ** 2, C1 = (e2 / (1 - e2)) * cp1 ** 2;
  const D = (x - FE) / (N1 * K0);

  const phi = phi1 - (N1 * tp1 / R1) * (
    D ** 2 / 2
    - (5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * (e2 / (1 - e2))) * D ** 4 / 24
    + (61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * (e2 / (1 - e2)) - 3 * C1 ** 2) * D ** 6 / 720
  );
  const lam = LNG0 + (
    D - (1 + 2 * T1 + C1) * D ** 3 / 6
    + (5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * (e2 / (1 - e2)) + 24 * T1 ** 2) * D ** 5 / 120
  ) / cp1;

  // Molodensky: Bessel → WGS84
  const sp = Math.sin(phi), cp = Math.cos(phi), sl = Math.sin(lam), cl = Math.cos(lam);
  const Nv = BESSEL_A / Math.sqrt(1 - e2 * sp ** 2);
  const Mv2 = BESSEL_A * (1 - e2) / (1 - e2 * sp ** 2) ** 1.5;
  const da = WGS84_A - BESSEL_A;
  const df = WGS84_F - BESSEL_F;
  const dPhi = (-DX * sp * cl - DY * sp * sl + DZ * cp
    + da * (Nv * e2 * sp * cp) / BESSEL_A
    + df * (Mv2 * (BESSEL_A / BESSEL_B) + Nv * (BESSEL_B / BESSEL_A)) * sp * cp) / Mv2;
  const dLam = (-DX * sl + DY * cl) / (Nv * cp);

  return { lat: (phi + dPhi) * (180 / Math.PI), lng: (lam + dLam) * (180 / Math.PI) };
}

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
