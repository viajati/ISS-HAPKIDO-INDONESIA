import { useState, useEffect } from 'react';
import { PrivateSidebar } from './PrivateSidebar';
import { Menu, Plus, Calendar, Users, AlertTriangle, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/auth-context';
import type { Database } from '../lib/database.types';
import { ModalRingkasanData, type LaporanData } from './ModalRingkasanData';
import { fetchPelaporData, formatDateOnly } from '../lib/injury-helpers';

type InjuryReport = Database['public']['Tables']['injury_reports']['Row'];

interface DashboardRegionalProps {
  onNavigate: (page: string) => void;
}

export function DashboardRegional({ onNavigate }: DashboardRegionalProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMonth: 0,
    mild: 0,
    moderate: 0,
    severe: 0,
  });
  const [recentEventInjuries, setRecentEventInjuries] = useState<InjuryReport[]>([]);
  const [selectedInjury, setSelectedInjury] = useState<LaporanData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get current month start and end dates
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const firstDayStr = firstDay.toISOString().split('T')[0];
        const lastDayStr = lastDay.toISOString().split('T')[0];

        // Fetch injury reports for current month by this user only (exclude drafts)
        const { data: reports, error } = await supabase
          .from('injury_reports')
          .select('*')
          .eq('user_id', user.id)
          .neq('status', 'draft')
          .gte('injury_date', firstDayStr)
          .lte('injury_date', lastDayStr)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Calculate stats using severity_level from database
        const totalMonth = reports?.length || 0;
        let mild = 0;
        let moderate = 0;
        let severe = 0;

        reports?.forEach((report) => {
          if (!report.severity_level) return;
          
          const severityLevel = report.severity_level.toLowerCase().trim();
          
          if (severityLevel === 'ringan') {
            mild++;
          } else if (severityLevel === 'sedang') {
            moderate++;
          } else if (severityLevel === 'berat') {
            severe++;
          }
        });

        setStats({ totalMonth, mild, moderate, severe });

        // Get 3 most recent injuries
        const recent = reports?.slice(0, 3) || [];
        setRecentEventInjuries(recent);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  const handleLogout = () => {
    onNavigate('logout');
  };

  // Helper function to get severity label from database
  const getSeverityLabel = (severityLevel: string | null): string => {
    if (!severityLevel) return 'TIDAK DIKETAHUI';
    
    const level = severityLevel.toLowerCase().trim();
    
    if (level === 'ringan') return 'RINGAN';
    if (level === 'sedang') return 'SEDANG';
    if (level === 'berat') return 'BERAT';
    
    return 'TIDAK DIKETAHUI';
  };

  // Helper function to get first injury location
  const getFirstInjuryLocation = (injuries: any): string => {
    if (Array.isArray(injuries) && injuries.length > 0) {
      return injuries[0].location || 'Tidak diketahui';
    }
    return 'Tidak diketahui';
  };

  const handleInjuryClick = async (injury: InjuryReport) => {
    // Convert InjuryReport to LaporanData format
    const injuries = Array.isArray(injury.injuries) ? injury.injuries : [];
    const redFlags = Array.isArray(injury.red_flags) ? injury.red_flags : [];
    
    // Fetch pelapor data using unified helper
    const pelapor = await fetchPelaporData(injury.user_id);
    
    const laporanData: LaporanData = {
      id: injury.id.toString(),
      namaAtlet: injury.athlete_name,
      jenisKelamin: injury.gender,
      usia: injury.age,
      tanggalKejadian: injury.injury_date,
      jenisAktivitas: injury.activity_type,
      konteks: injury.activity_context,
      cederaDetails: injuries.map((inj: any) => ({
        lokasi: inj.location || '',
        jenis: inj.type || '',
        mekanisme: inj.mechanism || ''
      })),
      kemampuanGerak: injury.movement_ability,
      tingkatNyeri: injury.pain_level,
      redFlags: redFlags.map((flag: any) => typeof flag === 'string' ? flag : flag.name || ''),
      severityLevel: injury.severity_level || undefined,
      pelapor,
      status: injury.status,
      tanggalLapor: formatDateOnly(injury.created_at),
      tanggalVerifikasi: formatDateOnly(injury.verified_at),
      verifikator: injury.verified_by || undefined
    };
    
    setSelectedInjury(laporanData);
    setIsModalOpen(true);
  };

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
                <p className="text-sm">{profile?.full_name || 'Admin Daerah'}</p>
                <p className="text-xs text-gray-600">{profile?.wilayah || 'Indonesia'}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Total Laporan Bulan Ini</h3>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl">{stats.totalMonth}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Cedera Ringan</h3>
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl text-green-600">{stats.mild}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalMonth > 0 ? ((stats.mild / stats.totalMonth) * 100).toFixed(0) : 0}% dari total
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Cedera Sedang</h3>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl text-yellow-600">{stats.moderate}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalMonth > 0 ? ((stats.moderate / stats.totalMonth) * 100).toFixed(0) : 0}% dari total
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Cedera Berat</h3>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl text-red-600">{stats.severe}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalMonth > 0 ? ((stats.severe / stats.totalMonth) * 100).toFixed(0) : 0}% dari total
            </p>
          </div>
        </div>

        {/* Recent Injuries Overview */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2>Overview Cedera Terkini</h2>
              <p className="text-sm text-gray-600 mt-1">
                {recentEventInjuries.length} cedera terakhir yang Anda laporkan
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
            {recentEventInjuries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Belum ada laporan cedera bulan ini</p>
              </div>
            ) : (
              recentEventInjuries.map((injury) => {
                const severity = getSeverityLabel(injury.severity_level);
                const location = getFirstInjuryLocation(injury.injuries);
                return (
                  <div
                    key={injury.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleInjuryClick(injury)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm text-gray-900">{injury.athlete_name}</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            severity === 'RINGAN' || severity === 'SEDANG'
                              ? 'bg-green-100 text-green-800'
                              : severity === 'BERAT'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {location} • {injury.activity_type} • {injury.activity_context}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('input-cedera')}
            className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-left hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="text-blue-900 mb-1">Input Cedera Baru</h3>
            <p className="text-sm text-blue-700">Laporkan cedera dari atlet Anda</p>
          </button>

          <button
            onClick={() => onNavigate('riwayat')}
            className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 text-left hover:bg-gray-100 transition-colors"
          >
            <Activity className="w-8 h-8 text-gray-600 mb-2" />
            <h3 className="text-gray-900 mb-1">Riwayat Lengkap</h3>
            <p className="text-sm text-gray-600">Lihat semua laporan cedera Anda</p>
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
          </>
        )}
      </main>

      {/* Modal Ringkasan Data */}
      {selectedInjury && (
        <ModalRingkasanData
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedInjury(null);
          }}
          data={selectedInjury}
        />
      )}
    </div>
  );
}