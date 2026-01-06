'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  User, 
  Users, 
  BarChart3, 
  LogOut,
  Shield
} from 'lucide-react';

interface UserProfile {
  email: string;
  username: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vaulta_token');
    const role = localStorage.getItem('vaulta_role');
    const email = localStorage.getItem('vaulta_email');
    const username = localStorage.getItem('vaulta_username');

    if (!token || !role) {
      router.push('/login');
      return;
    }

    setUserProfile({ email: email || '', username: username || '', role });
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('vaulta_token');
    localStorage.removeItem('vaulta_role');
    localStorage.removeItem('vaulta_email');
    localStorage.removeItem('vaulta_username');
    router.push('/login');
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
    { href: '/dashboard/transactions', label: 'Transactions', icon: ArrowLeftRight, adminOnly: false },
    { href: '/dashboard/profile', label: 'Profile', icon: User, adminOnly: false },
    { href: '/dashboard/admin', label: 'User Management', icon: Users, adminOnly: true },
    { href: '/dashboard/admin/stats', label: 'System Stats', icon: BarChart3, adminOnly: true },
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
          <p className="text-xs text-slate-400 mt-1">Secure Banking Platform</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => {
            if (link.adminOnly && !isAdmin) return null;
            
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
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
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium text-slate-100">{userProfile?.username}</p>
            <p className="text-xs text-slate-400">{userProfile?.email}</p>
            {isAdmin && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-500 rounded">
                ADMIN
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition-all border border-slate-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">
                {pathname.includes('admin') ? 'Admin Dashboard' : 'Dashboard'}
              </h2>
              <p className="text-sm text-slate-400">Welcome back, {userProfile?.username}</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}