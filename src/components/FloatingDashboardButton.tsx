import { Home } from 'lucide-react';

interface FloatingDashboardButtonProps {
  onNavigate: (page: string) => void;
  dashboardType?: 'coach' | 'regional' | 'national';
}

export function FloatingDashboardButton({ onNavigate, dashboardType = 'coach' }: FloatingDashboardButtonProps) {
  const handleClick = () => {
    onNavigate(`dashboard-${dashboardType}`);
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-105 z-40"
    >
      <Home className="w-5 h-5" />
      <span>Kembali ke Dashboard</span>
    </button>
  );
}