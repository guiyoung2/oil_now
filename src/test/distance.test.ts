import { describe, it, expect } from 'vitest'
import { haversineMeters } from '../lib/distance'

describe('haversineMeters', () => {
  it('같은 위치는 0m', () => {
    expect(haversineMeters(37.5665, 126.978, 37.5665, 126.978)).toBe(0)
  })

  it('서울 → 약 1km 이동', () => {
    // 위도 0.009도 ≈ 1000m
    const dist = haversineMeters(37.5665, 126.978, 37.5755, 126.978)
    expect(dist).toBeGreaterThan(900)
    expect(dist).toBeLessThan(1100)
  })

  it('2km 초과 지점 감지', () => {
    // 위도 0.018도 ≈ 2000m
    const dist = haversineMeters(37.5665, 126.978, 37.5845, 126.978)
    expect(dist).toBeGreaterThan(2000)
  })
})
