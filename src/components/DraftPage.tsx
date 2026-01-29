import { useEffect, useMemo, useState } from "react";
import { FileText, Trash2, Edit, Clock, Calendar, Menu, Search, RefreshCw, Plus } from "lucide-react";
import { PrivateSidebar } from "./PrivateSidebar";

import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/auth-context";

type DraftRow = {
  id: number;
  athlete_name: string | null;
  injury_date: string | null;
  activity_type: string | null;
  activity_type_other: string | null;
  activity_context: string | null;
  activity_context_other: string | null;
  injuries: Array<{ location: string; injuryType: string; mechanism: string }> | null;
  updated_at: string | null;
  created_at: string | null;
  status: "draft" | "submitted" | "verified" | "rejected" | string;
};

interface DraftPageProps {
  onNavigate: (page: string) => void;
  userRole?: "coach" | "regional" | "national";
  userName?: string;
  onLogout?: () => void;
}

function formatTimeHHMM(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatDateYMD(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso; // fallback kalau format sudah YMD
  return d.toISOString().split("T")[0];
}

function inferInjuryTitle(injuries: DraftRow["injuries"]) {
  if (!injuries || injuries.length === 0) return "Draft Laporan Cedera";
  const first = injuries[0];
  const loc = first?.location ? ` - ${first.location}` : "";
  const type = first?.injuryType ? first.injuryType : "Cedera";
  return `${type}${loc}`;
}

export function DraftPage({ onNavigate, onLogout }: Omit<DraftPageProps, "userName" | "userRole">) {
  const { user, loadingProfile, profile } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [query, setQuery] = useState("");

  // Get role from profile context
  const mappedRole = useMemo(() => {
    if (!profile?.role) return "pelatih";
    return profile.role;
  }, [profile?.role]);

  const handleLogout = () => {
    // ✅ bersihkan mode draft edit kalau logout
    sessionStorage.removeItem("iss_edit_draft_id");
    sessionStorage.removeItem("iss_edit_draft_mode");

    if (onLogout) onLogout();
    else onNavigate("logout");
  };

  const loadDrafts = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      if (!user?.id) {
        setDrafts([]);
        return;
      }

      // RLS: owner can read their own drafts
      const { data, error } = await supabase
        .from("injury_reports")
        .select("id, athlete_name, injury_date, activity_type, activity_type_other, activity_context, activity_context_other, injuries, updated_at, created_at, status")
        .eq("user_id", user.id)
        .eq("status", "draft")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setDrafts((data as DraftRow[]) ?? []);
    } catch (err) {
      if (err instanceof Error) setErrorMsg(err.message || "Gagal memuat draft.");
      else setErrorMsg("Gagal memuat draft.");
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loadingProfile) return;
    loadDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loadingProfile]);

  const filteredDrafts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return drafts;

    return drafts.filter((d) => {
      const name = (d.athlete_name ?? "").toLowerCase();
      const title = inferInjuryTitle(d.injuries).toLowerCase();
      const date = (d.injury_date ?? "").toLowerCase();
      return name.includes(q) || title.includes(q) || date.includes(q);
    });
  }, [drafts, query]);

  const handleCreateNew = () => {
    // ✅ pastikan tidak carry draft lama
    sessionStorage.removeItem("iss_edit_draft_id");
    sessionStorage.removeItem("iss_edit_draft_mode"); // ✅ penting
    onNavigate("input-cedera");
  };

  const handleEdit = (id: number) => {
    // ✅ set mode edit supaya InputCederaPage baru load draft kalau user klik "Lanjutkan"
    sessionStorage.setItem("iss_edit_draft_id", String(id));
    sessionStorage.setItem("iss_edit_draft_mode", "1");
    onNavigate("input-cedera");
  };

  const handleDelete = async (id: number) => {
    const ok = confirm("Apakah Anda yakin ingin menghapus draft ini?");
    if (!ok) return;

    setBusyId(id);
    setErrorMsg(null);

    try {
      // RLS: owner can delete ONLY draft own
      const { error } = await supabase.from("injury_reports").delete().eq("id", id);
      if (error) throw error;

      setDrafts((prev) => prev.filter((d) => d.id !== id));

      const current = sessionStorage.getItem("iss_edit_draft_id");
      if (current === String(id)) {
        sessionStorage.removeItem("iss_edit_draft_id");
        sessionStorage.removeItem("iss_edit_draft_mode");
      }
    } catch (err) {
      if (err instanceof Error) setErrorMsg(err.message || "Gagal menghapus draft.");
      else setErrorMsg("Gagal menghapus draft.");
    } finally {
      setBusyId(null);
    }
  };

  const disabledAll = loading || loadingProfile || !user;

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <PrivateSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={onNavigate}
        userRole={mappedRole}
        onLogout={handleLogout}
        currentPage="draft"
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900">
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl">Draft Laporan Cedera</h1>
                <p className="text-sm text-gray-600">Draft yang belum diajukan (status: draft)</p>
                {errorMsg && <p className="text-xs text-red-600 mt-1">{errorMsg}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadDrafts}
                disabled={disabledAll}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh"
                type="button"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={handleCreateNew}
                disabled={!user}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Buat Laporan Baru</span>
                <span className="sm:hidden">Baru</span>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 max-w-6xl mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari draft (nama atlet / jenis cedera / tanggal)..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={disabledAll}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600">Memuat draft...</p>
            </div>
          ) : filteredDrafts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-700 mb-2">{drafts.length === 0 ? "Belum Ada Draft" : "Draft tidak ditemukan"}</h3>
              <p className="text-gray-500 text-sm mb-6">
                {drafts.length === 0 ? "Draft muncul setelah Anda menekan Simpan Draft." : "Coba ubah kata kunci pencarian."}
              </p>
              <button
                onClick={handleCreateNew}
                disabled={!user}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                Mulai Input Laporan
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDrafts.map((draft) => {
                const title = inferInjuryTitle(draft.injuries);
                const savedDate = formatDateYMD(draft.injury_date || draft.created_at);
                const lastModified = formatTimeHHMM(draft.updated_at || draft.created_at);

                return (
                  <div key={draft.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <h3 className="text-gray-900">{title}</h3>
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                            Draft
                          </span>
                        </div>

                        <p className="text-gray-600 mb-3">Atlet: {draft.athlete_name || "-"}</p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{savedDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{lastModified}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(draft.id)}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={busyId === draft.id || !user}
                          type="button"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">Lanjutkan</span>
                        </button>

                        <button
                          onClick={() => handleDelete(draft.id)}
                          className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={busyId === draft.id || !user}
                          title="Hapus draft"
                          type="button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {busyId === draft.id && <p className="text-xs text-gray-500 mt-3">Memproses...</p>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>📝 Catatan:</strong> Sesuai aturan sistem, draft hanya bisa diedit/diubah saat status masih{" "}
              <em>draft</em>. Setelah <em>Ajukan</em> (status <em>submitted</em>), laporan terkunci dan menunggu proses
              review admin nasional.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
