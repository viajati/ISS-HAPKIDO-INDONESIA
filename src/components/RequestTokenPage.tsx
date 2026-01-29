import { Key, Mail, Phone, MessageSquare } from 'lucide-react';

interface RequestTokenPageProps {
  onNavigate: (page: string) => void;
}

export function RequestTokenPage({ onNavigate }: RequestTokenPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="mb-2">Cara Mendapatkan Private Token</h1>
          <p className="text-gray-600 text-sm">
            Hubungi pengurus untuk mendapatkan token pendaftaran
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">📋 Tentang Private Token</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Private Token diperlukan untuk mendaftar ke sistem ISS</li>
            <li>• Token hanya diberikan kepada anggota resmi Hapkido Indonesia</li>
            <li>• Setiap token memiliki role dan wilayah yang sudah ditentukan</li>
          </ul>
        </div>

        {/* Contact Options */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-900">Hubungi Pengurus:</h3>
          
          {/* Admin Pusat */}
          <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Pengurus Pusat ISS Hapkido Indonesia
            </h4>
            <div className="space-y-3">
              <a
                href="mailto:iss@hapkido-indonesia.org"
                className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Mail className="w-5 h-5 text-blue-600" />
                <span>iss@hapkido-indonesia.org</span>
              </a>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-700 hover:text-green-600 transition-colors"
              >
                <Phone className="w-5 h-5 text-green-600" />
                <span>+62 812-3456-7890 (WhatsApp)</span>
              </a>
            </div>
          </div>

          {/* Admin Daerah */}
          <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              Pengurus Daerah di Provinsi Anda
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Hubungi pengurus daerah Hapkido di provinsi tempat Anda berlatih untuk mendapatkan token.
            </p>
            <div className="flex items-start gap-3 text-sm text-gray-700">
              <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-gray-500">
                Untuk kontak admin daerah, hubungi pengurus pusat atau dojang Anda.
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-semibold text-yellow-900 mb-2">💡 Yang Perlu Disiapkan:</h4>
          <ul className="text-xs text-yellow-800 space-y-1">
            <li>• Nama lengkap sesuai KTP</li>
            <li>• Email aktif untuk pendaftaran</li>
            <li>• Nomor WhatsApp</li>
            <li>• Nama dojang tempat berlatih</li>
            <li>• Posisi/role yang diinginkan (pelatih, admin daerah, dll)</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href="mailto:iss@hapkido-indonesia.org?subject=Permintaan%20Private%20Token%20ISS&body=Nama%3A%0AEmail%3A%0ANo%20WhatsApp%3A%0ADojang%3A%0ARole%3A"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" />
            Kirim Email ke Pengurus Pusat
          </a>
          
          <a
            href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20mendaftar%20ke%20sistem%20ISS%20Hapkido%20Indonesia.%20Mohon%20info%20untuk%20mendapatkan%20Private%20Token."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Chat WhatsApp Pengurus Pusat
          </a>

          <button
            onClick={() => onNavigate('signup')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg transition-colors"
          >
            Sudah Punya Token? Daftar Sekarang
          </button>
          
          <button
            onClick={() => onNavigate('home')}
            className="w-full text-gray-600 hover:text-gray-800 py-2 transition-colors"
          >
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}