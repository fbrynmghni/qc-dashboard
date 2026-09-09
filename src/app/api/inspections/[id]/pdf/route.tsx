import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/db";
import { MEASUREMENT_FIELD_NAMES, type MaterialCategory } from "@/lib/astm-a123";
import { QcReportDocument, type QcReportData } from "@/lib/pdf/qc-report-document";
import { getCurrentUser } from "@/lib/auth/current-user";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const inspection = await prisma.inspection.findUnique({ where: { id } });

  if (!inspection) {
    return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
  }

  const measurements = MEASUREMENT_FIELD_NAMES.map(
    (name) => inspection[name as keyof typeof inspection] as number
  );

  const data: QcReportData = {
    companyName: inspection.companyName,
    materialName: inspection.materialName,
    spk: inspection.spk,
    materialDescription: inspection.materialDescription,
    inspectionDate: inspection.inspectionDate,
    quantityValue: inspection.quantityValue,
    steelThicknessMm: inspection.steelThicknessMm,
    materialCategory: inspection.materialCategory as MaterialCategory,
    measurements,
    averageThicknessUm: inspection.averageThicknessUm,
    minimumRequiredUm: inspection.minimumRequiredUm,
    result: inspection.result,
  };

  const buffer = await renderToBuffer(<QcReportDocument data={data} />);
  const fileName = `QC-${inspection.spk}-${inspection.materialName}.pdf`
    .replace(/[^a-zA-Z0-9._-]+/g, "-");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
