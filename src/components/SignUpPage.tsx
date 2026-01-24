"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, MailCheck } from "lucide-react";

interface SignUpPageProps {
  onNavigate: (page: string) => void;
}

export function SignUpPage({ onNavigate }: SignUpPageProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    privateToken: "",
    wilayah: "", // optional
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // ✅ state baru: sukses signup -> tampilkan panel verifikasi
  const [signupSuccess, setSignupSuccess] = useState<{
    email: string;
    message: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      delete newErrors.api;
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSignupSuccess(null);

    const email = formData.email.trim().toLowerCase();
    const token = formData.privateToken.trim().toUpperCase();
    const wilayah = formData.wilayah.trim();

    let hasError = false;

    if (!formData.fullName.trim()) {
      setErrors((prev) => ({ ...prev, fullName: "Nama lengkap wajib diisi." }));
      hasError = true;
    }
    if (!token) {
      setErrors((prev) => ({ ...prev, privateToken: "Private Token wajib diisi!" }));
      hasError = true;
    }
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email wajib diisi." }));
      hasError = true;
    }
    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: "Kata sandi wajib diisi." }));
      hasError = true;
    } else if (formData.password.length < 8) {
      setErrors((prev) => ({ ...prev, password: "Password minimal 8 karakter." }));
      hasError = true;
    }
    if (!formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Konfirmasi kata sandi wajib diisi." }));
      hasError = true;
    } else if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Kata sandi tidak cocok!" }));
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: formData.password,
          full_name: formData.fullName.trim(),
          token,
          wilayah: wilayah || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrors({ api: json?.error || "Gagal daftar" });
        return;
      }

      // ✅ Jangan langsung navigate ke login
      const msg =
        json?.message ||
        "Akun berhasil dibuat. Silakan cek email untuk verifikasi sebelum login.";

      setSignupSuccess({ email, message: msg });
      toast.success("Berhasil daftar! Cek email untuk verifikasi.");

      // optional: reset password fields (biar aman)
      setFormData((p) => ({
        ...p,
        password: "",
        confirmPassword: "",
      }));
    } catch {
      setErrors({ api: "Terjadi kesalahan saat mendaftar." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/assets/hapkido-logo.png"
            alt="Hapkido Indonesia Logo"
            width={80}
            height={80}
            className="w-20 h-20 mx-auto mb-4 object-contain"
            priority
          />
          <h1 className="mb-2">Buat Akun</h1>
          <p className="text-gray-600 text-sm">Bergabung dengan Hapkido Indonesia</p>
        </div>

        {/* ✅ Panel sukses verifikasi */}
        {signupSuccess && (
          <div className="mb-6 border border-green-200 bg-green-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <MailCheck className="w-5 h-5 text-green-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900">Cek email untuk verifikasi</p>
                <p className="text-sm text-green-800 mt-1">
                  {signupSuccess.message}
                </p>
                <p className="text-xs text-green-700 mt-2">
                  Email verifikasi dikirim ke: <b>{signupSuccess.email}</b>
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate("login")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  >
                    Saya sudah verifikasi → Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupSuccess(null)}
                    className="px-4 py-2 bg-white hover:bg-gray-50 border rounded-lg text-sm"
                  >
                    Tutup
                  </button>
                </div>

                <p className="text-[11px] text-green-700 mt-3">
                  Tidak menemukan email? Cek folder <b>Spam/Promotions</b>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.api && <div className="text-red-600 text-sm mb-2 text-center">{errors.api}</div>}

          <div>
            <label htmlFor="fullName" className="block text-sm mb-2 text-gray-700">
              Nama Lengkap
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              onInvalid={(e) => e.currentTarget.setCustomValidity("Nama lengkap wajib diisi.")}
              onInput={(e) => e.currentTarget.setCustomValidity("")}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.fullName ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"
              }`}
              placeholder="Masukkan nama lengkap"
              required
              disabled={loading}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="privateToken" className="block text-sm mb-2 text-gray-700">
              Private Token <span className="text-red-500">*</span>
            </label>
            <input
              id="privateToken"
              name="privateToken"
              type="text"
              value={formData.privateToken}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.privateToken ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"
              }`}
              placeholder="Masukkan token dari pengurus"
              required
              disabled={loading}
            />
            {errors.privateToken && <p className="text-red-500 text-xs mt-1">{errors.privateToken}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Token hanya menentukan <strong>role</strong>. Wilayah diisi dari input pengguna (jika ada).
            </p>
          </div>

          {/* Wilayah (optional) */}
          <div>
            <label htmlFor="wilayah" className="block text-sm mb-2 text-gray-700">
              Wilayah (Opsional)
            </label>
            <input
              id="wilayah"
              name="wilayah"
              type="text"
              value={formData.wilayah}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 border-gray-300"
              placeholder="Contoh: DIY / Jakarta / Jawa Barat"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Jika kosong, bisa diisi nanti di profil.</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm mb-2 text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onInvalid={(e) => e.currentTarget.setCustomValidity("Email wajib diisi.")}
              onInput={(e) => e.currentTarget.setCustomValidity("")}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.email ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"
              }`}
              placeholder="Masukkan email"
              required
              disabled={loading}
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
                value={formData.password}
                onChange={handleChange}
                onInvalid={(e) => e.currentTarget.setCustomValidity("Kata sandi wajib diisi.")}
                onInput={(e) => e.currentTarget.setCustomValidity("")}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 pr-10 ${
                  errors.password ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"
                }`}
                placeholder="Buat kata sandi"
                required
                disabled={loading}
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm mb-2 text-gray-700">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                onInvalid={(e) => e.currentTarget.setCustomValidity("Konfirmasi kata sandi wajib diisi.")}
                onInput={(e) => e.currentTarget.setCustomValidity("")}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 pr-10 ${
                  errors.confirmPassword ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"
                }`}
                placeholder="Konfirmasi kata sandi"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Sembunyikan konfirmasi kata sandi" : "Lihat konfirmasi kata sandi"}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </button>

          {/* ✅ Pesan tetap ada, tapi sekarang juga ada panel sukses */}
          <p className="text-xs text-gray-600">
            Setelah daftar, kamu wajib verifikasi email dulu sebelum bisa login.
          </p>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Sudah punya akun? </span>
          <button onClick={() => onNavigate("login")} className="text-blue-600 hover:underline">
            Masuk
          </button>
        </div>

        {/* Token Info */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm text-blue-900 mb-2">ℹ️ Tentang Private Token</h3>
          <p className="text-xs text-blue-800 mb-2">
            Private Token adalah kode unik yang diberikan oleh pengurus untuk memverifikasi bahwa Anda adalah anggota
            resmi Hapkido Indonesia yang berhak menggunakan sistem ISS.
          </p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-blue-800">
              <strong>Belum punya token?</strong>
            </p>
            <button
              onClick={() => onNavigate("request-token")}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors"
            >
              Minta Token
            </button>
          </div>
        </div>

        {/* Back to Home */}
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
