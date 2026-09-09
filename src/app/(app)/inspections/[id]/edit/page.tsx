import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { MEASUREMENT_FIELD_NAMES } from "@/lib/astm-a123";
import {
  InspectionForm,
  type InspectionFormInitialValues,
} from "@/components/inspection-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInspectionPage({ params }: PageProps) {
  const { id } = await params;
  const inspection = await prisma.inspection.findUnique({ where: { id } });

  if (!inspection) notFound();

  const measurements = Object.fromEntries(
    MEASUREMENT_FIELD_NAMES.map((name) => [
      name,
      String(inspection[name as keyof typeof inspection]),
    ])
  );

  const initialValues: InspectionFormInitialValues = {
    companyName: inspection.companyName,
    materialName: inspection.materialName,
    spk: inspection.spk,
    materialDescription: inspection.materialDescription,
    inspectionDate: inspection.inspectionDate.toISOString().slice(0, 10),
    quantityValue: String(inspection.quantityValue),
    steelThicknessMm: String(inspection.steelThicknessMm),
    materialCategory: inspection.materialCategory,
    measurements,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href={`/inspections/${id}`}
        className="text-sm text-blueprint hover:underline"
      >
        &larr; Kembali ke Detail
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-ink">
        Edit Pengecekan QC
      </h1>
      <p className="mt-1 text-sm text-slate">
        Perbarui data material dan hasil pengecekan ketebalan lapisan
        galvanis.
      </p>
      <div className="mt-6">
        <InspectionForm
          mode="edit"
          inspectionId={id}
          initialValues={initialValues}
        />
      </div>
    </div>
  );
}
