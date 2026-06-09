import { describe, expect, it } from "vitest";
import { katecToWgs84 } from "../lib/coord.ts";

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
