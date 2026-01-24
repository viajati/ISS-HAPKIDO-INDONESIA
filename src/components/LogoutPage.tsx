import { LogOut, ArrowLeft } from 'lucide-react';

interface LogoutPageProps {
  onNavigate: (page: string) => void;
  fromPage?: string;
}

export function LogoutPage({ onNavigate, fromPage = 'dashboard-coach' }: LogoutPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <LogOut className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="mb-2">Konfirmasi Logout</h1>
          <p className="text-gray-600">
            Apakah Anda yakin ingin keluar dari sistem?
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            <strong>Perhatian:</strong> Anda akan keluar dari sesi dan harus login kembali untuk mengakses sistem.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onNavigate('home')}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Ya, Logout Sekarang
          </button>

          <button
            onClick={() => onNavigate(fromPage)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
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
