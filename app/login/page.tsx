"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Orbit,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validasi sisi klien sebelum memanggil Supabase
    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }
    if (!password) {
      setError("Password wajib diisi.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email atau password salah.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    router.push("/");
    router.refresh();
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ivory placeholder:text-ash/60 transition focus:border-lime focus:outline-none focus:ring-2 focus:ring-lime/25";

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-2">
      {/* ===== Kiri: visual branding ===== */}
      <section className="relative flex flex-col justify-between gap-8 overflow-hidden border-b border-line bg-surface px-6 py-8 lg:border-b-0 lg:border-r lg:px-12 lg:py-14">
        {/* Dekorasi orbital — murni visual */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-28 -top-28 h-[380px] w-[380px] animate-orbit rounded-full border border-line">
            <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/70" />
          </div>
          <div className="absolute -right-10 -top-10 h-[200px] w-[200px] rounded-full border border-line/60" />
          <div className="absolute bottom-16 left-8 h-1.5 w-1.5 rounded-full bg-lavender/60" />
          <div className="absolute bottom-32 left-24 h-1 w-1 rounded-full bg-lime/50" />
        </div>

        <div className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-obsidian">
            <Orbit className="h-4 w-4 text-lime" aria-hidden />
          </span>
          <span className="font-display text-lg font-bold tracking-wide">
            JehaToDo
          </span>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-4xl font-bold leading-[1.1] lg:text-6xl">
            Jeha.
            <br />
            <span className="text-ash">Ji Iya.</span>
          </h1>
          <p className="mt-5 max-w-sm leading-relaxed text-ash">
            Jangan Lupa ToDo ta MasBro, Nda kutau apa lagi mau ku tulis pokokna hantam saja!
          </p>
        </div>
      </section>

      {/* ===== Kanan: form login ===== */}
      <section className="flex items-center justify-center px-6 py-10 lg:px-12">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full max-w-sm animate-rise space-y-5"
        >
          <div>
            <h2 className="font-display text-3xl font-bold">Halo Jeha!</h2>
            <p className="mt-1.5 text-sm text-ash">
              Masuk mas Jeha!
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm text-ash">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              aria-invalid={!!error && !email.trim()}
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm text-ash">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                aria-invalid={!!error && !password}
                className={`${inputCls} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                title={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-ash transition hover:bg-moss hover:text-ivory"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-coral/40 bg-coral/10 px-3.5 py-2.5 text-sm text-coral"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || success}
            className="w-full"
          >
            {success ? (
              <>
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                Berhasil, mengalihkan...
              </>
            ) : loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Memproses...
              </>
            ) : (
              "Masuk"
            )}
          </Button>

          <p className="text-center text-xs leading-relaxed text-ash">
            Aplikasi pribadi — pendaftaran akun baru dinonaktifkan.
          </p>
        </form>
      </section>
    </main>
  );
}