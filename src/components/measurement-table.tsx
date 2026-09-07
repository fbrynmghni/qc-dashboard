import type { ReactNode } from "react";
import {
  MEASUREMENT_COLS,
  MEASUREMENT_ROWS,
  measurementFieldName,
} from "@/lib/astm-a123";

interface MeasurementTableProps {
  renderCell: (name: string, row: number, col: number) => ReactNode;
}

/**
 * Shared row/column skeleton for the 3x6 measurement grid, used both by the
 * interactive input grid and the read-only detail view — keeps the two in
 * sync if the layout ever changes.
 */
export function MeasurementTable({ renderCell }: MeasurementTableProps) {
  const rows = Array.from({ length: MEASUREMENT_ROWS }, (_, i) => i + 1);
  const cols = Array.from({ length: MEASUREMENT_COLS }, (_, i) => i + 1);

  return (
    <table className="min-w-full border-separate border-spacing-1 text-sm">
      <thead>
        <tr>
          <th className="w-24 text-left text-xs font-medium uppercase tracking-wide text-slate">
            Baris \ Titik
          </th>
          {cols.map((col) => (
            <th
              key={col}
              className="text-xs font-medium uppercase tracking-wide text-slate px-1 pb-1"
            >
              Titik {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row}>
            <th className="text-left text-xs font-medium uppercase tracking-wide text-slate pr-2">
              Spesimen {row}
            </th>
            {cols.map((col) => {
              const name = measurementFieldName(row, col);
              return <td key={name}>{renderCell(name, row, col)}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
