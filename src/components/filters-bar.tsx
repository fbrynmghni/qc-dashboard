import Link from "next/link";
import { gradientButtonClass, gradientButtonStyle } from "@/lib/ui";

export interface InspectionFilters {
  company?: string;
  material?: string;
  spk?: string;
  result?: string;
  from?: string;
  to?: string;
}

const fieldInputClass =
  "mt-1 block w-full rounded-md border border-steel bg-white px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-blueprint";

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-slate">
        {label}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        className={fieldInputClass}
      />
    </label>
  );
}

export function FiltersBar({ filters }: { filters: InspectionFilters }) {
  return (
    <form
      method="get"
      className="grid grid-cols-2 gap-3 rounded-md border border-steel bg-white p-4 sm:grid-cols-3 lg:grid-cols-6"
    >
      <Field label="Perusahaan" name="company" defaultValue={filters.company} />
      <Field label="Material" name="material" defaultValue={filters.material} />
      <Field label="SPK" name="spk" defaultValue={filters.spk} />
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-wide text-slate">
          Hasil
        </span>
        <select
          name="result"
          defaultValue={filters.result ?? ""}
          className={fieldInputClass}
        >
          <option value="">Semua</option>
          <option value="PASS">Lulus</option>
          <option value="FAIL">Tidak Lulus</option>
          <option value="NO_STANDARD">Tanpa Standar</option>
        </select>
      </label>
      <Field
        label="Dari Tanggal"
        name="from"
        type="date"
        defaultValue={filters.from}
      />
      <Field label="Sampai Tanggal" name="to" type="date" defaultValue={filters.to} />
      <div className="col-span-2 flex items-end gap-2 sm:col-span-3 lg:col-span-6">
        <button
          type="submit"
          className={gradientButtonClass}
          style={gradientButtonStyle}
        >
          Filter
        </button>
        <Link
          href="/inspections"
          className="rounded-md border border-steel px-3 py-1.5 text-sm font-medium text-ink hover:bg-paper"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
