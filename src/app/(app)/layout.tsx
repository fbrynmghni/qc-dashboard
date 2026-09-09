import Link from "next/link";
import { SignOutIcon } from "@phosphor-icons/react/ssr";
import { inspectionGradient } from "@/lib/ui";
import { getCurrentUser } from "@/lib/auth/current-user";
import { logout } from "@/app/login/actions";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <>
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: inspectionGradient }}
          aria-hidden
        />
        <nav className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded border-2 border-white/60 font-display text-lg font-extrabold">
              QC
            </span>
            <div className="leading-tight">
              <p className="font-display text-lg font-bold uppercase tracking-wide">
                Dashboard Inspeksi
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                ASTM A123 &middot; Galvanizing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-sm font-medium">
            <Link href="/inspections" className="hover:text-white/80">
              Riwayat
            </Link>
            <Link
              href="/inspections/new"
              className="rounded border border-white/70 px-3 py-1.5 hover:bg-white/10"
            >
              + Pengecekan Baru
            </Link>
            {user && (
              <div className="flex items-center gap-3 border-l border-white/30 pl-5">
                <span className="text-white/80">{user.name}</span>
                <form action={logout}>
                  <button
                    type="submit"
                    aria-label="Keluar"
                    className="flex items-center gap-1.5 hover:text-white/80"
                  >
                    <SignOutIcon weight="bold" className="h-4 w-4" />
                    Keluar
                  </button>
                </form>
              </div>
            )}
          </div>
        </nav>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
