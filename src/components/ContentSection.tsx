import { ArrowRight, Calendar } from 'lucide-react';

interface ContentSectionProps {
  onNavigate: (page: string) => void;
}

export function ContentSection({ onNavigate }: ContentSectionProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* CTA Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div
          onClick={() => onNavigate('panduan-pengguna')}
          className="bg-white rounded-lg p-6 cursor-pointer transition-all border"
          style={{ borderColor: 'var(--gray-10)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)';
            e.currentTarget.style.borderColor = 'var(--teal-0)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'var(--gray-10)';
          }}
        >
          <div className="text-3xl mb-3">📖</div>
          <h3 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>Panduan Penggunaan ISS</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--dark-navy-20)' }}>
            Pelajari cara menggunakan sistem ISS dengan lengkap
          </p>
          <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--teal-0)' }}>
            Baca panduan
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>

        <div
          onClick={() => onNavigate('edukasi-cedera')}
          className="bg-white rounded-lg p-6 cursor-pointer transition-all border"
          style={{ borderColor: 'var(--gray-10)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)';
            e.currentTarget.style.borderColor = 'var(--teal-0)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'var(--gray-10)';
          }}
        >
          <div className="text-3xl mb-3">🏥</div>
          <h3 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>Modul Edukasi</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--dark-navy-20)' }}>
            Pelajari cara mengenali dan merespons cedera dengan tepat
          </p>
          <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--teal-0)' }}>
            Pelajari
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>

        <div
          onClick={() => onNavigate('hasil-analisis')}
          className="bg-white rounded-lg p-6 cursor-pointer transition-all border"
          style={{ borderColor: 'var(--gray-10)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)';
            e.currentTarget.style.borderColor = 'var(--teal-0)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'var(--gray-10)';
          }}
        >
          <div className="text-3xl mb-3">📊</div>
          <h3 className="mb-2" style={{ color: 'var(--dark-navy-0)' }}>Hasil Analisis Cedera</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--dark-navy-20)' }}>
            Lihat hasil analisis dan infografis data cedera dari sistem ISS
          </p>
          <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--teal-0)' }}>
            Lihat hasil
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
}