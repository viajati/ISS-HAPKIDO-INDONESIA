import { useState, useRef } from 'react';
import { PrivateSidebar } from './PrivateSidebar';
import { Menu, BookOpen, ChevronDown, ChevronUp, Shield, Users, Key, ClipboardList, History, Globe, AlertCircle, CheckCircle, Activity, Clock, FileText } from 'lucide-react';

interface PanduanPrivatePageProps {
  onNavigate: (page: string) => void;
  userRole?: 'coach' | 'regional' | 'national';
  onLogout?: () => void;
}

interface AccordionSection {
  id: string;
  letter: string;
  title: string;
  icon: any;
  color: string;
}

export function PanduanPrivatePage({ onNavigate, userRole = 'coach', onLogout }: PanduanPrivatePageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Map userRole to format expected by PrivateSidebar
  const mappedRole = userRole === 'coach' ? 'pelatih' : userRole === 'regional' ? 'admin_daerah' : 'admin_nasional';

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      onNavigate('logout');
    }
  };

  const sectionRefs = {
    a: useRef<HTMLDivElement>(null),
    b: useRef<HTMLDivElement>(null),
    c: useRef<HTMLDivElement>(null),
    d: useRef<HTMLDivElement>(null),
    e: useRef<HTMLDivElement>(null),
    f: useRef<HTMLDivElement>(null),
    g: useRef<HTMLDivElement>(null),
  };

  const sections: AccordionSection[] = [
    { id: 'a', letter: 'A', title: 'Prinsip Umum Penggunaan ISS', icon: Shield, color: 'var(--teal-0)' },
    { id: 'b', letter: 'B', title: 'Peran dan Kewenangan Pengguna', icon: Users, color: '#10b981' },
    { id: 'c', letter: 'C', title: 'Proses Akses dan Akun Pengguna', icon: Key, color: '#f59e0b' },
    { id: 'd', letter: 'D', title: 'Prosedur Pelaporan Cedera', icon: ClipboardList, color: 'var(--teal-0)' },
    { id: 'e', letter: 'E', title: 'Riwayat/Rekap Data', icon: History, color: '#8b5cf6' },
    { id: 'f', letter: 'F', title: 'Publikasi Data Nasional', icon: Globe, color: '#3b82f6' },
    { id: 'g', letter: 'G', title: 'Etika dan Tanggung Jawab Pengguna', icon: AlertCircle, color: '#ec4899' },
  ];

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
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      <PrivateSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={onNavigate}
        userRole={mappedRole}
        onLogout={handleLogout}
        currentPage="panduan-private"
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl">Panduan Pengguna</h1>
                <p className="text-sm text-gray-600">
                  <span className="italic">Injury Surveillance System</span> Hapkido Indonesia
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8 pb-32">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <p className="text-gray-700 leading-relaxed">
            Panduan ini menjelaskan tata cara penggunaan ISS Hapkido Indonesia bagi <strong>Pelatih</strong> dan <strong>Admin Daerah</strong> dalam melakukan pelaporan cedera atlet secara terstandar, aman, dan akuntabel.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="bg-blue-50 rounded-lg shadow-md p-6 mb-6 border-l-4" style={{ borderColor: 'var(--teal-0)' }}>
          <h2 className="mb-4 flex items-center gap-2" style={{ color: 'var(--dark-navy-0)' }}>
            <FileText className="w-6 h-6" />
            Navigasi Cepat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="text-left px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all text-sm"
                style={{ color: 'var(--teal-0)' }}
              >
                <span className="font-semibold">{section.letter}.</span> {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-4">
          {/* Section A - Prinsip Umum */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.a}>
            <button
              onClick={() => toggleSection('a')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Shield className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">Prinsip Umum Penggunaan ISS</h2>
                </div>
              </div>
              {openSection === 'a' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'a' && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <ul className="space-y-3 text-gray-700 mt-4">
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>ISS digunakan untuk mencatat kejadian cedera atlet Hapkido secara resmi.</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Setiap laporan cedera dibuat berdasarkan kejadian aktual pada tanggal tertentu.</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Satu atlet, satu waktu kejadian (tanggal) dilaporkan dalam satu laporan.</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>Apabila atlet mengalami lebih dari satu jenis cedera dalam satu kejadian, seluruh cedera tersebut dapat dicatat dalam satu laporan yang sama.</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal-0)' }} />
                    <span>ISS bukan alat diagnosis medis, melainkan sistem pemantauan dan dokumentasi cedera.</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Section B - Peran dan Kewenangan */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.b}>
            <button
              onClick={() => toggleSection('b')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Users className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">Peran dan Kewenangan Pengguna</h2>
                </div>
              </div>
              {openSection === 'b' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'b' && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="mt-4 space-y-6">
                  {/* Pelatih */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-green-900 mb-3 flex items-center gap-2">
                      <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                      Pelatih
                    </h3>
                    <p className="text-gray-700 mb-3">Pelatih bertanggung jawab melaporkan cedera atlet yang terjadi pada kegiatan:</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li className="flex gap-2">
                        <span className="text-green-600">•</span>
                        <span>Latihan rutin</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">•</span>
                        <span>Training camp dojang</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">•</span>
                        <span>Kegiatan pembinaan lainnya</span>
                      </li>
                    </ul>
                    <p className="text-gray-700 mt-3 text-sm italic">
                      *di luar event pertandingan atau event resmi yang diselenggarakan oleh Pengurus Daerah maupun Nasional.
                    </p>
                  </div>

                  {/* Admin Daerah */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-blue-900 mb-3 flex items-center gap-2">
                      <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                      Admin Daerah
                    </h3>
                    <p className="text-gray-700 mb-3">Admin Daerah bertanggung jawab melaporkan cedera atlet yang terjadi pada:</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li className="flex gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Event pertandingan/kejuaraan</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Ujian kenaikan tingkat</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Training camp atau kegiatan resmi</span>
                      </li>
                    </ul>
                    <p className="text-gray-700 mt-3 text-sm italic">
                      *yang diselenggarakan oleh Pengurus Daerah.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section C - Proses Akses */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.c}>
            <button
              onClick={() => toggleSection('c')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Key className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">Proses Akses dan Akun Pengguna</h2>
                </div>
              </div>
              {openSection === 'c' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'c' && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="mt-4 space-y-6">
                  {/* Pendaftaran Pelatih */}
                  <div>
                    <h3 className="text-orange-900 mb-3 flex items-center gap-2">
                      <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                      Pendaftaran dan Akses Pelatih
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-600" />
                        <span>Pelatih wajib terdaftar dalam sistem ISS.</span>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-600" />
                        <span>Sebelum mendaftar, pelatih harus meminta token verifikasi dari Admin Nasional.</span>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-600" />
                        <div>
                          <p className="mb-2">Token digunakan sebagai bukti bahwa pelatih:</p>
                          <ul className="ml-4 space-y-1">
                            <li className="flex gap-2">
                              <span className="text-orange-600">→</span>
                              <span>Berstatus resmi</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-orange-600">→</span>
                              <span>Berhak melakukan input data cedera</span>
                            </li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-600" />
                        <div>
                          <p className="mb-2">Setelah token diverifikasi, pelatih dapat:</p>
                          <ul className="ml-4 space-y-1">
                            <li className="flex gap-2">
                              <span className="text-orange-600">→</span>
                              <span>Membuat akun</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-orange-600">→</span>
                              <span>Login ke dashboard ISS</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-orange-600">→</span>
                              <span>Menginput laporan cedera sesuai kewenangan</span>
                            </li>
                          </ul>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Akses Admin Daerah */}
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="text-orange-900 mb-3 flex items-center gap-2">
                      <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                      Akses Admin Daerah
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-600" />
                        <span>Akun Admin Daerah dibuat langsung oleh Admin Nasional.</span>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-600" />
                        <div>
                          <p className="mb-2">Admin Daerah akan menerima:</p>
                          <ul className="ml-4 space-y-1">
                            <li className="flex gap-2">
                              <span className="text-orange-600">→</span>
                              <span>User ID resmi</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-orange-600">→</span>
                              <span>Password resmi</span>
                            </li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-600" />
                        <span>Admin Daerah tidak perlu melakukan pendaftaran mandiri.</span>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-600" />
                        <div>
                          <p className="mb-2">Akses Admin Daerah dibatasi pada:</p>
                          <ul className="ml-4 space-y-1">
                            <li className="flex gap-2">
                              <span className="text-orange-600">→</span>
                              <span>Input data cedera event daerah</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-orange-600">→</span>
                              <span>Rekap data wilayahnya sendiri</span>
                            </li>
                          </ul>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section D - Prosedur Pelaporan */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.d}>
            <button
              onClick={() => toggleSection('d')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <ClipboardList className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">Prosedur Pelaporan Cedera</h2>
                </div>
              </div>
              {openSection === 'd' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'd' && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="mt-4 space-y-6">
                  {/* Waktu Pelaporan */}
                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-red-600" />
                      <h3 className="text-red-900">1. Waktu Pelaporan</h3>
                    </div>
                    <p className="text-gray-700">
                      Pelaporan dilakukan secepat mungkin untuk menjaga akurasi data <strong>(dalam 24 jam kejadian)</strong>.
                    </p>
                  </div>

                  {/* Mekanisme Pelaporan */}
                  <div>
                    <h3 className="text-red-900 mb-3 flex items-center gap-2">
                      <span className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                      Mekanisme Pelaporan
                    </h3>
                    <p className="text-gray-700 mb-4">Baik Pelatih maupun Admin Daerah mengikuti prinsip berikut:</p>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-red-600 font-semibold mb-2">→ Pilih menu Input Data Cedera</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-red-600 font-semibold mb-3">→ Masukkan Identitas Atlet dan Kejadian:</p>
                        <ul className="space-y-2 text-gray-700 ml-4">
                          <li className="flex gap-2"><span className="text-red-400">•</span> Nama Atlet</li>
                          <li className="flex gap-2"><span className="text-red-400">•</span> Jenis kelamin</li>
                          <li className="flex gap-2"><span className="text-red-400">•</span> Usia</li>
                          <li className="flex gap-2"><span className="text-red-400">•</span> Waktu kejadian</li>
                          <li className="flex gap-2"><span className="text-red-400">•</span> Jenis kegiatan</li>
                          <li className="flex gap-2"><span className="text-red-400">•</span> Konteks kegiatan</li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-red-600 font-semibold mb-3">→ Pilih dan isikan:</p>
                        <ul className="space-y-2 text-gray-700 ml-4">
                          <li className="flex gap-2"><span className="text-red-400">•</span> Lokasi cedera</li>
                          <li className="flex gap-2"><span className="text-red-400">•</span> Jenis cedera</li>
                          <li className="flex gap-2"><span className="text-red-400">•</span> Mekanisme</li>
                          <li className="flex gap-2"><span className="text-red-400">•</span> Tingkat keparahan (sesuai kategori sistem)</li>
                        </ul>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                        <p className="text-gray-700">
                          <strong>Catatan:</strong> Jika atlet mengalami lebih dari satu cedera, sistem memungkinkan penambahan lebih dari satu entri cedera dalam satu laporan.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Assessment Pelatih */}
                  <div className="border-2 border-red-200 rounded-lg p-5">
                    <h3 className="text-red-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Assessment Pelatih tentang Derajat Cedera dan Feedback
                    </h3>
                    
                    <div className="mb-4 bg-red-50 p-3 rounded">
                      <p className="text-sm font-semibold text-red-900">DEFINISI OPERASIONAL</p>
                    </div>

                    {/* Penilaian Kemampuan Gerak */}
                    <div className="mb-5">
                      <h4 className="font-semibold text-gray-800 mb-3 bg-gray-100 p-2 rounded">Penilaian Kemampuan Gerak</h4>
                      
                      <div className="space-y-4">
                        <div className="ml-4">
                          <p className="font-semibold text-green-700 mb-2">✓ Bisa Bergerak Bebas</p>
                          <ul className="space-y-1 text-gray-700 text-sm ml-4">
                            <li className="flex gap-2"><span className="text-green-500">•</span> Atlet bisa berdiri & berjalan normal</li>
                            <li className="flex gap-2"><span className="text-green-500">•</span> Tidak pincang</li>
                            <li className="flex gap-2"><span className="text-green-500">•</span> Tidak kaku</li>
                            <li className="flex gap-2"><span className="text-green-500">•</span> Tidak menghindari anggota tubuh tertentu</li>
                          </ul>
                        </div>

                        <div className="ml-4">
                          <p className="font-semibold text-yellow-700 mb-2">⚠ Gerak Terbatas</p>
                          <ul className="space-y-1 text-gray-700 text-sm ml-4">
                            <li className="flex gap-2"><span className="text-yellow-500">•</span> Atlet masih bisa bergerak</li>
                            <li className="flex gap-2"><span className="text-yellow-500">•</span> Terlihat pincang, kaku, ragu, atau menghindari gerakan tertentu</li>
                            <li className="flex gap-2"><span className="text-yellow-500">•</span> Aktivitas perlu dikurangi</li>
                          </ul>
                        </div>

                        <div className="ml-4">
                          <p className="font-semibold text-red-700 mb-2">✗ Tidak Bisa Bergerak</p>
                          <ul className="space-y-1 text-gray-700 text-sm ml-4">
                            <li className="flex gap-2"><span className="text-red-500">•</span> Atlet tidak mampu berdiri, berjalan, atau menggunakan bagian tubuh</li>
                            <li className="flex gap-2"><span className="text-red-500">•</span> Aktivitas terhenti</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Penilaian Tingkat Nyeri */}
                    <div className="mb-5">
                      <h4 className="font-semibold text-gray-800 mb-3 bg-gray-100 p-2 rounded">Penilaian Tingkat Nyeri</h4>
                      
                      <div className="space-y-4">
                        <div className="ml-4">
                          <p className="font-semibold text-green-700 mb-2">Nyeri Ringan</p>
                          <ul className="space-y-1 text-gray-700 text-sm ml-4">
                            <li className="flex gap-2"><span className="text-green-500">•</span> Tidak mengganggu aktivitas utama</li>
                            <li className="flex gap-2"><span className="text-green-500">•</span> Tidak perlu es atau obat anti nyeri</li>
                          </ul>
                        </div>

                        <div className="ml-4">
                          <p className="font-semibold text-yellow-700 mb-2">Nyeri Sedang</p>
                          <ul className="space-y-1 text-gray-700 text-sm ml-4">
                            <li className="flex gap-2"><span className="text-yellow-500">•</span> Membutuhkan es / istirahat / obat antinyeri</li>
                            <li className="flex gap-2"><span className="text-yellow-500">•</span> Aktivitas dikurangi</li>
                          </ul>
                        </div>

                        <div className="ml-4">
                          <p className="font-semibold text-red-700 mb-2">Nyeri Berat</p>
                          <ul className="space-y-1 text-gray-700 text-sm ml-4">
                            <li className="flex gap-2"><span className="text-red-500">•</span> Tidak berkurang dengan es atau obat antinyeri</li>
                            <li className="flex gap-2"><span className="text-red-500">•</span> Atlet tidak bisa melanjutkan aktivitas</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Red Flags */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 bg-gray-100 p-2 rounded">Pemeriksaan Tanda Bahaya (Red Flags)</h4>
                      <p className="text-gray-700 mb-3 ml-4">Centang yang sesuai:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-4 h-4 border-2 border-red-500 rounded flex items-center justify-center text-xs">☐</span>
                          Bengkak hebat
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-4 h-4 border-2 border-red-500 rounded flex items-center justify-center text-xs">☐</span>
                          Bentuk sendi tidak normal
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-4 h-4 border-2 border-red-500 rounded flex items-center justify-center text-xs">☐</span>
                          Pusing
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-4 h-4 border-2 border-red-500 rounded flex items-center justify-center text-xs">☐</span>
                          Tidak sadar
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-4 h-4 border-2 border-red-500 rounded flex items-center justify-center text-xs">☐</span>
                          Mati rasa
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-4 h-4 border-2 border-red-500 rounded flex items-center justify-center text-xs">☐</span>
                          Perdarahan hebat
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-4 h-4 border-2 border-red-500 rounded flex items-center justify-center text-xs">☐</span>
                          Tidak ada
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-red-600 font-semibold">→ Edit, Simpan atau kirim laporan</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section E - Riwayat/Rekap Data */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.e}>
            <button
              onClick={() => toggleSection('e')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <History className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">Riwayat/Rekap Data</h2>
                </div>
              </div>
              {openSection === 'e' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'e' && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="mt-4 space-y-6">
                  {/* Akses Pelatih */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-purple-900 mb-3 flex items-center gap-2">
                      <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                      Akses Pelatih
                    </h3>
                    <div className="space-y-3 text-gray-700">
                      <p className="flex gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-purple-600" />
                        <span>Pelatih dapat melihat riwayat laporan cedera atlet di dojang masing-masing.</span>
                      </p>
                      <p className="flex gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-purple-600" />
                        <span>Tidak dapat mengakses data pelatih lain, data daerah atau nasional.</span>
                      </p>
                    </div>
                  </div>

                  {/* Akses Admin Daerah */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-blue-900 mb-3 flex items-center gap-2">
                      <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                      Akses Admin Daerah
                    </h3>
                    <div className="space-y-3 text-gray-700">
                      <p className="flex gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
                        <span>Admin Daerah dapat melihat riwayat laporan cedera event yang diselenggarakan di wilayahnya.</span>
                      </p>
                      <p className="flex gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
                        <span>Tidak dapat mengakses dan mengubah data pelatih atau daerah lain.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section F - Publikasi Data Nasional */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.f}>
            <button
              onClick={() => toggleSection('f')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <Globe className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">Publikasi Data Nasional</h2>
                </div>
              </div>
              {openSection === 'f' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'f' && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="mt-4 space-y-4">
                  <p className="flex gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
                    <span>Rekap data tingkat nasional dikelola oleh Admin Nasional.</span>
                  </p>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-700 mb-3">Data nasional akan diumumkan di website ISS dalam bentuk:</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li className="flex gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Ringkasan tahunan</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Tanpa identitas personal atlet</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-700 mb-2 font-semibold">Publikasi bersifat:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <div className="bg-white p-3 rounded text-center">
                        <p className="text-blue-600 font-semibold">Deskriptif</p>
                      </div>
                      <div className="bg-white p-3 rounded text-center">
                        <p className="text-blue-600 font-semibold">Agregat</p>
                      </div>
                      <div className="bg-white p-3 rounded text-center">
                        <p className="text-blue-600 font-semibold">Non-identifiable</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section G - Etika */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={sectionRefs.g}>
            <button
              onClick={() => toggleSection('g')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--teal-50)' }}>
                  <AlertCircle className="w-6 h-6" style={{ color: 'var(--teal-0)' }} />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-lg leading-snug">Etika dan Tanggung Jawab Pengguna</h2>
                </div>
              </div>
              {openSection === 'g' ? <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </button>
            
            {openSection === 'g' && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="mt-4 space-y-4">
                  <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-500">
                    <p className="text-gray-700 flex gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-pink-600" />
                      <span>Setiap pengguna bertanggung jawab atas kebenaran dan kejujuran data yang dilaporkan.</span>
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 mb-3 font-semibold">Data ISS digunakan untuk:</p>
                    <ul className="space-y-2 text-gray-700 ml-4">
                      <li className="flex gap-2">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-pink-600" />
                        <span>Pemantauan cedera</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-pink-600" />
                        <span>Evaluasi keselamatan</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-pink-600" />
                        <span>Pengembangan sistem pembinaan</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                    <p className="text-red-800 flex gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span><strong>Peringatan:</strong> Penyalahgunaan data dapat berakibat pada pembatasan akses sistem.</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}