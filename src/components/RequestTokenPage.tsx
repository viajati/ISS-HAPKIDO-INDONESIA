import { useState } from 'react';
import { Key, Mail, User } from 'lucide-react';

interface RequestTokenPageProps {
  onNavigate: (page: string) => void;
}

export function RequestTokenPage({ onNavigate }: RequestTokenPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dojang: '',
    role: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Token request:', formData);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="mb-2">Request Private Token</h1>
          <p className="text-gray-600 text-sm">
            Ajukan permintaan token untuk mendaftar ke sistem ISS
          </p>
        </div>

        {!submitted ? (
          <>
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm text-blue-900 mb-2">📋 Informasi Penting</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Private Token diperlukan untuk mendaftar ke sistem ISS</li>
                <li>• Token hanya diberikan kepada anggota resmi Hapkido Indonesia</li>
                <li>• Permohonan akan diproses oleh pengurus daerah/pusat</li>
                <li>• Anda akan menerima token melalui email/WhatsApp setelah diverifikasi</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm mb-2 text-gray-700">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Nama sesuai KTP"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm mb-2 text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm mb-2 text-gray-700">
                    Nomor WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm mb-2 text-gray-700">
                    Peran <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  >
                    <option value="">Pilih peran</option>
                    <option value="coach">Pelatih</option>
                    <option value="regional-admin">Admin Daerah</option>
                    <option value="national-admin">Admin Nasional</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="dojang" className="block text-sm mb-2 text-gray-700">
                  Dojang/Cabang <span className="text-red-500">*</span>
                </label>
                <input
                  id="dojang"
                  name="dojang"
                  type="text"
                  value={formData.dojang}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Nama dojang atau cabang"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm mb-2 text-gray-700">
                  Pesan Tambahan (Opsional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Informasi tambahan yang perlu diketahui pengurus"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
              >
                Ajukan Permintaan Token
              </button>
            </form>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-sm mb-3">💬 Kontak Pengurus</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Pengurus Pusat:</strong></p>
                <p className="text-xs">Email: admin@hapkidoindonesia.org</p>
                <p className="text-xs">WhatsApp: +62 812 3456 7890</p>
                <p className="text-xs mt-2 text-gray-500">
                  Anda juga dapat menghubungi langsung pengurus daerah untuk mendapatkan token lebih cepat.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-green-800">Permintaan Berhasil Dikirim!</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm mb-2">
                Permintaan token Anda telah diterima dan akan diproses oleh pengurus.
              </p>
              <p className="text-green-700 text-sm">
                Anda akan menerima private token melalui email <strong>{formData.email}</strong> dan 
                WhatsApp dalam 1-3 hari kerja setelah verifikasi.
              </p>
            </div>
            <button
              onClick={() => onNavigate('login')}
              className="text-blue-600 hover:underline text-sm"
            >
              Kembali ke Login
            </button>
          </div>
        )}

        {/* Back Links */}
        <div className="mt-6 text-center space-x-4 text-sm">
          <button
            onClick={() => onNavigate('signup')}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Kembali ke Daftar
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => onNavigate('home')}
            className="text-gray-500 hover:text-gray-700"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}