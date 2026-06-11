export interface RegionalAvgRow {
  date: string       // 'YYYY-MM-DD'
  fuel_type: string  // gasoline/diesel/lpg/premium/kerosene
  region: string     // '전국' or 시도명
  avg_price: number
  diff: number       // 전일 대비 변동(원)
}

const FUEL_MAP: Record<string, string> = {
  B027: 'gasoline',
  D047: 'diesel',
  K015: 'lpg',
  B034: 'premium',
  C004: 'kerosene',
}

interface OpinetAvgRaw {
  TRADE_DT: string
  PRODCD: string
  PRODNM: string
  PRICE: string | number
  DIFF: string | number
}

interface OpinetAvgResponse {
  RESULT: { OIL: OpinetAvgRaw[] }
}

export function parseAvgPriceResponse(
  json: OpinetAvgResponse,
  region = '전국',
): RegionalAvgRow[] {
  return (json?.RESULT?.OIL ?? []).flatMap((item) => {
    const fuelType = FUEL_MAP[item.PRODCD]
    if (!fuelType) return []
    const dt = String(item.TRADE_DT)
    const date = `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}`
    return [
      {
        date,
        fuel_type: fuelType,
        region,
        avg_price: Number(item.PRICE),
        diff: Number(item.DIFF),
      },
    ]
  })
}
