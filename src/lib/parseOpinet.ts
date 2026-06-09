import { katecToWgs84 } from "./coord.ts";

export interface OpinetRaw {
  UNI_ID: string;
  OS_NM: string;
  NEW_ADR: string;
  POLL_DIV_CD: string;
  GIS_X_COOR: string;
  GIS_Y_COOR: string;
  PRICE: string;
}

export interface ParsedStation {
  id: string;
  name: string;
  brand: string;
  address: string;
  lat: number | null;
  lng: number | null;
  isSelf: boolean;
  fuelType: string;
  price: number;
}

const FUEL_MAP: Record<string, string> = {
  B027: "gasoline",
  D047: "diesel",
  B034: "premium",
  C004: "kerosene",
  K015: "lpg",
};

const BRAND_MAP: Record<string, string> = {
  SKE: "SK에너지",
  GSC: "GS칼텍스",
  HDO: "현대오일뱅크",
  SOL: "S-OIL",
  RTO: "자영알뜰",
  RTX: "고속알뜰",
  NHO: "농협알뜰",
  E1G: "E1",
  SKG: "SK가스",
  ETC: "기타",
};

export function parseOpinetStation(
  raw: OpinetRaw,
  fuelCode: string,
): ParsedStation | null {
  const price = parseInt(raw.PRICE, 10);
  if (!price || price <= 0) return null;

  const x = parseFloat(raw.GIS_X_COOR);
  const y = parseFloat(raw.GIS_Y_COOR);
  let lat: number | null = null;
  let lng: number | null = null;

  if (!isNaN(x) && !isNaN(y) && x > 0 && y > 0) {
    const coords = katecToWgs84(x, y);
    lat = coords.lat;
    lng = coords.lng;
  }

  return {
    id: raw.UNI_ID,
    name: raw.OS_NM,
    brand: BRAND_MAP[raw.POLL_DIV_CD] ?? raw.POLL_DIV_CD,
    address: raw.NEW_ADR,
    lat,
    lng,
    isSelf: false,
    fuelType: FUEL_MAP[fuelCode] ?? fuelCode,
    price,
  };
}
