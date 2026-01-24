import { X, Search, Building2, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';
import logoImage from '../../public/assets/hapkido-logo.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string) => void;
}

export function Sidebar({ isOpen, onClose, onNavigate }: SidebarProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-black text-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div className="bg-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleNavigation('home')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity w-full text-left"
            >
              <img
                src={logoImage}
                alt="Hapkido Indonesia Logo"
                className="w-14 h-14 object-contain"
              />
              <div>
                <div className="text-red-600 uppercase tracking-tight">
                  HAPKIDO
                </div>
                <div className="text-red-600 uppercase tracking-tight">
                  INDONESIA
                </div>
              </div>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              <button
                onClick={() => handleNavigation('tentang')}
                className="flex items-center gap-3 hover:bg-gray-800 p-3 rounded transition-colors w-full text-left"
              >
                <span>ℹ️</span>
                <span>Tentang ISS</span>
              </button>
              <button
                onClick={() => handleNavigation('panduan-pengguna')}
                className="flex items-center gap-3 hover:bg-gray-800 p-3 rounded transition-colors w-full text-left"
              >
                <span>📖</span>
                <span>Panduan Penggunaan ISS</span>
              </button>
              <button
                onClick={() => handleNavigation('edukasi-cedera')}
                className="flex items-center gap-3 hover:bg-gray-800 p-3 rounded transition-colors w-full text-left"
              >
                <span>🏥</span>
                <span>Modul Edukasi Cedera</span>
              </button>
              <button
                onClick={() => handleNavigation('hasil-analisis')}
                className="flex items-center gap-3 hover:bg-gray-800 p-3 rounded transition-colors w-full text-left"
              >
                <span>📊</span>
                <span>Hasil Analisis Cedera</span>
              </button>
              <button
                onClick={() => handleNavigation('login')}
                className="flex items-center gap-3 hover:bg-gray-800 p-3 rounded transition-colors w-full text-left"
              >
                <span>✏️</span>
                <span>Input Data Cedera</span>
              </button>
              <button
                onClick={() => handleNavigation('faqs')}
                className="flex items-center gap-3 hover:bg-gray-800 p-3 rounded transition-colors w-full text-left"
              >
                <span>❓</span>
                <span>FAQs</span>
              </button>
              <button
                onClick={() => handleNavigation('help-contact')}
                className="flex items-center gap-3 hover:bg-gray-800 p-3 rounded transition-colors w-full text-left"
              >
                <span>📞</span>
                <span>Help & Contact</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}