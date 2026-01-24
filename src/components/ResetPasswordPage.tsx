"use client";

import { useEffect, useState } from "react";
// SPA navigation: use setUrlPage for App.tsx
import Image from "next/image";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";



function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // validasi: user harus datang dari link reset yang valid
  const [checking, setChecking] = useState(true);
  const [hasResetSession, setHasResetSession] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        /**
         * IMPORTANT:
         * Link reset Supabase biasanya bawa token di URL hash:
         *   /?page=reset-password#access_token=...&type=recovery
         * Supabase JS umumnya akan "auto-detect" ini, tapi kadang perlu dipastikan
         * lewat getSession() (atau exchangeCodeForSession utk flow code).
         */
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!mounted) return;
        setHasResetSession(!!data?.session);
      } catch {
        if (!mounted) return;
        setHasResetSession(false);
      } finally {
        if (!mounted) return;
        setChecking(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!hasResetSession) {
      const msg =
        "Link reset tidak valid atau sudah kedaluwarsa. Silakan minta link reset ulang.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!password || password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      toast.success("Kata sandi berhasil direset!");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal reset password. Silakan coba lagi.";
      setError(msg);
      toast.error("Gagal reset password: " + msg);
    } finally {
      setLoading(false);
    }
  };

  // SPA navigation: update URL for App.tsx
  function setUrlPage(page: string) {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("page", page);
    url.hash = ""; // clear hash fragment
    url.searchParams.delete("error");
    url.searchParams.delete("error_code");
    url.searchParams.delete("error_description");
    window.history.replaceState(null, "", url.toString());
  }
  const goToForgot = () => setUrlPage("forgot-password");
  const goToLogin = () => setUrlPage("login");

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
          <p className="text-gray-600 text-sm">
            Masukkan kata sandi baru Anda di bawah ini.
          </p>
        </div>

        {checking ? (
          <div className="text-center text-sm text-gray-600">
            Memverifikasi link reset...
          </div>
        ) : !hasResetSession ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Link reset tidak valid atau sudah kedaluwarsa.
              </p>
              <p className="text-yellow-800 text-sm mt-1">
                Silakan minta link reset ulang.
              </p>
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
              <label
                htmlFor="password"
                className="block text-sm mb-2 text-gray-700"
              >
                Kata Sandi Baru
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Kata sandi baru"
                required
                autoComplete="new-password"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">Minimal 8 karakter.</p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm mb-2 text-gray-700"
              >
                Konfirmasi Kata Sandi
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ulangi kata sandi baru"
                required
                autoComplete="new-password"
                disabled={loading}
              />
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
            <div className="text-green-600 font-semibold">
              Kata sandi berhasil direset!
            </div>
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
              onClick={goToLogin}
              type="button"
            >
              Kembali ke Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
