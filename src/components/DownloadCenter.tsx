import { useState } from 'react';
import { PrivateSidebar } from './PrivateSidebar';
import { Menu, Download, FileSpreadsheet, Table, BarChart3, Filter, Calendar, FileText, FileDown } from 'lucide-react';

interface DownloadCenterProps {
  onNavigate: (page: string) => void;
  userRole?: 'pelatih' | 'admin_daerah' | 'admin_nasional';
  userWilayah?: string;
}

export function DownloadCenter({ 
  onNavigate, 
  userRole = 'admin_nasional',
  userWilayah = 'DKI Jakarta'
}: DownloadCenterProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [periodeFilter, setPeriodeFilter] = useState<'6bulan' | '1tahun' | 'tahun' | 'custom'>('6bulan');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [formatData, setFormatData] = useState<'wide' | 'long'>('wide');
  const [selectedCrosstab, setSelectedCrosstab] = useState('derajat-wilayah');
  const [selectedChart, setSelectedChart] = useState('bar-bulan');

  const handleLogout = () => {
    onNavigate('logout');
  };

  const isNasional = userRole === 'admin_nasional';

  const getPeriodLabel = () => {
    if (periodeFilter === '6bulan') return '6 Bulan Terakhir';
    if (periodeFilter === '1tahun') return '1 Tahun Terakhir (2024)';
    if (periodeFilter === 'tahun') return `Tahun ${selectedYear}`;
    if (periodeFilter === 'custom') return `Custom: ${customStartDate} - ${customEndDate}`;
    return '6 Bulan Terakhir';
  };

  const handleDownload = (type: string) => {
    // Simulasi download
    console.log(`Downloading ${type} - ${getPeriodLabel()} - Format: ${formatData}`);
    alert(`Download ${type} dimulai!\nPeriode: ${getPeriodLabel()}\nFormat: ${formatData === 'wide' ? 'Wide Format' : 'Long Format'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <PrivateSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={onNavigate}
        onLogout={handleLogout}
        currentPage="download-center"
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
                <h1 className="text-xl">Download Center</h1>
                <p className="text-sm text-gray-600">
                  Export data cedera dalam berbagai format
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

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Informasi Download</p>
              <p className="text-blue-700">
                Semua data akan diexport dalam format <strong>Excel (.xlsx)</strong> dan <strong>CSV</strong>. 
                {isNasional ? ' Data mencakup seluruh wilayah Indonesia.' : ` Data khusus untuk wilayah ${userWilayah}.`}
              </p>
            </div>
          </div>
        </div>

        {/* 1. Data Dasar (Wide/Long) */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-teal-900">1. Data Dasar (Raw Data)</h2>
                <p className="text-sm text-teal-700">Data lengkap semua laporan cedera dalam format terstruktur</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Format Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Pilih Format Data:</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setFormatData('wide')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formatData === 'wide'
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-300 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={formatData === 'wide'}
                      onChange={() => setFormatData('wide')}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Wide Format</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Satu baris per laporan, semua data dalam kolom terpisah. 
                        <span className="block mt-1 text-xs">Cocok untuk: Analisis statistik, pivot table</span>
                      </p>
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-700">
                        ID | Nama | Umur | Lokasi | Derajat | ...
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setFormatData('long')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formatData === 'long'
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-300 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={formatData === 'long'}
                      onChange={() => setFormatData('long')}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Long Format</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Multiple baris per laporan dengan struktur key-value.
                        <span className="block mt-1 text-xs">Cocok untuk: Database import, time-series analysis</span>
                      </p>
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-700">
                        ID | Variable | Value
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Field Info */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Data yang disertakan:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                  Data Atlet (Nama, Umur, Gender)
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                  Lokasi & Jenis Cedera
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                  Derajat Cedera
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                  Mekanisme Cedera
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                  Aktivitas saat Cedera
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                  Red Flags
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                  Tanggal Kejadian
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                  Data Pelapor
                </div>
                {isNasional && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                    Wilayah/Daerah
                  </div>
                )}
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleDownload(`Data Dasar ${formatData.toUpperCase()} - Excel`)}
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer shadow-sm hover:shadow-md active:scale-95"
              >
                <Download className="w-5 h-5" />
                Download Excel (.xlsx)
              </button>
              <button
                onClick={() => handleDownload(`Data Dasar ${formatData.toUpperCase()} - CSV`)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-teal-600 border-2 border-teal-600 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer shadow-sm hover:shadow-md active:scale-95"
              >
                <Download className="w-5 h-5" />
                Download CSV (.csv)
              </button>
            </div>
          </div>
        </div>

        {/* 2. Tabel Ringkasan (Crosstabulasi) */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Table className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-blue-900">2. Tabel Ringkasan (Crosstabulasi)</h2>
                <p className="text-sm text-blue-700">Data agregat dalam bentuk tabel pivot dan crosstab</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Crosstab Description */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-3">Tabel Crosstabulasi Lengkap</p>
              <p className="text-sm text-gray-600 mb-4">
                Tabel ringkasan yang menampilkan breakdown lengkap data cedera berdasarkan jenis aktivitas (Training vs Competition), 
                dengan detail jenis cedera, mekanisme, lokasi, dan derajat cedera.
              </p>
              
              {/* What's included */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Tabel mencakup:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Total atlet & cedera
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Jenis cedera (Sprain, Strain, Dislokasi, dll)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Mekanisme cedera
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Breakdown per aktivitas (Training/Competition)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Lokasi cedera terbanyak
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Derajat cedera (Ringan/Sedang/Berat)
                  </div>
                  {isNasional && (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      Breakdown per wilayah
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleDownload('Tabel Crosstabulasi - Excel')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-sm hover:shadow-md active:scale-95"
              >
                <Download className="w-5 h-5" />
                Download Excel (.xlsx)
              </button>
              <button
                onClick={() => handleDownload('Tabel Crosstabulasi - CSV')}
                className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer shadow-sm hover:shadow-md active:scale-95"
              >
                <Download className="w-5 h-5" />
                Download CSV (.csv)
              </button>
            </div>
          </div>
        </div>

        {/* 3. Ilustrasi & Grafik */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-purple-900">3. Ilustrasi & Grafik</h2>
                <p className="text-sm text-purple-700">Visualisasi data dalam bentuk chart dan diagram</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Chart Options */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Pilih grafik yang ingin didownload:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedChart('bar-bulan')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedChart === 'bar-bulan'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={selectedChart === 'bar-bulan'}
                      onChange={() => setSelectedChart('bar-bulan')}
                      className="mt-1"
                    />
                    <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Bar Chart: Cedera per Bulan</p>
                      <p className="text-sm text-gray-600 mt-1">Trend jumlah cedera bulanan</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedChart('pie-derajat')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedChart === 'pie-derajat'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={selectedChart === 'pie-derajat'}
                      onChange={() => setSelectedChart('pie-derajat')}
                      className="mt-1"
                    />
                    <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Pie Chart: Distribusi Derajat</p>
                      <p className="text-sm text-gray-600 mt-1">Proporsi ringan/sedang/berat</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedChart('bar-lokasi')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedChart === 'bar-lokasi'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={selectedChart === 'bar-lokasi'}
                      onChange={() => setSelectedChart('bar-lokasi')}
                      className="mt-1"
                    />
                    <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Bar Chart: Lokasi Cedera</p>
                      <p className="text-sm text-gray-600 mt-1">Top lokasi cedera terbanyak</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedChart('bar-aktivitas')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedChart === 'bar-aktivitas'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={selectedChart === 'bar-aktivitas'}
                      onChange={() => setSelectedChart('bar-aktivitas')}
                      className="mt-1"
                    />
                    <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Bar Chart: Jenis Aktivitas</p>
                      <p className="text-sm text-gray-600 mt-1">Aktivitas penyebab cedera</p>
                    </div>
                  </div>
                </button>

                {isNasional && (
                  <>
                    <button
                      onClick={() => setSelectedChart('line-wilayah')}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedChart === 'line-wilayah'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          checked={selectedChart === 'line-wilayah'}
                          onChange={() => setSelectedChart('line-wilayah')}
                          className="mt-1"
                        />
                        <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Line Chart: Trend per Wilayah</p>
                          <p className="text-sm text-gray-600 mt-1">Perbandingan trend antar wilayah</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedChart('stacked-derajat')}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedChart === 'stacked-derajat'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          checked={selectedChart === 'stacked-derajat'}
                          onChange={() => setSelectedChart('stacked-derajat')}
                          className="mt-1"
                        />
                        <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Stacked Bar: Derajat × Wilayah</p>
                          <p className="text-sm text-gray-600 mt-1">Breakdown derajat per wilayah</p>
                        </div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Format Info */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-900">
                <strong>Format:</strong> Semua grafik akan diexport dalam resolusi tinggi (High-Resolution PNG) 
                dan format vektor (PDF) yang cocok untuk publikasi dan presentasi.
              </p>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleDownload('Semua Grafik - PNG')}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer shadow-sm hover:shadow-md active:scale-95"
              >
                <FileDown className="w-5 h-5" />
                Download PNG (High-Res)
              </button>
              <button
                onClick={() => handleDownload('Semua Grafik - PDF')}
                className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer shadow-sm hover:shadow-md active:scale-95"
              >
                <FileDown className="w-5 h-5" />
                Download PDF (Vector)
              </button>
              <button
                onClick={() => handleDownload('Semua Grafik - PowerPoint')}
                className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer shadow-sm hover:shadow-md active:scale-95"
              >
                <FileDown className="w-5 h-5" />
                Download PowerPoint (.pptx)
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-gray-100 border border-gray-300 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Catatan Penting</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-teal-600 font-bold">•</span>
              <span>Semua data yang diexport sudah terverifikasi dan valid sesuai periode yang dipilih.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-600 font-bold">•</span>
              <span>Data bersifat rahasia dan hanya untuk keperluan analisis internal organisasi.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-600 font-bold">•</span>
              <span>Identitas atlet telah dianonimkan untuk menjaga privasi.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-600 font-bold">•</span>
              <span>Untuk pertanyaan teknis, silakan hubungi admin sistem melalui menu Help & Contact.</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}