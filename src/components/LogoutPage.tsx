import { LogOut, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../contexts/auth-context';

interface LogoutPageProps {
  onNavigate: (page: string) => void;
  fromPage?: string;
}

export function LogoutPage({ onNavigate, fromPage = 'dashboard-coach' }: LogoutPageProps) {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/assets/hapkido-logo.png"
            alt="Hapkido Indonesia Logo"
            width={80}
            height={80}
            className="w-20 h-20 mx-auto mb-4 object-contain"
            priority
          />
          <h1 className="mb-2">Konfirmasi Logout</h1>
          <p className="text-gray-600 text-sm">
            Apakah Anda yakin ingin keluar dari sistem?
          </p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <p className="text-blue-800 text-sm">
            <strong>Perhatian:</strong> Anda akan keluar dari sesi dan harus login kembali untuk mengakses sistem.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <LogOut className="w-5 h-5" />
            Ya, Logout Sekarang
          </button>

          <button
            onClick={() => onNavigate(fromPage)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Batal, Kembali ke Dashboard
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            Lupa menyimpan data? Pastikan semua perubahan sudah tersimpan sebelum logout.
          </p>
        </div>
      </div>
    </div>
  );
}
