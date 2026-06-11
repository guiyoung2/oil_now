import { describe, expect, it } from 'vitest'
import { parseAvgPriceResponse } from '../lib/parseAvgPrice'

const FIXTURE = {
  RESULT: {
    OIL: [
      { TRADE_DT: '20260612', PRODCD: 'B034', PRODNM: '고급휘발유',  PRICE: '2442.29', DIFF: '-0.03' },
      { TRADE_DT: '20260612', PRODCD: 'B027', PRODNM: '휘발유',      PRICE: '2009.66', DIFF: '-0.07' },
      { TRADE_DT: '20260612', PRODCD: 'D047', PRODNM: '자동차용경유', PRICE: '2004.38', DIFF: '-0.31' },
      { TRADE_DT: '20260612', PRODCD: 'K015', PRODNM: '자동차부탄',  PRICE: '1107.57', DIFF: '-0.10' },
      { TRADE_DT: '20260612', PRODCD: 'C004', PRODNM: '등유',        PRICE: '1631.77', DIFF: '-0.18' },
    ],
  },
}

describe('parseAvgPriceResponse', () => {
  it('휘발유 B027 → gasoline 매핑, date YYYYMMDD→YYYY-MM-DD 변환', () => {
    const rows = parseAvgPriceResponse(FIXTURE)
    const gasoline = rows.find((r) => r.fuel_type === 'gasoline')
    expect(gasoline).toBeDefined()
    expect(gasoline!.date).toBe('2026-06-12')
    expect(gasoline!.avg_price).toBe(2009.66)
    expect(gasoline!.diff).toBe(-0.07)
    expect(gasoline!.region).toBe('전국')
  })

  it('경유 D047 → diesel 매핑', () => {
    const rows = parseAvgPriceResponse(FIXTURE)
    const diesel = rows.find((r) => r.fuel_type === 'diesel')
    expect(diesel!.avg_price).toBe(2004.38)
    expect(diesel!.diff).toBe(-0.31)
  })

  it('LPG K015 → lpg 매핑', () => {
    const rows = parseAvgPriceResponse(FIXTURE)
    const lpg = rows.find((r) => r.fuel_type === 'lpg')
    expect(lpg!.avg_price).toBe(1107.57)
  })

  it('고급휘발유 B034 → premium 매핑', () => {
    const rows = parseAvgPriceResponse(FIXTURE)
    const premium = rows.find((r) => r.fuel_type === 'premium')
    expect(premium!.avg_price).toBe(2442.29)
  })

  it('등유 C004 → kerosene 매핑', () => {
    const rows = parseAvgPriceResponse(FIXTURE)
    const kerosene = rows.find((r) => r.fuel_type === 'kerosene')
    expect(kerosene!.avg_price).toBe(1631.77)
    expect(kerosene!.diff).toBe(-0.18)
  })

  it('알 수 없는 유종코드 → 스킵', () => {
    const fixture = {
      RESULT: { OIL: [{ TRADE_DT: '20260612', PRODCD: 'UNKNOWN', PRODNM: '미지', PRICE: '1000', DIFF: '0' }] },
    }
    const rows = parseAvgPriceResponse(fixture)
    expect(rows).toHaveLength(0)
  })

  it('빈 OIL 배열 → 빈 배열 반환', () => {
    expect(parseAvgPriceResponse({ RESULT: { OIL: [] } })).toHaveLength(0)
  })
})
