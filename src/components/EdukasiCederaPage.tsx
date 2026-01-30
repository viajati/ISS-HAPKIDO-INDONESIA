import { useState, useRef } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NavigationBar } from './NavigationBar';
import { FloatingHomeButton } from './FloatingHomeButton';
import { ModulImageZoom } from './ModulImageZoom';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Target,
  AlertTriangle,
  MapPin,
  Shield,
  Wind,
  Eye,
  UserCheck,
  GitBranch,
  FileText,
  CheckCircle,
  List,
} from 'lucide-react';

interface EdukasiCederaPageProps {
  onNavigate: (page: string) => void;
}

export function EdukasiCederaPage({ onNavigate }: EdukasiCederaPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const sectionRefs = {
    m1: useRef<HTMLDivElement>(null),
    m2: useRef<HTMLDivElement>(null),
    m3: useRef<HTMLDivElement>(null),
    m4: useRef<HTMLDivElement>(null),
    m5: useRef<HTMLDivElement>(null),
    m6: useRef<HTMLDivElement>(null),
    m7: useRef<HTMLDivElement>(null),
    m8: useRef<HTMLDivElement>(null),
    m9: useRef<HTMLDivElement>(null),
  };

  // Callback refs to avoid accessing .current in render
  const setSectionRef = (id: keyof typeof sectionRefs) => (el: HTMLDivElement | null) => {
    sectionRefs[id].current = el;
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
      
      <NavigationBar onMenuClick={() => setIsSidebarOpen(true)} />
      
      {/* Hero Section */}
      <div className="text-white py-3 md:py-4" style={{ background: 'linear-gradient(135deg, var(--dark-navy-0), var(--dark-navy-20))' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--teal-0)' }}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="mb-1 text-white text-3xl">Modul Edukasi Cedera</h1>
            <p className="text-white opacity-80">
              Panduan lengkap keselamatan atlet berbasis data dan praktik lapangan
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-32 max-w-5xl">
        {/* Tujuan Modul */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <h2 className="mb-4 flex items-center gap-2" style={{ color: 'var(--dark-navy-0)' }}>
            <Target className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
            Tujuan Modul
          </h2>
          <p className="text-gray-700 mb-3">Membantu pelatih untuk:</p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
              <span>Mengurangi risiko cedera saat latihan</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
              <span>Mengenali tanda bahaya sejak dini</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
              <span>Mengambil keputusan yang aman dan tepat</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
              <span>Melaporkan cedera secara benar melalui ISS</span>
            </li>
          </ul>
        </div>

        {/* Navigasi Cepat */}
        <div className="bg-blue-50 rounded-lg shadow-md p-6 mb-6 border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
          <h2 className="mb-4 flex items-center gap-2" style={{ color: 'var(--dark-navy-0)' }}>
            <List className="w-6 h-6" />
            Daftar Modul
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button onClick={() => scrollToSection('m1')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">1.</span> Risiko Cedera
            </button>
            <button onClick={() => scrollToSection('m2')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">2.</span> Lokasi Cedera
            </button>
            <button onClick={() => scrollToSection('m3')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">3.</span> Latihan Aman
            </button>
            <button onClick={() => scrollToSection('m4')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">4.</span> Pemanasan & Pendinginan
            </button>
            <button onClick={() => scrollToSection('m5')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">5.</span> Tanda Awal Cedera
            </button>
            <button onClick={() => scrollToSection('m6')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">6.</span> Peran Pelatih
            </button>
            <button onClick={() => scrollToSection('m7')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">7.</span> Pengambilan Keputusan
            </button>
            <button onClick={() => scrollToSection('m8')} className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">8.</span> Pencatatan di ISS
            </button>
            <button onClick={() => scrollToSection('m9')} className="col-span-full text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm" style={{ color: 'var(--teal-0)' }}>
              <span className="font-semibold">9.</span> Decision Tree Respons Keselamatan
            </button>
          </div>
        </div>

        {/* Modul Sections */}
        <div className="space-y-4">
          {/* Modul 1 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={setSectionRef('m1')}>
            <button
              onClick={() => toggleSection('m1')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <AlertTriangle className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">Modul 1: Memahami Risiko Cedera dalam Latihan Hapkido</h2>
                </div>
              </div>
              {openSection === 'm1' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'm1' && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="mt-4 space-y-6">
                  <ModulImageZoom src="/assets/modul1.png" alt="Modul 1" />
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>Untuk apa modul ini?</h3>
                    <p className="text-gray-700">Modul ini ditujukan bagi pelatih Hapkido yang ingin menjaga atlet tetap berkembang tanpa mengorbankan keselamatan.</p>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Cedera Paling Sering Terjadi Saat Latihan</h3>
                    <p className="text-gray-700 mb-3">Sebagian besar cedera Hapkido bukan terjadi saat pertandingan, melainkan saat latihan. Hal ini terjadi karena latihan:</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li>• Berlangsung lebih sering</li>
                      <li>• Melibatkan pengulangan teknik</li>
                      <li>• Dilakukan dalam kondisi kelelahan</li>
                    </ul>
                    <div className="bg-blue-50 p-3 rounded mt-3 border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                      <p className="text-sm text-gray-700"><strong>Artinya:</strong> latihan adalah area utama pencegahan cedera.</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Teknik Hapkido = Potensi Risiko</h3>
                    <p className="text-gray-700 mb-3">Hapkido memiliki ciri khas teknik yang efektif, namun berisiko bila tidak dikontrol dengan baik, seperti:</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li className="flex gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                        <span>Kuncian sendi</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                        <span>Bantingan dan jatuhan</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                        <span>Pergerakan cepat dan dinamis</span>
                      </li>
                    </ul>
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500 mt-3">
                      <p className="text-sm text-gray-700 mb-2"><strong>Risiko cedera meningkat bila:</strong></p>
                      <ul className="space-y-1 text-sm text-gray-700 ml-4">
                        <li>• Teknik diajarkan terlalu cepat</li>
                        <li>• Atlet belum siap secara fisik</li>
                        <li>• Kontrol pasangan latihan kurang baik</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg mt-3">
                      <p className="text-sm text-gray-700"><strong>💡 Insight untuk pelatih:</strong> Teknik yang terlihat &quot;rapi&quot; belum tentu aman bila atlet belum siap menerimanya.</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Faktor yang perlu diperhatikan Pelatih</h3>
                    <p className="text-gray-700 mb-3">Cedera jarang disebabkan satu hal saja. Biasanya kombinasi dari:</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li>• Atlet lelah</li>
                      <li>• Intensitas latihan meningkat terlalu cepat</li>
                      <li>• Pengawasan berkurang di akhir sesi latihan</li>
                      <li>• Tekanan target latihan atau ujian</li>
                    </ul>
                    <div className="bg-gray-50 p-4 rounded-lg mt-3">
                      <p className="text-sm text-gray-700"><strong>🤔 Pertanyaan reflektif untuk pelatih:</strong><br/>Apakah saya menilai kesiapan atlet hari ini, atau hanya mengikuti rencana latihan di kertas?</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Risiko Bukan untuk Ditakuti, tapi Dikelola</h3>
                    <p className="text-gray-700 mb-3">Tujuan pelatih bukan menghilangkan risiko, tetapi mengelolanya.</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="mb-3">
                        <h4 className="mb-2 text-green-700">Latihan yang Baik:</h4>
                        <ul className="space-y-1 text-sm text-gray-700 ml-4">
                          <li>✓ Tetap menantang</li>
                          <li>✓ Tetap progresif</li>
                          <li>✓ Tetap terkendali</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-2 text-red-700">Latihan yang Berbahaya:</h4>
                        <ul className="space-y-1 text-sm text-gray-700 ml-4">
                          <li>✗ Terlalu cepat</li>
                          <li>✗ Terlalu banyak</li>
                          <li>✗ Terlalu dipaksakan</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                    <h3 className="mb-2">Ringkasan Modul 1</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Cedera paling sering terjadi saat latihan</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Teknik Hapkido memiliki risiko bila tidak dikelola</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Kelelahan dan pengawasan rendah meningkatkan cedera</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Pelatih berperan besar dalam mengatur risiko</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modul 2 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={setSectionRef('m2')}>
            <button
              onClick={() => toggleSection('m2')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <MapPin className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">Modul 2: Bagian Tubuh yang Paling Sering Cedera</h2>
                </div>
              </div>
              {openSection === 'm2' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'm2' && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="mt-4 space-y-6">
                  <ModulImageZoom src="/assets/modul2.png" alt="Modul 2" />
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>Untuk apa modul ini?</h3>
                    <p className="text-gray-700">Agar pelatih lebih peka melihat risiko, bukan sekadar bereaksi saat cedera sudah terjadi.</p>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Tidak Semua Cedera Terjadi Secara Acak</h3>
                    <p className="text-gray-700 mb-3">Dalam latihan Hapkido, cedera cenderung berulang pada bagian tubuh tertentu. Ini bukan kebetulan, tetapi berkaitan dengan:</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li>• Jenis teknik yang dilatih</li>
                      <li>• Cara latihan dilakukan</li>
                      <li>• Tingkat kesiapan atlet</li>
                    </ul>
                    <div className="bg-blue-50 p-3 rounded mt-3 border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                      <p className="text-sm text-gray-700"><strong>Artinya:</strong> pelatih bisa mengantisipasi sebelum cedera terjadi.</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4" style={{ color: 'var(--dark-navy-0)' }}>Bagian Tubuh yang Paling Perlu Diawasi</h3>
                    
                    {/* Pergelangan Tangan */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>1. Pergelangan Tangan</h4>
                      <p className="text-sm text-gray-700 mb-2"><strong>Sering terlibat dalam:</strong></p>
                      <ul className="space-y-1 text-sm text-gray-700 mb-3 ml-4">
                        <li>• Kuncian sendi</li>
                        <li>• Tumpuan jatuhan</li>
                        <li>• Teknik tangkisan</li>
                      </ul>
                      <p className="text-sm text-gray-700 mb-2"><strong>Waspadai bila:</strong></p>
                      <ul className="space-y-1 text-sm text-gray-700 mb-3 ml-4">
                        <li>• Atlet terlihat ragu menumpu</li>
                        <li>• Pegangan terlalu keras</li>
                        <li>• Pengulangan teknik terlalu banyak</li>
                      </ul>
                      <div className="bg-white p-3 rounded border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                        <p className="text-sm text-gray-700"><strong>💡 Insight pelatih:</strong> Kuncian yang &quot;terasa berhasil&quot; sering justru terlalu keras untuk latihan.</p>
                      </div>
                    </div>

                    {/* Bahu */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>2. Bahu</h4>
                      <p className="text-sm text-gray-700 mb-2"><strong>Rentan pada:</strong></p>
                      <ul className="space-y-1 text-sm text-gray-700 mb-3 ml-4">
                        <li>• Bantingan</li>
                        <li>• Jatuhan tidak sempurna</li>
                        <li>• Gerakan menarik atau memutar</li>
                      </ul>
                      <p className="text-sm text-gray-700 mb-2"><strong>Tanda risiko:</strong></p>
                      <ul className="space-y-1 text-sm text-gray-700 ml-4">
                        <li>• Atlet menghindari satu sisi bahu</li>
                        <li>• Gerak lengan tidak simetris</li>
                      </ul>
                    </div>

                    {/* Lutut */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>3. Lutut</h4>
                      <p className="text-sm text-gray-700 mb-2"><strong>Terlibat dalam:</strong></p>
                      <ul className="space-y-1 text-sm text-gray-700 mb-3 ml-4">
                        <li>• Perubahan arah cepat</li>
                        <li>• Teknik bantingan</li>
                        <li>• Tumpuan kaki saat menyerang</li>
                      </ul>
                      <p className="text-sm text-gray-700 mb-2"><strong>Perlu perhatian khusus pada:</strong></p>
                      <ul className="space-y-1 text-sm text-gray-700 ml-4">
                        <li>• Atlet dengan riwayat cedera lutut</li>
                        <li>• Latihan di matras licin atau keras</li>
                      </ul>
                    </div>

                    {/* Pergelangan Kaki */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>4. Pergelangan Kaki</h4>
                      <p className="text-sm text-gray-700 mb-2"><strong>Sering cedera saat:</strong></p>
                      <ul className="space-y-1 text-sm text-gray-700 mb-3 ml-4">
                        <li>• Footwork cepat</li>
                        <li>• Salah tumpuan</li>
                        <li>• Kelelahan di akhir latihan</li>
                      </ul>
                      <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
                        <p className="text-sm text-gray-700"><strong>⚠️ Catatan penting:</strong> Cedera pergelangan kaki sering terjadi saat atlet sudah lelah dan fokus menurun.</p>
                      </div>
                    </div>

                    {/* Punggung */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>5. Punggung</h4>
                      <p className="text-sm text-gray-700 mb-2"><strong>Rentan saat:</strong></p>
                      <ul className="space-y-1 text-sm text-gray-700 ml-4">
                        <li>• Jatuhan berulang</li>
                        <li>• Postur tubuh salah</li>
                        <li>• Otot inti (core) lemah</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Cara Berpikir Praktis untuk Pelatih</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 mb-2"><strong>Sebelum latihan teknik berisiko, tanyakan:</strong></p>
                      <ul className="space-y-2 text-sm text-gray-700 ml-4 mb-3">
                        <li>• Apakah atlet sudah siap secara fisik?</li>
                        <li>• Apakah teknik ini perlu diulang sebanyak ini?</li>
                        <li>• Apakah pengawasan masih optimal?</li>
                      </ul>
                      <div className="bg-white p-3 rounded border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                        <p className="text-sm text-gray-700"><strong>Prinsip sederhana:</strong> Bila satu bagian tubuh mulai &quot;sering bermasalah&quot;, hentikan dulu, evaluasi, lalu lanjutkan dengan penyesuaian.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                    <h3 className="mb-2">Ringkasan Modul 2</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Cedera sering berulang di lokasi yang sama</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Pergelangan tangan, bahu, lutut, pergelangan kaki, dan punggung perlu perhatian ekstra</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Kelelahan dan pengulangan teknik adalah pemicu utama</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Pelatih bisa mengantisipasi dengan observasi sederhana</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modul 3 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={setSectionRef('m3')}>
            <button
              onClick={() => toggleSection('m3')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Shield className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">Modul 3: Latihan Aman Itu Bukan Latihan Ringan</h2>
                </div>
              </div>
              {openSection === 'm3' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'm3' && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="mt-4 space-y-6">
                  <ModulImageZoom src="/assets/modul3.png" alt="Modul 3" />
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>Untuk apa modul ini?</h3>
                    <p className="text-gray-700">Agar pelatih tidak terjebak pada dua ekstrem: latihan terlalu keras atau latihan terlalu aman tapi tidak berkembang.</p>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Kesalahpahaman yang Sering Terjadi</h3>
                    <p className="text-gray-700 mb-3">Banyak pelatih khawatir bahwa:</p>
                    <ul className="space-y-2 text-gray-700 ml-4 mb-3">
                      <li>❌ Latihan yang aman = latihan ringan</li>
                      <li>❌ Mengurangi risiko = menurunkan kualitas latihan</li>
                    </ul>
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                      <p className="text-sm text-gray-700"><strong>Padahal kenyataannya:</strong> Latihan aman justru membuat atlet bisa berlatih lebih lama dan lebih konsisten.</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Latihan Aman = Latihan yang Terkendali</h3>
                    <p className="text-gray-700 mb-3">Latihan Hapkido yang aman memiliki tiga ciri utama:</p>
                    <ul className="space-y-2 text-gray-700 ml-4 mb-3">
                      <li className="flex gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                        <span>Bertahap</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                        <span>Terencana</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                        <span>Sesuai kemampuan atlet</span>
                      </li>
                    </ul>
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                      <p className="text-sm text-gray-700 mb-2"><strong>Latihan menjadi berisiko ketika:</strong></p>
                      <ul className="space-y-1 text-sm text-gray-700 ml-4">
                        <li>• Intensitas naik terlalu cepat</li>
                        <li>• Teknik sulit diberikan terlalu dini</li>
                        <li>• Atlet dipaksa menyelesaikan latihan saat sudah lelah</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4" style={{ color: 'var(--dark-navy-0)' }}>Prinsip Praktis untuk Pelatih</h3>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>1. Naikkan Beban Secara Bertahap</h4>
                      <ul className="space-y-1 text-sm text-gray-700 ml-4 mb-3">
                        <li>• Tambah intensitas sedikit demi sedikit</li>
                        <li>• Jangan menaikkan beberapa aspek sekaligus (kecepatan, kekuatan, durasi)</li>
                      </ul>
                      <div className="bg-white p-3 rounded border-l-4 border-red-400">
                        <p className="text-sm text-gray-700"><strong>Ingat:</strong> Progres cepat sering dibayar dengan cedera.</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>2. Perhatikan Kualitas, Bukan Jumlah</h4>
                      <p className="text-sm text-gray-700 mb-3">Lebih baik sedikit repetisi dengan teknik baik daripada banyak repetisi dengan kontrol buruk.</p>
                      <p className="text-sm text-gray-700 mb-2"><strong>Tanda latihan perlu dihentikan:</strong></p>
                      <ul className="space-y-1 text-sm text-gray-700 ml-4">
                        <li>• Teknik mulai kacau</li>
                        <li>• Reaksi atlet melambat</li>
                        <li>• Kesalahan berulang muncul</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>3. Akhir Latihan adalah Titik Rawan</h4>
                      <p className="text-sm text-gray-700 mb-2"><strong>Banyak cedera terjadi:</strong></p>
                      <ul className="space-y-1 text-sm text-gray-700 ml-4 mb-3">
                        <li>• Di menit-menit terakhir latihan</li>
                        <li>• Saat fokus atlet menurun</li>
                      </ul>
                      <div className="bg-white p-3 rounded border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                        <p className="text-sm text-gray-700 mb-1"><strong>Tips praktis:</strong></p>
                        <ul className="space-y-1 text-sm text-gray-700 ml-4">
                          <li>• Kurangi teknik berisiko di akhir sesi</li>
                          <li>• Gunakan akhir latihan untuk teknik ringan atau evaluasi</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Mengelola Latihan, Bukan Memaksakan Target</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 mb-2">Target latihan penting, tetapi:</p>
                      <ul className="space-y-2 text-sm text-gray-700 ml-4 mb-3">
                        <li>• Target tidak boleh mengalahkan keselamatan</li>
                        <li>• Atlet yang cedera tidak akan mencapai target apa pun</li>
                      </ul>
                      <div className="bg-white p-3 rounded border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                        <p className="text-sm text-gray-700"><strong>🤔 Refleksi untuk pelatih:</strong><br/>Apakah saya menyesuaikan latihan dengan kondisi atlet hari ini, atau memaksa atlet mengikuti rencana yang sudah dibuat?</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                    <h3 className="mb-2">Ringkasan Modul 3</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Latihan aman bukan latihan lunak</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Progres bertahap mengurangi risiko cedera</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Kualitas teknik lebih penting dari kuantitas</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Akhir latihan adalah fase paling rawan cedera</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modul 4 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={setSectionRef('m4')}>
            <button
              onClick={() => toggleSection('m4')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Wind className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">Modul 4: Pemanasan dan Pendinginan: Wajib, Bukan Formalitas</h2>
                </div>
              </div>
              {openSection === 'm4' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'm4' && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="mt-4 space-y-6">
                  <ModulImageZoom src="/assets/modul4.png" alt="Modul 4" />
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>Untuk apa modul ini?</h3>
                    <p className="text-gray-700">Agar pelatih tidak melihat pemanasan dan pendinginan sebagai rutinitas pembuka dan penutup semata, tetapi sebagai bagian inti dari keselamatan latihan.</p>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Banyak Cedera Berawal dari Awal Latihan</h3>
                    <p className="text-gray-700 mb-3">Cedera sering terjadi karena:</p>
                    <ul className="space-y-2 text-gray-700 ml-4 mb-3">
                      <li>• Tubuh belum siap bergerak</li>
                      <li>• Sendi masih kaku</li>
                      <li>• Otot belum aktif</li>
                    </ul>
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                      <p className="text-sm text-gray-700"><strong>⚠️ Peringatan:</strong> Latihan langsung masuk ke teknik tanpa persiapan adalah risiko besar, terutama pada teknik Hapkido yang dinamis.</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Pemanasan yang Efektif Itu Sederhana</h3>
                    <p className="text-gray-700 mb-3">Pemanasan tidak perlu lama atau rumit, tetapi harus tepat sasaran.</p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Tiga Tujuan Pemanasan</h4>
                      <ul className="space-y-2 text-gray-700 ml-4">
                        <li className="flex gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                          <span>Menggerakkan sendi</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                          <span>Mengaktifkan otot</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                          <span>Mempersiapkan gerak latihan</span>
                        </li>
                      </ul>
                      <div className="bg-yellow-50 p-3 rounded mt-3 border-l-4 border-yellow-500">
                        <p className="text-sm text-gray-700">Jika satu saja terlewat, risiko cedera meningkat.</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>Contoh Pola Pemanasan yang Baik</h4>
                      <ol className="space-y-2 text-sm text-gray-700 ml-4 mb-3">
                        <li>1. Gerak sendi utama (pergelangan, bahu, lutut, pinggul)</li>
                        <li>2. Aktivasi otot inti dan kaki</li>
                        <li>3. Gerakan ringan yang mirip teknik latihan hari itu</li>
                      </ol>
                      <div className="bg-white p-3 rounded border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                        <p className="text-sm text-gray-700"><strong>💡 Catatan penting:</strong> Pemanasan harus meniru arah dan pola gerak latihan, bukan sekadar keringat.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Kesalahan Umum dalam Pemanasan</h3>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li>❌ Terlalu singkat</li>
                      <li>❌ Hanya lari keliling matras</li>
                      <li>❌ Langsung masuk ke teknik berat</li>
                      <li>❌ Pemanasan tidak berubah meski jenis latihan berbeda</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Pendinginan Itu Bukan Bonus</h3>
                    <div className="bg-gray-50 p-4 rounded-lg mb-3">
                      <p className="text-sm text-gray-700 mb-2"><strong>Pendinginan sering dilewati karena:</strong></p>
                      <ul className="space-y-1 text-sm text-gray-700 ml-4">
                        <li>• Waktu habis</li>
                        <li>• Atlet sudah lelah</li>
                        <li>• Dianggap tidak penting</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                      <p className="text-sm text-gray-700 mb-2"><strong>Padahal pendinginan membantu:</strong></p>
                      <ul className="space-y-1 text-sm text-gray-700 ml-4">
                        <li>• Mengurangi kekakuan</li>
                        <li>• Menurunkan ketegangan otot</li>
                        <li>• Mempercepat pemulihan</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Pendinginan yang Cukup dan Aman</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 mb-2"><strong>Pendinginan sederhana:</strong></p>
                      <ul className="space-y-1 text-sm text-gray-700 ml-4 mb-3">
                        <li>• Gerakan ringan</li>
                        <li>• Peregangan santai</li>
                        <li>• Pernapasan terkontrol</li>
                      </ul>
                      <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                        <p className="text-sm text-gray-700"><strong>Ingat:</strong> Pendinginan bukan tempat menguji kelenturan, tapi menenangkan tubuh.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Peran Pelatih dalam Pemanasan & Pendinginan</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 mb-2"><strong>Pelatih perlu:</strong></p>
                      <ul className="space-y-2 text-sm text-gray-700 ml-4">
                        <li className="flex gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                          <span>Memimpin, bukan menyerahkan sepenuhnya ke atlet</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                          <span>Menyesuaikan dengan usia dan level atlet</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                          <span>Memberi contoh yang konsisten</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                    <h3 className="mb-2">Ringkasan Modul 4</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Pemanasan dan pendinginan adalah bagian inti latihan</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Pemanasan harus relevan dengan teknik yang dilatih</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Pendinginan membantu pemulihan dan mencegah cedera berulang</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Rutinitas sederhana lebih baik daripada formalitas</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modul 5 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={setSectionRef('m5')}>
            <button
              onClick={() => toggleSection('m5')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Eye className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">Modul 5: Mengenali Tanda Awal Cedera</h2>
                </div>
              </div>
              {openSection === 'm5' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'm5' && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="mt-4 space-y-6">
                  <ModulImageZoom src="/assets/modul5.png" alt="Modul 5" />
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>Untuk apa modul ini?</h3>
                    <p className="text-gray-700">Agar pelatih tidak menunggu cedera terlihat parah baru bertindak.</p>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Cedera Jarang Datang Tiba-tiba</h3>
                    <p className="text-gray-700 mb-3">Sebagian besar cedera memberi sinyal lebih dulu, tetapi sering:</p>
                    <ul className="space-y-2 text-gray-700 ml-4 mb-3">
                      <li>• Diabaikan</li>
                      <li>• Dianggap &quot;biasa&quot;</li>
                      <li>• Ditunda penanganannya</li>
                    </ul>
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                      <p className="text-sm text-gray-700"><strong>💡 Insight penting:</strong> Cedera besar sering berawal dari tanda kecil yang diabaikan.</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4" style={{ color: 'var(--dark-navy-0)' }}>Tanda Awal Cedera yang Perlu Diwaspadai</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>1. Nyeri yang Tidak Biasa</h4>
                        <ul className="space-y-1 text-sm text-gray-700 ml-4 mb-2">
                          <li>• Nyeri tajam</li>
                          <li>• Nyeri yang bertambah saat bergerak</li>
                          <li>• Nyeri yang berbeda dari kelelahan biasa</li>
                        </ul>
                        <div className="bg-white p-3 rounded border-l-4 border-red-400">
                          <p className="text-sm text-gray-700">Ini bukan &quot;capek latihan&quot; biasa.</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>2. Gerak Mulai Berubah</h4>
                        <p className="text-sm text-gray-700 mb-2"><strong>Perhatikan bila atlet:</strong></p>
                        <ul className="space-y-1 text-sm text-gray-700 ml-4">
                          <li>• Pincang</li>
                          <li>• Menghindari satu sisi tubuh</li>
                          <li>• Gerak jadi kaku atau terbatas</li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>3. Penurunan Kontrol</h4>
                        <ul className="space-y-1 text-sm text-gray-700 ml-4">
                          <li>• Teknik mulai tidak stabil</li>
                          <li>• Jatuhan tidak terkontrol</li>
                          <li>• Reaksi melambat</li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>4. Bahasa Tubuh Atlet</h4>
                        <p className="text-sm text-gray-700 mb-2">Kadang atlet tidak bicara, tapi tubuhnya memberi sinyal:</p>
                        <ul className="space-y-1 text-sm text-gray-700 ml-4">
                          <li>• Wajah menahan nyeri</li>
                          <li>• Gerak ragu</li>
                          <li>• Terlalu sering berhenti sendiri</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Kesalahan Umum Pelatih</h3>
                    <ul className="space-y-2 text-gray-700 ml-4 mb-3">
                      <li>❌ Menunggu atlet mengeluh dulu</li>
                      <li>❌ Menganggap atlet &quot;mengada-ada&quot;</li>
                      <li>❌ Menganggap nyeri sebagai bagian dari latihan</li>
                    </ul>
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                      <p className="text-sm text-gray-700"><strong>Padahal:</strong> Atlet sering diam karena takut dianggap lemah.</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                    <h3 className="mb-2">Ringkasan Modul 5</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Cedera hampir selalu diawali tanda</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Nyeri, perubahan gerak, dan kontrol menurun adalah alarm</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Observasi pelatih lebih penting dari keluhan atlet</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Tindakan dini mencegah cedera berat</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modul 6 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={setSectionRef('m6')}>
            <button
              onClick={() => toggleSection('m6')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <UserCheck className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">Modul 6: Peran Pelatih Saat Cedera Terjadi</h2>
                </div>
              </div>
              {openSection === 'm6' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'm6' && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="mt-4 space-y-6">
                  <ModulImageZoom src="/assets/modul6.png" alt="Modul 6" />
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>Untuk apa modul ini?</h3>
                    <p className="text-gray-700">Agar pelatih tahu apa yang harus dilakukan dan apa yang tidak perlu dilakukan saat cedera terjadi.</p>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Pelatih Tidak Mendiagnosis, Tapi Mengamankan</h3>
                    <div className="bg-gray-50 p-4 rounded-lg mb-3">
                      <p className="text-gray-700 mb-2"><strong>Saat cedera terjadi:</strong></p>
                      <ul className="space-y-2 text-sm text-gray-700 ml-4">
                        <li className="flex gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                          <span>Pelatih bukan dokter</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                          <span>Tapi pelatih adalah orang pertama yang menentukan arah</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                      <p className="text-sm text-gray-700">Keputusan pelatih saat itu bisa membatasi cedera atau justru memperburuk kondisi.</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4" style={{ color: 'var(--dark-navy-0)' }}>Tugas Utama Pelatih Saat Cedera</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>1. Hentikan Aktivitas Atlet</h4>
                        <ul className="space-y-1 text-sm text-gray-700 ml-4 mb-2">
                          <li>• Jangan menunggu kepastian</li>
                          <li>• Jangan memaksa atlet &quot;coba sekali lagi&quot;</li>
                        </ul>
                        <div className="bg-white p-3 rounded border-l-4 border-red-400">
                          <p className="text-sm text-gray-700"><strong>Prinsip:</strong> Lebih baik berhenti sebentar daripada menyesal lama.</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>2. Jaga Keamanan Atlet</h4>
                        <ul className="space-y-1 text-sm text-gray-700 ml-4">
                          <li>• Jauhkan dari aktivitas lain</li>
                          <li>• Pastikan atlet tidak bergerak berlebihan</li>
                          <li>• Ciptakan situasi tenang</li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>3. Dengarkan Atlet, Tapi Jangan Tertekan</h4>
                        <p className="text-sm text-gray-700 mb-2"><strong>Atlet bisa:</strong></p>
                        <ul className="space-y-1 text-sm text-gray-700 ml-4 mb-2">
                          <li>• Ingin lanjut karena gengsi</li>
                          <li>• Takut tertinggal latihan</li>
                        </ul>
                        <div className="bg-white p-3 rounded border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                          <p className="text-sm text-gray-700">Keputusan tetap di tangan pelatih.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Apa yang Tidak Perlu Dilakukan Pelatih</h3>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li>❌ Tidak perlu menebak diagnosis</li>
                      <li>❌ Tidak perlu memijat atau memaksa gerak</li>
                      <li>❌ Tidak perlu membandingkan dengan atlet lain</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Kapan Pelatih Harus Menghentikan Latihan?</h3>
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                      <p className="text-sm text-gray-700 mb-2"><strong>Hentikan latihan bila:</strong></p>
                      <ul className="space-y-1 text-sm text-gray-700 ml-4 mb-3">
                        <li>• Nyeri bertambah</li>
                        <li>• Gerak terganggu</li>
                        <li>• Atlet terlihat ragu</li>
                        <li>• Pelatih sendiri merasa tidak yakin</li>
                      </ul>
                      <div className="bg-white p-3 rounded">
                        <p className="text-sm text-gray-700 font-bold">Ingat: Ragu = hentikan.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Setelah Situasi Terkendali, Pelatih perlu:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                          <span>Menyarankan pemantauan lanjutan</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                          <span>Menyesuaikan latihan berikutnya</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                          <span>Mencatat kejadian di ISS</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                    <h3 className="mb-2">Ringkasan Modul 6</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Pelatih bukan mendiagnosis, tapi mengamankan</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Keputusan cepat lebih penting dari keputusan sempurna</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Jangan tertekan oleh target atau keinginan atlet</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Semua kejadian cedera perlu dicatat</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modul 7 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={setSectionRef('m7')}>
            <button
              onClick={() => toggleSection('m7')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <GitBranch className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">Modul 7: Respon Pelatih</h2>
                </div>
              </div>
              {openSection === 'm7' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'm7' && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="mt-4 space-y-6">
                  <ModulImageZoom src="/assets/modul7.png" alt="Modul 7" />
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>Untuk apa modul ini?</h3>
                    <p className="text-gray-700">Agar pelatih tidak ragu, tidak gegabah, dan tahu kapan harus melanjutkan latihan dan kapan harus menghentikannya.</p>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Tiga Pertanyaan Kunci untuk Pelatih</h3>
                    <p className="text-gray-700 mb-3">Saat cedera terjadi, tanyakan cepat pada diri sendiri:</p>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>1. Apakah fungsi gerak terganggu?</h4>
                        <ul className="space-y-2 text-sm text-gray-700 ml-4">
                          <li>• Gerak terbatas / pincang / tidak stabil → <strong className="text-red-700">STOP</strong></li>
                          <li>• Gerak normal tanpa rasa takut → <strong className="text-green-700">evaluasi lanjut</strong></li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>2. Apakah atlet masih merasa nyeri?</h4>
                        <ul className="space-y-2 text-sm text-gray-700 ml-4">
                          <li>• Nyeri tajam atau bertambah → <strong className="text-red-700">STOP</strong></li>
                          <li>• Nyeri ringan dan stabil → <strong className="text-yellow-700">lanjut dengan sangat hati-hati</strong></li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>3. Apakah ada tanda bahaya?</h4>
                        <p className="text-sm text-gray-700 mb-2"><strong>Tanda bahaya pokok:</strong> bengkak hebat, bentuk sendi tidak normal, pusing, tidak sadar, mati rasa, perdarahan hebat</p>
                        <div className="bg-white p-3 rounded border-l-4 border-red-400">
                          <p className="text-sm text-gray-700"><strong>Bila ada satu saja → STOP</strong></p>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                        <p className="text-sm text-gray-700 font-bold">Prinsip aman: Jika pelatih ragu, hentikan dulu.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Tekanan Sosial yang Perlu Diwaspadai</h3>
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                      <p className="text-sm text-gray-700"><strong>Ingat:</strong> Atlet yang berhenti hari ini masih bisa berlatih besok. Atlet yang cedera berat bisa berhenti berbulan-bulan.</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                    <h3 className="mb-2">Ringkasan Modul 7</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Ragu = hentikan</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Keselamatan atlet lebih penting dari target latihan</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modul 8 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={setSectionRef('m8')}>
            <button
              onClick={() => toggleSection('m8')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <FileText className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">Modul 8: Mencatat Cedera di ISS</h2>
                </div>
              </div>
              {openSection === 'm8' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'm8' && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="mt-4 space-y-6">
                  <ModulImageZoom src="/assets/modul8.png" alt="Modul 8" />
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>Untuk apa modul ini?</h3>
                    <p className="text-gray-700">Agar pelatih memahami bahwa mencatat cedera bukan beban administrasi, tetapi bagian dari perlindungan atlet.</p>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Kenapa Cedera Perlu Dicatat?</h3>
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                      <p className="text-sm text-gray-700"><strong>💡 Insight penting:</strong> Data bukan untuk menyalahkan pelatih, tetapi untuk mencegah cedera yang sama terulang.</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>Prinsip Satu Kejadian = Satu Laporan</h3>
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                      <p className="text-gray-700"><strong>Satu atlet + Satu waktu kejadian (tanggal) = Satu laporan</strong></p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                    <h3 className="mb-2">Ringkasan Modul 8</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Mencatat cedera adalah bagian dari tanggung jawab pelatih</li>
                      <li className="flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} /> Semua laporan berkontribusi pada keselamatan atlet</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modul 9 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={setSectionRef('m9')}>
            <button
              onClick={() => toggleSection('m9')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <GitBranch className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">Modul 9: Decision Tree Respons Keselamatan</h2>
                </div>
              </div>
              {openSection === 'm9' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'm9' && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="mt-4 space-y-6">
                  <ModulImageZoom src="/assets/modul9.png" alt="Modul 9" />
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>Panduan Cepat untuk Pelatih Hapkido</h3>
                    <p className="text-sm text-gray-700">Ikuti langkah-langkah berikut saat menghadapi cedera.</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-400">
                    <h4 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>1️⃣ Cedera Terjadi</h4>
                    <p className="text-center my-2">⬇️</p>
                    <div className="bg-white p-3 rounded">
                      <p className="text-center font-bold text-gray-700">Hentikan aktivitas atlet sementara</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                    <h4 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>2️⃣ Tanyakan & Amati (≤ 30 detik)</h4>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded">
                        <p className="font-semibold text-sm mb-1">A. Apakah gerak terganggu?</p>
                        <p className="text-sm text-gray-700">Ya → STOP | Tidak → lanjut cek B</p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="font-semibold text-sm mb-1">B. Apakah ada nyeri tajam / bertambah?</p>
                        <p className="text-sm text-gray-700">Ya → STOP | Tidak → lanjut cek C</p>
                      </div>
                      <div className="bg-white p-3 rounded">
                        <p className="font-semibold text-sm mb-1">C. Apakah ada tanda bahaya?</p>
                        <p className="text-sm text-gray-700">Ya → STOP | Tidak → lanjut evaluasi</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-yellow-500">
                    <h4 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>3️⃣ Keputusan Pelatih</h4>
                    <div className="space-y-3">
                      <div className="bg-red-50 p-3 rounded">
                        <h5 className="font-bold text-sm mb-2">🔴 STOP LATIHAN (Wajib)</h5>
                        <p className="text-xs">➡️ Amankan atlet → Anjurkan pemeriksaan → Catat di ISS</p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded">
                        <h5 className="font-bold text-sm mb-2">🟡 LANJUT TERBATAS (Hati-hati)</h5>
                        <p className="text-xs">➡️ Turunkan intensitas → Tanpa teknik berisiko → Catat di ISS</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
                    <h4 className="mb-3" style={{ color: 'var(--dark-navy-0)' }}>4️⃣ Prinsip Emas Pelatih</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>❗ Ragu = Hentikan</p>
                      <p>❗ Keselamatan lebih penting dari target latihan</p>
                      <p>❗ Cedera kecil yang dicatat hari ini mencegah cedera besar besok</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Penutup */}
        <div className="bg-blue-50 rounded-lg shadow-md p-6 md:p-8 mt-6 border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
          <h2 className="text-xl mb-6" style={{ color: 'var(--dark-navy-0)' }}>Penutup</h2>
          
          <div className="bg-white rounded-lg p-5 border-2" style={{ borderColor: 'var(--teal-0)' }}>
            <h3 className="mb-4 text-center text-lg" style={{ color: 'var(--teal-0)' }}>Tugas Pokok Pelatih untuk Menjaga Keselamatan Atlet</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <Eye className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                <span>Lebih peka terhadap risiko</span>
              </li>
              <li className="flex gap-3">
                <GitBranch className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                <span>Lebih bijak mengambil keputusan</span>
              </li>
              <li className="flex gap-3">
                <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                <span>Lebih konsisten menjaga keselamatan atlet</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
