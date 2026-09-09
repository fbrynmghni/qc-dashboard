import { InspectionForm } from "@/components/inspection-form";

export default function NewInspectionPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate">
        ASTM A123 &middot; Table 1
      </p>
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-ink">
        Pengecekan QC Baru
      </h1>
      <p className="mt-1 text-sm text-slate">
        Isi data material dan hasil pengecekan ketebalan lapisan galvanis
        sesuai ASTM A123.
      </p>
      <div className="mt-6">
        <InspectionForm />
      </div>
    </div>
  );
}
