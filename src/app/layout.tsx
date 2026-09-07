import type { Metadata } from "next";
import Link from "next/link";
import { Big_Shoulders, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { inspectionGradient } from "@/lib/ui";
import "./globals.css";

const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-big-shoulders",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "QC Dashboard - Galvanizing (ASTM A123)",
  description:
    "Dashboard QC pengecekan ketebalan lapisan galvanis sesuai ASTM A123",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${bigShoulders.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
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
            </div>
          </nav>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
