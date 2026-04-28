import { useEffect, useMemo, useState } from "react";
import { PrivateSidebar } from "./PrivateSidebar";
import {
  Menu,
  Search,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Activity,
  MapPin,
  RefreshCw,
  Undo2,
  Trash2,
} from "lucide-react";
import { ModalRingkasanData } from "./ModalRingkasanData";
import { toast } from "sonner";

import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/auth-context";

interface SudahVerifikasiProps {
  onNavigate: (page: string) => void;
}

type ProfileJoin = {
  full_name: string;
  role: "pelatih" | "admin_daerah" | "admin_nasional" | string;
  wilayah: string | null;
  email?: string | null;
};

type DbRow = {
  id: number;
  created_at: string | null;
  updated_at: string | null;

  user_id: string;

  athlete_name: string | null;
  gender: string | null;
  age: number | null;
  injury_date: string | null;

  activity_type: string | null;
  activity_type_other: string | null;
  activity_context: string | null;
  activity_context_other: string | null;

  injuries: Array<{ location: string; injuryType: string; mechanism: string }> | null;

  movement_ability: string | null;
  pain_level: string | null;
  red_flags: string[] | null;
  severity_level: string | null;

  status: "verified" | "rejected" | string;
  verified_by: string | null;
  verified_at: string | null;

  profiles: ProfileJoin | ProfileJoin[] | null;
};

interface LaporanVerified {
  id: string;
  tanggalLapor: string;
  tanggalKejadian: string;
  tanggalVerifikasi: string;

  pelapor: {
    nama: string;
    role: string;
    wilayah: string;
  };

  atlet: {
    nama: string;
    umur: number;
    jenisKelamin: string;
  };

  cedera: {
    lokasi: string;
    jenis: string;
    derajat: string;
  };

  kegiatan: {
    jenis: string;
    konteks: string;
  };

  verifikator: string;
  status: "Terverifikasi" | "Ditolak";

  cederaDetails?: Array<{
    lokasi: string;
    jenis: string;
    mekanisme: string;
  }>;
  kemampuanGerak?: string;
  tingkatNyeri?: string;
  redFlags?: string[];
}

function formatDateYMD(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().split("T")[0];
}

function normalizeActivity(base?: string | null, other?: string | null) {
  const b = base ?? "";
  const o = (other ?? "").trim();
  return o ? `${b} (${o})` : b;
}

function firstProfile(p?: ProfileJoin | ProfileJoin[] | null): ProfileJoin | null {
  if (!p) return null;
  if (Array.isArray(p)) return p[0] ?? null;
  return p;
}

function computeDerajatFromForm(
  movementAbility?: string | null,
  painLevel?: string | null,
  redFlags?: string[] | null
) {
  const rf = Array.isArray(redFlags) ? redFlags : [];
  if (
    rf.length > 0 ||
    movementAbility === "unable_to_move" ||
    painLevel === "severe"
  ) {
    return "Berat";
  }
  if (movementAbility === "limited_movement" || painLevel === "moderate") {
    return "Sedang";
  }
  return "Ringan";
}

function mapKemampuanGerak(val?: string | null) {
  const map: Record<string, string> = {
    free_movement: "Bisa bergerak bebas",
    limited_movement: "Gerak terbatas",
    unable_to_move: "Tidak bisa bergerak",
  };
  if (!val) return "-";
  return map[val] ?? val;
}

function mapNyeri(val?: string | null) {
  const map: Record<string, string> = {
    mild: "Ringan (1–3/10)",
    moderate: "Sedang (4–7/10)",
    severe: "Berat (8–10/10)",
  };
  if (!val) return "-";
  return map[val] ?? val;
}

function locationSummary(injuries?: DbRow["injuries"]) {
  const first = Array.isArray(injuries) && injuries.length > 0 ? injuries[0] : null;
  return first?.location ?? "-";
}

function typeSummary(injuries?: DbRow["injuries"]) {
  const first = Array.isArray(injuries) && injuries.length > 0 ? injuries[0] : null;
  return first?.injuryType ?? "-";
}

