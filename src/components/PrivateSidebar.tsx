import { X, Home, FileText, BarChart3, BookOpen, LogOut, FileClock, User, CheckSquare, Download, Users, Key } from 'lucide-react';
import Image from 'next/image';

interface PrivateSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  currentPage: string;
  userRole: 'pelatih' | 'admin_daerah' | 'admin_nasional';
  // userName prop removed (was unused)
}

export function PrivateSidebar({ 
  isOpen, 
  onClose, 
  onNavigate, 
  onLogout,
  currentPage, 
  userRole
  }: Omit<PrivateSidebarProps, 'userName'>) {
  const handleNavigation = (page: string) => {
    // Special handling for Beranda - go to homepage while staying logged in
    if (page === 'beranda') {
      onNavigate('home');
    } else if (page === 'dashboard') {
      // Map role to dashboard page
      const roleToDashboard = {
        'pelatih': 'dashboard-coach',
        'admin_daerah': 'dashboard-regional',
        'admin_nasional': 'dashboard-national'
      };
      onNavigate(roleToDashboard[userRole]);
    } else {
      onNavigate(page);
    }
    onClose();
  };

  // Different menu items based on role
  const getMenuItems = () => {
    if (userRole === 'admin_nasional') {
      // Admin Nasional has different menu structure
      return [
        { id: 'dashboard', icon: Home, label: 'Dashboard', type: 'item' },
        { id: 'input-cedera', icon: FileText, label: 'Ajukan Laporan', type: 'item' },
        { id: 'riwayat', icon: BarChart3, label: 'Riwayat Laporan', type: 'item' },
        { id: 'draft', icon: FileClock, label: 'Draft', type: 'item' },
        { id: 'manajemen-data-heading', label: 'Manajemen Data', type: 'heading' },
        { id: 'menunggu-verifikasi', icon: CheckSquare, label: 'Menunggu Verifikasi', type: 'subitem' },
        { id: 'sudah-verifikasi', icon: CheckSquare, label: 'Sudah Terverifikasi', type: 'subitem' },
        { id: 'data-ekspor-heading', label: 'Data dan Ekspor', type: 'heading' },
        { id: 'visualisasi-data', icon: BarChart3, label: 'Visualisasi Data', type: 'subitem' },
        { id: 'download-center', icon: Download, label: 'Download Center', type: 'subitem' },
        { id: 'manajemen-pengguna-heading', label: 'Manajemen Pengguna', type: 'heading' },
        { id: 'manajemen-pengguna', icon: Users, label: 'Kelola Akun', type: 'subitem' },
        { id: 'token-generator', icon: Key, label: 'Token Generator', type: 'subitem' },
        { id: 'profil', icon: User, label: 'Profil', type: 'item' },
      ];
    } else {
      // Pelatih and Admin Daerah menu structure
      return [
        { id: 'dashboard', icon: Home, label: 'Dashboard', type: 'item' },
        { id: 'input-cedera', icon: FileText, label: 'Ajukan Laporan', type: 'item' },
        { id: 'riwayat', icon: BarChart3, label: 'Riwayat Laporan', type: 'item' },
        { id: 'draft', icon: FileClock, label: 'Draft', type: 'item' },
        { id: 'panduan-private', icon: BookOpen, label: 'Panduan Input', type: 'item' },
        { id: 'profil', icon: User, label: userRole === 'pelatih' ? 'Profil Pelatih' : 'Profil Pengurus', type: 'item' },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white w-64 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/hapkido-logo.png"
                  alt="Hapkido Indonesia Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
                <div>
                  <h2 className="text-white text-sm">ISS</h2>
                  <p className="text-gray-400 text-xs">Hapkido Indonesia</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 sidebar-scroll">
            <div className="space-y-1">
              {menuItems.map((item) => {
                // Heading - tidak clickable
                if (item.type === 'heading') {
                  return (
                    <div key={item.id} className="pt-4 pb-2 px-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{item.label}</p>
                    </div>
                  );
                }

                const Icon = item.icon;
                const isActive = 
                  currentPage === item.id || 
                  (item.id === 'dashboard' && currentPage.startsWith('dashboard-')) ||
                  (item.id === 'panduan-private' && currentPage === 'panduan-private');
                
                // Subitem - ada indent
                const isSubitem = item.type === 'subitem';
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                      isSubitem ? 'pl-6' : ''
                    } ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {Icon ? <Icon className="w-5 h-5" /> : <span className="w-5 h-5" />}
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full p-3 rounded-lg text-red-400 hover:bg-gray-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}