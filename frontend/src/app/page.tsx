'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('vaulta_token');
      if (token) {
        router.push('/dashboard');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-7xl font-bold text-emerald-500 mb-4">
            Vaulta
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-2">
            Secure Banking Platform
          </p>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Experience next-generation banking with industry-standard encryption 
            and cutting-edge security features.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/login"
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-semibold rounded-xl transition shadow-lg hover:shadow-emerald-500/50"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white text-lg font-semibold rounded-xl transition border border-slate-700"
          >
            Create Account
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="text-emerald-500 text-3xl mb-3">🔒</div>
            <h3 className="text-white font-semibold text-lg mb-2">Secure</h3>
            <p className="text-slate-400 text-sm">
              JWT authentication with token versioning and encryption
            </p>
          </div>
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="text-emerald-500 text-3xl mb-3">⚡</div>
            <h3 className="text-white font-semibold text-lg mb-2">Fast</h3>
            <p className="text-slate-400 text-sm">
              Lightning-fast transactions with real-time updates
            </p>
          </div>
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="text-emerald-500 text-3xl mb-3">🛡️</div>
            <h3 className="text-white font-semibold text-lg mb-2">Protected</h3>
            <p className="text-slate-400 text-sm">
              Rate limiting and advanced security measures
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-slate-500 text-sm">
          <p>Protected by industry-standard encryption</p>
        </div>
      </div>
    </div>
  );
}