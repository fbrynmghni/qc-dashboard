"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { evaluateInspection, MEASUREMENT_FIELD_NAMES } from "@/lib/astm-a123";
import { parseInspectionFormData } from "@/lib/validation";

export interface CreateInspectionState {
  error: string | null;
  fieldErrors: Record<string, string[]>;
}

export async function createInspection(
  _prevState: CreateInspectionState,
  formData: FormData
): Promise<CreateInspectionState> {
  const parsed = parseInspectionFormData(formData);

  if (!parsed.success) {
    return {
      error: "Ada input yang belum valid, silakan periksa kembali.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const data = parsed.data;
  const measurements = MEASUREMENT_FIELD_NAMES.map(
    (name) => data[name as keyof typeof data] as number
  );

  const evaluation = evaluateInspection(
    data.materialCategory,
    data.steelThicknessMm,
    measurements
  );

  let inspectionId: string;
  try {
    const inspection = await prisma.inspection.create({
      data: {
        ...data,
        averageThicknessUm: evaluation.averageUm,
        minimumRequiredUm: evaluation.minimumRequiredUm,
        result: evaluation.result,
      },
    });
    inspectionId = inspection.id;
  } catch (err) {
    console.error("Failed to save inspection:", err);
    return {
      error: "Gagal menyimpan data ke database. Silakan coba lagi.",
      fieldErrors: {},
    };
  }

  revalidatePath("/inspections");
  redirect(`/inspections/${inspectionId}`);
}

export async function deleteInspection(id: string) {
  await prisma.inspection.delete({ where: { id } });
  revalidatePath("/inspections");
  redirect("/inspections");
}

export async function updateInspection(
  id: string,
  _prevState: CreateInspectionState,
  formData: FormData
): Promise<CreateInspectionState> {
  const parsed = parseInspectionFormData(formData);

  if (!parsed.success) {
    return {
      error: "Ada input yang belum valid, silakan periksa kembali.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const data = parsed.data;
  const measurements = MEASUREMENT_FIELD_NAMES.map(
    (name) => data[name as keyof typeof data] as number
  );

  const evaluation = evaluateInspection(
    data.materialCategory,
    data.steelThicknessMm,
    measurements
  );

  try {
    await prisma.inspection.update({
      where: { id },
      data: {
        ...data,
        averageThicknessUm: evaluation.averageUm,
        minimumRequiredUm: evaluation.minimumRequiredUm,
        result: evaluation.result,
      },
    });
  } catch (err) {
    console.error("Failed to update inspection:", err);
    return {
      error: "Gagal memperbarui data. Silakan coba lagi.",
      fieldErrors: {},
    };
  }

  revalidatePath("/inspections");
  revalidatePath(`/inspections/${id}`);
  redirect(`/inspections/${id}`);
}
