import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabase"; // ✅ pastikan path benar

// No props needed

export function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ✅ sesuaikan dengan URL FE kamu yang bener
  // - kalau pakai Vite: http://localhost:5173
  // - kalau production: https://domainkamu.com
  const RESET_REDIRECT_URL = `${window.location.origin}/reset-password`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg("Email belum diisi.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Supabase: kirim email reset password
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: RESET_REDIRECT_URL,
      });

      if (error) throw error;

      setSubmitted(true);
    } catch (err) {
      // Supabase kadang kasih pesan teknis, kita bikin lebih manusiawi
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal mengirim link reset. Coba lagi.";
      setErrorMsg(msg);
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setSubmitted(false);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/assets/hapkido-logo.png"
            alt="Hapkido Indonesia Logo"
            className="w-20 h-20 mx-auto mb-4 object-contain"
          />
          <h1 className="mb-2">Lupa Kata Sandi?</h1>
          <p className="text-gray-600 text-sm">
            Masukkan email Anda, nanti kami kirim link untuk reset kata sandi.
          </p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex gap-2 items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          </div>
        )}

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm mb-2 text-gray-700">
                Alamat Email
              </label>

              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Masukkan email Anda"
                  required
                  disabled={loading}
                />
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Pastikan email ini terdaftar di sistem.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Mengirim..." : "Kirim Link Reset"}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-green-800 text-sm">
                Jika email <span className="font-medium">{email}</span> terdaftar, kami sudah mengirim link reset.
                Silakan cek Inbox/Spam.
              </p>
            </div>

            <button onClick={handleRetry} className="text-blue-600 hover:underline text-sm" type="button">
              Tidak menerima email? Coba lagi
            </button>
          </div>
        )}

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/login")}
            className="text-gray-500 hover:text-gray-700 text-sm"
            type="button"
          >
            ← Kembali ke Masuk
          </button>
        </div>
      </div>
    </div>
  );
}
