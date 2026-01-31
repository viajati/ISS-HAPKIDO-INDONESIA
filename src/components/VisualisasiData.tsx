import { useState, useEffect, useMemo } from 'react';
import { PrivateSidebar } from './PrivateSidebar';
import { Menu, Calendar, Filter } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../contexts/auth-context';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface VisualisasiDataProps {
  onNavigate: (page: string) => void;
}

// Helper to get access token
async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export function VisualisasiData({ onNavigate }: VisualisasiDataProps) {
  const { profile, loadingProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'visualisasi' | 'crosstab'>('visualisasi');
  const [periodeFilter, setPeriodeFilter] = useState<'6bulan' | '1tahun' | 'tahun' | 'custom'>('6bulan');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // State for visualisasi data
  const [vizLoading, setVizLoading] = useState(false);
  const [vizError, setVizError] = useState<string | null>(null);
  const [dataPerBulan, setDataPerBulan] = useState<any[]>([]);
  const [dataDerajat, setDataDerajat] = useState<any[]>([]);
  const [dataLokasi, setDataLokasi] = useState<any[]>([]);
  const [dataAktivitas, setDataAktivitas] = useState<any[]>([]);

  // State for crosstab data
  const [crosstabLoading, setCrosstabLoading] = useState(false);
  const [crosstabError, setCrosstabError] = useState<string | null>(null);
  const [crosSummary, setCrosSummary] = useState<any[]>([]);
  const [crosJenis, setCrosJenis] = useState<any[]>([]);
  const [crosMekanisme, setCrosMekanisme] = useState<any[]>([]);
  const [crosLokasi, setCrosLokasi] = useState<any[]>([]);
  const [crosDerajat, setCrosDerajat] = useState<any[]>([]);

  const handleLogout = () => {
    onNavigate('logout');
  };

  // Get role and region from profile
  const userRole = useMemo(() => profile?.role || 'pelatih', [profile?.role]);
  const userWilayah = useMemo(() => profile?.wilayah || 'DKI Jakarta', [profile?.wilayah]);
  const isNasional = userRole === 'admin_nasional';

  // Compute date range based on filter
  function computeRange() {
    const today = new Date();
    const end = new Date(today);
    let start = new Date(today);

    if (periodeFilter === '6bulan') {
      start.setMonth(start.getMonth() - 6);
    } else if (periodeFilter === '1tahun') {
      start.setFullYear(start.getFullYear() - 1);
    } else if (periodeFilter === 'tahun') {
      start = new Date(Number(selectedYear), 0, 1);
      end.setTime(new Date(Number(selectedYear), 11, 31).getTime());
    } else if (periodeFilter === 'custom') {
      return { start: customStartDate, end: customEndDate };
    }

    const toISO = (d: Date) => d.toISOString().slice(0, 10);
    return { start: toISO(start), end: toISO(end) };
  }

  // Access control - only admin nasional can access this page
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

  // Fetch visualisasi data
  useEffect(() => {
    if (!profile || profile.role !== 'admin_nasional') return;

    const run = async () => {
      const { start, end } = computeRange();
      setVizLoading(true);
      setVizError(null);

      try {
        const token = await getAccessToken();
        if (!token) throw new Error('Session tidak ditemukan');

        const res = await fetch(`/api/analytics/visualisasi?start=${start}&end=${end}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal memuat data visualisasi');

        setDataPerBulan(Array.isArray(json.dataPerBulan) ? json.dataPerBulan : []);
        setDataDerajat(Array.isArray(json.dataDerajat) ? json.dataDerajat : []);
        setDataLokasi(Array.isArray(json.dataLokasi) ? json.dataLokasi : []);
        setDataAktivitas(Array.isArray(json.dataAktivitas) ? json.dataAktivitas : []);
      } catch (e: any) {
        setVizError(e.message);
        toast.error(e.message);
      } finally {
        setVizLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, profile?.role, periodeFilter, selectedYear, customStartDate, customEndDate]);

  // Fetch crosstab data (only when tab is active)
  useEffect(() => {
    if (!profile || profile.role !== 'admin_nasional') return;
    if (activeTab !== 'crosstab') return;

    const run = async () => {
      const { start, end } = computeRange();
      setCrosstabLoading(true);
      setCrosstabError(null);

      try {
        const token = await getAccessToken();
        if (!token) throw new Error('Session tidak ditemukan');

        const res = await fetch(`/api/analytics/crosstab?start=${start}&end=${end}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal memuat crosstab');

        // Robust guards
        setCrosSummary(Array.isArray(json.summary) ? json.summary : []);
        setCrosJenis(Array.isArray(json.jenis_cedera) ? json.jenis_cedera : []);
        setCrosMekanisme(Array.isArray(json.mekanisme) ? json.mekanisme : []);

        // Backend kamu mungkin belum return ini → aman jadi []
        setCrosLokasi(Array.isArray(json.lokasi) ? json.lokasi : []);
        setCrosDerajat(Array.isArray(json.derajat) ? json.derajat : []);
      } catch (e: any) {
        setCrosstabError(e.message);
        toast.error(e.message);
      } finally {
        setCrosstabLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, periodeFilter, selectedYear, customStartDate, customEndDate, profile?.id]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const getPeriodLabel = () => {
    if (periodeFilter === '6bulan') return '6 Bulan Terakhir';
    if (periodeFilter === '1tahun') return '1 Tahun Terakhir (2024)';
    if (periodeFilter === 'tahun') return `Tahun ${selectedYear}`;
    if (periodeFilter === 'custom') return `Custom: ${customStartDate} - ${customEndDate}`;
    return '6 Bulan Terakhir';
  };

  // Show loading while checking access
  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
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
        currentPage="visualisasi-data"
        userRole="admin_nasional"
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
                type="button"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl">Visualisasi Data Cedera</h1>
                <p className="text-sm text-gray-600">
                  {isNasional ? 'Analisis data cedera nasional' : `Analisis data cedera ${userWilayah}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm">
                  {userRole === 'admin_nasional'
                    ? 'Admin Nasional'
                    : userRole === 'admin_daerah'
                    ? 'Admin Daerah'
                    : 'Pelatih'}
                </p>
                <p className="text-xs text-gray-600">{isNasional ? 'Pengurus Pusat' : userWilayah}</p>
              </div>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white">
                {userRole === 'admin_nasional' ? 'SN' : 'AF'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8">
        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter Periode:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={periodeFilter}
                onChange={(e) => setPeriodeFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="6bulan">6 Bulan Terakhir</option>
                <option value="1tahun">1 Tahun Terakhir</option>
                <option value="tahun">Pilih Tahun Tertentu</option>
                <option value="custom">Custom Range</option>
              </select>

              {periodeFilter === 'tahun' && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              )}

              {periodeFilter === 'custom' && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-600">-</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('visualisasi')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'visualisasi'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              type="button"
            >
              Visualisasi Umum
            </button>
            <button
              onClick={() => setActiveTab('crosstab')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'crosstab'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              type="button"
            >
              Crosstabulasi
            </button>
          </div>
        </div>

        {/* Tab Content - Visualisasi Umum */}
        {activeTab === 'visualisasi' && (
          <>
            {vizLoading ? (
              <div className="bg-white rounded-lg shadow-md p-12 mb-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Memuat data visualisasi...</p>
              </div>
            ) : vizError ? (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{vizError}</div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="mb-4">Visualisasi Data - {getPeriodLabel()}</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 1. Jumlah Cedera per Bulan */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm mb-4 text-gray-700">Jumlah Cedera per Bulan</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dataPerBulan}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="jumlah" fill="#0891b2" name="Total Cedera" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 2. Distribusi Derajat Cedera */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm mb-4 text-gray-700">Distribusi Derajat Cedera</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dataDerajat}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dataDerajat.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 3. Lokasi Cedera Terbanyak */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm mb-4 text-gray-700">Lokasi Cedera Terbanyak</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dataLokasi} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="lokasi" type="category" width={120} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="jumlah" name="Jumlah">
                          {dataLokasi.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#f59e0b'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 4. Jenis Aktivitas saat Cedera */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm mb-4 text-gray-700">Jenis Aktivitas saat Cedera</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dataAktivitas} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="aktivitas" type="category" width={120} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="jumlah" name="Jumlah">
                          {dataAktivitas.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#10b981'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Tab Content - Crosstabulasi */}
        {activeTab === 'crosstab' && (
          <>
            {crosstabLoading ? (
              <div className="bg-white rounded-lg shadow-md p-12 mb-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Memuat data crosstab...</p>
              </div>
            ) : crosstabError ? (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {crosstabError}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="mb-6">
                  <h2 className="mb-2">
                    Tabel Crosstabulasi - {getPeriodLabel()}
                    {isNasional ? ' (Seluruh Wilayah)' : ` (${userWilayah})`}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Tabel ringkasan yang menampilkan breakdown data cedera berdasarkan jenis aktivitas (Training vs
                    Competition), dengan detail jenis cedera dan mekanisme.
                  </p>
                </div>

                {/* Crosstab Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Kategori</th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Training</th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Competition</th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold bg-blue-200">Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {/* Total Atlet & Cedera */}
                      {(() => {
                        const atletRow = crosSummary.find((r) => r.kategori === 'Atlet');
                        const cederaRow = crosSummary.find((r) => r.kategori === 'Cedera');

                        return (
                          <>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2 font-semibold">Atlet</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{atletRow?.training || 0}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">
                                {atletRow?.competition || 0}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center font-semibold bg-gray-100">
                                {atletRow?.total || 0}
                              </td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2 font-semibold">Cedera</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">
                                {cederaRow?.training || 0}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center">
                                {cederaRow?.competition || 0}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-center font-semibold bg-gray-100">
                                {cederaRow?.total || 0}
                              </td>
                            </tr>
                          </>
                        );
                      })()}

                      {/* Jenis Cedera (SEMUA) */}
                      <tr className="bg-blue-50">
                        <td className="border border-gray-300 px-4 py-2 font-semibold italic" colSpan={4}>
                          Jenis Cedera (Semua)
                        </td>
                      </tr>
                      {crosJenis.length > 0 ? (
                        crosJenis.map((row, idx) => (
                          <tr key={`jenis-${idx}`}>
                            <td className="border border-gray-300 px-4 py-2 pl-8">{row.kategori}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{row.training}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{row.competition}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center bg-gray-50">{row.total}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 pl-8 text-gray-400 italic" colSpan={4}>
                            Tidak ada data
                          </td>
                        </tr>
                      )}

                      {/* Mekanisme Cedera (SEMUA) */}
                      <tr className="bg-blue-50">
                        <td className="border border-gray-300 px-4 py-2 font-semibold italic" colSpan={4}>
                          Mekanisme Cedera (Semua)
                        </td>
                      </tr>
                      {crosMekanisme.length > 0 ? (
                        crosMekanisme.map((row, idx) => (
                          <tr key={`mekanisme-${idx}`}>
                            <td className="border border-gray-300 px-4 py-2 pl-8">{row.kategori}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{row.training}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{row.competition}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center bg-gray-50">{row.total}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 pl-8 text-gray-400 italic" colSpan={4}>
                            Tidak ada data
                          </td>
                        </tr>
                      )}

                      {/* Lokasi Cedera (SEMUA) - hanya kalau backend sudah return */}
                      {crosLokasi.length > 0 && (
                        <>
                          <tr className="bg-blue-50">
                            <td className="border border-gray-300 px-4 py-2 font-semibold italic" colSpan={4}>
                              Lokasi Cedera (Semua)
                            </td>
                          </tr>
                          {crosLokasi.map((row, idx) => (
                            <tr key={`lokasi-${idx}`}>
                              <td className="border border-gray-300 px-4 py-2 pl-8">{row.kategori}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{row.training}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{row.competition}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center bg-gray-50">{row.total}</td>
                            </tr>
                          ))}
                        </>
                      )}

                      {/* Derajat Cedera - hanya kalau backend sudah return */}
                      {crosDerajat.length > 0 && (
                        <>
                          <tr className="bg-blue-50">
                            <td className="border border-gray-300 px-4 py-2 font-semibold italic" colSpan={4}>
                              Derajat Cedera
                            </td>
                          </tr>
                          {crosDerajat.map((row, idx) => (
                            <tr key={`derajat-${idx}`}>
                              <td className="border border-gray-300 px-4 py-2 pl-8">{row.kategori}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{row.training}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{row.competition}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center bg-gray-50">{row.total}</td>
                            </tr>
                          ))}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer Note */}
                <div className="mt-4 text-xs text-gray-600 bg-gray-50 p-3 rounded">
                  <p>
                    <strong>Catatan:</strong> Data di atas merupakan ringkasan agregat untuk periode {getPeriodLabel()}.
                    Untuk data detail per individu, silakan gunakan menu download/export (jika tersedia).
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
