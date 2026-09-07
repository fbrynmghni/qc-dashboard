import { MeasurementTable } from "./measurement-table";

interface MeasurementGridProps {
  values: Record<string, string>;
  errors?: Record<string, string[]>;
  onChange: (name: string, value: string) => void;
}

export function MeasurementGrid({
  values,
  errors,
  onChange,
}: MeasurementGridProps) {
  return (
    <div className="overflow-x-auto">
      <MeasurementTable
        renderCell={(name, row, col) => {
          const fieldErrors = errors?.[name];
          return (
            <input
              type="number"
              step="any"
              min={0}
              inputMode="decimal"
              name={name}
              value={values[name] ?? ""}
              onChange={(e) => onChange(name, e.target.value)}
              className={`w-20 rounded-md border bg-white px-2 py-1 font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-blueprint ${
                fieldErrors ? "border-stamp-red" : "border-steel"
              }`}
              aria-label={`Ketebalan pada spesimen ${row}, titik ${col} (µm)`}
            />
          );
        }}
      />
      <p className="mt-1 text-xs text-slate">
        Satuan: mikrometer (µm). Total 18 titik pengecekan (3 spesimen x 6
        titik).
      </p>
    </div>
  );
}
