import { useState } from 'react';
import { User, Phone, MapPin, Shield, Calendar, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import logoImage from '../../public/assets/hapkido-logo.png';
import { PROVINSI_INDONESIA } from '../lib/constants';

interface RegistrationPageProps {
  onNavigate: (page: string) => void;
  userRole?: 'coach' | 'regional-admin' | 'national-admin';
}

export function RegistrationPage({ onNavigate, userRole = 'coach' }: RegistrationPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Data Pribadi
    dateOfBirth: '',
    gender: '',
    address: '',
    phone: '',
    
    // Step 2: Data Hapkido
    sabukLevel: '',
    dojang: '',
    region: '',
    licenseNumber: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validasi per step
    if (currentStep === 1) {
      if (!formData.dateOfBirth || !formData.gender || !formData.address || !formData.phone) {
        alert('Mohon lengkapi semua data pribadi');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.sabukLevel || !formData.dojang || !formData.region) {
        alert('Mohon lengkapi semua data Hapkido');
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    console.log('Registration data:', formData);
    
    // Navigate to appropriate dashboard based on role
    if (userRole === 'coach') {
      onNavigate('dashboard-coach');
    } else if (userRole === 'regional-admin') {
      onNavigate('dashboard-regional');
    } else if (userRole === 'national-admin') {
      onNavigate('dashboard-national');
    }
  };

  const sabukLevels = [
    'Sabuk Putih (10th Gup)',
    'Sabuk Kuning (9th - 8th Gup)',
    'Sabuk Hijau (7th - 6th Gup)',
    'Sabuk Biru (5th - 4th Gup)',
    'Sabuk Merah (3rd - 2nd Gup)',
    'Sabuk Coklat (1st Gup)',
    '1st Dan (Sabuk Hitam I)',
    '2nd Dan (Sabuk Hitam II)',
    '3rd Dan (Sabuk Hitam III)',
    '4th Dan (Sabuk Hitam IV)',
    '5th Dan (Sabuk Hitam V)',
    '6th Dan (Sabuk Hitam VI)',
    '7th Dan (Sabuk Hitam VII)',
    '8th Dan (Sabuk Hitam VIII)',
    '9th Dan (Sabuk Hitam IX)',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src={logoImage.src} 
            alt="Hapkido Indonesia Logo" 
            className="w-20 h-20 mx-auto mb-4 object-contain"
          />
          <h1 className="mb-2">Lengkapi Data Profil</h1>
          <p className="text-gray-600 text-sm">Silakan lengkapi data profil Anda untuk melanjutkan</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <span className="text-sm hidden sm:inline">Data Pribadi</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {currentStep > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
              </div>
              <span className="text-sm hidden sm:inline">Data Hapkido</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="text-sm hidden sm:inline">Konfirmasi</span>
            </div>
          </div>
        </div>

        {/* Step 1: Data Pribadi */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="mb-4">Data Pribadi</h2>
            
            <div>
              <label htmlFor="dateOfBirth" className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Tanggal Lahir
              </label>
              <input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>

            <div>
              <label htmlFor="gender" className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Jenis Kelamin
              </label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label htmlFor="address" className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                Alamat Lengkap
              </label>
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                rows={3}
                placeholder="Masukkan alamat lengkap"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                Nomor Telepon
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="+62 812 3456 7890"
                required
              />
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
            >
              Lanjutkan
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Data Hapkido */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="mb-4">Data Hapkido</h2>
            
            <div>
              <label htmlFor="sabukLevel" className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <Shield className="w-4 h-4" />
                Tingkat Sabuk Saat Ini
              </label>
              <select
                id="sabukLevel"
                value={formData.sabukLevel}
                onChange={(e) => handleChange('sabukLevel', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              >
                <option value="">Pilih Tingkat Sabuk</option>
                {sabukLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="region" className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                Provinsi
              </label>
              <select
                id="region"
                value={formData.region}
                onChange={(e) => handleChange('region', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              >
                <option value="">-- Pilih Provinsi --</option>
                {PROVINSI_INDONESIA.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dojang" className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                Nama Dojang / Klub
              </label>
              <input
                id="dojang"
                type="text"
                value={formData.dojang}
                onChange={(e) => handleChange('dojang', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Contoh: Dojang Jakarta Pusat"
                required
              />
            </div>

            <div>
              <label htmlFor="licenseNumber" className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <Shield className="w-4 h-4" />
                Nomor Lisensi Pelatih <span className="text-gray-500">(Opsional)</span>
              </label>
              <input
                id="licenseNumber"
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => handleChange('licenseNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Contoh: PEL-2024-001"
              />
              <p className="text-xs text-gray-500 mt-1">
                Khusus untuk pelatih bersertifikat
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Kembali
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Lanjutkan
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Konfirmasi */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="mb-4">Konfirmasi Data</h2>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-sm text-gray-600 mb-3">Data Pribadi</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Tanggal Lahir:</span>
                    <span className="text-gray-900">{formData.dateOfBirth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Jenis Kelamin:</span>
                    <span className="text-gray-900">{formData.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Nomor Telepon:</span>
                    <span className="text-gray-900">{formData.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-700">Alamat:</span>
                    <p className="text-gray-900 mt-1">{formData.address}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm text-gray-600 mb-3">Data Hapkido</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Tingkat Sabuk:</span>
                    <span className="text-gray-900">{formData.sabukLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Wilayah:</span>
                    <span className="text-gray-900">{formData.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Dojang:</span>
                    <span className="text-gray-900">{formData.dojang}</span>
                  </div>
                  {formData.licenseNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Nomor Lisensi:</span>
                      <span className="text-gray-900">{formData.licenseNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>📝 Catatan:</strong> Data yang Anda masukkan dapat diubah nanti melalui halaman Profil.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Kembali
              </button>
              <button
                onClick={handleSubmit}
                className="flex-[1.5] bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <CheckCircle className="w-5 h-5" />
                Selesai & Masuk
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}