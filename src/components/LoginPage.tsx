"use client";
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { Eye, EyeOff } from "lucide-react";

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; login?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, login: undefined }));
  };

  const handleResendVerification = async () => {
    const email = credentials.email.trim().toLowerCase();
    if (!email) return toast.error("Masukkan email dulu.");

    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) toast.error("Gagal kirim ulang email verifikasi: " + error.message);
      else {
        toast.success("Email verifikasi dikirim ulang. Cek inbox/spam.");
        setShowResend(false);
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowResend(false);
    setErrors({});

    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password;

    let hasError = false;
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email tidak boleh kosong." }));
      hasError = true;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Kata sandi tidak boleh kosong." }));
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
    try {
      // 1) Login
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrors({ login: "Email atau kata sandi salah." });
        } else {
          setErrors({ login: "Login gagal: " + error.message });
        }
        return;
      }

      if (!data.user) {
        setErrors({ login: "Login gagal: user tidak ditemukan." });
        return;
      }

      // 2) Block if email not verified
      const emailConfirmed = data.user.email_confirmed_at || data.user.confirmed_at;
      if (!emailConfirmed) {
        toast.error("Email belum diverifikasi. Silakan cek email Anda.");
        setShowResend(true);
        return;
      }

      // 3) Ambil role dari profiles (sesuai desain RLS kamu)
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", data.user.id)
        .single();

      if (profErr || !prof) {
        setErrors({ login: "Profil tidak ditemukan. Hubungi admin." });
        return;
      }

      toast.success("Selamat datang, " + prof.full_name);

      if (prof.role === "pelatih") onNavigate("dashboard-coach");
      else if (prof.role === "admin_daerah") onNavigate("dashboard-regional");
      else if (prof.role === "admin_nasional") onNavigate("dashboard-national");
      else onNavigate("dashboard-coach");
    } catch {
      setErrors({ login: "Terjadi kesalahan saat login." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/assets/hapkido-logo.png"
            alt="Hapkido Indonesia Logo"
            width={80}
            height={80}
            className="w-20 h-20 mx-auto mb-4 object-contain"
            priority
          />
          <h1 className="mb-2">Masuk</h1>
          <p className="text-gray-600 text-sm">Selamat datang kembali di Hapkido Indonesia</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.login && (
            <div className="text-red-600 text-sm mb-2 text-center">{errors.login}</div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm mb-2 text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.email ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"}`}
              placeholder="Masukkan email"
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-2 text-gray-700">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 pr-10 ${errors.password ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"}`}
                placeholder="Masukkan kata sandi"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>

          {showResend && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {resendLoading ? "Mengirim..." : "Kirim Ulang Email Verifikasi"}
              </button>
              <p className="text-xs text-gray-600 mt-2">
                Belum menerima email verifikasi? Cek inbox/spam atau kirim ulang.
              </p>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <button
              type="button"
              onClick={() => onNavigate("forgot-password")}
              className="text-blue-600 hover:underline"
            >
              Lupa Kata Sandi?
            </button>
            {/* Username recovery removed */}
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Belum punya akun? </span>
          <button onClick={() => onNavigate("signup")} className="text-blue-600 hover:underline">
            Daftar
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => onNavigate("home")}
            className="text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}