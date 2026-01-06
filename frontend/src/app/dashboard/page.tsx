'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('vaulta_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('vaulta_token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-500">Vaulta</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
          <h2 className="text-3xl font-bold text-white mb-4">
            Welcome to Vaulta Dashboard
          </h2>
          <p className="text-slate-400">
            Your secure banking interface. Features coming soon!
          </p>
        </div>
      </main>
    </div>
  );
}
