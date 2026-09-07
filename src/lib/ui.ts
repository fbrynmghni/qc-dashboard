// Shared "inspection gradient" styling for primary actions and the nav band —
// red (reject) to blue (approve), the same spectrum a QC stamp sits between.
export const inspectionGradient =
  "linear-gradient(120deg, var(--color-stamp-red) 0%, var(--color-blueprint) 100%)";

export const gradientButtonClass =
  "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100";

export const gradientButtonStyle = { backgroundImage: inspectionGradient };
