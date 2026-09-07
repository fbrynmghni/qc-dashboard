import { describe, expect, it } from "vitest";
import {
  computeAverageUm,
  evaluateInspection,
  getMinimumRequiredCoatingUm,
  MATERIAL_CATEGORIES,
  MEASUREMENT_COUNT,
  MEASUREMENT_FIELD_NAMES,
  type MaterialCategory,
} from "./astm-a123";

describe("MEASUREMENT_FIELD_NAMES", () => {
  it("lists all 18 fields in row-major order", () => {
    expect(MEASUREMENT_FIELD_NAMES).toEqual([
      "r1c1", "r1c2", "r1c3", "r1c4", "r1c5", "r1c6",
      "r2c1", "r2c2", "r2c3", "r2c4", "r2c5", "r2c6",
      "r3c1", "r3c2", "r3c3", "r3c4", "r3c5", "r3c6",
    ]);
  });
});

// ASTM A123 Table 1 expectations, mirroring the standard exactly.
// Columns correspond to bins: <1.6, [1.6,3.2), [3.2,4.8), [4.8,6.4), [6.4,16.0), >=16.0
const EXPECTED_TABLE_1: Record<MaterialCategory, (number | null)[]> = {
  STRUCTURAL_SHAPES: [45, 65, 75, 75, 100, 100],
  STRIP_AND_BAR: [45, 65, 75, 75, 75, 100],
  PLATE: [45, 65, 75, 75, 75, 100],
  PIPE_AND_TUBING: [45, 45, 75, 75, 75, 75],
  WIRE: [35, 50, 60, 65, 80, 80],
  REINFORCING_BAR: [null, null, null, null, 100, 100],
  FORGINGS_AND_CASTINGS: [null, null, null, 100, 100, 100],
};

// A representative sample thickness (mm) inside each bin, used to exercise
// the lookup at a non-boundary point.
const BIN_SAMPLE_MM = [0.8, 2.4, 4.0, 5.6, 10.0, 20.0];

// The lower boundary of each bin (inclusive) — used to confirm edges land in
// the correct bin per the standard's ">=" / "<" wording.
const BIN_LOWER_BOUNDARY_MM = [0, 1.6, 3.2, 4.8, 6.4, 16.0];

describe("getMinimumRequiredCoatingUm", () => {
  for (const category of MATERIAL_CATEGORIES) {
    describe(category, () => {
      EXPECTED_TABLE_1[category].forEach((expected, binIndex) => {
        it(`returns ${expected} for a representative thickness in bin ${binIndex}`, () => {
          expect(
            getMinimumRequiredCoatingUm(category, BIN_SAMPLE_MM[binIndex])
          ).toBe(expected);
        });

        it(`returns ${expected} at the lower boundary of bin ${binIndex}`, () => {
          expect(
            getMinimumRequiredCoatingUm(
              category,
              BIN_LOWER_BOUNDARY_MM[binIndex]
            )
          ).toBe(expected);
        });
      });
    });
  }

  it("treats a value just below a boundary as belonging to the previous bin", () => {
    // Just under 1.6mm must still fall in the <1.6 bin, not [1.6,3.2).
    expect(getMinimumRequiredCoatingUm("PLATE", 1.5999)).toBe(45);
    expect(getMinimumRequiredCoatingUm("PLATE", 1.6)).toBe(65);
  });

  it("handles arbitrarily large thickness in the unbounded top bin", () => {
    expect(getMinimumRequiredCoatingUm("STRUCTURAL_SHAPES", 1000)).toBe(100);
  });

  it("throws for a negative thickness", () => {
    expect(() => getMinimumRequiredCoatingUm("PLATE", -1)).toThrow();
  });
});

describe("computeAverageUm", () => {
  it("averages exactly 18 measurements", () => {
    const measurements = Array(MEASUREMENT_COUNT).fill(0).map((_, i) => i + 1); // 1..18
    expect(computeAverageUm(measurements)).toBeCloseTo(9.5, 10);
  });

  it("throws when given the wrong number of measurements", () => {
    expect(() => computeAverageUm([1, 2, 3])).toThrow();
  });
});

describe("evaluateInspection", () => {
  const passing = Array(MEASUREMENT_COUNT).fill(80); // average 80
  const failing = Array(MEASUREMENT_COUNT).fill(50); // average 50

  it("returns PASS when the average meets the minimum", () => {
    // PLATE, 5mm -> bin [4.8,6.4) -> minimum 75
    const result = evaluateInspection("PLATE", 5, passing);
    expect(result.minimumRequiredUm).toBe(75);
    expect(result.averageUm).toBe(80);
    expect(result.result).toBe("PASS");
  });

  it("returns PASS when the average exactly equals the minimum", () => {
    const exact = Array(MEASUREMENT_COUNT).fill(75);
    const result = evaluateInspection("PLATE", 5, exact);
    expect(result.result).toBe("PASS");
  });

  it("returns FAIL when the average is below the minimum", () => {
    const result = evaluateInspection("PLATE", 5, failing);
    expect(result.minimumRequiredUm).toBe(75);
    expect(result.averageUm).toBe(50);
    expect(result.result).toBe("FAIL");
  });

  it("returns NO_STANDARD when the category/thickness combination has no defined minimum", () => {
    // REINFORCING_BAR at 2mm falls in a "--" cell.
    const result = evaluateInspection("REINFORCING_BAR", 2, passing);
    expect(result.minimumRequiredUm).toBeNull();
    expect(result.result).toBe("NO_STANDARD");
  });
});
