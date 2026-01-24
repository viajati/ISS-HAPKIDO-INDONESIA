import { Home } from 'lucide-react';

interface FloatingHomeButtonProps {
  onNavigate: (page: string) => void;
}

export function FloatingHomeButton({ onNavigate }: FloatingHomeButtonProps) {
  return (
    <button
      onClick={() => onNavigate('home')}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-105"
      style={{ backgroundColor: 'var(--blue-0)' }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--blue-10)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--blue-0)'}
      aria-label="Kembali ke halaman utama"
    >
      <Home className="w-5 h-5" />
      <span>Kembali ke Halaman Utama</span>
    </button>
  );
}