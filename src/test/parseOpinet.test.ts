import { describe, expect, it } from "vitest";
import { parseOpinetStation } from "../lib/parseOpinet.ts";
import type { OpinetRaw } from "../lib/parseOpinet.ts";

const baseRaw: OpinetRaw = {
  UNI_ID: "A0000001",
  OS_NM: "테스트주유소",
  NEW_ADR: "서울시 중구 태평로 1",
  POLL_DIV_CD: "SKE",
  GIS_X_COOR: "198000",
  GIS_Y_COOR: "552000",
  PRICE: "1650",
};

describe("parseOpinetStation", () => {
  it("정상 응답 파싱 — 필드 매핑 및 좌표 변환", () => {
    const result = parseOpinetStation(baseRaw, "B027");
    expect(result).not.toBeNull();
    expect(result!.id).toBe("A0000001");
    expect(result!.name).toBe("테스트주유소");
    expect(result!.brand).toBe("SK에너지");
    expect(result!.address).toBe("서울시 중구 태평로 1");
    expect(result!.fuelType).toBe("gasoline");
    expect(result!.price).toBe(1650);
    expect(result!.isSelf).toBe(false);
    expect(result!.lat).not.toBeNull();
    expect(result!.lng).not.toBeNull();
    // 서울 범위 좌표 확인
    expect(result!.lat!).toBeGreaterThan(36);
    expect(result!.lat!).toBeLessThan(39);
  });

  it("price 0 → null 반환 (fix.md #7)", () => {
    const raw: OpinetRaw = { ...baseRaw, PRICE: "0" };
    expect(parseOpinetStation(raw, "B027")).toBeNull();
  });

  it("price 음수 → null 반환", () => {
    const raw: OpinetRaw = { ...baseRaw, PRICE: "-100" };
    expect(parseOpinetStation(raw, "D047")).toBeNull();
  });

  it("좌표 공백 → lat/lng null", () => {
    const raw: OpinetRaw = { ...baseRaw, GIS_X_COOR: "", GIS_Y_COOR: "" };
    const result = parseOpinetStation(raw, "D047");
    expect(result).not.toBeNull();
    expect(result!.lat).toBeNull();
    expect(result!.lng).toBeNull();
    expect(result!.fuelType).toBe("diesel");
  });

  it("알 수 없는 브랜드 코드 → 원본 코드 그대로 사용", () => {
    const raw: OpinetRaw = { ...baseRaw, POLL_DIV_CD: "XYZ" };
    const result = parseOpinetStation(raw, "B027");
    expect(result!.brand).toBe("XYZ");
  });

  it("유종 매핑 전체 확인 (fix.md #8)", () => {
    const cases: [string, string][] = [
      ["B027", "gasoline"],
      ["D047", "diesel"],
      ["B034", "premium"],
      ["C004", "kerosene"],
      ["K015", "lpg"],
    ];
    for (const [code, expected] of cases) {
      const result = parseOpinetStation(baseRaw, code);
      expect(result!.fuelType).toBe(expected);
    }
  });
});
