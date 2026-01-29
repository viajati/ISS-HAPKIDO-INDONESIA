import { useEffect, useMemo, useState } from "react";
import { PrivateSidebar } from "./PrivateSidebar";
import { supabase } from "../lib/supabase"; // pastikan path sesuai punyamu
import { useAuth } from "../contexts/auth-context";
import { toast } from "sonner";
import { Menu, Key, Calendar, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";

type Role = "pelatih" | "admin_daerah" | "admin_nasional";
type TokenStatus = "active" | "expired" | "used";

type TokenGeneratorProps = {
  onNavigate: (page: string) => void;
};

type ApiTokenRow = {
  id: number;
  token: string;
  role: Role;
  status: TokenStatus;
  created_by: string;
  created_at: string;
  expires_at: string;
};

type ApiGetResponse = {
  tokens?: ApiTokenRow[];
  activeByRole?: Partial<Record<Role, ApiTokenRow | null>>;
  error?: string;
};

type ApiPostResponse = {
  ok?: boolean;
  token?: string;
  validUntil?: string;
  createdAt?: string;
  createdBy?: string;
  status?: TokenStatus;
  role?: Role;
  id?: number;
  error?: string;
};

type GeneratedToken = {
  id: string;
  token: string;
  validUntil: string; // YYYY-MM-DD
  generatedAt: string; // YYYY-MM-DD
  generatedBy: string; // UUID
  status: TokenStatus;
  role: Role;
};

const formatDateOnly = (iso?: string) => (typeof iso === "string" ? iso.split("T")[0] : "");

const mapRow = (t: ApiTokenRow): GeneratedToken => ({
  id: String(t.id ?? ""),
  token: String(t.token ?? ""),
  role: t.role,
  status: t.status,
  generatedBy: String(t.created_by ?? ""),
  generatedAt: formatDateOnly(t.created_at),
  validUntil: formatDateOnly(t.expires_at),
});

const roleLabel = (r: Role) =>
  r === "pelatih" ? "Pelatih" : r === "admin_daerah" ? "Admin Daerah" : "Admin Nasional";

const statusLabel = (s: TokenStatus) => (s === "active" ? "Aktif" : s === "used" ? "Used" : "Expired");

async function getAccessToken(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.access_token ?? null;
}

async function authedFetch(input: RequestInfo | URL, init?: RequestInit) {
  const token = await getAccessToken();
  const headers = new Headers(init?.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");
  return fetch(input, { ...init, headers });
}

function TokenGenerator({ onNavigate }: TokenGeneratorProps) {
  const { user, profile, loadingProfile } = useAuth();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tokenValidDays, setTokenValidDays] = useState(7);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [role, setRole] = useState<Role>("pelatih");
  const [loading, setLoading] = useState(false);

  const [tokenHistory, setTokenHistory] = useState<GeneratedToken[]>([]);
  const [activeByRole, setActiveByRole] = useState<Record<Role, GeneratedToken | null>>({
    pelatih: null,
    admin_daerah: null,
    admin_nasional: null,
  });

  const itemsPerPage = 10;

  const roleCards = useMemo(
    () => [
      { value: "pelatih" as const, label: "Pelatih" },
      { value: "admin_daerah" as const, label: "Admin Daerah" },
      { value: "admin_nasional" as const, label: "Admin Nasional" },
    ],
    []
  );

  // ✅ Access control - only admin nasional can access this page
  useEffect(() => {
    if (loadingProfile) return;
    
    if (!profile) {
      toast.error('Anda harus login terlebih dahulu');
      onNavigate('login');
      return;
    }

    if (profile.role !== 'admin_nasional') {
      toast.error('Akses ditolak. Halaman ini hanya untuk Admin Nasional.');
      onNavigate('dashboard');
      return;
    }
  }, [loadingProfile, profile, onNavigate]);

  const refreshHistory = async () => {
    const res = await authedFetch("/api/token", { method: "GET" });
    const data = (await res.json()) as ApiGetResponse;

    if (!res.ok) {
      console.error("GET /api/token failed:", data?.error);
      // kalau 401/403, kemungkinan session habis / bukan admin nasional
      return;
    }

    if (data.activeByRole) {
      setActiveByRole({
        pelatih: data.activeByRole.pelatih ? mapRow(data.activeByRole.pelatih) : null,
        admin_daerah: data.activeByRole.admin_daerah ? mapRow(data.activeByRole.admin_daerah) : null,
        admin_nasional: data.activeByRole.admin_nasional ? mapRow(data.activeByRole.admin_nasional) : null,
      });
    }

    if (Array.isArray(data.tokens)) {
      setTokenHistory(data.tokens.map(mapRow));
    }
  };

  useEffect(() => {
    if (loadingProfile) return;
    if (!profile || profile.role !== 'admin_nasional') return;
    
    refreshHistory();
  }, [loadingProfile, profile]);

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(tokenHistory.length / itemsPerPage));
    if (currentPage > pages) setCurrentPage(pages);
  }, [tokenHistory.length, currentPage]);

  const handleGenerateToken = async () => {
    setLoading(true);
    try {
      const res = await authedFetch("/api/token", {
        method: "POST",
        body: JSON.stringify({ role, validDays: tokenValidDays }),
      });

      const data = (await res.json()) as ApiPostResponse;

      if (!res.ok) {
        alert(data.error || "Gagal generate token");
        return;
      }

      if (data.token) {
        await refreshHistory();
        setCurrentPage(1);
        alert(
          `✅ Token berhasil di-generate!\n\nToken: ${data.token}\nBerlaku hingga: ${formatDateOnly(data.validUntil)}`
        );
      } else {
        alert(data.error || "Gagal generate token");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal generate token");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = (tok: string) => {
    navigator.clipboard.writeText(tok);
    setCopiedToken(tok);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleLogout = () => {
    onNavigate("logout");
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(tokenHistory.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTokens = tokenHistory.slice(indexOfFirstItem, indexOfLastItem);

  // Show loading while checking access
  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if not authorized
  if (!profile || profile.role !== 'admin_nasional') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <PrivateSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={onNavigate}
        onLogout={handleLogout}
        currentPage="token-generator"
        userRole="admin_nasional"
      />

      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900">
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl">Token Generator</h1>
                <p className="text-sm text-gray-600">Generate token registrasi untuk pengguna baru</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm">Admin Nasional</p>
                <p className="text-xs text-gray-600">Pengurus Pusat</p>
              </div>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white">SN</div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 lg:p-8">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-lg mb-2 flex items-center gap-2">
              <Key className="w-6 h-6 text-purple-600" />
              Generate Token Baru
            </h3>
            <p className="text-sm text-gray-600">
              Buat token registrasi universal untuk pengguna baru. <b>Hanya 1 token aktif per role.</b>
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">Perhatian!</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Generate token baru akan otomatis menonaktifkan token aktif sebelumnya untuk <b>role yang sama</b>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Masa Berlaku (Hari)</label>
              <input
                type="number"
                min={1}
                max={365}
                value={tokenValidDays}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setTokenValidDays(Number.isFinite(v) && v > 0 ? v : 1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Role Token</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="pelatih">Pelatih</option>
                <option value="admin_daerah">Admin Daerah</option>
                <option value="admin_nasional">Admin Nasional</option>
              </select>
            </div>

            <button
              onClick={handleGenerateToken}
              className="px-8 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              disabled={loading}
            >
              <Key className="w-5 h-5" />
              {loading ? "Generating..." : "Generate Token"}
            </button>
          </div>
        </div>

        {/* Active tokens */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg mb-1">Token Aktif Saat Ini (per role)</h3>
          <p className="text-sm text-gray-600 mb-4">Token dapat dipakai banyak orang selama masih aktif.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roleCards.map(({ value, label }) => {
              const t = activeByRole[value];
              return (
                <div key={value} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold uppercase tracking-wide text-gray-700">{label}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded border ${
                        t?.status === "active"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }`}
                    >
                      {t?.status === "active" ? "Aktif" : "Tidak ada"}
                    </span>
                  </div>

                  {t ? (
                    <>
                      <div className="font-mono text-lg font-semibold tracking-wider text-gray-900">{t.token}</div>
                      <div className="text-xs text-gray-600 mt-2">
                        Berlaku hingga: <span className="font-medium">{t.validUntil || "-"}</span>
                      </div>

                      <button
                        onClick={() => handleCopyToken(t.token)}
                        className="mt-3 inline-flex items-center gap-2 px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        {copiedToken === t.token ? (
                          <>
                            <Check className="w-4 h-4" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" /> Copy
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">Belum ada token aktif.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg">Riwayat Token</h3>
            <p className="text-sm text-gray-600">Semua token yang telah di-generate</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Token</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Tanggal Generate</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Berlaku Hingga</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {currentTokens.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-lg text-gray-900 font-semibold tracking-wider">
                      {t.token}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{t.generatedAt}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{t.validUntil}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded px-2 py-1">
                        {roleLabel(t.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 rounded-full border ${
                          t.status === "active"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-gray-100 text-gray-800 border-gray-300"
                        }`}
                      >
                        {statusLabel(t.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleCopyToken(t.token)}
                        className="flex items-center gap-2 px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        {copiedToken === t.token ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tokenHistory.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, tokenHistory.length)} dari{" "}
                  {tokenHistory.length} token
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
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
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-lg transition-colors ${
                              currentPage === page ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
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
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export { TokenGenerator };
export default TokenGenerator;
