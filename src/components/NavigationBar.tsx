import { Menu, Search } from 'lucide-react';
import { useState } from 'react';

interface NavigationBarProps {
  onMenuClick: () => void;
  variant?: 'hero' | 'content';
}

export function NavigationBar({ onMenuClick, variant = 'content' }: NavigationBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log('Search query:', searchQuery);
  };

  const isHero = variant === 'hero';
  const inputBg = isHero ? 'bg-white' : 'bg-white';

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

          {/* Search Bar - Right */}
          <form onSubmit={handleSearch} className="relative flex-shrink-0">
            <input
              type="text"
              placeholder="SEARCH..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-40 md:w-56 px-3 py-1.5 pr-9 rounded text-gray-800 text-xs placeholder-gray-400 focus:outline-none ${inputBg} border`}
              style={{ 
                borderColor: isHero ? 'white' : 'var(--gray-10)',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--teal-0)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0,150,136,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isHero ? 'white' : 'var(--gray-10)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              aria-label="Search"
            >
              <Search className="w-4 h-4 text-gray-500" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}