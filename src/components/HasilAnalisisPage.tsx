import { useState } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, X, ZoomIn } from 'lucide-react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NavigationBar } from './NavigationBar';
import { FloatingHomeButton } from './FloatingHomeButton';

interface HasilAnalisisPageProps {
  onNavigate: (page: string) => void;
}

export function HasilAnalisisPage({ onNavigate }: HasilAnalisisPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const infographics = ['/assets/info1.jpg', '/assets/info2.jpg'];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % infographics.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + infographics.length) % infographics.length);
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
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="mb-1 text-white text-3xl">Hasil Analisis Cedera</h1>
            <p className="text-white opacity-80">
              Gambaran awal hasil <span className="italic">Injury Surveillance System</span> Hapkido Indonesia
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-32 max-w-5xl">
        {/* Infografis Data Cedera */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="mb-6">Infografis Data Cedera</h2>
          
          {/* Slideshow */}
          <div className="relative group">
            <div className="bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer" onClick={() => setIsModalOpen(true)}>
              <img
                src={infographics[currentSlide]}
                alt={`Infographic ${currentSlide + 1}`}
                className="w-full h-auto"
              />
              {/* Zoom indicator */}
              <div className="absolute top-4 right-4 bg-black/60 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-5 h-5 text-white" />
              </div>
            </div>
            
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow-lg transition-all"
              style={{ color: 'var(--teal-0)' }}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow-lg transition-all"
              style={{ color: 'var(--teal-0)' }}
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {infographics.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className="w-3 h-3 rounded-full transition-all hover:scale-110"
                  style={{
                    backgroundColor: currentSlide === index ? 'var(--teal-0)' : 'white',
                    border: '2px solid var(--teal-0)',
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Slide Counter */}
          <div className="text-center mt-4">
            <p className="text-sm" style={{ color: 'var(--dark-navy-20)' }}>
              Infografis {currentSlide + 1} dari {infographics.length}
            </p>
          </div>
        </div>

        {/* Tentang Data ISS */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8" style={{ color: 'var(--teal-0)' }} />
            <h2>Tren Cedera Hapkido Indonesia 2019-2025</h2>
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Dua infografis diatas menyajikan gambaran awal hasil survey cedera Hapkido Indonesia yang dikumpulkan melalui desain multi-cross sectional, bukan longitudinal. Data diperoleh pada empat periode pengambilan (2019, 2023, 2024, dan 2025) menggunakan formulir manual, dengan pelaporan melibatkan <strong>179 pelatih</strong> dan <strong>3.442 atlet</strong> dari <strong>28 provinsi</strong>.
          </p>
          <div className="border-l-4 p-4" style={{ backgroundColor: 'var(--teal-50)', borderColor: 'var(--teal-0)' }}>
            <p className="text-gray-700 leading-relaxed">
              <strong>Catatan Penting:</strong> Angka pelatih dan atlet tersebut bukan jumlah akumulatif unik, karena individu yang sama dapat terlibat dan terlapor pada lebih dari satu periode pengambilan data (overlap). Oleh karena itu, infografis ini bertujuan menggambarkan pola dan proporsi cedera pada tiap periode pengamatan, bukan mengikuti individu yang sama secara berkelanjutan dari waktu ke waktu.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center text-white rounded-lg p-8" style={{ background: 'linear-gradient(135deg, var(--teal-0), var(--teal-20))' }}>
          <h2 className="mb-4 text-white" style={{ fontWeight: 'bold' }}>Ingin Berkontribusi dalam Pengumpulan Data?</h2>
          <p className="mb-6 text-white opacity-90" style={{ fontWeight: '600' }}>
            Login untuk melaporkan cedera dan mengakses dashboard analisis lengkap
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

      {/* Modal for Infographic */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative w-full max-w-6xl max-h-screen" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 md:-right-12 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Image Container */}
            <div className="bg-black/50 rounded-lg overflow-auto max-h-[90vh]">
              <img
                src={infographics[currentSlide]}
                alt={`Infographic ${currentSlide + 1}`}
                className="w-full h-auto"
              />
            </div>

            {/* Navigation Arrows in Modal */}
            {infographics.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow-lg transition-all"
                  style={{ color: 'var(--teal-0)' }}
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button
                  onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow-lg transition-all"
                  style={{ color: 'var(--teal-0)' }}
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Slide Counter in Modal */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 rounded-full px-4 py-2">
                  <p className="text-sm text-white">
                    {currentSlide + 1} / {infographics.length}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}