import { Menu } from 'lucide-react';

interface NavigationBarProps {
  onMenuClick: () => void;
}

export function NavigationBar({ onMenuClick }: NavigationBarProps) {

  return (
    <div className="sticky top-[73px] z-30 bg-gray-50 border-b border-gray-200 shadow-md">
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex items-center justify-between gap-3">
          {/* Menu Utama Button - Left */}
          <button
            onClick={onMenuClick}
            className="text-white px-3 py-1.5 rounded transition-all flex items-center gap-2 whitespace-nowrap text-sm shadow-sm"
            style={{ backgroundColor: 'var(--teal-0)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--teal-10)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--teal-0)';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
            }}
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4 text-white" />
            <span className="text-xs md:text-sm text-white">Menu Lengkap</span>
          </button>
        </div>
      </div>
    </div>
  );
}