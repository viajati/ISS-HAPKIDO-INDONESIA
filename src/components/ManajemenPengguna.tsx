import { useState, useEffect, useMemo } from 'react';
import { PrivateSidebar } from './PrivateSidebar';
import { Users, Search, Shield, UserCircle, ChevronLeft, ChevronRight, Power, PowerOff, Copy, Check } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { PROVINSI_INDONESIA } from '../lib/constants';

interface ManajemenPenggunaProps {
  onNavigate: (page: string) => void;
}

interface User {
  id: string; // UUID from profiles.id
  nama: string;
  email: string;
  role: 'admin_daerah' | 'pelatih';
  wilayah: string | null;
  status: 'active' | 'inactive';
  registeredDate: string;
}

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export function ManajemenPengguna({ onNavigate }: ManajemenPenggunaProps) {
  const { profile, loadingProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin_daerah' | 'pelatih'>('all');
  const [filterWilayah, setFilterWilayah] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const handleLogout = () => {
    onNavigate('logout');
  };

  const copyToClipboard = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success('ID berhasil disalin');
    } catch (err) {
      toast.error('Gagal menyalin ID');
    }
  };

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

  // Data pengguna dari backend
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = await getAccessToken();
        if (!token) throw new Error('Session tidak ditemukan. Silakan login ulang.');

        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal mengambil data pengguna');

        setUsers(
          (json.users || []).map((u: any) => ({
            id: u.id,
            nama: u.full_name ?? '-',
            email: u.email ?? '-',
            role: u.role,
            wilayah: u.wilayah ?? null,
            status: u.is_active ? 'active' : 'inactive',
            registeredDate: u.created_at ? String(u.created_at).slice(0, 10) : '',
          }))
        );
      } catch (err: any) {
        setError(err.message || 'Gagal mengambil data pengguna');
      } finally {
        setLoading(false);
      }
    };

    // biar tidak fetch sebelum profile siap
    if (!loadingProfile && profile?.role === 'admin_nasional') fetchUsers();
  }, [loadingProfile, profile]);

  // Fungsi untuk toggle status akun
  const handleToggleStatus = async (userId: string, currentStatus: 'active' | 'inactive') => {
    const nextActive = currentStatus !== 'active';
    const action = nextActive ? 'mengaktifkan' : 'menonaktifkan';

    if (!confirm(`Apakah Anda yakin ingin ${action} akun ini?`)) return;

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Session tidak ditemukan. Silakan login ulang.');

      const res = await fetch('/api/users/toggle', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, nextActive }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal update status');

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextActive ? 'active' : 'inactive' } : u))
      );

      toast.success(`Akun berhasil ${nextActive ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch (e: any) {
      toast.error(e.message || 'Gagal update status');
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesWilayah = !filterWilayah || 
                          (user.wilayah && user.wilayah.toLowerCase().includes(filterWilayah.toLowerCase()));
    return matchesSearch && matchesRole && matchesWilayah;
  });

  // Get unique wilayah for suggestions
  const wilayahSuggestions = useMemo(() => {
    const uniqueWilayah = new Set<string>();
    users.forEach(u => {
      if (u.wilayah && PROVINSI_INDONESIA.includes(u.wilayah as any)) {
        uniqueWilayah.add(u.wilayah);
      }
    });
    return Array.from(uniqueWilayah).sort((a, b) => a.localeCompare(b, 'id-ID'));
  }, [users]);

  // Statistics
  const stats = {
    totalAdminDaerah: users.filter(u => u.role === 'admin_daerah').length,
    totalPelatih: users.filter(u => u.role === 'pelatih').length,
    totalActive: users.filter(u => u.status === 'active').length,
    totalInactive: users.filter(u => u.status === 'inactive').length
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
        userRole="admin_nasional"
        onLogout={handleLogout}
        currentPage="manajemen-pengguna"
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
                <Users className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl">Kelola Akun</h1>
                <p className="text-sm text-gray-600">Manajemen akun Admin Daerah dan Pelatih</p>
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Admin Daerah</h3>
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl text-blue-600">{stats.totalAdminDaerah}</p>
            <p className="text-xs text-gray-500 mt-1">Total akun Admin Daerah</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Pelatih</h3>
              <UserCircle className="w-5 h-5 text-teal-600" />
            </div>
            <p className="text-3xl text-teal-600">{stats.totalPelatih}</p>
            <p className="text-xs text-gray-500 mt-1">Total akun Pelatih</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Aktif</h3>
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl text-green-600">{stats.totalActive}</p>
            <p className="text-xs text-gray-500 mt-1">Pengguna aktif</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">Tidak Aktif</h3>
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-3xl text-gray-600">{stats.totalInactive}</p>
            <p className="text-xs text-gray-500 mt-1">Pengguna tidak aktif</p>
          </div>
        </div>

        {/* Filter & Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as 'all' | 'admin_daerah' | 'pelatih')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Semua Role</option>
                <option value="admin_daerah">Admin Daerah</option>
                <option value="pelatih">Pelatih</option>
              </select>

              <input
                type="text"
                placeholder="Filter provinsi..."
                value={filterWilayah}
                onChange={(e) => setFilterWilayah(e.target.value)}
                list="wilayah-suggestions"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <datalist id="wilayah-suggestions">
                {PROVINSI_INDONESIA.map(provinsi => (
                  <option key={provinsi} value={provinsi} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Wilayah
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Terdaftar
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p>Tidak ada pengguna ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span 
                            className="font-mono text-xs text-blue-600"
                            title={user.id}
                          >
                            {user.id.slice(0, 8)}...
                          </span>
                          <button
                            onClick={() => copyToClipboard(user.id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Copy full ID"
                          >
                            {copiedId === user.id ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.nama}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 rounded-full border ${
                          user.role === 'admin_daerah'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-teal-100 text-teal-800 border-teal-300'
                        }`}>
                          {user.role === 'admin_daerah' ? 'Admin Daerah' : 'Pelatih'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.wilayah}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 rounded-full border ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-gray-100 text-gray-800 border-gray-300'
                        }`}>
                          {user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.registeredDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                            user.status === 'active'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                              : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                          }`}
                          title={user.status === 'active' ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                        >
                          {user.status === 'active' ? (
                            <>
                              <PowerOff className="w-3.5 h-3.5" />
                              <span>Nonaktifkan</span>
                            </>
                          ) : (
                            <>
                              <Power className="w-3.5 h-3.5" />
                              <span>Aktifkan</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} dari {filteredUsers.length} pengguna
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 text-gray-400">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:bg-blue-50'
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