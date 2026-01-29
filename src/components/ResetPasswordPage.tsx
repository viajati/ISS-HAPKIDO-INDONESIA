"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { validatePassword, getPasswordRequirements } from "../lib/password-validation";

function navigateSpa(page: string, opts?: { clearHash?: boolean }) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.searchParams.set("page", page);
  if (opts?.clearHash) url.hash = "";

  url.searchParams.delete("error");
  url.searchParams.delete("error_code");
  url.searchParams.delete("error_description");
  url.searchParams.delete("code"); // ✅ penting: buang code setelah dipakai

  window.history.pushState(null, "", url.toString());
  window.dispatchEvent(new PopStateEvent("popstate"));
}

async function withTimeout<T>(p: Promise<T>, ms = 15000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request terlalu lama. Silakan coba lagi.")), ms)
    ),
  ]);
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // ✅ 1) Kalau link reset model PKCE: ada ?code=...
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          const { error: exErr } = await withTimeout(
            supabase.auth.exchangeCodeForSession(code),
            15000
          );
          if (exErr) throw exErr;

          // buang code supaya tidak diproses ulang kalau user refresh
          url.searchParams.delete("code");
          window.history.replaceState(null, "", url.toString());
        }

        // ✅ 2) Untuk hash-based (#access_token=...), detectSessionInUrl akan set session otomatis.
        // Jadi kita cek session setelah itu.
        const { data, error: sErr } = await withTimeout(supabase.auth.getSession(), 15000);
        if (sErr) throw sErr;

        if (!alive) return;

        if (data.session) {
          setReady(true);
        } else {
          setReady(false);
        }
      } catch (e) {
        if (!alive) return;
        setReady(false);
        const msg = e instanceof Error ? e.message : "Gagal memverifikasi link reset.";
        setError(msg);
      } finally {
        if (!alive) return;
        setChecking(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!ready) {
      const msg =
        "Link reset tidak valid / sesi reset belum terbentuk. Silakan buka ulang link dari email atau minta link baru.";
      setError(msg);
      toast.error(msg);
      return;
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      const msg = passwordCheck.errors.join(". ") + ".";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = "Konfirmasi password tidak cocok.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    const tid = toast.loading("Menyimpan password baru...");

    try {
      const { error: upErr } = await withTimeout(
        supabase.auth.updateUser({ password }),
        15000
      );
      if (upErr) throw upErr;

      setSuccess(true);
      toast.success("Kata sandi berhasil direset! Silakan login ulang.", { id: tid });

      // ✅ sign out supaya session lama di device ini berakhir
      await withTimeout(supabase.auth.signOut(), 10000);

      // ✅ bersihkan hash token recovery + redirect login
      setTimeout(() => navigateSpa("login", { clearHash: true }), 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal reset password. Silakan coba lagi.";
      setError(msg);
      toast.error("Gagal reset password: " + msg, { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const goToForgot = () => navigateSpa("forgot-password", { clearHash: true });
  const goToLogin = () => navigateSpa("login", { clearHash: true });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <Image
              src="/assets/hapkido-logo.png"
              alt="Hapkido Indonesia Logo"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <h1 className="mb-2">Reset Kata Sandi</h1>
          <p className="text-gray-600 text-sm">Masukkan kata sandi baru Anda di bawah ini.</p>
        </div>

        {checking ? (
          <div className="text-center text-sm text-gray-600">Memverifikasi link reset...</div>
        ) : !ready ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">Link reset tidak valid atau sudah kedaluwarsa.</p>
              {error ? <p className="text-yellow-800 text-xs mt-2 break-words">{error}</p> : null}
              <p className="text-yellow-800 text-sm mt-2">Silakan minta link reset ulang.</p>
            </div>

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
              onClick={goToForgot}
              type="button"
            >
              Minta Link Reset Ulang
            </button>

            <button
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg transition-colors"
              onClick={goToLogin}
              type="button"
            >
              Kembali ke Login
            </button>
          </div>
        ) : !success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm mb-2 text-gray-700">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Kata sandi baru"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <ul className="text-xs text-gray-500 mt-2 space-y-0.5">
                {getPasswordRequirements().map((req, i) => (
                  <li key={i}>• {req}</li>
                ))}
              </ul>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm mb-2 text-gray-700">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Ulangi kata sandi baru"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : null}
              Simpan Kata Sandi Baru
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-green-700 font-semibold">Kata sandi berhasil direset!</p>
            <p className="text-sm text-gray-600">Anda akan diarahkan ke halaman login...</p>
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
              onClick={goToLogin}
              type="button"
            >
              Login Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
