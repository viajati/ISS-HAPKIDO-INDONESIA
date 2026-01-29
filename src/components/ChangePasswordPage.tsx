"use client";

import { useState, useMemo } from "react";
import { useAuth } from "../contexts/auth-context";
import { supabase } from "../lib/supabase";
import { PrivateSidebar } from "./PrivateSidebar";
import { Menu, Lock, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface ChangePasswordPageProps {
  onNavigate: (page: string) => void;
  userRole?: "pelatih" | "admin_daerah" | "admin_nasional";
}

export function ChangePasswordPage({
  onNavigate,
  userRole: userRoleProp,
}: ChangePasswordPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, profile } = useAuth();

  // ✅ Use profile.role from auth context
  const userRole = useMemo(() => {
    if (!profile?.role) return "pelatih";
    return profile.role;
  }, [profile?.role]);

  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleLogout = () => onNavigate("logout");

  const handleSendResetEmail = async () => {
    if (!user?.email) {
      toast.error("Email tidak ditemukan. Silakan login ulang.");
      onNavigate("login");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Mengirim email reset password...");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/?page=reset-password#`,
      });

      if (error) throw error;

      toast.success("Email reset password berhasil dikirim!", { id: toastId });
      setEmailSent(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim email";
      toast.error(`Gagal mengirim email: ${msg}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <PrivateSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={onNavigate}
        currentPage="profil"
        userRole={userRole}
        onLogout={handleLogout}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl">Ubah Kata Sandi</h1>
              <p className="text-sm text-gray-600">Perbarui password akun Anda</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => onNavigate("profil")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Profil
          </button>

          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg">Ubah Kata Sandi</h2>
                <p className="text-sm text-gray-600">
                  Kami akan mengirim link reset password ke email Anda
                </p>
              </div>
            </div>

            {!emailSent ? (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm text-blue-900 mb-1">Email Anda</h4>
                      <p className="text-blue-800">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Cara kerja:</h4>
                  <ol className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold">1.</span>
                      <span>Klik tombol "Kirim Email Reset Password"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold">2.</span>
                      <span>Kami akan <strong>mengirimkan email</strong> ke inbox Anda</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold">3.</span>
                      <span>Buka email dan <strong>klik link yang dikirim</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold">4.</span>
                      <span>Anda akan <strong>diarahkan ke halaman reset password</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold">5.</span>
                      <span>Masukkan password baru Anda</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold">6.</span>
                      <span>Setelah berhasil, Anda <strong>harus login ulang</strong> dengan password baru</span>
                    </li>
                  </ol>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSendResetEmail}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Kirim Email Reset Password
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate("profil")}
                    disabled={loading}
                    className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Email Berhasil Dikirim!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Kami telah mengirim link reset password ke <strong>{user?.email}</strong>
                  </p>
                  <div className="space-y-2 text-sm text-gray-700 bg-blue-50 p-4 rounded-lg">
                    <p><strong>📧 Langkah selanjutnya:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Buka email Anda dan klik link yang dikirim</li>
                      <li>Anda akan dibawa ke halaman reset password</li>
                      <li>Masukkan password baru Anda</li>
                      <li>Setelah berhasil, Anda akan diminta <strong className="text-blue-700">login ulang</strong></li>
                    </ol>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <p className="mb-1 font-semibold">💡 Penting untuk Diketahui:</p>
                  <ul className="space-y-1 text-left">
                    <li>• Cek folder Spam/Junk jika tidak menemukan email</li>
                    <li>• Link berlaku selama 1 jam</li>
                    <li>• Setelah ubah password, Anda HARUS login ulang</li>
                    <li>• Jangan share link ke orang lain</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => onNavigate("profil")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
                  >
                    Kembali ke Profil
                  </button>
                  <button
                    onClick={() => setEmailSent(false)}
                    className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg transition-colors"
                  >
                    Kirim Ulang
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
