import { useEffect, useMemo, useState } from "react";
import { PrivateSidebar } from "./PrivateSidebar";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/auth-context";
import {
  Menu,
  Users,
  Activity,
  Shield,
  MapPin,
  Download,
  CheckSquare,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

interface DashboardNationalProps {
  onNavigate: (page: string) => void;
}

type Hero = {
  total_cedera: number;
  total_atlet: number;
  total_pelatih: number;
  total_pengurus: number;
};

type MonthlyItem = { month: string; total: number; percentage: number };
type LokasiItem = { lokasi: string; count: number; percentage: number };
type JenisItem = { jenis: string; count: number; percentage: number };
type DerajatItem = { derajat: string; count: number; percentage: number };

type DashboardPayload = {
  hero: Hero;
  monthly: MonthlyItem[];
  lokasi: LokasiItem[];
  jenis: JenisItem[];
  derajat: DerajatItem[];
};

const num = (x: any, fallback = 0) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeDerajat = (s: string) => (s || "").trim().toLowerCase();

const derajatOrder = (label: string) => {
  const v = normalizeDerajat(label);
  if (v.includes("ringan")) return 1;
  if (v.includes("sedang")) return 2;
  if (v.includes("berat")) return 3;
  return 99; // Lainnya
};

export function DashboardNational({ onNavigate }: DashboardNationalProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { profile, loadingProfile } = useAuth();

  const [loadingDash, setLoadingDash] = useState(true);
  const [dash, setDash] = useState<DashboardPayload | null>(null);

  const handleLogout = () => onNavigate("logout");
  const isAdminNasional = useMemo(() => profile?.role === "admin_nasional", [profile]);

  useEffect(() => {
    if (loadingProfile) return;
    if (!profile) return;

    if (!isAdminNasional) {
      toast.error("Akses ditolak. Halaman ini hanya untuk Admin Nasional.");
      onNavigate("dashboard");
      return;
    }

    let alive = true;

    (async () => {
      setLoadingDash(true);
      try {
        const { data, error } = await (supabase.rpc as any)("dashboard_national_summary", {
          p_months: 3,
        });

        if (error) throw error;
        if (!alive) return;

        const hero: Hero = {
          total_cedera: num(data?.hero?.total_cedera),
          total_atlet: num(data?.hero?.total_atlet),
          total_pelatih: num(data?.hero?.total_pelatih),
          total_pengurus: num(data?.hero?.total_pengurus),
        };

        const monthly: MonthlyItem[] = Array.isArray(data?.monthly)
          ? data.monthly.map((x: any) => ({
              month: String(x.month ?? ""),
              total: num(x.total),
              percentage: num(x.percentage),
            }))
          : [];

        const lokasi: LokasiItem[] = Array.isArray(data?.lokasi)
          ? data.lokasi.map((x: any) => ({
              lokasi: String(x.lokasi ?? "Lainnya"),
              count: num(x.count),
              percentage: num(x.percentage),
            }))
          : [];

        const jenis: JenisItem[] = Array.isArray(data?.jenis)
          ? data.jenis.map((x: any) => ({
              jenis: String(x.jenis ?? "Lainnya"),
              count: num(x.count),
              percentage: num(x.percentage),
            }))
          : [];

        // ✅ derajat sekarang dianggap "severity level" dari backend (severity_level)
        const derajatRaw: DerajatItem[] = Array.isArray(data?.derajat)
          ? data.derajat.map((x: any) => ({
              derajat: String(x.derajat ?? "Lainnya"),
              count: num(x.count),
              percentage: num(x.percentage),
            }))
          : [];

        // ✅ sort biar urut: Ringan -> Sedang -> Berat -> Lainnya
        const derajat = derajatRaw.sort((a, b) => derajatOrder(a.derajat) - derajatOrder(b.derajat));

        setDash({ hero, monthly, lokasi, jenis, derajat });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Gagal memuat dashboard.";
        toast.error(`Gagal memuat dashboard: ${msg}`);
        setDash(null);
      } finally {
        if (alive) setLoadingDash(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [loadingProfile, profile, isAdminNasional, onNavigate]);

  const heroMetrics = {
    totalCedera: dash?.hero?.total_cedera ?? 0,
    totalAtlet: dash?.hero?.total_atlet ?? 0,
    totalPelatih: dash?.hero?.total_pelatih ?? 0,
    totalPengurus: dash?.hero?.total_pengurus ?? 0,
  };

  const monthlyData = dash?.monthly ?? [];
  const lokasiData = dash?.lokasi ?? [];
  const jenisData = dash?.jenis ?? [];

  const derajatData = (dash?.derajat ?? []).map((d) => {
    const v = normalizeDerajat(d.derajat);
    const color = v.includes("ringan")
      ? "green"
      : v.includes("sedang")
      ? "yellow"
      : v.includes("berat")
      ? "red"
      : "gray";
    return { ...d, color };
  });

  if (loadingProfile || loadingDash) {
    return (
      <div className="min-h-screen bg-gray-50 lg:pl-64">
        <PrivateSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNavigate={onNavigate}
          onLogout={handleLogout}
          currentPage="dashboard-national"
          userRole="admin_nasional"
        />

        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden text-gray-600 hover:text-gray-900"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-xl">Dashboard Admin Nasional</h1>
                  <p className="text-sm text-gray-600">Memuat data...</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          {/* Skeleton loading cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <PrivateSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={onNavigate}
        onLogout={handleLogout}
        currentPage="dashboard-national"
        userRole="admin_nasional"
      />

      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl">Dashboard Admin Nasional</h1>
                <p className="text-sm text-gray-600">Ringkasan Kondisi ISS Nasional</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm">{profile?.full_name || 'Admin Nasional'}</p>
                <p className="text-xs text-gray-600">{profile?.wilayah || 'Indonesia'}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 lg:p-8">
        {/* Hero Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Total Cedera</h3>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl">{heroMetrics.totalCedera}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Total Atlet</h3>
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl text-green-600">{heroMetrics.totalAtlet}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Total Pelatih</h3>
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl text-purple-600">{heroMetrics.totalPelatih}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Total Pengurus Daerah</h3>
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl text-orange-600">{heroMetrics.totalPengurus}</p>
          </div>
        </div>

        {/* Visualisasi */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2>Visualisasi Data 3 Bulan Terakhir</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="mb-4 text-gray-900">Jumlah & Persentase Cedera per Bulan</h3>
                <div className="space-y-3">
                  {monthlyData.length === 0 ? (
                    <p className="text-sm text-gray-600">Belum ada data.</p>
                  ) : (
                    monthlyData.map((item, index) => {
                      const maxTotal = Math.max(...monthlyData.map((d) => d.total), 1);
                      const widthPercentage = (item.total / maxTotal) * 100;

                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">{item.month}</span>
                            <span className="text-sm">
                              {item.total}{" "}
                              <span className="text-gray-500">({item.percentage}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-blue-600 h-3 rounded-full"
                              style={{ width: `${widthPercentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Lokasi */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="mb-4 text-gray-900">Distribusi Lokasi Cedera</h3>
                <div className="space-y-3">
                  {lokasiData.length === 0 ? (
                    <p className="text-sm text-gray-600">Belum ada data.</p>
                  ) : (
                    lokasiData.map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{item.lokasi}</span>
                          <span className="text-xs text-gray-600">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-teal-600 h-3 rounded-full"
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Jenis */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="mb-4 text-gray-900">Distribusi Jenis Cedera</h3>
                <div className="space-y-3">
                  {jenisData.length === 0 ? (
                    <p className="text-sm text-gray-600">Belum ada data.</p>
                  ) : (
                    jenisData.map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{item.jenis}</span>
                          <span className="text-xs text-gray-600">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-purple-600 h-3 rounded-full"
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Derajat / Severity */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="mb-1 text-gray-900">Distribusi Derajat Cedera</h3>

                <div className="space-y-3">
                  {derajatData.length === 0 ? (
                    <p className="text-sm text-gray-600">Belum ada data.</p>
                  ) : (
                    derajatData.map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{item.derajat}</span>
                          <span className="text-xs text-gray-600">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={
                              item.color === "green"
                                ? "bg-green-600 h-3 rounded-full"
                                : item.color === "yellow"
                                ? "bg-yellow-500 h-3 rounded-full"
                                : item.color === "red"
                                ? "bg-red-600 h-3 rounded-full"
                                : "bg-gray-500 h-3 rounded-full"
                            }
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="mb-6">Aksi Cepat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => onNavigate("menunggu-verifikasi")}
              className="flex flex-col items-center gap-3 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <CheckSquare className="w-8 h-8 text-yellow-600" />
              <span className="text-sm font-medium text-gray-900">Verifikasi Laporan</span>
            </button>

            <button
              onClick={() => onNavigate("visualisasi-data")}
              className="flex flex-col items-center gap-3 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Visualisasi Data</span>
            </button>

            <button
              onClick={() => onNavigate("download-center")}
              className="flex flex-col items-center gap-3 p-6 bg-teal-50 border-2 border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <Download className="w-8 h-8 text-teal-600" />
              <span className="text-sm font-medium text-gray-900">Download Data</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
