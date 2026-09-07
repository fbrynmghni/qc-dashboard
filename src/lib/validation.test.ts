import { describe, expect, it } from "vitest";
import { MEASUREMENT_FIELD_NAMES } from "./astm-a123";
import { inspectionSchema } from "./validation";

function validFormObject(overrides: Record<string, string> = {}) {
  const measurements = Object.fromEntries(
    MEASUREMENT_FIELD_NAMES.map((name) => [name, "80"])
  );
  return {
    companyName: "PT Contoh",
    materialName: "Besi Siku",
    spk: "SPK-001",
    materialDescription: "Structural angle bar",
    inspectionDate: "2026-01-15",
    quantityValue: "10",
    steelThicknessMm: "5",
    materialCategory: "PLATE",
    ...measurements,
    ...overrides,
  };
}

describe("inspectionSchema", () => {
  it("accepts a fully valid record and coerces numeric fields", () => {
    const result = inspectionSchema.safeParse(validFormObject());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantityValue).toBe(10);
      expect(result.data.steelThicknessMm).toBe(5);
      expect(result.data.r1c1).toBe(80);
      expect(result.data.inspectionDate).toBeInstanceOf(Date);
      expect(result.data.inspectionDate.toISOString().slice(0, 10)).toBe(
        "2026-01-15"
      );
    }
  });

  it("rejects a blank inspection date", () => {
    const result = inspectionSchema.safeParse(
      validFormObject({ inspectionDate: "" })
    );
    expect(result.success).toBe(false);
  });

  it("rejects an unparseable inspection date", () => {
    const result = inspectionSchema.safeParse(
      validFormObject({ inspectionDate: "not-a-date" })
    );
    expect(result.success).toBe(false);
  });

  it("rejects an empty required text field", () => {
    const result = inspectionSchema.safeParse(
      validFormObject({ companyName: "" })
    );
    expect(result.success).toBe(false);
  });

  it("rejects a non-positive quantity", () => {
    const result = inspectionSchema.safeParse(
      validFormObject({ quantityValue: "0" })
    );
    expect(result.success).toBe(false);
  });

  it("rejects a negative measurement", () => {
    const result = inspectionSchema.safeParse(
      validFormObject({ r2c3: "-1" })
    );
    expect(result.success).toBe(false);
  });

  it("rejects an invalid material category", () => {
    const result = inspectionSchema.safeParse(
      validFormObject({ materialCategory: "NOT_REAL" })
    );
    expect(result.success).toBe(false);
  });

  it("rejects a blank measurement instead of silently coercing it to 0", () => {
    const result = inspectionSchema.safeParse(
      validFormObject({ r1c1: "" })
    );
    expect(result.success).toBe(false);
  });

  it("rejects a blank steel thickness instead of silently coercing it to 0", () => {
    const result = inspectionSchema.safeParse(
      validFormObject({ steelThicknessMm: "" })
    );
    expect(result.success).toBe(false);
  });

  it("rejects a non-numeric measurement", () => {
    const result = inspectionSchema.safeParse(
      validFormObject({ r3c4: "abc" })
    );
    expect(result.success).toBe(false);
  });
});
