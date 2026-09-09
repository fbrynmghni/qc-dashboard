"use client";

import { deleteInspection } from "@/app/(app)/inspections/actions";

export function DeleteInspectionButton({
  id,
  className,
  label = "Hapus",
  title,
}: {
  id: string;
  className?: string;
  label?: string;
  title?: string;
}) {
  return (
    <form
      action={deleteInspection.bind(null, id)}
      onSubmit={(event) => {
        if (
          !confirm(
            "Hapus data pengecekan ini? Tindakan ini tidak bisa dibatalkan."
          )
        ) {
          event.preventDefault();
        }
      }}
      className="inline"
    >
      <button
        type="submit"
        title={title}
        aria-label={title ?? label}
        className={className ?? "font-medium text-stamp-red hover:underline"}
      >
        {label}
      </button>
    </form>
  );
}
