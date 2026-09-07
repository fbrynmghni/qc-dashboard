import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  MATERIAL_CATEGORY_LABELS,
  type MaterialCategory,
} from "@/lib/astm-a123";
import { PassFailBadge } from "@/components/pass-fail-badge";
import { MeasurementTable } from "@/components/measurement-table";
import { ThresholdGauge } from "@/components/threshold-gauge";
import { DeleteInspectionButton } from "@/components/delete-inspection-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  );
}

export default async function InspectionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const inspection = await prisma.inspection.findUnique({ where: { id } });

  if (!inspection) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/inspections" className="text-sm text-blueprint hover:underline">
        &larr; Kembali ke Riwayat
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-ink">
          Detail Pengecekan QC
        </h1>
        <div className="flex items-center gap-3">
          <PassFailBadge result={inspection.result} size="lg" />
          <a
            href={`/api/inspections/${inspection.id}/pdf`}
            className="inline-flex items-center gap-1.5 rounded-md border border-blueprint px-3 py-1.5 text-sm font-medium text-blueprint hover:bg-blueprint hover:text-white"
          >
            Unduh PDF
          </a>
          <Link
            href={`/inspections/${inspection.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-steel px-3 py-1.5 text-sm font-medium text-ink hover:bg-paper"
          >
            Edit
          </Link>
          <DeleteInspectionButton
            id={inspection.id}
            className="inline-flex items-center gap-1.5 rounded-md border border-stamp-red px-3 py-1.5 text-sm font-medium text-stamp-red hover:bg-stamp-red hover:text-white"
          />
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 rounded-md border border-steel bg-white p-4 sm:grid-cols-3">
        <InfoRow label="Nama Perusahaan" value={inspection.companyName} />
        <InfoRow label="Nama Material" value={inspection.materialName} />
        <InfoRow label="SPK" value={inspection.spk} />
        <InfoRow
          label="Deskripsi Material"
          value={inspection.materialDescription}
        />
        <InfoRow
          label="Kuantitas Material"
          value={`${inspection.quantityValue}`}
        />
        <InfoRow
          label="Tebal Material"
          value={`${inspection.steelThicknessMm} mm`}
        />
        <InfoRow
          label="Kategori Material"
          value={
            MATERIAL_CATEGORY_LABELS[
              inspection.materialCategory as MaterialCategory
            ]
          }
        />
        <InfoRow
          label="Tanggal Pengecekan"
          value={inspection.inspectionDate.toLocaleDateString("id-ID")}
        />
      </dl>

      <div className="mt-6">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink">
          Titik Pengecekan Ketebalan Lapisan (<span className="normal-case">µm</span>)
        </h2>
        <div className="mt-2 overflow-x-auto">
          <MeasurementTable
            renderCell={(name) => {
              const value = inspection[
                name as keyof typeof inspection
              ] as number;
              return (
                <div className="w-20 rounded-md border border-steel bg-paper px-2 py-1 text-center font-mono text-ink">
                  {value}
                </div>
              );
            }}
          />
        </div>
      </div>

      <div className="mt-6 rounded-md border border-steel bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-4 font-mono text-sm text-ink">
          <span>
            Rata-rata: <strong>{inspection.averageThicknessUm.toFixed(2)} µm</strong>
          </span>
          <span>
            Minimum standar:{" "}
            <strong>
              {inspection.minimumRequiredUm !== null
                ? `${inspection.minimumRequiredUm} µm`
                : "Tidak ada standar untuk kombinasi kategori/tebal ini"}
            </strong>
          </span>
        </div>
        <ThresholdGauge
          averageUm={inspection.averageThicknessUm}
          minimumUm={inspection.minimumRequiredUm}
        />
      </div>
    </div>
  );
}
