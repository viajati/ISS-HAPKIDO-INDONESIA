import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NavigationBar } from './NavigationBar';
import { FloatingHomeButton } from './FloatingHomeButton';
import { Shield, Target, Users, Lock, ClipboardCheck, Award, Building2 } from 'lucide-react';
import { Info } from 'lucide-react';

interface TentangPageProps {
  onNavigate: (page: string) => void;
}

export function TentangPage({ onNavigate }: TentangPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onNavigate={onNavigate} />
      <Header 
        onNavigate={onNavigate}
      />
      <FloatingHomeButton onNavigate={onNavigate} />
      
      {/* Navigation Bar */}
      <NavigationBar onMenuClick={() => setIsSidebarOpen(true)} />
      
      {/* Hero Section */}
      <div className="text-white py-3 md:py-4" style={{ background: 'linear-gradient(135deg, var(--dark-navy-0), var(--dark-navy-20))' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--teal-0)' }}>
                <Info className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="mb-1 text-white text-3xl">Tentang <span className="italic">Injury Surveillance System</span></h1>
            <p className="text-white opacity-80">
              Sistem pemantauan cedera profesional untuk keselamatan atlet Hapkido Indonesia
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-32 max-w-5xl">
        {/* Tentang ISS */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8" style={{ color: 'var(--teal-0)' }} />
            <h2>Tentang ISS</h2>
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">
            <strong><span className="italic">Injury Surveillance System (ISS)</span></strong> Hapkido Indonesia adalah sistem resmi yang dikembangkan untuk mencatat, memantau, dan menganalisis kejadian cedera yang terjadi selama latihan maupun event Hapkido di seluruh Indonesia.
          </p>
          <p className="text-gray-700 mb-4 leading-relaxed">
            ISS dirancang sebagai basis data terpusat yang memungkinkan pengumpulan data cedera secara berkelanjutan, terstruktur, dan terstandar, sehingga informasi cedera tidak lagi bersifat insidental atau <em>snapshot</em>, melainkan dapat dianalisis secara longitudinal atau berkelanjutan.
          </p>
          
          <div className="border-l-4 p-6 mt-6 rounded-r-lg" style={{ backgroundColor: 'var(--teal-50)', borderColor: 'var(--teal-0)' }}>
            <h3 className="mb-4" style={{ color: 'var(--teal-0)' }}>Melalui ISS, pelatih dan pengurus dapat:</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0" style={{ color: 'var(--teal-0)' }}>✓</span>
                <span>Mendokumentasikan kejadian cedera secara sistematis</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0" style={{ color: 'var(--teal-0)' }}>✓</span>
                <span>Mengidentifikasi pola cedera berdasarkan waktu, lokasi, jenis aktivitas, dan karakteristik atlet</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0" style={{ color: 'var(--teal-0)' }}>✓</span>
                <span>Mendukung pengambilan keputusan berbasis data terkait keselamatan latihan dan event</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0" style={{ color: 'var(--teal-0)' }}>✓</span>
                <span>Menjadi dasar pengembangan kebijakan, edukasi, dan peningkatan mutu pembinaan Hapkido</span>
              </li>
            </ul>
          </div>

          <div className="bg-red-50 border-l-4 p-4 mt-6 rounded-r-lg" style={{ borderColor: 'var(--coral-0)' }}>
            <p className="text-gray-800">
              <strong style={{ color: 'var(--coral-0)' }}>⚠️ Perhatian:</strong> ISS tidak dimaksudkan sebagai alat diagnosis medis, melainkan sebagai sistem pemantauan cedera untuk kepentingan pencegahan, evaluasi, dan perencanaan respons keselamatan yang lebih baik di lingkungan Hapkido.
            </p>
          </div>

          <p className="text-gray-700 mt-6 leading-relaxed">
            Pengelolaan ISS dilakukan secara bertingkat sesuai peran pengguna, dengan tujuan menjaga akurasi data, akuntabilitas, dan integritas sistem, sekaligus mendukung upaya peningkatan keselamatan atlet secara nasional.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center text-white rounded-lg p-8" style={{ background: 'linear-gradient(135deg, var(--teal-0), var(--teal-20))' }}>
          <h2 className="mb-4 text-white" style={{ fontWeight: 'bold' }}>Siap Menggunakan Sistem?</h2>
          <p className="mb-6 text-white opacity-90" style={{ fontWeight: '600' }}>
            Login untuk mulai melaporkan cedera dan mengakses dashboard Anda
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="bg-white px-8 py-3 rounded-lg transition-colors"
            style={{ color: 'var(--teal-0)', fontWeight: 'bold' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--teal-50)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Login ke Sistem ISS
          </button>
        </div>
      </div>
    </div>
  );
}