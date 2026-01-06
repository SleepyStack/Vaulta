'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

interface LoginFormData {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  // Handle navigation after successful login
  useEffect(() => {
    if (shouldNavigate) {
      router.push('/dashboard');
    }
  }, [shouldNavigate, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setShouldNavigate(false);

    try {
      console.log('🔵 Attempting login... ', formData. email);
      
      const response = await api.post<AuthResponse>('/api/v1/auth/login', {
        email: formData.email,
        password: formData. password,
      });

      console.log('✅ Login successful!');

      // Store JWT token
      localStorage.setItem('vaulta_token', response.data.token);
      
      setIsLoading(false);

      // Trigger navigation
      setShouldNavigate(true);
      
    } catch (err:  any) {
      console.error('❌ Login error:', err);
      
      // Determine error message
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (err. code === 'ERR_NETWORK') {
        errorMessage = '🔴 Cannot connect to server. Is the backend running on port 8080?';
      } else if (err.response) {
        const status = err.response.status;
        const serverMessage = err.response.data?.message;

        if (status === 401 || status === 403) {
          errorMessage = '❌ Invalid email or password.  Please check your credentials and try again. ';
        } else if (status === 500) {
          errorMessage = '❌ Server error. Please try again later.';
        } else if (serverMessage) {
          errorMessage = `❌ ${serverMessage}`;
        } else {
          errorMessage = `❌ Authentication failed (Error ${status}). Please try again.`;
        }
      }

      console.error('📛 Error message:', errorMessage);
      
      // Set error and loading state
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleChange = (e: React. ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleInputFocus = () => {
    // Clear error when user focuses on input after an error
    if (error && ! isLoading) {
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-500 mb-2">Vaulta</h1>
          <p className="text-slate-400">Secure Banking Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-800">
          <h2 className="text-2xl font-semibold text-white mb-6">Sign In</h2>

          {/* Error Message - Persistent and Dismissible */}
          {error && !isLoading && (
            <div 
              className="mb-6 p-4 bg-red-500/20 border-2 border-red-500 rounded-lg animate-shake"
              role="alert"
            >
              <div className="flex items-start gap-3">
                <span className="text-red-400 text-2xl flex-shrink-0 leading-none">⚠️</span>
                <div className="flex-1 pt-0.5">
                  <p className="text-red-200 font-semibold text-sm leading-relaxed">
                    {error}
                  </p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-200 transition flex-shrink-0 text-xl leading-none font-bold"
                  aria-label="Dismiss error"
                  type="button"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={handleInputFocus}
                required
                autoComplete="off"
                className={`w-full px-4 py-3 bg-slate-800 border-2 rounded-lg text-white placeholder-slate-500 focus:outline-none focus: ring-2 transition ${
                  error && !isLoading
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' 
                    : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/50'
                }`}
                placeholder="user@vaulta.com"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={handleInputFocus}
                required
                autoComplete="off"
                className={`w-full px-4 py-3 bg-slate-800 border-2 rounded-lg text-white placeholder-slate-500 focus: outline-none focus:ring-2 transition ${
                  error && !isLoading
                    ?  'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' 
                    : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/50'
                }`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition duration-200 shadow-lg transform hover:scale-[1.02] active:scale-95 disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in... 
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account? {' '}
              <Link
                href="/register"
                className="text-emerald-500 hover:text-emerald-400 font-medium transition underline-offset-2 hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-slate-500 text-xs">
          <p>Protected by industry-standard encryption</p>
        </div>
      </div>
    </div>
  );
}