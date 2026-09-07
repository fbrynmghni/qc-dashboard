import { z } from "zod";
import { MATERIAL_CATEGORIES } from "./astm-a123";

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} wajib diisi`);

// Coercing an empty string with z.coerce.number() silently yields 0, which
// would pass a plain .min(0) check. Require non-empty input first.
const requiredNonNegativeNumber = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} wajib diisi`)
    .refine((val) => !Number.isNaN(Number(val)), "Harus berupa angka")
    .transform((val) => Number(val))
    .refine((val) => val >= 0, "Tidak boleh negatif");

const measurement = requiredNonNegativeNumber("Titik pengecekan");

export const inspectionSchema = z.object({
  companyName: requiredText("Nama Perusahaan"),
  materialName: requiredText("Nama Material"),
  spk: requiredText("SPK"),
  materialDescription: requiredText("Deskripsi Material"),
  inspectionDate: z
    .string()
    .trim()
    .min(1, "Tanggal Pengecekan wajib diisi")
    .refine((val) => !Number.isNaN(Date.parse(val)), "Tanggal tidak valid")
    .transform((val) => new Date(val)),
  quantityValue: z.coerce
    .number({ error: "Harus berupa angka" })
    .positive("Harus lebih besar dari 0"),
  steelThicknessMm: requiredNonNegativeNumber("Tebal Material"),
  materialCategory: z.enum(MATERIAL_CATEGORIES, {
    error: "Pilih kategori material",
  }),
  r1c1: measurement,
  r1c2: measurement,
  r1c3: measurement,
  r1c4: measurement,
  r1c5: measurement,
  r1c6: measurement,
  r2c1: measurement,
  r2c2: measurement,
  r2c3: measurement,
  r2c4: measurement,
  r2c5: measurement,
  r2c6: measurement,
  r3c1: measurement,
  r3c2: measurement,
  r3c3: measurement,
  r3c4: measurement,
  r3c5: measurement,
  r3c6: measurement,
});

export type InspectionInput = z.infer<typeof inspectionSchema>;

export function parseInspectionFormData(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return inspectionSchema.safeParse(raw);
}
