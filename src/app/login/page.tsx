import type { Metadata } from "next";
import { FilePdfIcon, RulerIcon, ShieldCheckIcon } from "@phosphor-icons/react/ssr";
import { LoginForm } from "@/components/login-form";
import { inspectionGradient } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Masuk - QC Mini ERP",
  description: "Masuk untuk mengakses QC Mini ERP, sistem inspeksi ketebalan lapisan galvanis ASTM A123.",
};

const highlights = [
  {
    icon: RulerIcon,
    label: "18 titik ukur per spesimen dicatat dan dirata-rata otomatis.",
  },
  {
    icon: ShieldCheckIcon,
    label: "Hasil dicocokkan langsung dengan ASTM A123 Table 1.",
  },
  {
    icon: FilePdfIcon,
    label: "Setiap inspeksi bisa diunduh sebagai laporan PDF satu halaman.",
  },
];

export default function LoginPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-steel bg-surface shadow-[0_40px_90px_-45px_rgba(27,58,107,0.45)] lg:grid-cols-[1.05fr_1fr]">
        <div
          className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-10"
          style={{ backgroundImage: inspectionGradient }}
        >
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden
          />

          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded border-2 border-white/60 font-display text-xl font-extrabold text-white">
              QC
            </span>
            <div className="leading-tight text-white">
              <p className="font-display text-xl font-bold tracking-wide">
                QC Mini ERP
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                ASTM A123 &middot; Galvanizing
              </p>
            </div>
          </div>

          <div className="relative max-w-sm">
            <h1 className="font-display text-3xl leading-[1.15] font-bold text-white">
              Kontrol mutu galvanis, satu dashboard.
            </h1>
            <p className="mt-3 text-sm text-white/80">
              Catat, evaluasi, dan arsipkan setiap pengecekan ketebalan
              lapisan tanpa kalkulasi manual.
            </p>

            <ul className="mt-7 flex flex-col gap-4">
              {highlights.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border border-white/30 bg-white/10">
                    <Icon weight="bold" className="h-3.5 w-3.5 text-white" />
                  </span>
                  <span className="text-sm text-white/85">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs text-white/60">
            Sistem internal untuk tim quality control lapangan.
          </p>
        </div>

        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span
              className="flex h-10 w-10 items-center justify-center rounded font-display text-lg font-extrabold text-white"
              style={{ backgroundImage: inspectionGradient }}
            >
              QC
            </span>
            <p className="font-display text-lg font-bold tracking-wide text-ink">
              QC Mini ERP
            </p>
          </div>

          <h2 className="font-display text-2xl font-bold text-ink">
            Masuk ke akun Anda
          </h2>
          <p className="mt-1 text-sm text-slate">
            Gunakan email dan kata sandi tim untuk mengakses dashboard
            inspeksi.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
