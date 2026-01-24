import { useState } from 'react';
import { PrivateSidebar } from './PrivateSidebar';
import { Menu, Users, Activity, Shield, MapPin, TrendingUp, FileText, Download, CheckSquare, BarChart3 } from 'lucide-react';

interface DashboardNationalProps {
  onNavigate: (page: string) => void;
}

export function DashboardNational({ onNavigate }: DashboardNationalProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    onNavigate('logout');
  };

  // Mock data - Hero Metrics
  const heroMetrics = {
    totalCedera: 342,
    totalAtlet: 1248,
    totalPelatih: 89,
    totalPengurus: 34,
  };

  // Mock data - 3 Bulan Terakhir
  const monthlyData = [
    { month: 'Oktober 2024', total: 98, percentage: 28.6 },
    { month: 'November 2024', total: 112, percentage: 32.7 },
    { month: 'Desember 2024', total: 132, percentage: 38.6 },
  ];

  // Mock data - Distribusi Lokasi Cedera
  const lokasiData = [
    { lokasi: 'Lutut', count: 82, percentage: 24.0 },
    { lokasi: 'Pergelangan Kaki', count: 68, percentage: 19.9 },
    { lokasi: 'Bahu', count: 54, percentage: 15.8 },
    { lokasi: 'Pergelangan Tangan', count: 48, percentage: 14.0 },
    { lokasi: 'Lainnya', count: 90, percentage: 26.3 },
  ];

  // Mock data - Distribusi Jenis Cedera
  const jenisData = [
    { jenis: 'Strain/Sprain', count: 156, percentage: 45.6 },
    { jenis: 'Kontusio', count: 98, percentage: 28.7 },
    { jenis: 'Fraktur', count: 42, percentage: 12.3 },
    { jenis: 'Dislokasi', count: 28, percentage: 8.2 },
    { jenis: 'Lainnya', count: 18, percentage: 5.3 },
  ];

  // Mock data - Distribusi Derajat Cedera
  const derajatData = [
    { derajat: 'Ringan', count: 198, percentage: 57.9, color: 'green' },
    { derajat: 'Sedang', count: 102, percentage: 29.8, color: 'yellow' },
    { derajat: 'Berat', count: 42, percentage: 12.3, color: 'red' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <PrivateSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={onNavigate}
        onLogout={handleLogout}
        currentPage="dashboard-national"
        userRole="admin_nasional"
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
                <h1 className="text-xl">Dashboard Admin Nasional</h1>
                <p className="text-sm text-gray-600">Ringkasan Kondisi ISS Nasional</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm">Admin Nasional</p>
                <p className="text-xs text-gray-600">Pengurus Pusat</p>
              </div>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white">
                SN
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8">
        {/* Hero Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Total Cedera</h3>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl">{heroMetrics.totalCedera}</p>
            <p className="text-xs text-gray-500 mt-1">Data nasional</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Total Atlet</h3>
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl text-green-600">{heroMetrics.totalAtlet}</p>
            <p className="text-xs text-gray-500 mt-1">Terdaftar dalam sistem</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Total Pelatih</h3>
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl text-purple-600">{heroMetrics.totalPelatih}</p>
            <p className="text-xs text-gray-500 mt-1">Pelatih aktif</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Total Pengurus Daerah</h3>
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl text-orange-600">{heroMetrics.totalPengurus}</p>
            <p className="text-xs text-gray-500 mt-1">Admin daerah</p>
          </div>
        </div>

        {/* Visualisasi 3 Bulan Terakhir Section */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2>Visualisasi Data 3 Bulan Terakhir</h2>
            <p className="text-sm text-gray-600 mt-1">Analisis deskriptif cedera Hapkido Indonesia</p>
          </div>

          <div className="p-6">
            {/* Grid 2x2 untuk 4 Visualisasi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. Jumlah & Persentase Cedera per Bulan */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="mb-4 text-gray-900">Jumlah & Persentase Cedera per Bulan</h3>
                <div className="space-y-3">
                  {monthlyData.map((item, index) => {
                    const maxTotal = Math.max(...monthlyData.map((d) => d.total));
                    const widthPercentage = (item.total / maxTotal) * 100;

                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">{item.month}</span>
                          <span className="text-sm">
                            {item.total} <span className="text-gray-500">({item.percentage}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full transition-all"
                            style={{ width: `${widthPercentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Distribusi Lokasi Cedera */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="mb-4 text-gray-900">Distribusi Lokasi Cedera</h3>
                <div className="space-y-3">
                  {lokasiData.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{item.lokasi}</span>
                        <span className="text-xs text-gray-600">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-teal-600 h-3 rounded-full transition-all"
                          style={{ width: `${item.percentage * 4}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Distribusi Jenis Cedera */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="mb-4 text-gray-900">Distribusi Jenis Cedera</h3>
                <div className="space-y-3">
                  {jenisData.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{item.jenis}</span>
                        <span className="text-xs text-gray-600">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-purple-600 h-3 rounded-full transition-all"
                          style={{ width: `${item.percentage * 2}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Distribusi Derajat Cedera */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="mb-4 text-gray-900">Distribusi Derajat Cedera</h3>
                <div className="space-y-3">
                  {derajatData.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{item.derajat}</span>
                        <span className="text-xs text-gray-600">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            item.color === 'green'
                              ? 'bg-green-600'
                              : item.color === 'yellow'
                              ? 'bg-yellow-500'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
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
              onClick={() => onNavigate('menunggu-verifikasi')}
              className="flex flex-col items-center gap-3 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <CheckSquare className="w-8 h-8 text-yellow-600" />
              <span className="text-sm font-medium text-gray-900">Verifikasi Laporan</span>
            </button>
            <button
              onClick={() => onNavigate('visualisasi-data')}
              className="flex flex-col items-center gap-3 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Visualisasi Data</span>
            </button>
            <button
              onClick={() => onNavigate('download-center')}
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