export function SudahVerifikasi({ onNavigate }: SudahVerifikasiProps) {
  const { user, loadingProfile, profile } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDerajat, setFilterDerajat] = useState<string>("all");
  const [filterWilayah, setFilterWilayah] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [selectedLaporan, setSelectedLaporan] = useState<LaporanVerified | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [rows, setRows] = useState<LaporanVerified[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleLogout = () => onNavigate("logout");

  useEffect(() => {
    if (loadingProfile) return;

    if (!profile) {
      toast.error("Anda harus login terlebih dahulu");
      onNavigate("login");
      return;
    }

    if (profile.role !== "admin_nasional") {
      toast.error("Akses ditolak. Halaman ini hanya untuk Admin Nasional.");
      onNavigate("dashboard");
      return;
    }
  }, [loadingProfile, profile, onNavigate]);

  const loadReviewed = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      if (!user?.id) {
        setRows([]);
        return;
      }

      const { data, error } = await supabase
        .from("injury_reports")
        .select(
          `
          id, created_at, updated_at,
          user_id,
          athlete_name, gender, age, injury_date,
          activity_type, activity_type_other,
          activity_context, activity_context_other,
          injuries, movement_ability, pain_level, red_flags,
          severity_level,
          status, verified_by, verified_at,
          profiles:profiles!injury_reports_user_id_fkey!inner(full_name, role, wilayah, email)
        `
        )
        .in("status", ["verified", "rejected"])
        .order("verified_at", { ascending: false, nullsFirst: false })
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const dbRows = (data ?? []) as unknown as DbRow[];

      const roleMap: Record<string, string> = {
        pelatih: "Pelatih",
        admin_daerah: "Admin Daerah",
        admin_nasional: "Admin Nasional",
      };

      const mapped: LaporanVerified[] = dbRows.map((r) => {
        const p = firstProfile(r.profiles);

        const pelaporNama = p?.full_name ?? p?.email ?? "Pelapor";
        const pelaporWilayah = p?.wilayah ?? "-";
        const pelaporRoleLabel = p?.role ? roleMap[p.role] ?? p.role : "Pelatih";

        const tanggalKejadian = formatDateYMD(r.injury_date);
        const tanggalLapor = formatDateYMD(r.created_at);
        const tanggalVerifikasi = formatDateYMD(r.verified_at ?? r.updated_at);

        const derajat = r.severity_level
          ? r.severity_level === "ringan"
            ? "Ringan"
            : r.severity_level === "sedang"
            ? "Sedang"
            : "Berat"
          : computeDerajatFromForm(r.movement_ability, r.pain_level, r.red_flags);

        const cederaDetails =
          Array.isArray(r.injuries) && r.injuries.length > 0
            ? r.injuries.map((i) => ({
                lokasi: i.location,
                jenis: i.injuryType,
                mekanisme: i.mechanism,
              }))
            : [];

        return {
          id: String(r.id),
          tanggalLapor,
          tanggalKejadian,
          tanggalVerifikasi,
          pelapor: {
            nama: pelaporNama,
            role: pelaporRoleLabel,
            wilayah: pelaporWilayah,
          },
          atlet: {
            nama: r.athlete_name ?? "-",
            umur: typeof r.age === "number" ? r.age : 0,
            jenisKelamin: r.gender ?? "-",
          },
          cedera: {
            lokasi: locationSummary(r.injuries),
            jenis: typeSummary(r.injuries),
            derajat,
          },
          kegiatan: {
            jenis: normalizeActivity(r.activity_type, r.activity_type_other),
            konteks: normalizeActivity(r.activity_context, r.activity_context_other),
          },
          verifikator: "Admin Nasional",
          status: r.status === "verified" ? "Terverifikasi" : "Ditolak",
          cederaDetails,
          kemampuanGerak: mapKemampuanGerak(r.movement_ability),
          tingkatNyeri: mapNyeri(r.pain_level),
          redFlags: Array.isArray(r.red_flags) ? r.red_flags : [],
        };
      });

      setRows(mapped);
      setCurrentPage(1);
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message || "Gagal memuat laporan yang sudah diproses.");
      } else {
        setErrorMsg("Gagal memuat laporan yang sudah diproses.");
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loadingProfile) return;
    loadReviewed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loadingProfile]);

  const wilayahOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((l) => {
      const w = (l.pelapor.wilayah ?? "").trim();
      if (w && w !== "-") set.add(w);
    });
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b, "id-ID"))];
  }, [rows]);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return rows.filter((laporan) => {
      const matchSearch =
        !q ||
        laporan.id.toLowerCase().includes(q) ||
        laporan.pelapor.nama.toLowerCase().includes(q) ||
        laporan.atlet.nama.toLowerCase().includes(q) ||
        laporan.pelapor.wilayah.toLowerCase().includes(q);

      const matchDerajat =
        filterDerajat === "all" || laporan.cedera.derajat === filterDerajat;

      const matchWilayah =
        filterWilayah === "all" || laporan.pelapor.wilayah === filterWilayah;

      const statusRaw = laporan.status === "Terverifikasi" ? "verified" : "rejected";
      const matchStatus = filterStatus === "all" || statusRaw === filterStatus;

      return matchSearch && matchDerajat && matchWilayah && matchStatus;
    });
  }, [rows, searchQuery, filterDerajat, filterWilayah, filterStatus]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    const next = Math.min(Math.max(1, page), Math.max(1, totalPages));
    setCurrentPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const viewDetail = (laporan: LaporanVerified) => {
    setSelectedLaporan(laporan);
    setShowDetailModal(true);
  };

  const getDerajatColor = (derajat: string) => {
    switch (derajat) {
      case "Ringan":
        return "bg-green-100 text-green-700 border-green-300";
      case "Sedang":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Berat":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusBadge = (status: "Terverifikasi" | "Ditolak") => {
    if (status === "Terverifikasi") {
      return "bg-green-100 text-green-700 border-green-300";
    }
    return "bg-red-100 text-red-700 border-red-300";
  };

  const handleUndo = async (id: string) => {
    const ok = confirm(
      "Kembalikan laporan ini ke status Menunggu Verifikasi (submitted) untuk verifikasi ulang?"
    );
    if (!ok) return;

    setBusyId(id);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from("injury_reports")
        .update({
          status: "submitted",
          verified_by: null,
          verified_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", Number(id));

      if (error) throw error;

      setRows((prev) => prev.filter((x) => x.id !== id));

      if (selectedLaporan?.id === id) {
        setShowDetailModal(false);
        setSelectedLaporan(null);
      }

      alert("↩️ Berhasil dikembalikan ke Menunggu Verifikasi.");
    } catch (err) {
      if (err instanceof Error) setErrorMsg(err.message || "Gagal undo.");
      else setErrorMsg("Gagal undo.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = confirm(
      "Yakin ingin menghapus laporan ini secara permanen? Data akan hilang dari database dan tidak muncul lagi di CSV."
    );
    if (!ok) return;

    setBusyId(id);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/verify-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          report_id: Number(id),
          action: "delete",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Gagal menghapus laporan.");
      }

      setRows((prev) => prev.filter((x) => x.id !== id));

      if (selectedLaporan?.id === id) {
        setShowDetailModal(false);
        setSelectedLaporan(null);
      }

      alert("Laporan berhasil dihapus permanen.");
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message || "Gagal menghapus laporan.");
      } else {
        setErrorMsg("Gagal menghapus laporan.");
      }
    } finally {
      setBusyId(null);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDerajat, filterWilayah, filterStatus]);

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile || profile.role !== "admin_nasional") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <PrivateSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={onNavigate}
        onLogout={handleLogout}
        currentPage="sudah-verifikasi"
        userRole="admin_nasional"
      />

      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div>
                <h1 className="text-xl">Sudah Diproses Admin</h1>
                <p className="text-sm text-gray-600">
                  Daftar laporan yang sudah diverifikasi / ditolak (status:
                  verified/rejected)
                </p>
                {errorMsg && <p className="text-xs text-red-600 mt-1">{errorMsg}</p>}
                {loading && <p className="text-xs text-gray-500 mt-1">Memuat data...</p>}
              </div>
            </div>

            <button
              onClick={loadReviewed}
              disabled={loadingProfile || !user || loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-sm mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Total Diproses</h3>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl text-blue-600">{rows.length}</p>
            <p className="text-xs text-gray-500 mt-1">Verified + Rejected</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari ID, pelapor, atlet, atau wilayah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  value={filterDerajat}
                  onChange={(e) => setFilterDerajat(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Semua Derajat</option>
                  <option value="Ringan">Ringan</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Berat">Berat</option>
                </select>
              </div>

              <div className="flex items-center gap-2 flex-1">
                <MapPin className="w-5 h-5 text-gray-600" />
                <select
                  value={filterWilayah}
                  onChange={(e) => setFilterWilayah(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {wilayahOptions.map((w) => (
                    <option key={w} value={w}>
                      {w === "all" ? "Semua Wilayah" : w}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 flex-1">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  title="Filter Status"
                >
                  <option value="all">Semua Status</option>
                  <option value="verified">Terverifikasi</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Tgl Kejadian
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Pelapor
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Atlet
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Cedera
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Derajat
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Tgl Proses
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      {loading
                        ? "Memuat..."
                        : searchQuery ||
                          filterDerajat !== "all" ||
                          filterWilayah !== "all" ||
                          filterStatus !== "all"
                        ? "Tidak ada data yang sesuai filter"
                        : "Belum ada laporan yang diproses"}
                    </td>
                  </tr>
                ) : (
                  currentData.map((laporan) => (
                    <tr key={laporan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span className="font-mono text-blue-600">{laporan.id}</span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 rounded-full border ${getStatusBadge(
                            laporan.status
                          )}`}
                        >
                          {laporan.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {laporan.tanggalKejadian}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {laporan.pelapor.nama}
                        </div>
                        <div className="text-xs text-gray-500">
                          {laporan.pelapor.wilayah}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {laporan.atlet.nama}
                        </div>
                        <div className="text-xs text-gray-500">
                          {laporan.atlet.jenisKelamin}, {laporan.atlet.umur} tahun
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {laporan.cedera.lokasi}
                        </div>
                        <div className="text-xs text-gray-500">
                          {laporan.cedera.jenis}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 rounded-full border ${getDerajatColor(
                            laporan.cedera.derajat
                          )}`}
                        >
                          {laporan.cedera.derajat}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {laporan.tanggalVerifikasi}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewDetail(laporan)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleUndo(laporan.id)}
                            disabled={busyId === laporan.id}
                            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Undo (kembalikan ke Menunggu Verifikasi)"
                          >
                            <Undo2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(laporan.id)}
                            disabled={busyId === laporan.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Hapus permanen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {busyId === laporan.id && (
                          <p className="text-xs text-gray-500 mt-2">Memproses...</p>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Menampilkan {startIndex + 1} -{" "}
              {Math.min(endIndex, filteredData.length)} dari {filteredData.length}{" "}
              laporan
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }

                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }

                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>

      <ModalRingkasanData
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        data={{
          id: selectedLaporan?.id || "",
          namaAtlet: selectedLaporan?.atlet.nama || "",
          jenisKelamin: selectedLaporan?.atlet.jenisKelamin || "",
          usia: selectedLaporan?.atlet.umur || 0,
          tanggalKejadian: selectedLaporan?.tanggalKejadian || "",
          jenisAktivitas: selectedLaporan?.kegiatan.jenis || "",
          konteks: selectedLaporan?.kegiatan.konteks || "",
          cederaDetails: selectedLaporan?.cederaDetails || [],
          kemampuanGerak: selectedLaporan?.kemampuanGerak || "",
          tingkatNyeri: selectedLaporan?.tingkatNyeri || "",
          redFlags: selectedLaporan?.redFlags || [],
          severityLevel: selectedLaporan?.cedera.derajat.toLowerCase() || undefined,
          pelapor: selectedLaporan?.pelapor || { nama: "-", wilayah: "-" },
          status: selectedLaporan?.status,
          tanggalLapor: selectedLaporan?.tanggalLapor,
          tanggalVerifikasi: selectedLaporan?.tanggalVerifikasi,
          verifikator: selectedLaporan?.verifikator,
        }}
      />

      {showDetailModal && selectedLaporan && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[60] flex gap-3">
          <button
            onClick={() => handleUndo(selectedLaporan.id)}
            disabled={busyId === selectedLaporan.id}
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Undo2 className="w-5 h-5" />
            Undo
          </button>

          <button
            onClick={() => handleDelete(selectedLaporan.id)}
            disabled={busyId === selectedLaporan.id}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-5 h-5" />
            Hapus Permanen
          </button>
        </div>
      )}
    </div>
  );
}
