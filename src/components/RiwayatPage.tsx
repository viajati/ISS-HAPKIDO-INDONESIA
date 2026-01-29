import { useEffect, useMemo, useState } from "react";
import { PrivateSidebar } from "./PrivateSidebar";
import {
  Menu,
  Filter,
  Search,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/auth-context";
import { ModalRingkasanData, LaporanData } from "./ModalRingkasanData";
import { fetchPelaporData, formatDateOnly } from "../lib/injury-helpers";

interface RiwayatPageProps {
  onNavigate: (page: string) => void;
  userRole?: "coach" | "regional" | "national";
  userName?: string;
  onLogout?: () => void;
}

type InjuryDetailDB = {
  location: string;
  injuryType: string;
  mechanism: string;
};

type InjuryReportRow = {
  id: number;
  user_id: string;
  athlete_name: string;
  gender: string;
  age: number;
  injury_date: string;
  activity_type: string;
  activity_type_other: string | null;
  activity_context: string;
  activity_context_other: string | null;
  injury_count: number;
  injuries: InjuryDetailDB[];
  movement_ability: string;
  pain_level: string;
  red_flags: string[];
  severity_level: string | null;
  status: "draft" | "submitted" | "verified" | "rejected";
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export function RiwayatPage({
  onNavigate,
  userRole: userRoleProp,
  onLogout,
}: Omit<RiwayatPageProps, "userName">) {
  const { user, loadingProfile, profile } = useAuth();

  // ✅ Derive userRole from profile instead of relying on prop
  const userRole: "coach" | "regional" | "national" = useMemo(() => {
    if (!profile?.role) return "coach";
    if (profile.role === "admin_nasional") return "national";
    if (profile.role === "admin_daerah") return "regional";
    return "coach";
  }, [profile?.role]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [rows, setRows] = useState<InjuryReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<"all" | "submitted" | "verified" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedData, setSelectedData] = useState<LaporanData | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Map profile.role to format expected by PrivateSidebar
  const mappedRole = useMemo(() => {
    if (!profile?.role) return "pelatih";
    return profile.role;
  }, [profile?.role]);

  // ✅ onLogout wajib function utk PrivateSidebar
  const handleLogout = () => {
    if (onLogout) onLogout();
    else onNavigate("logout");
  };

  const disabledAll = loadingProfile || !user;

  // ============
  // Helpers
  // ============
  const statusLabel = (r: InjuryReportRow) => {
    // diminta user: yang penting sudah diajukan
    // tapi label tetap informatif
    if (r.status === "verified" || r.verified_by) return "Terverifikasi";
    if (r.status === "rejected") return "Ditolak";
    return "Menunggu Verifikasi";
  };

  const activityLabel = (r: InjuryReportRow) => {
    const base = r.activity_type;
    const other = r.activity_type_other?.trim();
    return other ? `${base} (${other})` : base;
  };

  const contextLabel = (r: InjuryReportRow) => {
    const base = r.activity_context;
    const other = r.activity_context_other?.trim();
    return other ? `${base} (${other})` : base;
  };

  const displayMovement = (movement: string) => {
    // kalau kamu sudah pakai label final di InputCederaPage, ini akan tampil apa adanya.
    // tetap sediakan fallback untuk kode2 umum.
    const map: Record<string, string> = {
      able_to_move: "Masih bisa bergerak",
      limited: "Terbatas",
      unable_to_move: "Tidak bisa bergerak",
    };
    return map[movement] ?? movement;
  };

  const displayPain = (pain: string) => {
    const map: Record<string, string> = {
      mild: "Ringan (1–3/10)",
      moderate: "Sedang (4–7/10)",
      severe: "Berat (8–10/10)",
    };
    return map[pain] ?? pain;
  };

  const toModalData = async (r: InjuryReportRow): Promise<LaporanData> => {
    // Fetch pelapor data using unified helper
    const pelapor = await fetchPelaporData(r.user_id);
    
    return {
      id: String(r.id), // ✅ modal minta string
      namaAtlet: r.athlete_name,
      jenisKelamin: r.gender,
      usia: r.age,
      tanggalKejadian: r.injury_date,
      jenisAktivitas: activityLabel(r),
      konteks: contextLabel(r),
      cederaDetails: Array.isArray(r.injuries)
        ? r.injuries.map((i) => ({
            lokasi: i.location,
            jenis: i.injuryType,
            mekanisme: i.mechanism,
          }))
        : [],
      kemampuanGerak: displayMovement(r.movement_ability),
      tingkatNyeri: displayPain(r.pain_level),
      redFlags: Array.isArray(r.red_flags) ? r.red_flags : [],
      severityLevel: r.severity_level || undefined,
      status: statusLabel(r),
      tanggalLapor: formatDateOnly(r.created_at),
      tanggalVerifikasi: formatDateOnly(r.verified_at),
      verifikator: r.verified_by ?? undefined,
      pelapor,
    };
  };

  // ============
  // Fetch data
  // ============
  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("injury_reports")
        .select(
          "id,user_id,athlete_name,gender,age,injury_date,activity_type,activity_type_other,activity_context,activity_context_other,injury_count,injuries,movement_ability,pain_level,red_flags,severity_level,status,verified_by,verified_at,created_at,updated_at"
        )
        .eq("user_id", user.id)
        .neq("status", "draft") // ✅ semua yang sudah diajukan
        .order("updated_at", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        setRows([]);
        setErrorMsg(error.message);
      } else {
        setRows((data ?? []) as InjuryReportRow[]);
      }

      setLoading(false);
    })();
  }, [user?.id]);

  // ============
  // Filter + Search
  // ============
  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return rows.filter((r) => {
      const matchStatus = filterStatus === "all" ? true : r.status === filterStatus;

      const matchSearch =
        q === "" ||
        r.athlete_name.toLowerCase().includes(q) ||
        String(r.id).includes(q) ||
        (Array.isArray(r.injuries) && r.injuries.some((i) => i.location?.toLowerCase().includes(q)));

      return matchStatus && matchSearch;
    });
  }, [rows, searchQuery, filterStatus]);

  // Remove setCurrentPage from useEffect to avoid cascading renders
  // Instead, reset currentPage to 1 inside the event handlers for searchQuery and filterStatus changes
  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value as typeof filterStatus);
    setCurrentPage(1);
  };

  // ============
  // Pagination
  // ============
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRows = filteredRows.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  // ============
  // Stats (optional)
  // ============
  const stats = useMemo(() => {
    const total = rows.length;
    const submitted = rows.filter((r) => r.status === "submitted").length;
    const verified = rows.filter((r) => r.status === "verified").length;
    const rejected = rows.filter((r) => r.status === "rejected").length;
    return { total, submitted, verified, rejected };
  }, [rows]);

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <PrivateSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={onNavigate}
        currentPage="riwayat"
        userRole={mappedRole}
        onLogout={handleLogout}
      />

      {/* Header */}
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
                <h1 className="text-xl">Riwayat Laporan Cedera</h1>
                <p className="text-sm text-gray-600">
                  Menampilkan semua laporan yang sudah diajukan (bukan draft), terbaru di atas
                </p>
                {loading && <p className="text-xs text-gray-500 mt-1">Memuat data...</p>}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="p-4 md:p-6 lg:p-8">
        {/* Error banner (fix eslint unused) */}
        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Total Diajukan</p>
            <p className="text-2xl">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Menunggu</p>
            <p className="text-2xl text-yellow-600">{stats.submitted}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Terverifikasi</p>
            <p className="text-2xl text-green-600">{stats.verified}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Ditolak</p>
            <p className="text-2xl text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchQueryChange}
                  placeholder="Cari berdasarkan nama atlet, ID laporan, atau lokasi..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={disabledAll}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={handleFilterStatusChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={disabledAll}
              >
                <option value="all">Semua Status</option>
                <option value="submitted">Menunggu</option>
                <option value="verified">Terverifikasi</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Menampilkan <strong>{filteredRows.length}</strong> dari {stats.total} laporan
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Tanggal Kejadian</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Nama Atlet</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Cedera</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : currentRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada laporan
                    </td>
                  </tr>
                ) : (
                  currentRows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="font-mono text-blue-600">{r.id}</span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {r.injury_date}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">{r.athlete_name}</td>

                      <td className="px-6 py-4 text-sm text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800">
                          {r.injury_count}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            statusLabel(r) === "Terverifikasi"
                              ? "bg-green-100 text-green-800"
                              : statusLabel(r) === "Menunggu Verifikasi"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {statusLabel(r)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                          onClick={async () => {
                            const data = await toModalData(r);
                            setSelectedData(data);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          Lihat
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredRows.length > 0 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredRows.length)} dari{" "}
              {filteredRows.length} laporan
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

              <span className="text-sm text-gray-700">
                Halaman <strong>{currentPage}</strong> / {totalPages}
              </span>

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

      {/* Detail Modal */}
      {showDetailModal && selectedData && (
        <ModalRingkasanData
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          data={selectedData}
        />
      )}
    </div>
  );
}
