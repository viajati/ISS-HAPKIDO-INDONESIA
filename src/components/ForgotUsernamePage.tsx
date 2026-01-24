import { useState } from 'react';
import { User } from 'lucide-react';


interface ForgotUsernamePageProps {
  onNavigate: (page: string) => void;
}

export function ForgotUsernamePage({ onNavigate }: ForgotUsernamePageProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle username recovery logic here
    console.log('Username recovery request for:', email);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/assets/hapkido-logo.png"
            alt="Hapkido Indonesia Logo"
            className="w-20 h-20 mx-auto mb-4 object-contain"
          />
          <h1 className="mb-2">Lupa Username?</h1>
          <p className="text-gray-600 text-sm">
            Masukkan email Anda dan kami akan mengirimkan username Anda
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm mb-2 text-gray-700">
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Masukkan email Anda"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
            >
              Pulihkan Username
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                Cek email Anda! Kami telah mengirimkan username Anda ke{' '}
                <span className="font-medium">{email}</span>
              </p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="text-blue-600 hover:underline text-sm"
            >
              Tidak menerima email? Coba lagi
            </button>
          </div>
        )}

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('login')}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Kembali ke Masuk
          </button>
        </div>
      </div>
    </div>
  );
}