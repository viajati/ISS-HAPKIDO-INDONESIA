// ✅ FIX 1: join profiles returns ARRAY by default -> make DbRow.profiles an ARRAY (or pick first)
// ✅ FIX 2: PrivateSidebar in your project expects Omit<..., "userName"> -> remove userName prop

import { useEffect, useMemo, useState } from "react";
import { PrivateSidebar } from "./PrivateSidebar";
import {
  Menu,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  Activity,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { ModalRingkasanData } from "./ModalRingkasanData";

import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

interface MenungguVerifikasiProps {
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

  status: string;

  // ✅ IMPORTANT: join returns array
  profiles: ProfileJoin[] | null;
};

interface LaporanPending {
  id: string;
  tanggalLapor: string;
  tanggalKejadian: string;
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
  status: string;
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

function computeDerajatFromForm(movementAbility?: string | null, painLevel?: string | null, redFlags?: string[] | null) {
  const rf = Array.isArray(redFlags) ? redFlags : [];
  if (rf.length > 0 || movementAbility === "unable_to_move" || painLevel === "severe") return "Berat";
  if (movementAbility === "limited_movement" || painLevel === "moderate") return "Sedang";
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

function normalizeActivity(base?: string | null, other?: string | null) {
  const b = base ?? "";
  const o = (other ?? "").trim();
  return o ? `${b} (${o})` : b;
}

function firstProfile(profiles?: ProfileJoin[] | null): ProfileJoin | null {
  if (!profiles || profiles.length === 0) return null;
  return profiles[0];
}

function locationSummary(injuries?: DbRow["injuries"]) {
  const first = Array.isArray(injuries) && injuries.length > 0 ? injuries[0] : null;
  return first?.location ?? "-";
}
function typeSummary(injuries?: DbRow["injuries"]) {
  const first = Array.isArray(injuries) && injuries.length > 0 ? injuries[0] : null;
  return first?.injuryType ?? "-";
}

export function MenungguVerifikasi({ onNavigate }: MenungguVerifikasiProps) {
  const { user, loadingProfile } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDerajat, setFilterDerajat] = useState<string>("all");
  const [filterWilayah, setFilterWilayah] = useState<string>("all");

  const [selectedLaporan, setSelectedLaporan] = useState<LaporanPending | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [laporanPending, setLaporanPending] = useState<LaporanPending[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleLogout = () => {
    onNavigate("logout");
  };

  const loadPending = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      if (!user?.id) {
        setLaporanPending([]);
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
          status,
          profiles:profiles!injury_reports_user_id_fkey(
            full_name, role, wilayah, email
          )
        `
        )
        .eq("status", "submitted")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // ✅ FIX: data type mismatch -> convert via unknown, THEN DbRow[]
      const rows = ((data ?? []) as unknown) as DbRow[];

      const roleMap: Record<string, string> = {
        pelatih: "Pelatih",
        admin_daerah: "Admin Daerah",
        admin_nasional: "Admin Nasional",
      };

      const mapped: LaporanPending[] = rows.map((r) => {
        const p = firstProfile(r.profiles);

        const pelaporNama = p?.full_name ?? p?.email ?? "Pelapor";
        const pelaporWilayah = p?.wilayah ?? "-";
        const pelaporRoleLabel = p?.role ? roleMap[p.role] ?? p.role : "Pelatih";

        const tanggalKejadian = formatDateYMD(r.injury_date);
        const tanggalLapor = formatDateYMD(r.created_at);

        const derajat = computeDerajatFromForm(r.movement_ability, r.pain_level, r.red_flags);

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
          status: "Menunggu Verifikasi",
          cederaDetails,
          kemampuanGerak: mapKemampuanGerak(r.movement_ability),
          tingkatNyeri: mapNyeri(r.pain_level),
          redFlags: Array.isArray(r.red_flags) ? r.red_flags : [],
        };
      });

      setLaporanPending(mapped);
      setCurrentPage(1);
    } catch (err) {
      if (err instanceof Error) setErrorMsg(err.message || "Gagal memuat laporan pending.");
      else setErrorMsg("Gagal memuat laporan pending.");
      setLaporanPending([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loadingProfile) return;
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loadingProfile]);

  const wilayahOptions = useMemo(() => {
    const set = new Set<string>();
    laporanPending.forEach((l) => {
      const w = (l.pelapor.wilayah ?? "").trim();
      if (w && w !== "-") set.add(w);
    });
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b, "id-ID"))];
  }, [laporanPending]);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return laporanPending.filter((laporan) => {
      const matchSearch =
        !q ||
        laporan.id.toLowerCase().includes(q) ||
        laporan.pelapor.nama.toLowerCase().includes(q) ||
        laporan.atlet.nama.toLowerCase().includes(q) ||
        laporan.pelapor.wilayah.toLowerCase().includes(q);

      const matchDerajat = filterDerajat === "all" || laporan.cedera.derajat === filterDerajat;
      const matchWilayah = filterWilayah === "all" || laporan.pelapor.wilayah === filterWilayah;

      return matchSearch && matchDerajat && matchWilayah;
    });
  }, [laporanPending, searchQuery, filterDerajat, filterWilayah]);

  const handleApprove = async (id: string) => {
    const ok = confirm(
      "Apakah Anda yakin ingin menyetujui laporan ini?\n\nLaporan yang disetujui akan masuk ke data agregat sistem."
    );
    if (!ok) return;

    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from("injury_reports")
        .update({
          status: "verified",
          verified_by: user?.id ?? null,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", Number(id))
        .eq("status", "submitted");

      if (error) throw error;

      setLaporanPending((prev) => prev.filter((item) => item.id !== id));
      setShowDetailModal(false);
      alert("✅ Laporan berhasil diverifikasi!");
    } catch (err) {
      if (err instanceof Error) setErrorMsg(err.message || "Gagal memverifikasi laporan.");
      else setErrorMsg("Gagal memverifikasi laporan.");
    }
  };

  // ✅ reject langsung, tanpa alasan
  const handleReject = async (id: string) => {
    const ok = confirm("Apakah Anda yakin ingin menolak laporan ini?");
    if (!ok) return;

    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from("injury_reports")
        .update({
          status: "rejected",
          verified_by: user?.id ?? null,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", Number(id))
        .eq("status", "submitted");

      if (error) throw error;

      setLaporanPending((prev) => prev.filter((item) => item.id !== id));
      setShowDetailModal(false);
      alert("❌ Laporan ditolak.");
    } catch (err) {
      if (err instanceof Error) setErrorMsg(err.message || "Gagal menolak laporan.");
      else setErrorMsg("Gagal menolak laporan.");
    }
  };

  const viewDetail = (laporan: LaporanPending) => {
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

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    const next = Math.min(Math.max(1, pageNumber), Math.max(1, totalPages));
    setCurrentPage(next);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDerajat, filterWilayah]);

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <PrivateSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={onNavigate}
        onLogout={handleLogout}
        currentPage="menunggu-verifikasi"
        userRole="admin_nasional"
        // ✅ FIX: remove userName prop (your component type omits it)
      />

      {/* Header */}
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
                <h1 className="text-xl">Menunggu Verifikasi</h1>
                <p className="text-sm text-gray-600">Verifikasi laporan cedera (status: submitted)</p>
                {errorMsg && <p className="text-xs text-red-600 mt-1">{errorMsg}</p>}
                {loading && <p className="text-xs text-gray-500 mt-1">Memuat data...</p>}
              </div>
            </div>

            <button
              onClick={loadPending}
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
        {/* Stats Cards */}
        <div className="max-w-sm mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Total Pending</h3>
              <Activity className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl text-yellow-600">{laporanPending.length}</p>
            <p className="text-xs text-gray-500 mt-1">Menunggu verifikasi</p>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari berdasarkan ID, nama pelapor, nama atlet, atau wilayah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-600" />

              <select
                value={filterDerajat}
                onChange={(e) => setFilterDerajat(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title="Filter Derajat"
              >
                <option value="all">Semua Derajat</option>
                <option value="Ringan">Ringan</option>
                <option value="Sedang">Sedang</option>
                <option value="Berat">Berat</option>
              </select>

              <select
                value={filterWilayah}
                onChange={(e) => setFilterWilayah(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title="Filter Wilayah"
              >
                {wilayahOptions.map((w) => (
                  <option key={w} value={w}>
                    {w === "all" ? "Semua Wilayah" : w}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Pelapor</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Atlet</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Cedera</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Derajat</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {loading ? "Memuat..." : "Tidak ada laporan yang menunggu verifikasi"}
                    </td>
                  </tr>
                ) : (
                  currentItems.map((laporan) => (
                    <tr key={laporan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm">{laporan.id}</span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{laporan.tanggalKejadian}</div>
                        <div className="text-xs text-gray-500">Lapor: {laporan.tanggalLapor}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{laporan.pelapor.nama}</div>
                        <div className="text-xs text-gray-500">{laporan.pelapor.wilayah}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{laporan.atlet.nama}</div>
                        <div className="text-xs text-gray-500">
                          {laporan.atlet.jenisKelamin}, {laporan.atlet.umur} tahun
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{laporan.cedera.lokasi}</div>
                        <div className="text-xs text-gray-500">{laporan.cedera.jenis}</div>
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewDetail(laporan)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleApprove(laporan.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Setujui"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>

                          {/* ✅ SAME handler as modal */}
                          <button
                            onClick={() => handleReject(laporan.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Tolak"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} dari{" "}
              {filteredData.length} laporan
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          currentPage === page ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
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
                  currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal Ringkasan Data */}
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
          pelapor: selectedLaporan?.pelapor,
          status: selectedLaporan?.status,
          tanggalLapor: selectedLaporan?.tanggalLapor,
        }}
      />

      {/* Floating actions when modal open */}
      {showDetailModal && selectedLaporan && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[60] flex gap-3">
          <button
            onClick={() => handleApprove(selectedLaporan.id)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            <CheckCircle className="w-5 h-5" />
            Setujui
          </button>

          {/* ✅ SAME handler as table */}
          <button
            onClick={() => handleReject(selectedLaporan.id)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
          >
            <XCircle className="w-5 h-5" />
            Tolak
          </button>
        </div>
      )}
    </div>
  );
}
