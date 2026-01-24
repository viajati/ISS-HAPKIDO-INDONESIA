import { useState, useRef } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NavigationBar } from './NavigationBar';
import { FloatingHomeButton } from './FloatingHomeButton';
import { HelpCircle, ChevronDown, ChevronUp, Shield, Users, Key, AlertCircle, FileText, Lock, Calendar } from 'lucide-react';

interface FAQsPageProps {
  onNavigate: (page: string) => void;
}

export function FAQsPage({ onNavigate }: FAQsPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const sectionRefs = {
    q1: useRef<HTMLDivElement>(null),
    q2: useRef<HTMLDivElement>(null),
    q3: useRef<HTMLDivElement>(null),
    q4: useRef<HTMLDivElement>(null),
    q5: useRef<HTMLDivElement>(null),
    q6: useRef<HTMLDivElement>(null),
    q7: useRef<HTMLDivElement>(null),
    q8: useRef<HTMLDivElement>(null),
    q9: useRef<HTMLDivElement>(null),
    q10: useRef<HTMLDivElement>(null),
    q11: useRef<HTMLDivElement>(null),
    q12: useRef<HTMLDivElement>(null),
    q13: useRef<HTMLDivElement>(null),
    q14: useRef<HTMLDivElement>(null),
    q15: useRef<HTMLDivElement>(null),
    q16: useRef<HTMLDivElement>(null),
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
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="mb-1 text-white text-3xl">FAQs</h1>
            <p className="text-white opacity-80">
              <span className="italic">Injury Surveillance System</span> Hapkido Indonesia
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-32 max-w-5xl">
        {/* Navigasi Cepat */}
        <div className="bg-blue-50 rounded-lg shadow-md p-6 mb-6 border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
          <h2 className="mb-4 flex items-center gap-2" style={{ color: 'var(--dark-navy-0)' }}>
            <FileText className="w-6 h-6" />
            Navigasi Cepat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button onClick={() => scrollToSection('q1')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">1.</span> Apa itu ISS Hapkido Indonesia?
            </button>
            <button onClick={() => scrollToSection('q2')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">2.</span> Apakah ISS untuk mendiagnosis?
            </button>
            <button onClick={() => scrollToSection('q3')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">3.</span> Siapa yang Menggunakan ISS?
            </button>
            <button onClick={() => scrollToSection('q4')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">4.</span> Cara pelatih akses ISS?
            </button>
            <button onClick={() => scrollToSection('q5')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">5.</span> Akun Admin Daerah?
            </button>
            <button onClick={() => scrollToSection('q6')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">6.</span> Kapan cedera dilaporkan?
            </button>
            <button onClick={() => scrollToSection('q7')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">7.</span> Cedera ringan perlu dicatat?
            </button>
            <button onClick={() => scrollToSection('q8')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">8.</span> Lebih dari satu cedera?
            </button>
            <button onClick={() => scrollToSection('q9')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">9.</span> Atlet dilaporkan berulang?
            </button>
            <button onClick={() => scrollToSection('q10')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">10.</span> Pelatih lihat data nasional?
            </button>
            <button onClick={() => scrollToSection('q11')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">11.</span> Apakah data atlet aman?
            </button>
            <button onClick={() => scrollToSection('q12')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">12.</span> Untuk nilai kinerja pelatih?
            </button>
            <button onClick={() => scrollToSection('q13')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">13.</span> Manfaat langsung bagi pelatih?
            </button>
            <button onClick={() => scrollToSection('q14')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">14.</span> Jika cedera tidak dicatat?
            </button>
            <button onClick={() => scrollToSection('q15')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">15.</span> Kendala teknis?
            </button>
            <button onClick={() => scrollToSection('q16')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">16.</span> Prinsip penggunaan ISS
            </button>
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-4">
          {/* Q1 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.q1}>
            <button
              onClick={() => toggleSection('q1')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <HelpCircle className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">1. Apa itu ISS Hapkido Indonesia?</h2>
                </div>
              </div>
              {openSection === 'q1' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'q1' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <p className="text-gray-700">
                  ISS adalah sistem resmi untuk mencatat dan memantau kejadian cedera atlet Hapkido yang terjadi saat latihan maupun event resmi, agar data cedera terdokumentasi secara rapi dan dapat digunakan untuk evaluasi keselamatan.
                </p>
              </div>
            )}
          </div>

          {/* Q2 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.q2}>
            <button
              onClick={() => toggleSection('q2')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <AlertCircle className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">2. Apakah ISS digunakan untuk mendiagnosis cedera?</h2>
                </div>
              </div>
              {openSection === 'q2' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'q2' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <div className="space-y-3 text-gray-700">
                  <p className="font-semibold" style={{ color: 'var(--teal-0)' }}>Tidak.</p>
                  <p>ISS bukan alat diagnosis medis.</p>
                  <p>ISS hanya mencatat kejadian cedera berdasarkan pengamatan pelatih atau admin, bukan hasil pemeriksaan dokter.</p>
                </div>
              </div>
            )}
          </div>

          {/* Q3 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.q3}>
            <button
              onClick={() => toggleSection('q3')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Users className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">3. Siapa yang Menggunakan ISS?</h2>
                </div>
              </div>
              {openSection === 'q3' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'q3' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2" style={{ borderColor: 'var(--teal-0)' }}>
                    <h3 className="text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-xl">👤</span>
                      Pelatih
                    </h3>
                    <p className="text-gray-700">Menginput kejadian cedera saat latihan rutin</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border-2" style={{ borderColor: 'var(--teal-0)' }}>
                    <h3 className="text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-xl">🏟️</span>
                      Admin Daerah
                    </h3>
                    <p className="text-gray-700">Menginput cedera pada event daerah, kejuaraan, TC, ujian kenaikan tingkat</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border-2" style={{ borderColor: 'var(--teal-0)' }}>
                    <h3 className="text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-xl">🛡️</span>
                      Admin Nasional
                    </h3>
                    <p className="text-gray-700">Input data cedera kegiatan event nasional, verifikasi data, pengelolaan pengguna, analisis & pelaporan nasional</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Q4 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.q4}>
            <button
              onClick={() => toggleSection('q4')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Key className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">4. Bagaimana cara pelatih mendapatkan akses ISS?</h2>
                </div>
              </div>
              {openSection === 'q4' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'q4' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <p className="text-gray-700 mb-4">Pelatih harus:</p>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm" style={{ backgroundColor: 'var(--teal-0)' }}>1</div>
                    <p className="text-gray-700">Meminta token verifikasi dari Admin Nasional</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm" style={{ backgroundColor: 'var(--teal-0)' }}>2</div>
                    <p className="text-gray-700">Menggunakan token tersebut untuk registrasi akun pelatih</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm" style={{ backgroundColor: 'var(--teal-0)' }}>3</div>
                    <p className="text-gray-700">Setelah diverifikasi, pelatih dapat login dan menginput data</p>
                  </div>
                </div>
                <div className="mt-4 bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
                  <p className="text-gray-700 text-sm">Token digunakan untuk memastikan bahwa hanya pelatih resmi yang dapat menginput data.</p>
                </div>
              </div>
            )}
          </div>

          {/* Q5 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.q5}>
            <button
              onClick={() => toggleSection('q5')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Shield className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">5. Bagaimana dengan akun Admin Daerah?</h2>
                </div>
              </div>
              {openSection === 'q5' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'q5' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <div className="space-y-3 text-gray-700">
                  <p>Akun Admin Daerah dibuat langsung oleh Admin Nasional.</p>
                  <p className="font-semibold">Admin Daerah akan menerima:</p>
                  <ul className="ml-6 space-y-2">
                    <li className="flex gap-2">
                      <span style={{ color: 'var(--teal-0)' }}>•</span>
                      <span>User ID resmi</span>
                    </li>
                    <li className="flex gap-2">
                      <span style={{ color: 'var(--teal-0)' }}>•</span>
                      <span>Password resmi</span>
                    </li>
                  </ul>
                  <p className="mt-3">Admin Daerah tidak perlu registrasi mandiri.</p>
                </div>
              </div>
            )}
          </div>

          {/* Q6 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.q6}>
            <button
              onClick={() => toggleSection('q6')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Calendar className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">6. Kapan cedera perlu dilaporkan di ISS?</h2>
                </div>
              </div>
              {openSection === 'q6' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'q6' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <p className="text-gray-700 mb-4">Cedera perlu dilaporkan bila:</p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Latihan dihentikan</span>
                  </li>
                  <li className="flex gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Intensitas latihan diturunkan karena cedera</span>
                  </li>
                  <li className="flex gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Atlet mengeluh nyeri tidak biasa</span>
                  </li>
                  <li className="flex gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Pelatih merasa perlu melakukan evaluasi keselamatan</span>
                  </li>
                </ul>
                <div className="mt-4 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-gray-700">
                    <strong>Prinsip aman:</strong> Jika ragu perlu dicatat atau tidak, lebih baik dicatat.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Q7 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.q7}>
            <button
              onClick={() => toggleSection('q7')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <FileText className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">7. Apakah cedera ringan perlu dicatat?</h2>
                </div>
              </div>
              {openSection === 'q7' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'q7' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <div className="space-y-3 text-gray-700">
                  <p className="font-semibold text-xl" style={{ color: 'var(--teal-0)' }}>Ya.</p>
                  <p>Cedera ringan yang sering diabaikan justru sering:</p>
                  <ul className="ml-6 space-y-2">
                    <li className="flex gap-2">
                      <span style={{ color: 'var(--teal-0)' }}>•</span>
                      <span>Terulang</span>
                    </li>
                    <li className="flex gap-2">
                      <span style={{ color: 'var(--teal-0)' }}>•</span>
                      <span>Memburuk</span>
                    </li>
                    <li className="flex gap-2">
                      <span style={{ color: 'var(--teal-0)' }}>•</span>
                      <span>Terjadi pada atlet yang sama</span>
                    </li>
                  </ul>
                  <p className="mt-3 font-semibold">ISS membantu melihat pola ini.</p>
                </div>
              </div>
            )}
          </div>

          {/* Q8 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.q8}>
            <button
              onClick={() => toggleSection('q8')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <AlertCircle className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">8. Bagaimana jika satu atlet mengalami lebih dari satu cedera?</h2>
                </div>
              </div>
              {openSection === 'q8' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'q8' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <p className="text-gray-700 mb-4">Jika terjadi dalam satu kejadian (tanggal yang sama):</p>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm" style={{ backgroundColor: 'var(--teal-0)' }}>1</div>
                    <p className="text-gray-700">Buat satu laporan</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm" style={{ backgroundColor: 'var(--teal-0)' }}>2</div>
                    <p className="text-gray-700">Masukkan semua cedera yang dialami atlet dalam laporan tersebut</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Q9 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.q9}>
            <button
              onClick={() => toggleSection('q9')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <FileText className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">9. Apakah satu atlet boleh dilaporkan lebih dari sekali?</h2>
                </div>
              </div>
              {openSection === 'q9' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'q9' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <div className="space-y-3 text-gray-700">
                  <p className="font-semibold" style={{ color: 'var(--teal-0)' }}>Boleh, jika kejadiannya berbeda (waktu berbeda).</p>
                  <div className="bg-blue-50 p-3 rounded">
                    <p>Setiap kejadian = satu laporan terpisah.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Q10 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.q10}>
            <button
              onClick={() => toggleSection('q10')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Shield className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">10. Apakah pelatih bisa melihat data nasional?</h2>
                </div>
              </div>
              {openSection === 'q10' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'q10' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <div className="space-y-3 text-gray-700">
                  <p className="font-semibold text-xl" style={{ color: 'var(--teal-0)' }}>Tidak.</p>
                  <ul className="ml-6 space-y-2">
                    <li className="flex gap-2">
                      <span style={{ color: 'var(--teal-0)' }}>•</span>
                      <span>Pelatih hanya bisa melihat data dojang sendiri</span>
                    </li>
                    <li className="flex gap-2">
                      <span style={{ color: 'var(--teal-0)' }}>•</span>
                      <span>Admin Daerah hanya bisa melihat data wilayahnya</span>
                    </li>
                    <li className="flex gap-2">
                      <span style={{ color: 'var(--teal-0)' }}>•</span>
                      <span>Rekap nasional hanya ditampilkan secara agregat di website ISS</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Q11 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.q11}>
            <button
              onClick={() => toggleSection('q11')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Lock className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">11. Apakah data atlet aman?</h2>
                </div>
              </div>
              {openSection === 'q11' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'q11' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <div className="space-y-3 text-gray-700">
                  <p className="font-semibold text-xl" style={{ color: 'var(--teal-0)' }}>Ya.</p>
                  <ul className="space-y-2">
                    <li className="flex gap-3">
                      <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                      <span>Data atlet tidak ditampilkan secara publik</span>
                    </li>
                    <li className="flex gap-3">
                      <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                      <span>Rekap nasional tanpa identitas personal</span>
                    </li>
                    <li className="flex gap-3">
                      <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                      <span>Akses data dibatasi sesuai peran pengguna</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Q12 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.q12}>
            <button
              onClick={() => toggleSection('q12')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Shield className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">12. Apakah data ISS digunakan untuk menilai kinerja pelatih?</h2>
                </div>
              </div>
              {openSection === 'q12' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'q12' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <div className="space-y-3 text-gray-700">
                  <p className="font-semibold" style={{ color: 'var(--teal-0)' }}>Tidak secara individu.</p>
                  <p>Data ISS digunakan untuk:</p>
                  <ul className="ml-6 space-y-2">
                    <li className="flex gap-2">
                      <span style={{ color: 'var(--teal-0)' }}>•</span>
                      <span>Pemantauan keselamatan</span>
                    </li>
                    <li className="flex gap-2">
                      <span style={{ color: 'var(--teal-0)' }}>•</span>
                      <span>Evaluasi pola cedera</span>
                    </li>
                    <li className="flex gap-2">
                      <span style={{ color: 'var(--teal-0)' }}>•</span>
                      <span>Perbaikan sistem pembinaan</span>
                    </li>
                  </ul>
                  <div className="mt-4 bg-red-50 p-3 rounded border-l-4 border-red-500">
                    <p className="font-semibold">ISS bukan alat untuk menyalahkan pelatih.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Q13 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.q13}>
            <button
              onClick={() => toggleSection('q13')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Shield className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">13. Apa manfaat langsung ISS bagi pelatih?</h2>
                </div>
              </div>
              {openSection === 'q13' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'q13' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex gap-3">
                    <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Membantu melihat pola cedera di dojang</span>
                  </li>
                  <li className="flex gap-3">
                    <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Membantu mengevaluasi latihan</span>
                  </li>
                  <li className="flex gap-3">
                    <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Mendukung keselamatan atlet jangka panjang</span>
                  </li>
                  <li className="flex gap-3">
                    <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Membantu pelatih mengambil keputusan lebih baik</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Q14 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.q14}>
            <button
              onClick={() => toggleSection('q14')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <AlertCircle className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">14. Apa yang terjadi jika cedera tidak pernah dicatat?</h2>
                </div>
              </div>
              {openSection === 'q14' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'q14' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <div className="space-y-3 text-gray-700">
                  <p>Cedera yang tidak dicatat:</p>
                  <ul className="ml-6 space-y-2">
                    <li className="flex gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Tidak terlihat sebagai pola</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Sulit dicegah</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-500">✗</span>
                      <span>Cenderung terulang</span>
                    </li>
                  </ul>
                  <div className="mt-4 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                    <p className="font-semibold text-red-900">Data yang hilang = peluang pencegahan yang hilang.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Q15 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.q15}>
            <button
              onClick={() => toggleSection('q15')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <HelpCircle className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">15. Ke mana harus bertanya jika mengalami kendala teknis?</h2>
                </div>
              </div>
              {openSection === 'q15' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'q15' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <p className="text-gray-700 mb-3">Gunakan menu Help & Contact pada website ISS untuk:</p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex gap-3">
                    <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Masalah login</span>
                  </li>
                  <li className="flex gap-3">
                    <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Token verifikasi</span>
                  </li>
                  <li className="flex gap-3">
                    <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Kesalahan input data</span>
                  </li>
                </ul>
                <button
                  onClick={() => onNavigate('help-contact')}
                  className="mt-4 px-6 py-2 rounded-lg text-white transition-colors"
                  style={{ backgroundColor: 'var(--teal-0)' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Ke Halaman Help & Contact
                </button>
              </div>
            )}
          </div>

          {/* Q16 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.q16}>
            <button
              onClick={() => toggleSection('q16')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Shield className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">16. Bagaimana Prinsip penggunaan ISS?</h2>
                </div>
              </div>
              {openSection === 'q16' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'q16' && (
              <div className="px-6 py-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border-2" style={{ borderColor: 'var(--teal-0)' }}>
                    <h3 className="text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-xl">🔒</span>
                      Kerahasiaan
                    </h3>
                    <p className="text-gray-700 text-sm">Kerahasiaan data atlet terjaga</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border-2" style={{ borderColor: 'var(--teal-0)' }}>
                    <h3 className="text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-xl">📊</span>
                      Pembinaan
                    </h3>
                    <p className="text-gray-700 text-sm">Data digunakan untuk pembinaan, bukan sanksi</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border-2" style={{ borderColor: 'var(--teal-0)' }}>
                    <h3 className="text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-xl">🧭</span>
                      Edukatif & Preventif
                    </h3>
                    <p className="text-gray-700 text-sm">Pendekatan edukatif & preventif</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border-2" style={{ borderColor: 'var(--teal-0)' }}>
                    <h3 className="text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-xl">🗂️</span>
                      Terintegrasi
                    </h3>
                    <p className="text-gray-700 text-sm">Terintegrasi secara nasional</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Need More Help */}
        <div className="mt-8 text-white rounded-lg p-8" style={{ background: 'linear-gradient(135deg, var(--teal-0), var(--teal-20))' }}>
          <h2 className="mb-4 text-white text-center">Tidak Menemukan Jawaban yang Anda Cari?</h2>
          <p className="mb-6 text-white opacity-90 text-center">
            Tim kami siap membantu Anda. Hubungi kami melalui halaman Help & Contact.
          </p>
          <div className="text-center">
            <button
              onClick={() => onNavigate('help-contact')}
              className="bg-white px-8 py-3 rounded-lg transition-colors"
              style={{ color: 'var(--teal-0)', fontWeight: 'bold' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--teal-50)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Hubungi Kami
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}