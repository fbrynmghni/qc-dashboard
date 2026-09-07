import Link from "next/link";
import type { Inspection } from "@/generated/prisma/client";
import { MATERIAL_CATEGORY_LABELS, type MaterialCategory } from "@/lib/astm-a123";
import { PassFailBadge } from "./pass-fail-badge";
import { DeleteInspectionButton } from "./delete-inspection-button";

export function InspectionsTable({
  inspections,
}: {
  inspections: Inspection[];
}) {
  if (inspections.length === 0) {
    return (
      <p className="mt-6 text-sm text-slate">
        Belum ada data pengecekan yang cocok dengan filter ini.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-md border border-steel bg-white">
      <table className="min-w-full divide-y divide-steel text-sm">
        <thead>
          <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate">
            <th className="py-2 pl-4 pr-4">Tanggal</th>
            <th className="py-2 pr-4">Perusahaan</th>
            <th className="py-2 pr-4">Material</th>
            <th className="py-2 pr-4">SPK</th>
            <th className="py-2 pr-4">Kategori</th>
            <th className="py-2 pr-4">
              Rata-rata (<span className="normal-case">µm</span>)
            </th>
            <th className="py-2 pr-4">
              Minimum (<span className="normal-case">µm</span>)
            </th>
            <th className="py-2 pr-4">Hasil</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-steel">
          {inspections.map((inspection) => (
            <tr key={inspection.id}>
              <td className="py-2 pl-4 pr-4 whitespace-nowrap font-mono text-xs text-slate">
                {inspection.inspectionDate.toLocaleDateString("id-ID")}
              </td>
              <td className="py-2 pr-4 text-ink">{inspection.companyName}</td>
              <td className="py-2 pr-4 text-ink">{inspection.materialName}</td>
              <td className="py-2 pr-4 font-mono text-ink">{inspection.spk}</td>
              <td className="py-2 pr-4 text-ink">
                {
                  MATERIAL_CATEGORY_LABELS[
                    inspection.materialCategory as MaterialCategory
                  ]
                }
              </td>
              <td className="py-2 pr-4 font-mono text-ink">
                {inspection.averageThicknessUm.toFixed(2)}
              </td>
              <td className="py-2 pr-4 font-mono text-ink">
                {inspection.minimumRequiredUm ?? "-"}
              </td>
              <td className="py-2 pr-4">
                <PassFailBadge result={inspection.result} />
              </td>
              <td className="py-2 pr-4 whitespace-nowrap">
                <Link
                  href={`/inspections/${inspection.id}`}
                  className="font-medium text-blueprint hover:underline"
                >
                  Detail
                </Link>
                <span className="mx-2 text-steel">|</span>
                <Link
                  href={`/inspections/${inspection.id}/edit`}
                  className="font-medium text-blueprint hover:underline"
                >
                  Edit
                </Link>
                <span className="mx-2 text-steel">|</span>
                <a
                  href={`/api/inspections/${inspection.id}/pdf`}
                  title="Unduh PDF"
                  aria-label="Unduh PDF"
                  className="text-base hover:opacity-70"
                >
                  📄
                </a>
                <span className="mx-2 text-steel">|</span>
                <DeleteInspectionButton
                  id={inspection.id}
                  label="🗑️"
                  title="Hapus"
                  className="text-base hover:opacity-70"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
