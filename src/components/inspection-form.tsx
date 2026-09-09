"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  createInspection,
  updateInspection,
  type CreateInspectionState,
} from "@/app/(app)/inspections/actions";
import {
  evaluateInspection,
  MATERIAL_CATEGORIES,
  MATERIAL_CATEGORY_LABELS,
  MEASUREMENT_FIELD_NAMES,
  type MaterialCategory,
} from "@/lib/astm-a123";
import { gradientButtonClass, gradientButtonStyle } from "@/lib/ui";
import { MeasurementGrid } from "./measurement-grid";
import { PassFailBadge } from "./pass-fail-badge";
import { ThresholdGauge } from "./threshold-gauge";

const INITIAL_STATE: CreateInspectionState = { error: null, fieldErrors: {} };

const inputClass =
  "mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-blueprint";

interface HeaderFields {
  companyName: string;
  materialName: string;
  spk: string;
  materialDescription: string;
  inspectionDate: string;
  quantityValue: string;
  steelThicknessMm: string;
  materialCategory: string;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_HEADER: HeaderFields = {
  companyName: "",
  materialName: "",
  spk: "",
  materialDescription: "",
  inspectionDate: "",
  quantityValue: "",
  steelThicknessMm: "",
  materialCategory: "",
};

function TextField({
  label,
  name,
  value,
  onChange,
  errors,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  errors?: string[];
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        step={type === "number" ? "any" : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} ${
          errors ? "border-stamp-red" : "border-steel"
        }`}
      />
      {errors?.map((message) => (
        <span key={message} className="mt-1 block text-xs text-stamp-red">
          {message}
        </span>
      ))}
    </label>
  );
}

export interface InspectionFormInitialValues extends HeaderFields {
  measurements: Record<string, string>;
}

interface InspectionFormProps {
  mode?: "create" | "edit";
  inspectionId?: string;
  initialValues?: InspectionFormInitialValues;
}

export function InspectionForm({
  mode = "create",
  inspectionId,
  initialValues,
}: InspectionFormProps) {
  const action =
    mode === "edit" && inspectionId
      ? updateInspection.bind(null, inspectionId)
      : createInspection;
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const [header, setHeader] = useState<HeaderFields>(
    () =>
      initialValues ?? {
        ...EMPTY_HEADER,
        inspectionDate: todayIsoDate(),
      }
  );
  const [measurements, setMeasurements] = useState<Record<string, string>>(
    initialValues?.measurements ?? {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  // React 19 form actions run a native-style form reset after every
  // submission attempt (success or failure), which snaps every field back to
  // its blank `defaultValue` at the DOM level. React's controlled re-render
  // then skips re-touching a field whose `value` prop hasn't changed since
  // the last render, so the reset silently sticks. That's invisible on the
  // create form (fields start empty anyway) but on edit — where fields start
  // populated — it looks like the whole form just wiped itself out on
  // submit. Re-push the current state onto every real DOM field once the
  // action settles, undoing that reset.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const current: Record<string, string> = { ...header, ...measurements };
    for (const [name, value] of Object.entries(current)) {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
        field.value = value;
      }
    }
    // Only re-sync right after an action settles, not on every keystroke —
    // `header`/`measurements` are read from the closure at that point, not
    // tracked as reactive dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const preview = useMemo(() => {
    const category = header.materialCategory as MaterialCategory;
    if (!MATERIAL_CATEGORIES.includes(category)) return null;

    const steelThicknessMm = Number(header.steelThicknessMm);
    if (!Number.isFinite(steelThicknessMm) || steelThicknessMm < 0)
      return null;

    const values = MEASUREMENT_FIELD_NAMES.map((name) =>
      Number(measurements[name])
    );
    if (values.some((value) => !Number.isFinite(value) || value < 0))
      return null;

    try {
      return evaluateInspection(category, steelThicknessMm, values);
    } catch {
      return null;
    }
  }, [header.materialCategory, header.steelThicknessMm, measurements]);

  function updateHeader<K extends keyof HeaderFields>(
    key: K,
    value: string
  ) {
    setHeader((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-8">
      {state.error && (
        <div className="rounded-md border border-stamp-red bg-white px-4 py-3 text-sm text-stamp-red">
          {state.error}
        </div>
      )}

      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Nama Perusahaan"
          name="companyName"
          value={header.companyName}
          onChange={(v) => updateHeader("companyName", v)}
          errors={state.fieldErrors.companyName}
        />
        <TextField
          label="Nama Material"
          name="materialName"
          value={header.materialName}
          onChange={(v) => updateHeader("materialName", v)}
          errors={state.fieldErrors.materialName}
        />
        <TextField
          label="SPK"
          name="spk"
          value={header.spk}
          onChange={(v) => updateHeader("spk", v)}
          errors={state.fieldErrors.spk}
        />
        <TextField
          label="Deskripsi Material"
          name="materialDescription"
          value={header.materialDescription}
          onChange={(v) => updateHeader("materialDescription", v)}
          errors={state.fieldErrors.materialDescription}
        />
        <TextField
          label="Tanggal Pengecekan"
          name="inspectionDate"
          type="date"
          value={header.inspectionDate}
          onChange={(v) => updateHeader("inspectionDate", v)}
          errors={state.fieldErrors.inspectionDate}
        />
        <TextField
          label="Kuantitas Material"
          name="quantityValue"
          type="number"
          value={header.quantityValue}
          onChange={(v) => updateHeader("quantityValue", v)}
          errors={state.fieldErrors.quantityValue}
        />
        <TextField
          label="Tebal Material (mm)"
          name="steelThicknessMm"
          type="number"
          value={header.steelThicknessMm}
          onChange={(v) => updateHeader("steelThicknessMm", v)}
          errors={state.fieldErrors.steelThicknessMm}
        />
        <label className="block">
          <span className="text-sm font-medium text-ink">
            Kategori Material
          </span>
          <select
            name="materialCategory"
            value={header.materialCategory}
            onChange={(e) => updateHeader("materialCategory", e.target.value)}
            className={`${inputClass} ${
              state.fieldErrors.materialCategory
                ? "border-stamp-red"
                : "border-steel"
            }`}
          >
            <option value="">Pilih kategori...</option>
            {MATERIAL_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {MATERIAL_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
          {state.fieldErrors.materialCategory?.map((message) => (
            <span key={message} className="mt-1 block text-xs text-stamp-red">
              {message}
            </span>
          ))}
        </label>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-ink">
          Titik Pengecekan Ketebalan Lapisan (<span className="normal-case">µm</span>)
        </legend>
        <MeasurementGrid
          values={measurements}
          errors={state.fieldErrors}
          onChange={(name, value) =>
            setMeasurements((prev) => ({ ...prev, [name]: value }))
          }
        />
      </fieldset>

      <div className="rounded-md border border-steel bg-white px-4 py-3">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-ink">
          Prediksi Hasil
        </p>
        {preview ? (
          <>
            <div className="mt-2 flex flex-wrap items-center gap-4 font-mono text-sm">
              <span>
                Rata-rata: <strong>{preview.averageUm.toFixed(2)} µm</strong>
              </span>
              <span className="font-sans">
                <PassFailBadge result={preview.result} size="lg" />
              </span>
            </div>
            <ThresholdGauge
              averageUm={preview.averageUm}
              minimumUm={preview.minimumRequiredUm}
            />
          </>
        ) : (
          <p className="mt-1 text-sm text-slate">
            Isi kategori, tebal material, dan semua 18 titik pengecekan untuk
            melihat prediksi hasil.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={gradientButtonClass}
        style={gradientButtonStyle}
      >
        {isPending
          ? "Menyimpan..."
          : mode === "edit"
            ? "Simpan Perubahan"
            : "Simpan Pengecekan"}
      </button>
    </form>
  );
}
