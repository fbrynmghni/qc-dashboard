"use client";

import { useActionState, useState } from "react";
import {
  ArrowRightIcon,
  CircleNotchIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockSimpleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { gradientButtonClass, gradientButtonStyle } from "@/lib/ui";
import { login, type LoginState } from "@/app/login/actions";

const INITIAL_LOGIN_STATE: LoginState = { error: null };

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [state, formAction, isPending] = useActionState(
    login,
    INITIAL_LOGIN_STATE
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-xs font-medium uppercase tracking-[0.14em] text-slate"
        >
          Email
        </label>
        <div className="relative">
          <EnvelopeIcon
            weight="bold"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate"
          />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            placeholder="nama@perusahaan.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-steel bg-white py-2.5 pr-3 pl-10 text-sm text-ink placeholder:text-slate/60 focus:border-blueprint focus:ring-2 focus:ring-blueprint/30 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-xs font-medium uppercase tracking-[0.14em] text-slate"
          >
            Kata Sandi
          </label>
          <a href="#" className="text-xs font-medium text-blueprint hover:underline">
            Lupa kata sandi?
          </a>
        </div>
        <div className="relative">
          <LockSimpleIcon
            weight="bold"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate"
          />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Masukkan kata sandi"
            className="w-full rounded-md border border-steel bg-white py-2.5 pr-10 pl-10 text-sm text-ink placeholder:text-slate/60 focus:border-blueprint focus:ring-2 focus:ring-blueprint/30 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={
              showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
            }
            className="absolute top-1/2 right-3 -translate-y-1/2 text-slate hover:text-ink"
          >
            {showPassword ? (
              <EyeSlashIcon weight="bold" className="h-4 w-4" />
            ) : (
              <EyeIcon weight="bold" className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate">
        <input
          type="checkbox"
          name="remember"
          className="h-4 w-4 rounded border-steel text-blueprint focus:ring-blueprint/30"
        />
        Ingat saya di perangkat ini
      </label>

      {state.error && (
        <p className="flex items-center gap-2 rounded-md border border-stamp-red/30 bg-stamp-red/5 px-3 py-2 text-sm text-stamp-red">
          <WarningCircleIcon weight="bold" className="h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={`${gradientButtonClass} mt-1 w-full gap-2 py-2.5`}
        style={gradientButtonStyle}
      >
        {isPending ? (
          <>
            <CircleNotchIcon weight="bold" className="h-4 w-4 animate-spin" />
            Memeriksa kredensial&hellip;
          </>
        ) : (
          <>
            Masuk
            <ArrowRightIcon weight="bold" className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
