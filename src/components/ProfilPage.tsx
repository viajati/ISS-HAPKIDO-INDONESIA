import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { PrivateSidebar } from "./PrivateSidebar";
import { Menu, User, Mail, Phone, MapPin, Shield, Calendar, Edit2, Save, X } from "lucide-react";

type ProfileData = {
  fullName: string;
  email: string; // read-only
  phone: string;
  roleLabel: string; // read-only label untuk UI
  dojang: string;
  wilayah: string;
  sabukLevel: string;
  certificationDate: string; // YYYY-MM-DD atau ""
};

interface ProfilPageProps {
  onNavigate: (page: string) => void;
  userRole?: "coach" | "regional" | "national";
  userName?: string;
  onLogout?: () => void;
}

const roleToLabel = (role: string) =>
  role === "pelatih" ? "Pelatih" : role === "admin_daerah" ? "Admin Daerah" : "Admin Nasional";

const mapUserRoleToSidebarRole = (userRole: "coach" | "regional" | "national") =>
  userRole === "coach" ? "pelatih" : userRole === "regional" ? "admin_daerah" : "admin_nasional";

export function ProfilPage({
  onNavigate,
  userRole = "coach",
  userName = "User",
  onLogout,
}: ProfilPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { profile, loadingProfile, user, fetchProfile } = useAuth();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editData, setEditData] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);

  const sidebarRole = useMemo(() => mapUserRoleToSidebarRole(userRole), [userRole]);

  // Hydrate state dari profile (DB)
  useEffect(() => {
    if (!profile) return;

    setProfileData({
      fullName: profile.full_name ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      roleLabel: roleToLabel(profile.role),
      dojang: profile.dojang ?? "",
      wilayah: profile.wilayah ?? "",
      sabukLevel: profile.sabuk_level ?? "",
      // DATE -> bisa null. Untuk input type="date" butuh "YYYY-MM-DD"
      certificationDate: profile.certification_date ?? "",
    });
  }, [profile]);

  // Mirror ke editData tiap profileData berubah
  useEffect(() => {
    if (!profileData) return;
    setEditData(profileData);
  }, [profileData]);

  const handleLogout = () => {
    if (onLogout) onLogout();
    else onNavigate("logout");
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profileData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profileData);
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setEditData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!user || !profile || !editData) return;

    // Basic validation minimal
    const fullName = editData.fullName.trim();
    if (!fullName) {
      alert("Nama lengkap wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const updates = {
        full_name: fullName,
        phone: editData.phone.trim() || null,
        dojang: editData.dojang.trim() || null,
        wilayah: editData.wilayah.trim() || null,
        sabuk_level: editData.sabukLevel.trim() || null,
        certification_date: editData.certificationDate ? editData.certificationDate : null, // YYYY-MM-DD
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);

      if (error) {
        alert("Gagal memperbarui profil: " + error.message);
        return;
      }

      setProfileData(editData);
      setIsEditing(false);

      // refresh dari DB supaya konsisten dengan server
      await fetchProfile(user.id);

      alert("Profil berhasil diperbarui!");
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile || !profileData || !editData) {
    return <div className="flex items-center justify-center min-h-screen">Memuat profil...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <PrivateSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={onNavigate}
        currentPage="profil"
        userRole={sidebarRole}
        userName={userName}
        onLogout={handleLogout}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900">
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl">Profil Pengguna</h1>
                <p className="text-sm text-gray-600">Kelola informasi akun Anda</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl">
                {(profileData.fullName?.charAt(0) || "U").toUpperCase()}
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="mb-1">{profileData.fullName}</h2>
                <p className="text-gray-600 mb-2">{profileData.email}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {profileData.roleLabel}
                  </span>
                  {profileData.sabukLevel ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {profileData.sabukLevel}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Sabuk: -</span>
                  )}
                </div>
              </div>

              <div>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profil
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detail */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <h3 className="mb-6">Informasi Detail</h3>

            <div className="space-y-6">
              {/* Pribadi */}
              <div>
                <h4 className="text-sm text-gray-600 mb-4">Informasi Pribadi</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <User className="w-4 h-4" />
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={isEditing ? editData.fullName : profileData.fullName}
                      onChange={isEditing ? (e) => handleChange("fullName", e.target.value) : undefined}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none ${isEditing ? 'focus:ring-2 focus:ring-blue-500' : 'bg-gray-100 text-gray-700 cursor-not-allowed'}`}
                      disabled={!isEditing}
                    />
                  </div>

                  {/* Email (locked) */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email dikunci dan tidak bisa diubah di sini.</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <Phone className="w-4 h-4" />
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      value={isEditing ? editData.phone : profileData.phone}
                      onChange={isEditing ? (e) => handleChange("phone", e.target.value) : undefined}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none ${isEditing ? 'focus:ring-2 focus:ring-blue-500' : 'bg-gray-100 text-gray-700 cursor-not-allowed'}`}
                      disabled={!isEditing}
                      placeholder="Contoh: 08xxxxxxxxxx"
                    />
                  </div>

                  {/* Sabuk level */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <Shield className="w-4 h-4" />
                      Tingkat Sabuk
                    </label>
                    <input
                      type="text"
                      value={isEditing ? editData.sabukLevel : profileData.sabukLevel}
                      onChange={isEditing ? (e) => handleChange("sabukLevel", e.target.value) : undefined}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none ${isEditing ? 'focus:ring-2 focus:ring-blue-500' : 'bg-gray-100 text-gray-700 cursor-not-allowed'}`}
                      disabled={!isEditing}
                      placeholder="Contoh: Kuning / Hijau / Biru / Hitam"
                    />
                  </div>
                </div>
              </div>

              {/* Organisasi */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-sm text-gray-600 mb-4">Informasi Organisasi</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dojang */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <MapPin className="w-4 h-4" />
                      Dojang
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.dojang}
                        onChange={(e) => handleChange("dojang", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.dojang || "-"}</p>
                    )}
                  </div>

                  {/* Wilayah */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <MapPin className="w-4 h-4" />
                      Wilayah
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.wilayah}
                        onChange={(e) => handleChange("wilayah", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.wilayah || "-"}</p>
                    )}
                  </div>

                  {/* Role (read-only) */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <Shield className="w-4 h-4" />
                      Peran
                    </label>
                    <p className="text-gray-900">{profileData.roleLabel}</p>
                    <p className="text-xs text-gray-500 mt-1">Peran tidak dapat diubah</p>
                  </div>

                  {/* Certification date */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <Calendar className="w-4 h-4" />
                      Tanggal Sertifikasi (Opsional)
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editData.certificationDate}
                        onChange={(e) => handleChange("certificationDate", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.certificationDate || "-"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security (opsional UI) */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mt-6">
            <h3 className="mb-6">Keamanan Akun</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="mb-1">Kata Sandi</h4>
                  <p className="text-sm text-gray-600">Ubah kata sandi melalui fitur reset/change password.</p>
                </div>
                <button
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  onClick={() => onNavigate("change-password")}
                >
                  Ubah Password
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
