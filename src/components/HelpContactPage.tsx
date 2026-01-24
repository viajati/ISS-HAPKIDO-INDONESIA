import { useState, useRef } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NavigationBar } from './NavigationBar';
import { FloatingHomeButton } from './FloatingHomeButton';
import { MessageCircle, ChevronDown, ChevronUp, Mail, Clock, AlertCircle, User, Shield, FileText, BookOpen, CheckCircle } from 'lucide-react';

interface HelpContactPageProps {
  onNavigate: (page: string) => void;
}

export function HelpContactPage({ onNavigate }: HelpContactPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const sectionRefs = {
    bantuan: useRef<HTMLDivElement>(null),
    pengguna: useRef<HTMLDivElement>(null),
    informasi: useRef<HTMLDivElement>(null),
    kontak: useRef<HTMLDivElement>(null),
    waktu: useRef<HTMLDivElement>(null),
    catatan: useRef<HTMLDivElement>(null),
  };

  const scrollToSection = (id: string) => {
    setOpenSection(id);
    setTimeout(() => {
      const ref = sectionRefs[id as keyof typeof sectionRefs];
      if (ref.current) {
        const yOffset = -120;
        const element = ref.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 150);
  };

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onNavigate={onNavigate} />
      <Header onNavigate={onNavigate} />
      <FloatingHomeButton onNavigate={onNavigate} />
      
      {/* Navigation Bar */}
      <NavigationBar onMenuClick={() => setIsSidebarOpen(true)} />
      
      {/* Hero Section */}
      <div className="text-white py-3 md:py-4" style={{ background: 'linear-gradient(135deg, var(--dark-navy-0), var(--dark-navy-20))' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--teal-0)' }}>
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="mb-1 text-white text-3xl">Help & Contact</h1>
            <p className="text-white opacity-80">
              <span className="italic">Injury Surveillance System</span> Hapkido Indonesia
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-32 max-w-5xl">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <p className="text-gray-700">
            Halaman ini disediakan untuk membantu pengguna ISS apabila mengalami kendala teknis, pertanyaan penggunaan sistem, atau membutuhkan klarifikasi terkait pelaporan cedera.
          </p>
        </div>

        {/* Navigasi Cepat */}
        <div className="bg-blue-50 rounded-lg shadow-md p-6 mb-6 border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
          <h2 className="mb-4 flex items-center gap-2" style={{ color: 'var(--dark-navy-0)' }}>
            <FileText className="w-6 h-6" />
            Navigasi Cepat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button onClick={() => scrollToSection('bantuan')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">1.</span> Bantuan Penggunaan ISS
            </button>
            <button onClick={() => scrollToSection('pengguna')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">2.</span> Jenis Pengguna & Jalur Bantuan
            </button>
            <button onClick={() => scrollToSection('informasi')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">3.</span> Informasi yang Perlu Disiapkan
            </button>
            <button onClick={() => scrollToSection('kontak')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">4.</span> Kontak Resmi ISS
            </button>
            <button onClick={() => scrollToSection('waktu')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">5.</span> Waktu Respons
            </button>
            <button onClick={() => scrollToSection('catatan')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">6.</span> Catatan Penting
            </button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-4">
          {/* Section 1: Bantuan Penggunaan ISS */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.bantuan}>
            <button
              onClick={() => toggleSection('bantuan')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <MessageCircle className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">1. Bantuan Penggunaan ISS</h2>
                </div>
              </div>
              {openSection === 'bantuan' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'bantuan' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <p className="text-gray-700 mb-4">Silakan hubungi kami jika Anda mengalami kendala terkait:</p>
                <ul className="space-y-2 text-gray-700 mb-6">
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Pendaftaran akun pelatih</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Permintaan atau penggunaan token verifikasi</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Login dan akses akun</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Pengisian atau pengiriman laporan cedera</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Akses riwayat laporan</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Kesalahan data yang sudah terinput</span>
                  </li>
                </ul>

                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                  <p className="text-gray-700 mb-2"><strong>Sebelum menghubungi, kami sarankan membaca terlebih dahulu:</strong></p>
                  <div className="space-y-2 ml-4">
                    <button
                      onClick={() => onNavigate('panduan-pengguna')}
                      className="block text-left text-sm hover:underline"
                      style={{ color: 'var(--teal-0)' }}
                    >
                      📖 Panduan Penggunaan ISS
                    </button>
                    <button
                      onClick={() => onNavigate('faqs')}
                      className="block text-left text-sm hover:underline"
                      style={{ color: 'var(--teal-0)' }}
                    >
                      ❓ FAQ ISS
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Jenis Pengguna & Jalur Bantuan */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.pengguna}>
            <button
              onClick={() => toggleSection('pengguna')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <User className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">2. Jenis Pengguna & Jalur Bantuan</h2>
                </div>
              </div>
              {openSection === 'pengguna' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'pengguna' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <div className="space-y-6">
                  {/* Pelatih */}
                  <div className="bg-white p-5 rounded-lg border-2" style={{ borderColor: 'var(--teal-0)' }}>
                    <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">👤</span>
                      <span className="font-semibold">Pelatih</span>
                    </h3>
                    <p className="text-gray-700 mb-2">Gunakan Help & Contact untuk:</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li className="flex gap-2">
                        <span style={{ color: 'var(--teal-0)' }}>•</span>
                        <span>Kendala registrasi akun</span>
                      </li>
                      <li className="flex gap-2">
                        <span style={{ color: 'var(--teal-0)' }}>•</span>
                        <span>Token tidak valid atau bermasalah</span>
                      </li>
                      <li className="flex gap-2">
                        <span style={{ color: 'var(--teal-0)' }}>•</span>
                        <span>Kesulitan menginput data cedera</span>
                      </li>
                      <li className="flex gap-2">
                        <span style={{ color: 'var(--teal-0)' }}>•</span>
                        <span>Pertanyaan terkait batas kewenangan pelatih</span>
                      </li>
                    </ul>
                  </div>

                  {/* Admin Daerah */}
                  <div className="bg-white p-5 rounded-lg border-2" style={{ borderColor: 'var(--teal-0)' }}>
                    <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">🏟️</span>
                      <span className="font-semibold">Admin Daerah</span>
                    </h3>
                    <p className="text-gray-700 mb-2">Gunakan Help & Contact untuk:</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li className="flex gap-2">
                        <span style={{ color: 'var(--teal-0)' }}>•</span>
                        <span>Kendala login akun admin</span>
                      </li>
                      <li className="flex gap-2">
                        <span style={{ color: 'var(--teal-0)' }}>•</span>
                        <span>Masalah akses rekap wilayah</span>
                      </li>
                      <li className="flex gap-2">
                        <span style={{ color: 'var(--teal-0)' }}>•</span>
                        <span>Klarifikasi pelaporan cedera event daerah</span>
                      </li>
                      <li className="flex gap-2">
                        <span style={{ color: 'var(--teal-0)' }}>•</span>
                        <span>Koordinasi teknis dengan Admin Nasional</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Informasi yang Perlu Disiapkan */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.informasi}>
            <button
              onClick={() => toggleSection('informasi')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <FileText className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">3. Informasi yang Perlu Disiapkan Saat Menghubungi</h2>
                </div>
              </div>
              {openSection === 'informasi' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'informasi' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <p className="text-gray-700 mb-4">Agar proses bantuan lebih cepat, mohon sertakan:</p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Nama lengkap</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Peran pengguna (Pelatih / Admin Daerah)</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Nama dojang atau daerah</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Deskripsi singkat masalah</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Tangkapan layar (jika ada)</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Section 4: Kontak Resmi ISS */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.kontak}>
            <button
              onClick={() => toggleSection('kontak')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Mail className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">4. Kontak Resmi ISS</h2>
                </div>
              </div>
              {openSection === 'kontak' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'kontak' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-gray-900 mb-2 font-semibold">Email Bantuan:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 flex items-center gap-2">
                        <Mail className="w-5 h-5" style={{ color: 'var(--teal-0)' }} />
                        <a href="mailto:iss.hapkido.indonesia@gmail.com" className="hover:underline" style={{ color: 'var(--teal-0)' }}>
                          iss.hapkido.indonesia@gmail.com
                        </a>
                      </p>
                      <p className="text-gray-600 text-sm mt-2">(contoh – dapat disesuaikan)</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-gray-900 mb-2 font-semibold">Subjek Email (disarankan):</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p className="text-gray-700 text-sm"><code className="bg-white px-2 py-1 rounded">[ISS] Bantuan Pelatih – Login</code></p>
                      <p className="text-gray-700 text-sm"><code className="bg-white px-2 py-1 rounded">[ISS] Bantuan Admin Daerah – Input Data</code></p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Waktu Respons */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.waktu}>
            <button
              onClick={() => toggleSection('waktu')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Clock className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">5. Waktu Respons</h2>
                </div>
              </div>
              {openSection === 'waktu' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'waktu' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Pertanyaan akan diproses sesuai antrean</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Waktu respons normal: <strong>1–3 hari kerja</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" />
                    <span>Permintaan yang tidak lengkap dapat memperlambat proses bantuan</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Section 6: Catatan Penting */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.catatan}>
            <button
              onClick={() => toggleSection('catatan')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <AlertCircle className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">6. Catatan Penting</h2>
                </div>
              </div>
              {openSection === 'catatan' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'catatan' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <div className="bg-red-50 p-5 rounded-lg border-l-4 border-red-500">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-3">
                      <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
                      <span><strong>ISS tidak memberikan konsultasi medis</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
                      <span><strong>ISS tidak menggantikan penanganan tenaga kesehatan</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-blue-500 text-xl flex-shrink-0">ℹ️</span>
                      <span>Bantuan difokuskan pada penggunaan sistem dan pelaporan data</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links to Resources */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="mb-4 flex items-center gap-2" style={{ color: 'var(--dark-navy-0)' }}>
            <BookOpen className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
            Sumber Daya Berguna
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => onNavigate('panduan-pengguna')}
              className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all text-left border-2 border-transparent hover:border-teal-500"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <BookOpen className="w-5 h-5" style={{ color: 'var(--teal-0)' }} />
                </div>
                <h3 className="font-semibold">Panduan Pengguna</h3>
              </div>
              <p className="text-sm text-gray-600">Cara lengkap menggunakan ISS</p>
            </button>

            <button
              onClick={() => onNavigate('faqs')}
              className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all text-left border-2 border-transparent hover:border-teal-500"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <MessageCircle className="w-5 h-5" style={{ color: 'var(--teal-0)' }} />
                </div>
                <h3 className="font-semibold">FAQs</h3>
              </div>
              <p className="text-sm text-gray-600">Pertanyaan yang sering diajukan</p>
            </button>

            <button
              onClick={() => onNavigate('edukasi-cedera')}
              className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all text-left border-2 border-transparent hover:border-teal-500"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Shield className="w-5 h-5" style={{ color: 'var(--teal-0)' }} />
                </div>
                <h3 className="font-semibold">Modul Edukasi</h3>
              </div>
              <p className="text-sm text-gray-600">Panduan lengkap keselamatan atlet</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
