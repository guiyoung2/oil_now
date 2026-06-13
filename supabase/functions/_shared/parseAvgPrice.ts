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

// avgAllPrice.do 응답 형태 (TRADE_DT + DIFF 포함)
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

// avgRecentPrice.do 응답 형태 (DATE 필드, DIFF 없음)
interface OpinetRecentRaw {
  DATE: string         // YYYYMMDD
  PRODCD: string
  PRICE: string | number
}

interface OpinetRecentResponse {
  RESULT: { OIL: OpinetRecentRaw[] }
}

export function parseRecentPriceResponse(
  json: OpinetRecentResponse,
  region = '전국',
): RegionalAvgRow[] {
  const rows = (json?.RESULT?.OIL ?? []).flatMap((item) => {
    const fuelType = FUEL_MAP[item.PRODCD]
    if (!fuelType) return []
    const dt = String(item.DATE)
    const date = `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}`
    return [{ date, fuel_type: fuelType, region, avg_price: Number(item.PRICE), diff: 0 }]
  })

  // avgRecentPrice.do는 DIFF를 제공하지 않으므로, 유종별 날짜 오름차순으로
  // 인접일 평균가 차이를 전일 대비(diff)로 계산한다. 가장 과거일은 기준이
  // 없으므로 0으로 둔다(최신일은 collect 단계에서 avgAllPrice.do로 보정).
  const byFuel = new Map<string, RegionalAvgRow[]>()
  for (const row of rows) {
    const list = byFuel.get(row.fuel_type) ?? []
    list.push(row)
    byFuel.set(row.fuel_type, list)
  }
  for (const list of byFuel.values()) {
    list.sort((a, b) => a.date.localeCompare(b.date))
    for (let i = 1; i < list.length; i++) {
      list[i].diff = Math.round((list[i].avg_price - list[i - 1].avg_price) * 100) / 100
    }
  }

  return rows
}
