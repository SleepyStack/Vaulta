'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { API_ENDPOINTS } from '@/lib/constants';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  User, 
  Users, 
  BarChart3, 
  LogOut,
  Shield,
  Wallet,
  CreditCard,
  UserCog
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface UserProfile {
  email: string;
  username: string;
  role: string;
}

export default function DashboardLayout({
  children,
}:  {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('vaulta_token');
    const role = localStorage.getItem('vaulta_role');
    const email = localStorage.getItem('vaulta_email');
    const username = localStorage.getItem('vaulta_username');

    if (! token || !role) {
      router.push('/login');
      return;
    }

    setUserProfile({ email:  email || '', username: username || '', role });
    setIsLoading(false);
  }, [router]);

  const handleLogout = async () => {
  setIsLoggingOut(true);
  try {
    // ✅ UPDATED - Uses constant instead of hardcoded URL
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('vaulta_token');
    localStorage.removeItem('vaulta_role');
    localStorage.removeItem('vaulta_email');
    localStorage.removeItem('vaulta_username');
    router.push('/login');
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const isAdmin = userProfile?.role === 'ADMIN';

  const navLinks = [
    { href: '/dashboard/user', label: 'Overview', icon: LayoutDashboard, adminOnly: false },
    { href: '/dashboard/accounts', label: 'Accounts', icon: Wallet, adminOnly: false },
    { href: '/dashboard/transactions', label:  'Transactions', icon: ArrowLeftRight, adminOnly: false },
    { href: '/dashboard/profile', label: 'Profile', icon: User, adminOnly: false },
    { href: '/dashboard/admin', label: 'User Management', icon: Users, adminOnly: true },
    { href:  '/dashboard/admin/stats', label: 'System Stats', icon: BarChart3, adminOnly: true },
    { href: '/dashboard/admin/accounts', label: 'All Accounts', icon:  Wallet, adminOnly: true },
    { href: '/dashboard/admin/transactions', label: 'All Transactions', icon: CreditCard, adminOnly: true },
    { href: '/dashboard/admin/users', label: 'All Users', icon: UserCog, adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-emerald-500" />
            <h1 className="text-2xl font-bold text-emerald-500">Vaulta</h1>
          </div>
          {userProfile && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-sm text-slate-400">Logged in as</p>
              <p className="text-sm font-medium text-slate-200 truncate">{userProfile.username}</p>
              <span className={`inline-block px-2 py-1 mt-2 text-xs rounded ${
                isAdmin ? 'bg-red-500/20 text-red-500' :  'bg-emerald-500/20 text-emerald-500'
              }`}>
                {userProfile.role}
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks
            .filter(link => !link.adminOnly || isAdmin)
            .map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}