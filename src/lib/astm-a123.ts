export type MaterialCategory =
  | "STRUCTURAL_SHAPES"
  | "STRIP_AND_BAR"
  | "PLATE"
  | "PIPE_AND_TUBING"
  | "WIRE"
  | "REINFORCING_BAR"
  | "FORGINGS_AND_CASTINGS";

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  STRUCTURAL_SHAPES: "Structural Shapes",
  STRIP_AND_BAR: "Strip and Bar",
  PLATE: "Plate",
  PIPE_AND_TUBING: "Pipe & Tubing",
  WIRE: "Wire",
  REINFORCING_BAR: "Reinforcing Bar",
  FORGINGS_AND_CASTINGS: "Forgings and Castings",
};

export const MATERIAL_CATEGORIES = Object.keys(
  MATERIAL_CATEGORY_LABELS
) as MaterialCategory[];

export const MEASUREMENT_ROWS = 3;
export const MEASUREMENT_COLS = 6;
export const MEASUREMENT_COUNT = MEASUREMENT_ROWS * MEASUREMENT_COLS;

// Field name for a given (1-indexed) row/column, e.g. "r1c1" .. "r3c6".
export function measurementFieldName(row: number, col: number): string {
  return `r${row}c${col}`;
}

// All 18 field names in row-major order, matching the Prisma model's columns.
export const MEASUREMENT_FIELD_NAMES: string[] = Array.from(
  { length: MEASUREMENT_ROWS },
  (_, rowIndex) =>
    Array.from({ length: MEASUREMENT_COLS }, (_, colIndex) =>
      measurementFieldName(rowIndex + 1, colIndex + 1)
    )
).flat();

// Steel thickness bins in mm: [min, maxExclusive). The last bin is unbounded above.
// Exported so callers that render the full Table 1 (e.g. the PDF report) can
// lay out the same column boundaries without redefining them.
export const THICKNESS_BINS: { min: number; max: number }[] = [
  { min: 0, max: 1.6 },
  { min: 1.6, max: 3.2 },
  { min: 3.2, max: 4.8 },
  { min: 4.8, max: 6.4 },
  { min: 6.4, max: 16.0 },
  { min: 16.0, max: Infinity },
];

// ASTM A123 Table 1 — Minimum Average Coating Thickness Grade (µm) by
// Material Category and steel thickness bin. `null` = "--" (no requirement defined).
export const TABLE_1: Record<MaterialCategory, (number | null)[]> = {
  STRUCTURAL_SHAPES: [45, 65, 75, 75, 100, 100],
  STRIP_AND_BAR: [45, 65, 75, 75, 75, 100],
  PLATE: [45, 65, 75, 75, 75, 100],
  PIPE_AND_TUBING: [45, 45, 75, 75, 75, 75],
  WIRE: [35, 50, 60, 65, 80, 80],
  REINFORCING_BAR: [null, null, null, null, 100, 100],
  FORGINGS_AND_CASTINGS: [null, null, null, 100, 100, 100],
};

export function findThicknessBinIndex(steelThicknessMm: number): number {
  const index = THICKNESS_BINS.findIndex(
    (bin) => steelThicknessMm >= bin.min && steelThicknessMm < bin.max
  );
  if (index === -1) {
    throw new Error(
      `steelThicknessMm must be a non-negative number, got ${steelThicknessMm}`
    );
  }
  return index;
}

/**
 * Looks up the minimum required average coating thickness (µm) from ASTM A123
 * Table 1. Returns null when the category/thickness combination has no
 * defined minimum (the "--" cells in the standard).
 */
export function getMinimumRequiredCoatingUm(
  category: MaterialCategory,
  steelThicknessMm: number
): number | null {
  const binIndex = findThicknessBinIndex(steelThicknessMm);
  return TABLE_1[category][binIndex];
}

export function computeAverageUm(measurements: number[]): number {
  if (measurements.length !== MEASUREMENT_COUNT) {
    throw new Error(
      `Expected exactly ${MEASUREMENT_COUNT} measurements, got ${measurements.length}`
    );
  }
  const sum = measurements.reduce((total, value) => total + value, 0);
  return sum / MEASUREMENT_COUNT;
}

export type EvaluationResult = "PASS" | "FAIL" | "NO_STANDARD";

export interface InspectionEvaluation {
  averageUm: number;
  minimumRequiredUm: number | null;
  result: EvaluationResult;
}

export function evaluateInspection(
  category: MaterialCategory,
  steelThicknessMm: number,
  measurements: number[]
): InspectionEvaluation {
  const averageUm = computeAverageUm(measurements);
  const minimumRequiredUm = getMinimumRequiredCoatingUm(
    category,
    steelThicknessMm
  );

  const result: EvaluationResult =
    minimumRequiredUm === null
      ? "NO_STANDARD"
      : averageUm >= minimumRequiredUm
        ? "PASS"
        : "FAIL";

  return { averageUm, minimumRequiredUm, result };
}
