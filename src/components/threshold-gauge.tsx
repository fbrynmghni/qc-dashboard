/**
 * Visualizes where the measured average sits relative to the ASTM minimum:
 * red zone below the threshold, blue zone at/above it — the same red-to-blue
 * spectrum a pass/fail decision moves across, made literal as a bar.
 */
export function ThresholdGauge({
  averageUm,
  minimumUm,
}: {
  averageUm: number;
  minimumUm: number | null;
}) {
  if (minimumUm === null) {
    return (
      <div className="mt-3">
        <div className="h-3 rounded-full bg-steel" />
        <p className="mt-1.5 text-xs text-slate">
          Tidak ada standar ASTM untuk kombinasi kategori dan tebal ini —
          rata-rata dicatat sebagai referensi saja.
        </p>
      </div>
    );
  }

  const domainMax = Math.max(minimumUm, averageUm, 1) * 1.35;
  const minPct = Math.min((minimumUm / domainMax) * 100, 100);
  const avgPct = Math.min((averageUm / domainMax) * 100, 100);
  const band = 3;

  return (
    <div className="mt-3">
      <div
        className="relative h-3 rounded-full"
        style={{
          background: `linear-gradient(to right,
            var(--color-stamp-red) 0%,
            var(--color-stamp-red) ${Math.max(minPct - band, 0)}%,
            var(--color-blueprint) ${Math.min(minPct + band, 100)}%,
            var(--color-blueprint) 100%)`,
        }}
      >
        <div
          className="absolute top-0 h-3 w-px bg-ink/60"
          style={{ left: `${minPct}%` }}
          aria-hidden
        />
        <div
          className="absolute -top-1.5 h-6 w-1.5 -translate-x-1/2 rounded-full border-2 border-ink bg-white"
          style={{ left: `${avgPct}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[11px] text-slate">
        <span>0 µm</span>
        <span>Min {minimumUm} µm</span>
        <span>{domainMax.toFixed(0)} µm</span>
      </div>
    </div>
  );
}
