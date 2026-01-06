'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Shield, 
  Key,
  Bell,
  Settings
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({
    username: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('vaulta_token');
    const email = localStorage.getItem('vaulta_email');
    const username = localStorage.getItem('vaulta_username');
    const role = localStorage.getItem('vaulta_role');

    if (!token) {
      router.push('/login');
      return;
    }

    setUserProfile({
      username: username || '',
      email: email || '',
      role: role || '',
    });
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Profile Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account information and preferences</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold">
            {userProfile.username. charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-100 mb-1">{userProfile.username}</h2>
            <p className="text-slate-400 mb-4">{userProfile.email}</p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                userProfile.role === 'ADMIN' 
                  ? 'bg-purple-500/20 text-purple-500' 
                  :  'bg-blue-500/20 text-blue-500'
              }`}>
                <Shield className="w-3 h-3" />
                {userProfile.role}
              </span>
              <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <User className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100">Account Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
              <div className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300">
                {userProfile.username}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
              <div className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                {userProfile.email}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Key className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100">Security</h3>
          </div>
          
          <div className="space-y-4">
            <button className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-left transition-all">
              Change Password
            </button>
            
            <button className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-left transition-all">
              Two-Factor Authentication
            </button>
            
            <button className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-left transition-all">
              Active Sessions
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100">Notifications</h3>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Email Notifications</span>
              <input type="checkbox" className="w-5 h-5 rounded bg-slate-800 border-slate-700" defaultChecked />
            </label>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Transaction Alerts</span>
              <input type="checkbox" className="w-5 h-5 rounded bg-slate-800 border-slate-700" defaultChecked />
            </label>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Security Alerts</span>
              <input type="checkbox" className="w-5 h-5 rounded bg-slate-800 border-slate-700" defaultChecked />
            </label>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <Settings className="w-5 h-5 text-violet-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100">Preferences</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Language</label>
              <select className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Currency</label>
              <select className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all">
          Cancel
        </button>
        <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all">
          Save Changes
        </button>
      </div>
    </div>
  );
}