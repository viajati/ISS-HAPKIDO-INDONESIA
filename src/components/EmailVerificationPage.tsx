import { useState } from 'react';
import Image from 'next/image';

interface EmailVerificationPageProps {
  onNavigate: (page: string) => void;
}

export function EmailVerificationPage({ onNavigate }: EmailVerificationPageProps) {
  const [verified] = useState(false);
  const [error] = useState('');

  // TODO: On mount, call backend to verify token from URL
  // Example: useEffect(() => { verifyEmail(token) }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <Image
              src="/assets/hapkido-logo.png"
              alt="Hapkido Indonesia Logo"
              layout="fill"
              objectFit="contain"
              priority
            />
          </div>
          <h1 className="mb-2">Verifikasi Email</h1>
          <p className="text-gray-600 text-sm">
            {verified
              ? 'Email Anda berhasil diverifikasi!'
              : 'Sedang memverifikasi email Anda...'}
          </p>
        </div>
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        {verified && (
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
            onClick={() => onNavigate('login')}
          >
            Lanjut ke Login
          </button>
        )}
      </div>
    </div>
  );
}

export default EmailVerificationPage;
