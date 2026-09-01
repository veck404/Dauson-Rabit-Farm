"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "./Icon";

export const DEMO_EMAIL = "admin@dausonfarm.com";
export const DEMO_PASSWORD = "Farm@2026";

export function LoginScreen({
  onLogin,
}: {
  onLogin: (remember: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (
      email.trim().toLowerCase() !== DEMO_EMAIL ||
      password !== DEMO_PASSWORD
    ) {
      setError(
        "The email or password is incorrect. Use the demo access below.",
      );
      return;
    }
    onLogin(remember);
  };

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-white text-stone-900 lg:bg-[#eff4f1]">
      <div className="pointer-events-none absolute -left-24 -top-32 hidden h-96 w-96 rounded-full bg-emerald-200/35 blur-3xl lg:block" />
      <div className="pointer-events-none absolute -bottom-40 right-0 hidden h-[30rem] w-[30rem] rounded-full bg-amber-100/70 blur-3xl lg:block" />

      <div className="relative min-h-[100dvh] lg:hidden">
        <div className="flex min-h-[100dvh] w-full flex-col overflow-hidden bg-white">
          <header className="relative h-[clamp(165px,27dvh,205px)] shrink-0 overflow-hidden bg-gradient-to-br from-[#075f4b] via-[#0d8a67] to-[#47c58d] text-white">
            <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full border-[38px] border-white/[0.07]" />
            <div className="absolute -left-12 top-12 h-36 w-36 rounded-full bg-emerald-950/15 blur-2xl" />
            <div className="relative z-10 flex h-[70%] flex-col items-center justify-center pb-1">
              <Icon
                name="rabbit"
                className="h-12 w-12 drop-shadow-[0_6px_12px_rgba(0,0,0,0.13)]"
              />
              <p className="mt-1.5 text-lg font-bold tracking-[-0.02em]">
                DAUSON FARM
              </p>
              {/* <p className="text-[9px] font-bold uppercase tracking-[.22em] text-white/65">
                Farm OS
              </p> */}
            </div>
            <svg
              aria-hidden="true"
              viewBox="0 0 390 100"
              preserveAspectRatio="none"
              className="absolute -bottom-0.5 left-0 h-[45%] w-full"
            >
              <path
                d="M0 50C67 16 117 33 174 57c71 30 132 35 216-13v56H0Z"
                fill="rgba(5,105,78,.72)"
              />
              <path
                d="M0 57C73 22 121 50 177 70c70 25 137 19 213-18v48H0Z"
                fill="white"
              />
            </svg>
          </header>

          <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col justify-center px-6 py-4 sm:px-8">
            <div className="text-center relative">
              <h1 className="text-2xl font-semibold tracking-[-0.025em] text-[#26342f]">
                Welcome back!
              </h1>
              <p className="mt-1 text-[10px] text-stone-400">
                Sign in to continue to your farm workspace
              </p>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-3" noValidate>
              <label className="relative block">
                <span className="sr-only">Email address</span>
                <Icon
                  name="mail"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="Email address"
                  className="w-full rounded-[10px] border border-transparent bg-[#f4f6f5] py-2.5 pl-11 pr-4 text-xs text-stone-700 outline-none transition placeholder:text-stone-400 hover:bg-stone-100 focus:border-emerald-400 focus:bg-white focus:ring-[3px] focus:ring-emerald-100"
                />
              </label>

              <label className="relative block">
                <span className="sr-only">Password</span>
                <Icon
                  name="lock"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Password"
                  className="w-full rounded-[10px] border border-transparent bg-[#f4f6f5] py-2.5 pl-11 pr-12 text-xs text-stone-700 outline-none transition placeholder:text-stone-400 hover:bg-stone-100 focus:border-emerald-400 focus:bg-white focus:ring-[3px] focus:ring-emerald-100"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-stone-400 hover:bg-white hover:text-emerald-700"
                >
                  <Icon
                    name={showPassword ? "eyeOff" : "eye"}
                    className="h-4 w-4"
                  />
                </button>
              </label>

              <div className="flex items-center justify-between px-1 text-[10px]">
                <label className="flex cursor-pointer items-center gap-1.5 text-stone-500">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="h-3.5 w-3.5 rounded border-stone-300 accent-emerald-700"
                  />
                  Remember me
                </label>
                {/* <button
                  type="button"
                  onClick={() =>
                    setError(
                      "Password recovery is not available in this local preview.",
                    )
                  }
                  className="font-medium text-stone-500 hover:text-violet-700"
                >
                  Forgot password?
                </button> */}
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl bg-rose-50 px-3 py-2 text-center text-[10px] font-medium leading-4 text-rose-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-[10px] bg-gradient-to-r from-[#08755a] via-[#19a875] to-[#68d8a4] p-px shadow-[0_7px_18px_rgba(8,117,90,0.16)] transition hover:-translate-y-px hover:shadow-[0_9px_22px_rgba(8,117,90,0.22)]"
              >
                <span className="block rounded-[9px] bg-white px-4 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50/30">
                  Login
                </span>
              </button>
            </form>

            {/* <p className="mt-3 text-center text-[10px] text-stone-400">
              New user?{" "}
              <button
                type="button"
                onClick={() => {
                  setEmail(DEMO_EMAIL);
                  setPassword(DEMO_PASSWORD);
                  setError("");
                }}
                className="font-bold text-emerald-700 hover:text-emerald-800"
              >
                Use demo access
              </button>
            </p> */}

            {/* <div className="my-3 flex items-center gap-3 px-4">
              <span className="h-px flex-1 bg-stone-200" />
              <span className="text-[9px] font-semibold uppercase text-stone-400">
                OR
              </span>
              <span className="h-px flex-1 bg-stone-200" />
            </div> */}

            <div className="text-center">
              {/* <div className="flex justify-center gap-2.5">
                {[
                  ["rabbit", "Herd"],
                  ["heart", "Care"],
                  ["wallet", "Finance"],
                  ["report", "Reports"],
                ].map(([icon, label]) => (
                  <span
                    key={label}
                    title={label}
                    className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-white shadow-sm shadow-emerald-900/10"
                  >
                    <Icon
                      name={icon as "rabbit" | "heart" | "wallet" | "report"}
                      className="h-3.5 w-3.5"
                    />
                  </span>
                ))}
              </div> */}
              <div className="absolute bottom-4 left-0 right-0">
                <p className="mt-.5 text-[9px] text-stone-400">
                  One secure account for every farm record
                </p>
                <p className="mt-1 text-[9px] text-stone-300">
                  Sessions expire automatically after 6 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative hidden min-h-[100dvh] lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(440px,.92fr)]">
        <section className="relative hidden overflow-hidden bg-[#0f3d32] p-10 text-white lg:flex lg:flex-col xl:p-14">
          <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full border-[70px] border-white/[0.035]" />
          <div className="absolute -bottom-44 -left-24 h-[30rem] w-[30rem] rounded-full bg-emerald-400/[0.07] blur-2xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-100/50 to-transparent" />

          <div className="relative flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#efc557] text-[#103f33] shadow-xl shadow-black/10">
              <Icon name="rabbit" className="h-6 w-6" />
            </span>
            <div>
              <p className="font-serif text-[19px] font-bold tracking-tight">
                Dauson Farm
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[.22em] text-emerald-100/50">
                Farm operating system
              </p>
            </div>
          </div>

          <div className="relative my-auto max-w-xl py-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-emerald-100/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#efc557]" />
              One farm. One trusted record.
            </span>
            <h1 className="mt-6 max-w-lg font-serif text-5xl font-bold leading-[1.05] tracking-[-0.035em] xl:text-[58px]">
              Run the farm with clarity.
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-7 text-emerald-50/60">
              Keep your herd, breeding, health, feed and finances organized in
              one dependable workspace built for daily farm operations.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {[
                ["Herd", "Complete records"],
                ["Care", "Health tracking"],
                ["Finance", "Clear cash flow"],
              ].map(([title, note]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-4 backdrop-blur-sm"
                >
                  <p className="text-xs font-bold text-white">{title}</p>
                  <p className="mt-1 text-[10px] text-emerald-100/45">{note}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-[10px] text-emerald-100/35">
            © {new Date().getFullYear()} Dauson Farm · Secure operations
            workspace
          </p>
        </section>

        <section className="flex min-h-[100dvh] items-center justify-center p-4 sm:p-8 lg:p-12">
          <div className="w-full max-w-[430px]">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#efc557] text-[#103f33] shadow-sm">
                <Icon name="rabbit" className="h-5 w-5" />
              </span>
              <div>
                <p className="font-serif text-lg font-bold text-[#123f34]">
                  Dauson Farm
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[.2em] text-emerald-900/40">
                  Farm OS
                </p>
              </div>
            </div>

            <div className="rounded-[26px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_70px_rgba(18,63,52,0.12)] backdrop-blur-xl sm:p-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-emerald-700">
                  Welcome back
                </p>
                <h2 className="mt-2 font-serif text-3xl font-bold tracking-[-0.025em] text-[#153e33]">
                  Sign in to your farm
                </h2>
                <p className="mt-2 text-xs leading-5 text-stone-500">
                  Enter your account details to continue to the workspace.
                </p>
              </div>

              <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
                <label className="block text-[12px] font-bold text-stone-600">
                  Email address
                  <span className="relative mt-1.5 block">
                    <Icon
                      name="mail"
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                    />
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                      placeholder="you@dausonfarm.com"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/70 py-2.5 pl-10 pr-3.5 text-xs text-stone-800 outline-none transition placeholder:text-stone-300 hover:border-stone-300 focus:border-emerald-600 focus:bg-white focus:ring-[3px] focus:ring-emerald-100"
                    />
                  </span>
                </label>

                <label className="block text-[12px] font-bold text-stone-600">
                  Password
                  <span className="relative mt-1.5 block">
                    <Icon
                      name="lock"
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                    />
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError("");
                      }}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/70 py-2.5 pl-10 pr-11 text-xs text-stone-800 outline-none transition placeholder:text-stone-300 hover:border-stone-300 focus:border-emerald-600 focus:bg-white focus:ring-[3px] focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                    >
                      <Icon
                        name={showPassword ? "eyeOff" : "eye"}
                        className="h-4 w-4"
                      />
                    </button>
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-[11px] font-medium text-stone-500">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 accent-emerald-700"
                  />
                  Keep me signed in after closing the browser
                </label>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-[11px] font-medium leading-4 text-rose-700"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#155c49] px-4 py-2.5 text-xs font-bold text-white shadow-[0_8px_18px_rgba(21,92,73,0.22)] hover:-translate-y-px hover:bg-[#104b3c] hover:shadow-[0_10px_24px_rgba(21,92,73,0.26)]"
                >
                  Sign in to Farm OS
                  <Icon name="arrow" className="h-4 w-4" />
                </button>
                <p className="text-center text-[10px] text-stone-400">
                  For your security, every session expires after 6 hours.
                </p>
              </form>

              <div className="mt-6 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-3.5">
                <div className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
                    <Icon name="lock" className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[.12em] text-amber-800">
                      Local demo access
                    </p>
                    <p className="mt-1 break-all font-mono text-[10px] leading-4 text-amber-900/70">
                      {DEMO_EMAIL} · {DEMO_PASSWORD}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-5 text-center text-[10px] leading-4 text-stone-400">
              This preview login protects the local interface only. Connect a
              server-side identity provider before production deployment.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
