'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Shield, 
  Key,
  Bell,
  Settings,
  X
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({
    username: '',
    email: '',
    role: '',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('vaulta_token');
    const email = localStorage.getItem('vaulta_email');
    const username = localStorage.getItem('vaulta_username');
    const role = localStorage.getItem('vaulta_role');

    if (! token) {
      router.push('/login');
      return;
    }

    setUserProfile({
      username:  username || '',
      email: email || '',
      role: role || '',
    });
    setIsLoading(false);
  }, [router]);

  const handleChangePassword = async (e: React. FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    const token = localStorage.getItem('vaulta_token');
    if (!token) return;

    setIsChangingPassword(true);

    try {
      await axios.post(
        'http://localhost:8080/api/v1/users/change-password',
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm. newPassword,
        },
        {
          headers: { Authorization:  `Bearer ${token}` },
        }
      );

      setSuccess('Password changed successfully! ');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

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

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-green-500 text-sm">{success}</p>
        </div>
      )}

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
                  : 'bg-blue-500/20 text-blue-500'
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
                {userProfile. email}
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
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-left transition-all"
            >
              Change Password
            </button>
            
            <button className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-left transition-all opacity-50 cursor-not-allowed">
              Two-Factor Authentication (Coming Soon)
            </button>
            
            <button className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-left transition-all opacity-50 cursor-not-allowed">
              Active Sessions (Coming Soon)
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
              <input type="checkbox" className="w-5 h-5 rounded bg-slate-800 border-slate-700" defaultChecked disabled />
            </label>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Transaction Alerts</span>
              <input type="checkbox" className="w-5 h-5 rounded bg-slate-800 border-slate-700" defaultChecked disabled />
            </label>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Security Alerts</span>
              <input type="checkbox" className="w-5 h-5 rounded bg-slate-800 border-slate-700" defaultChecked disabled />
            </label>
            <p className="text-xs text-slate-500 mt-2">Notification preferences coming soon</p>
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
              <select disabled className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 opacity-50 cursor-not-allowed">
                <option>English</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Currency</label>
              <select disabled className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 opacity-50 cursor-not-allowed">
                <option>USD ($)</option>
              </select>
            </div>
            <p className="text-xs text-slate-500">Preferences coming soon</p>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-100">Change Password</h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setError(null);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="p-2 hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm. currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all disabled: opacity-50"
                >
                  {isChangingPassword ?  'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}