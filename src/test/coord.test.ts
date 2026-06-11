import { describe, expect, it } from "vitest";
import { katecToWgs84, wgs84ToKatec } from "../lib/coord.ts";

describe("katecToWgs84", () => {
  it("TM 원점(400000, 600000) → WGS84 약 38°N 128°E", () => {
    // KATEC TM 원점은 38°N, 128°E에 대응. Tokyo→WGS84 datum shift는 ~0.002° 이하
    const { lat, lng } = katecToWgs84(400000, 600000);
    expect(lat).toBeCloseTo(38.0, 1);
    expect(lng).toBeCloseTo(128.0, 1);
  });

  it("서울 범위 좌표(약 198000, 552000) → WGS84 서울 위도경도 범위", () => {
    // 서울 근방 KATEC 좌표 → 위도 36-39°N, 경도 125-129°E
    const { lat, lng } = katecToWgs84(198000, 552000);
    expect(lat).toBeGreaterThan(36);
    expect(lat).toBeLessThan(39);
    expect(lng).toBeGreaterThan(125);
    expect(lng).toBeLessThan(129);
  });

  it("제주 범위 좌표(약 140000, 150000) → WGS84 제주 위도경도 범위", () => {
    // 제주도 근방 KATEC 좌표 → 위도 33-35°N, 경도 126-127°E
    const { lat, lng } = katecToWgs84(140000, 150000);
    expect(lat).toBeGreaterThan(33);
    expect(lat).toBeLessThan(35);
    expect(lng).toBeGreaterThan(125);
    expect(lng).toBeLessThan(128);
  });
});

describe("wgs84ToKatec", () => {
  function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  it("서울(37.5665, 126.978) 왕복 오차 5m 이하", () => {
    const { x, y } = wgs84ToKatec(37.5665, 126.978);
    const { lat, lng } = katecToWgs84(x, y);
    expect(haversineM(37.5665, 126.978, lat, lng)).toBeLessThan(5);
  });

  it("부산(35.1796, 129.0756) 왕복 오차 5m 이하", () => {
    const { x, y } = wgs84ToKatec(35.1796, 129.0756);
    const { lat, lng } = katecToWgs84(x, y);
    expect(haversineM(35.1796, 129.0756, lat, lng)).toBeLessThan(5);
  });

  it("제주(33.4996, 126.5312) 왕복 오차 5m 이하", () => {
    const { x, y } = wgs84ToKatec(33.4996, 126.5312);
    const { lat, lng } = katecToWgs84(x, y);
    expect(haversineM(33.4996, 126.5312, lat, lng)).toBeLessThan(5);
  });

  it("서울 변환 결과가 KATEC 유효 범위(양수 정수) 내에 있음", () => {
    const { x, y } = wgs84ToKatec(37.5665, 126.978);
    expect(x).toBeGreaterThan(0);
    expect(y).toBeGreaterThan(0);
    expect(x).toBeLessThan(1000000);
    expect(y).toBeLessThan(1000000);
  });
});
