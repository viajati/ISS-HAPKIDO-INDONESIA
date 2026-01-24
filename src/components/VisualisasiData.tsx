import { useState } from 'react';
import { PrivateSidebar } from './PrivateSidebar';
import { Menu, Calendar, Filter, Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface VisualisasiDataProps {
  onNavigate: (page: string) => void;
  userRole?: 'pelatih' | 'admin_daerah' | 'admin_nasional';
  userWilayah?: string;
}

export function VisualisasiData({ 
  onNavigate, 
  userRole = 'admin_nasional',
  userWilayah = 'DKI Jakarta'
}: VisualisasiDataProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'visualisasi' | 'crosstab'>('visualisasi');
  const [periodeFilter, setPeriodeFilter] = useState<'6bulan' | '1tahun' | 'tahun' | 'custom'>('6bulan');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handleLogout = () => {
    onNavigate('logout');
  };

  const isNasional = userRole === 'admin_nasional';

  // Data untuk Visualisasi Umum (Nasional atau per Wilayah)
  const dataPerBulan6Bulan = [
    { bulan: 'Jul 2024', jumlah: 12, ringan: 5, sedang: 4, berat: 3 },
    { bulan: 'Ags 2024', jumlah: 15, ringan: 6, sedang: 6, berat: 3 },
    { bulan: 'Sep 2024', jumlah: 18, ringan: 8, sedang: 7, berat: 3 },
    { bulan: 'Okt 2024', jumlah: 14, ringan: 6, sedang: 5, berat: 3 },
    { bulan: 'Nov 2024', jumlah: 20, ringan: 9, sedang: 8, berat: 3 },
    { bulan: 'Des 2024', jumlah: 16, ringan: 7, sedang: 6, berat: 3 },
  ];

  const dataPerBulan1Tahun = [
    { bulan: 'Jan 2024', jumlah: 10, ringan: 4, sedang: 4, berat: 2 },
    { bulan: 'Feb 2024', jumlah: 8, ringan: 3, sedang: 3, berat: 2 },
    { bulan: 'Mar 2024', jumlah: 12, ringan: 5, sedang: 5, berat: 2 },
    { bulan: 'Apr 2024', jumlah: 11, ringan: 5, sedang: 4, berat: 2 },
    { bulan: 'Mei 2024', jumlah: 14, ringan: 6, sedang: 5, berat: 3 },
    { bulan: 'Jun 2024', jumlah: 13, ringan: 5, sedang: 5, berat: 3 },
    { bulan: 'Jul 2024', jumlah: 12, ringan: 5, sedang: 4, berat: 3 },
    { bulan: 'Ags 2024', jumlah: 15, ringan: 6, sedang: 6, berat: 3 },
    { bulan: 'Sep 2024', jumlah: 18, ringan: 8, sedang: 7, berat: 3 },
    { bulan: 'Okt 2024', jumlah: 14, ringan: 6, sedang: 5, berat: 3 },
    { bulan: 'Nov 2024', jumlah: 20, ringan: 9, sedang: 8, berat: 3 },
    { bulan: 'Des 2024', jumlah: 16, ringan: 7, sedang: 6, berat: 3 },
  ];

  const dataPerBulan2023 = [
    { bulan: 'Jan 2023', jumlah: 8, ringan: 3, sedang: 3, berat: 2 },
    { bulan: 'Feb 2023', jumlah: 7, ringan: 3, sedang: 2, berat: 2 },
    { bulan: 'Mar 2023', jumlah: 10, ringan: 4, sedang: 4, berat: 2 },
    { bulan: 'Apr 2023', jumlah: 9, ringan: 4, sedang: 3, berat: 2 },
    { bulan: 'Mei 2023', jumlah: 11, ringan: 5, sedang: 4, berat: 2 },
    { bulan: 'Jun 2023', jumlah: 10, ringan: 4, sedang: 4, berat: 2 },
    { bulan: 'Jul 2023', jumlah: 9, ringan: 4, sedang: 3, berat: 2 },
    { bulan: 'Ags 2023', jumlah: 12, ringan: 5, sedang: 5, berat: 2 },
    { bulan: 'Sep 2023', jumlah: 14, ringan: 6, sedang: 6, berat: 2 },
    { bulan: 'Okt 2023', jumlah: 11, ringan: 5, sedang: 4, berat: 2 },
    { bulan: 'Nov 2023', jumlah: 15, ringan: 7, sedang: 6, berat: 2 },
    { bulan: 'Des 2023', jumlah: 13, ringan: 6, sedang: 5, berat: 2 },
  ];

  // Pilih data berdasarkan filter periode
  const getDataByPeriod = () => {
    if (periodeFilter === '6bulan') return dataPerBulan6Bulan;
    if (periodeFilter === '1tahun') return dataPerBulan1Tahun;
    if (periodeFilter === 'tahun' && selectedYear === '2023') return dataPerBulan2023;
    if (periodeFilter === 'tahun' && selectedYear === '2024') return dataPerBulan1Tahun;
    return dataPerBulan6Bulan; // default
  };

  const dataPerBulan = getDataByPeriod();

  // Data Derajat Cedera (Pie Chart)
  const dataDerajat = [
    { name: 'Ringan', value: 45, color: '#10b981' },
    { name: 'Sedang', value: 38, color: '#f59e0b' },
    { name: 'Berat', value: 17, color: '#ef4444' },
  ];

  // Data Lokasi Cedera (Bar Chart)
  const dataLokasi = [
    { lokasi: 'Lutut', jumlah: 28 },
    { lokasi: 'Pergelangan Kaki', jumlah: 22 },
    { lokasi: 'Bahu', jumlah: 15 },
    { lokasi: 'Pergelangan Tangan', jumlah: 12 },
    { lokasi: 'Kepala', jumlah: 10 },
    { lokasi: 'Punggung', jumlah: 8 },
  ];

  // Data Jenis Aktivitas (Bar Chart)
  const dataAktivitas = [
    { aktivitas: 'Latihan Teknik', jumlah: 35 },
    { aktivitas: 'Sparring', jumlah: 30 },
    { aktivitas: 'Latihan Fisik', jumlah: 20 },
    { aktivitas: 'Pertandingan', jumlah: 10 },
    { aktivitas: 'Lainnya', jumlah: 5 },
  ];

  // Data untuk Crosstabulasi (Per Wilayah)
  const dataCrosstabPerBulan = isNasional ? [
    { bulan: 'Jul 2024', 'DKI Jakarta': 5, 'Jawa Barat': 3, 'Jawa Tengah': 2, 'Jawa Timur': 2 },
    { bulan: 'Ags 2024', 'DKI Jakarta': 6, 'Jawa Barat': 4, 'Jawa Tengah': 3, 'Jawa Timur': 2 },
    { bulan: 'Sep 2024', 'DKI Jakarta': 7, 'Jawa Barat': 5, 'Jawa Tengah': 4, 'Jawa Timur': 2 },
    { bulan: 'Okt 2024', 'DKI Jakarta': 5, 'Jawa Barat': 4, 'Jawa Tengah': 3, 'Jawa Timur': 2 },
    { bulan: 'Nov 2024', 'DKI Jakarta': 8, 'Jawa Barat': 6, 'Jawa Tengah': 4, 'Jawa Timur': 2 },
    { bulan: 'Des 2024', 'DKI Jakarta': 6, 'Jawa Barat': 5, 'Jawa Tengah': 3, 'Jawa Timur': 2 },
  ] : [
    // Data spesifik wilayah untuk pelatih/admin daerah
    { bulan: 'Jul 2024', [userWilayah]: 5 },
    { bulan: 'Ags 2024', [userWilayah]: 6 },
    { bulan: 'Sep 2024', [userWilayah]: 7 },
    { bulan: 'Okt 2024', [userWilayah]: 5 },
    { bulan: 'Nov 2024', [userWilayah]: 8 },
    { bulan: 'Des 2024', [userWilayah]: 6 },
  ];

  const dataCrosstabDerajat = isNasional ? [
    { wilayah: 'DKI Jakarta', ringan: 12, sedang: 10, berat: 5 },
    { wilayah: 'Jawa Barat', ringan: 10, sedang: 8, berat: 4 },
    { wilayah: 'Jawa Tengah', ringan: 8, sedang: 7, berat: 4 },
    { wilayah: 'Jawa Timur', ringan: 7, sedang: 6, berat: 2 },
    { wilayah: 'Bali', ringan: 5, sedang: 4, berat: 1 },
    { wilayah: 'Sumatra Utara', ringan: 3, sedang: 3, berat: 1 },
  ] : [
    { wilayah: userWilayah, ringan: 12, sedang: 10, berat: 5 },
  ];

  const dataCrosstabLokasi = isNasional ? [
    { lokasi: 'Lutut', 'DKI Jakarta': 10, 'Jawa Barat': 8, 'Jawa Tengah': 6, 'Jawa Timur': 4 },
    { lokasi: 'Pergelangan Kaki', 'DKI Jakarta': 8, 'Jawa Barat': 6, 'Jawa Tengah': 5, 'Jawa Timur': 3 },
    { lokasi: 'Bahu', 'DKI Jakarta': 5, 'Jawa Barat': 4, 'Jawa Tengah': 4, 'Jawa Timur': 2 },
    { lokasi: 'Pergelangan Tangan', 'DKI Jakarta': 4, 'Jawa Barat': 3, 'Jawa Tengah': 3, 'Jawa Timur': 2 },
  ] : [
    { lokasi: 'Lutut', [userWilayah]: 10 },
    { lokasi: 'Pergelangan Kaki', [userWilayah]: 8 },
    { lokasi: 'Bahu', [userWilayah]: 5 },
    { lokasi: 'Pergelangan Tangan', [userWilayah]: 4 },
  ];

  const dataCrosstabAktivitas = isNasional ? [
    { aktivitas: 'Latihan Teknik', 'DKI Jakarta': 12, 'Jawa Barat': 10, 'Jawa Tengah': 8, 'Jawa Timur': 5 },
    { aktivitas: 'Sparring', 'DKI Jakarta': 10, 'Jawa Barat': 8, 'Jawa Tengah': 7, 'Jawa Timur': 5 },
    { aktivitas: 'Latihan Fisik', 'DKI Jakarta': 7, 'Jawa Barat': 6, 'Jawa Tengah': 4, 'Jawa Timur': 3 },
    { aktivitas: 'Pertandingan', 'DKI Jakarta': 4, 'Jawa Barat': 3, 'Jawa Tengah': 2, 'Jawa Timur': 1 },
  ] : [
    { aktivitas: 'Latihan Teknik', [userWilayah]: 12 },
    { aktivitas: 'Sparring', [userWilayah]: 10 },
    { aktivitas: 'Latihan Fisik', [userWilayah]: 7 },
    { aktivitas: 'Pertandingan', [userWilayah]: 4 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const getPeriodLabel = () => {
    if (periodeFilter === '6bulan') return '6 Bulan Terakhir';
    if (periodeFilter === '1tahun') return '1 Tahun Terakhir (2024)';
    if (periodeFilter === 'tahun') return `Tahun ${selectedYear}`;
    if (periodeFilter === 'custom') return `Custom: ${customStartDate} - ${customEndDate}`;
    return '6 Bulan Terakhir';
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <PrivateSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={onNavigate}
        onLogout={handleLogout}
        currentPage="visualisasi-data"
        userRole={userRole}
        // userName removed
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
                <h1 className="text-xl">Visualisasi Data Cedera</h1>
                <p className="text-sm text-gray-600">
                  {isNasional ? 'Analisis data cedera nasional' : `Analisis data cedera ${userWilayah}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm">
                  {userRole === 'admin_nasional' ? 'Admin Nasional' : userRole === 'admin_daerah' ? 'Admin Daerah' : 'Pelatih'}
                </p>
                <p className="text-xs text-gray-600">
                  {isNasional ? 'Pengurus Pusat' : userWilayah}
                </p>
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
                <>
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
                </>
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
            >
              Crosstabulasi
            </button>
          </div>
        </div>

        {/* Tab Content - Visualisasi Umum */}
        {activeTab === 'visualisasi' && (
          <>
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
                          <Cell key={`cell-${index}`} fill={entry.color} />
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
                      <Bar dataKey="jumlah" fill="#f59e0b" name="Jumlah" />
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
                      <Bar dataKey="jumlah" fill="#10b981" name="Jumlah" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab Content - Crosstabulasi */}
        {activeTab === 'crosstab' && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="mb-6">
                <h2 className="mb-2">
                  Tabel Crosstabulasi - {getPeriodLabel()} 
                  {isNasional ? ' (Seluruh Wilayah)' : ` (${userWilayah})`}
                </h2>
                <p className="text-sm text-gray-600">
                  Tabel ringkasan yang menampilkan breakdown lengkap data cedera berdasarkan jenis aktivitas (Training vs Competition), 
                  dengan detail jenis cedera, mekanisme, lokasi, dan derajat.
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
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-semibold">Atlet</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">45</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">38</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold bg-gray-100">83</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-semibold">Cedera</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">52</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">41</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold bg-gray-100">93</td>
                    </tr>

                    {/* Jenis Cedera */}
                    <tr className="bg-blue-50">
                      <td className="border border-gray-300 px-4 py-2 font-semibold italic" colSpan={4}>
                        Jenis Cedera
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 pl-8">Sprain</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">18</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">12</td>
                      <td className="border border-gray-300 px-4 py-2 text-center bg-gray-50">30</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 pl-8">Strain</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">15</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">10</td>
                      <td className="border border-gray-300 px-4 py-2 text-center bg-gray-50">25</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 pl-8">Dislokasi</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">8</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">9</td>
                      <td className="border border-gray-300 px-4 py-2 text-center bg-gray-50">17</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 pl-8">Fraktur</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">5</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">6</td>
                      <td className="border border-gray-300 px-4 py-2 text-center bg-gray-50">11</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 pl-8">Kontusi</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">6</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">4</td>
                      <td className="border border-gray-300 px-4 py-2 text-center bg-gray-50">10</td>
                    </tr>

                    {/* Mekanisme Cedera */}
                    <tr className="bg-blue-50">
                      <td className="border border-gray-300 px-4 py-2 font-semibold italic" colSpan={4}>
                        Mekanisme Cedera
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 pl-8">Kontak dengan Lawan</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">12</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">18</td>
                      <td className="border border-gray-300 px-4 py-2 text-center bg-gray-50">30</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 pl-8">Non-Kontak</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">25</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">15</td>
                      <td className="border border-gray-300 px-4 py-2 text-center bg-gray-50">40</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 pl-8">Overuse</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">15</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">8</td>
                      <td className="border border-gray-300 px-4 py-2 text-center bg-gray-50">23</td>
                    </tr>

                    {/* Lokasi Cedera */}
                    <tr className="bg-blue-50">
                      <td className="border border-gray-300 px-4 py-2 font-semibold italic" colSpan={4}>
                        Lokasi Cedera Terbanyak
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 pl-8">Lutut</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">12</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">10</td>
                      <td className="border border-gray-300 px-4 py-2 text-center bg-gray-50">22</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 pl-8">Pergelangan Kaki</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">10</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">8</td>
                      <td className="border border-gray-300 px-4 py-2 text-center bg-gray-50">18</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 pl-8">Bahu</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">8</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">7</td>
                      <td className="border border-gray-300 px-4 py-2 text-center bg-gray-50">15</td>
                    </tr>

                    {/* Derajat Cedera */}
                    <tr className="bg-blue-50">
                      <td className="border border-gray-300 px-4 py-2 font-semibold italic" colSpan={4}>
                        Derajat Cedera
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 pl-8">Ringan</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">30</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">20</td>
                      <td className="border border-gray-300 px-4 py-2 text-center bg-gray-50">50</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 pl-8">Sedang</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">18</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">15</td>
                      <td className="border border-gray-300 px-4 py-2 text-center bg-gray-50">33</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 pl-8">Berat</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">4</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">6</td>
                      <td className="border border-gray-300 px-4 py-2 text-center bg-gray-50">10</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer Note */}
              <div className="mt-4 text-xs text-gray-600 bg-gray-50 p-3 rounded">
                <p>
                  <strong>Catatan:</strong> Data di atas merupakan ringkasan agregat untuk periode {getPeriodLabel()}. 
                  Untuk data detail per individu, silakan download dari menu Download Center.
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}