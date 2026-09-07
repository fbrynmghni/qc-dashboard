import type { EvaluationResult } from "@/lib/astm-a123";

const STAMP: Record<EvaluationResult, { label: string; className: string }> = {
  PASS: { label: "Lulus", className: "border-blueprint text-blueprint" },
  FAIL: { label: "Tidak Lulus", className: "border-stamp-red text-stamp-red" },
  NO_STANDARD: { label: "Tanpa Standar", className: "border-slate text-slate" },
};

/**
 * Styled like a rubber ink stamp — blue for an approval stamp, red for a
 * rejection stamp, matching how a QC tag would actually be marked.
 * `lg` is reserved for the one hero instance per page (detail view, live
 * preview); table rows use the quiet default so repetition stays legible.
 */
export function PassFailBadge({
  result,
  size = "sm",
}: {
  result: EvaluationResult;
  size?: "sm" | "lg";
}) {
  const stamp = STAMP[result];

  if (size === "lg") {
    return (
      <div
        className={`inline-flex -rotate-2 items-center rounded-md border-[3px] px-4 py-1.5 font-display text-xl font-extrabold uppercase tracking-widest ring-1 ring-inset ring-current ring-offset-2 ring-offset-white ${stamp.className}`}
      >
        {stamp.label}
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-wider ${stamp.className}`}
    >
      {stamp.label}
    </span>
  );
}
