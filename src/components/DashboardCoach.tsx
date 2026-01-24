import { useState } from 'react';
import { PrivateSidebar } from './PrivateSidebar';
import { Menu, Plus, TrendingUp, AlertCircle, Activity } from 'lucide-react';

interface DashboardCoachProps {
  onNavigate: (page: string) => void;
}

export function DashboardCoach({ onNavigate }: DashboardCoachProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    onNavigate('logout');
  };

  // Mock data
  const stats = {
    totalMonth: 8,
    mild: 5,
    moderate: 2,
    severe: 1,
  };

  const recentInjuries = [
    {
      id: '2024-001',
      date: '2024-12-20',
      athlete: 'Ahmad Fauzi',
      location: 'Lutut',
      severity: 'RINGAN',
      activity: 'Sparring',
    },
    {
      id: '2024-002',
      date: '2024-12-18',
      athlete: 'Siti Nurhaliza',
      location: 'Pergelangan Kaki',
      severity: 'SEDANG',
      activity: 'Latihan Teknik',
    },
    {
      id: '2024-003',
      date: '2024-12-15',
      athlete: 'Budi Santoso',
      location: 'Bahu',
      severity: 'RINGAN',
      activity: 'Drill Teknik',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <PrivateSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={onNavigate}
        onLogout={handleLogout}
        currentPage="dashboard-coach"
        userRole="pelatih"
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
                <h1 className="text-xl">Dashboard Pelatih</h1>
                <p className="text-sm text-gray-600">Selamat datang kembali!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm">Pelatih</p>
                <p className="text-xs text-gray-600">Dojang Jakarta Pusat</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Total Laporan Bulan Ini</h3>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl">{stats.totalMonth}</p>
            <p className="text-xs text-gray-500 mt-1">Desember 2024</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Cedera Ringan</h3>
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl text-green-600">{stats.mild}</p>
            <p className="text-xs text-gray-500 mt-1">{((stats.mild / stats.totalMonth) * 100).toFixed(0)}% dari total</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Cedera Sedang</h3>
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl text-yellow-600">{stats.moderate}</p>
            <p className="text-xs text-gray-500 mt-1">{((stats.moderate / stats.totalMonth) * 100).toFixed(0)}% dari total</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Cedera Berat</h3>
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl text-red-600">{stats.severe}</p>
            <p className="text-xs text-gray-500 mt-1">{((stats.severe / stats.totalMonth) * 100).toFixed(0)}% dari total</p>
          </div>
        </div>

        {/* Recent Injuries */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2>Overview Cedera Terkini</h2>
              <p className="text-sm text-gray-600 mt-1">3 cedera terakhir yang dilaporkan</p>
            </div>
            <button
              onClick={() => onNavigate('riwayat')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Lihat Semua →
            </button>
          </div>
          <div className="p-6 space-y-4">
            {recentInjuries.map((injury) => (
              <div
                key={injury.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => onNavigate('riwayat')}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-sm text-gray-900">{injury.athlete}</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        injury.severity === 'RINGAN'
                          ? 'bg-green-100 text-green-800'
                          : injury.severity === 'SEDANG'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {injury.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {injury.location} • {injury.activity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{injury.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('input-cedera')}
            className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-left hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="text-blue-900 mb-1">Input Cedera Baru</h3>
            <p className="text-sm text-blue-700">Laporkan cedera yang baru terjadi</p>
          </button>

          <button
            onClick={() => onNavigate('riwayat')}
            className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 text-left hover:bg-gray-100 transition-colors"
          >
            <Activity className="w-8 h-8 text-gray-600 mb-2" />
            <h3 className="text-gray-900 mb-1">Riwayat Lengkap</h3>
            <p className="text-sm text-gray-600">Lihat semua laporan cedera</p>
          </button>

          <button
            onClick={() => onNavigate('draft')}
            className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-left hover:bg-yellow-100 transition-colors"
          >
            <AlertCircle className="w-8 h-8 text-yellow-600 mb-2" />
            <h3 className="text-yellow-900 mb-1">Draft Tersimpan</h3>
            <p className="text-sm text-yellow-700">Lanjutkan laporan yang belum selesai</p>
          </button>
        </div>
      </main>
    </div>
  );
}