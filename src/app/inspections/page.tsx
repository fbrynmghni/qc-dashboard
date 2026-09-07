import Link from "next/link";
import { prisma } from "@/lib/db";
import { FiltersBar } from "@/components/filters-bar";
import { InspectionsTable } from "@/components/inspections-table";
import { gradientButtonClass, gradientButtonStyle } from "@/lib/ui";
import type { Prisma } from "@/generated/prisma/client";

const VALID_RESULTS = new Set(["PASS", "FAIL", "NO_STANDARD"]);

interface PageProps {
  searchParams: Promise<{
    company?: string;
    material?: string;
    spk?: string;
    result?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function InspectionsPage({ searchParams }: PageProps) {
  const filters = await searchParams;

  const where: Prisma.InspectionWhereInput = {};
  if (filters.company) where.companyName = { contains: filters.company };
  if (filters.material) where.materialName = { contains: filters.material };
  if (filters.spk) where.spk = { contains: filters.spk };
  if (filters.result && VALID_RESULTS.has(filters.result)) {
    where.result = filters.result as Prisma.InspectionWhereInput["result"];
  }
  if (filters.from || filters.to) {
    where.inspectionDate = {
      ...(filters.from ? { gte: new Date(`${filters.from}T00:00:00.000Z`) } : {}),
      ...(filters.to ? { lte: new Date(`${filters.to}T23:59:59.999Z`) } : {}),
    };
  }

  const inspections = await prisma.inspection.findMany({
    where,
    orderBy: [{ inspectionDate: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate">
            Riwayat
          </p>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-ink">
            Pengecekan QC
          </h1>
          <p className="mt-1 text-sm text-slate">
            {inspections.length} hasil pengecekan.
          </p>
        </div>
        <Link
          href="/inspections/new"
          className={gradientButtonClass}
          style={gradientButtonStyle}
        >
          + Pengecekan Baru
        </Link>
      </div>

      <div className="mt-6">
        <FiltersBar filters={filters} />
      </div>

      <InspectionsTable inspections={inspections} />
    </div>
  );
}
