import { useState } from 'react';
import { PrivateSidebar } from './PrivateSidebar';
import { Menu, Plus, Calendar, Users, AlertTriangle, Activity } from 'lucide-react';

interface DashboardRegionalProps {
  onNavigate: (page: string) => void;
}

export function DashboardRegional({ onNavigate }: DashboardRegionalProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    onNavigate('logout');
  };

  // Mock data
  const stats = {
    totalMonth: 12,
    mild: 7,
    moderate: 3,
    severe: 2,
  };

  const recentEventInjuries = [
    {
      id: '2024-004',
      event: 'Jakarta Open 2024',
      athlete: 'Rizki Pratama',
      dojang: 'Jakarta Selatan',
      severity: 'SEDANG',
      location: 'Lutut',
    },
    {
      id: '2024-005',
      event: 'Pelatda',
      athlete: 'Diana Kusuma',
      dojang: 'Jakarta Utara',
      severity: 'RINGAN-SEDANG',
      location: 'Pergelangan Tangan',
    },
    {
      id: '2024-006',
      event: 'Jakarta Open 2024',
      athlete: 'Andi Wijaya',
      dojang: 'Jakarta Timur',
      severity: 'BERAT',
      location: 'Bahu',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <PrivateSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={onNavigate}
        onLogout={handleLogout}
        currentPage="dashboard-regional"
        userRole="admin_daerah"
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
                <h1 className="text-xl">Dashboard Admin Daerah</h1>
                <p className="text-sm text-gray-600">Pengelolaan Event & Kejuaraan</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm">Admin Daerah</p>
                <p className="text-xs text-gray-600">DKI Jakarta</p>
              </div>
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white">
                DJ
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
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl">{stats.totalMonth}</p>
            <p className="text-xs text-gray-500 mt-1">Desember 2024</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Cedera Ringan-Sedang</h3>
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl text-green-600">{stats.mild}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.mild / stats.totalMonth) * 100).toFixed(0)}% dari total
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Cedera Berat</h3>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl text-red-600">{stats.severe}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.severe / stats.totalMonth) * 100).toFixed(0)}% dari total
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Menunggu Verifikasi</h3>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl text-orange-600">{stats.moderate}</p>
            <p className="text-xs text-gray-500 mt-1">Perlu ditindaklanjuti</p>
          </div>
        </div>

        {/* Recent Injuries Overview */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2>Overview Cedera Terkini</h2>
              <p className="text-sm text-gray-600 mt-1">
                3 cedera terakhir yang dilaporkan dari event
              </p>
            </div>
            <button
              onClick={() => onNavigate('riwayat')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Lihat Semua →
            </button>
          </div>
          <div className="p-6 space-y-4">
            {recentEventInjuries.map((injury) => (
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
                        injury.severity === 'RINGAN' || injury.severity === 'RINGAN-SEDANG'
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
                    {injury.location} • {injury.event} • {injury.dojang}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('input-cedera')}
            className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-left hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="text-blue-900 mb-1">Input Cedera Event</h3>
            <p className="text-sm text-blue-700">Laporkan cedera dari event daerah</p>
          </button>

          <button
            onClick={() => onNavigate('riwayat')}
            className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 text-left hover:bg-gray-100 transition-colors"
          >
            <Activity className="w-8 h-8 text-gray-600 mb-2" />
            <h3 className="text-gray-900 mb-1">Riwayat Lengkap</h3>
            <p className="text-sm text-gray-600">Lihat semua laporan cedera event</p>
          </button>

          <button
            onClick={() => onNavigate('draft')}
            className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-left hover:bg-yellow-100 transition-colors"
          >
            <AlertTriangle className="w-8 h-8 text-yellow-600 mb-2" />
            <h3 className="text-yellow-900 mb-1">Draft Tersimpan</h3>
            <p className="text-sm text-yellow-700">Lanjutkan laporan yang belum selesai</p>
          </button>
        </div>
      </main>
    </div>
  );
}