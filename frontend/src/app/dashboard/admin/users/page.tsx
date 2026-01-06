'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import {
  Users,
  Shield,
  Key,
  UserCheck,
  UserX,
  Search,
  Crown,
  RefreshCw,
} from 'lucide-react';

interface User {
  id:  number;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [tempPassword, setTempPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('vaulta_token');
    const role = localStorage.getItem('vaulta_role');

    if (!token || role !== 'ADMIN') {
      router.push('/dashboard/user');
      return;
    }

    fetchUsers();
  }, [router]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const data = await apiClient.get<User[]>(
        'http://localhost:8080/api/v1/admin/users'
      );
      setUsers(data);
    } catch (err: any) {
      setError(err.response?. data?.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    if (! searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleToggleStatus = async (userId: number) => {
    setActionLoading(userId);
    try {
      await apiClient.patch(
        `http://localhost:8080/api/v1/admin/users/${userId}/status`,
        {}
      );
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePromoteToAdmin = async (userId: number, username: string) => {
    if (! confirm(`Are you sure you want to promote ${username} to ADMIN?`)) return;

    setActionLoading(userId);
    try {
      await apiClient.post(
        `http://localhost:8080/api/v1/admin/users/${userId}/promote`,
        {}
      );
      await fetchUsers();
      alert(`${username} has been promoted to ADMIN successfully! `);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to promote user');
    } finally {
      setActionLoading(null);
    }
  };

  const openResetModal = (userId: number) => {
    setSelectedUserId(userId);
    setTempPassword('');
    setShowResetModal(true);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setSelectedUserId(null);
    setTempPassword('');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !tempPassword) return;

    setIsSubmitting(true);
    try {
      await apiClient.post(
        `http://localhost:8080/api/v1/admin/users/${selectedUserId}/reset-password`,
        { tempPassword }
      );
      alert('Password reset successfully!');
      closeResetModal();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'LOCKED':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'FROZEN':
        return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      default: 
        return 'bg-slate-500/20 text-slate-500 border-slate-500/30';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'ADMIN'
      ? 'bg-violet-500/20 text-violet-500 border-violet-500/30'
      : 'bg-blue-500/20 text-blue-500 border-blue-500/30';
  };

  const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
  const adminUsers = users.filter((u) => u.role === 'ADMIN').length;

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">User Management</h1>
        <p className="text-slate-400 mt-1">Manage users, roles, and permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-500" />
            <p className="text-sm text-slate-400">Total Users</p>
          </div>
          <p className="text-3xl font-bold text-blue-500">{users.length}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="w-8 h-8 text-green-500" />
            <p className="text-sm text-slate-400">Active Users</p>
          </div>
          <p className="text-3xl font-bold text-green-500">{activeUsers}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-violet-500" />
            <p className="text-sm text-slate-400">Administrators</p>
          </div>
          <p className="text-3xl font-bold text-violet-500">{adminUsers}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-100">{user.username}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role === 'ADMIN' && <Crown className="w-3 h-3 inline mr-1" />}
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* Toggle Status */}
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        disabled={actionLoading === user.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                          user.status === 'ACTIVE'
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-500'
                            : 'bg-green-500/20 hover:bg-green-500/30 text-green-500'
                        }`}
                      >
                        {actionLoading === user. id ? '...' : user.status === 'ACTIVE' ? 'Lock' : 'Unlock'}
                      </button>

                      {/* Promote to Admin (only for non-admins) */}
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => handlePromoteToAdmin(user.id, user.username)}
                          disabled={actionLoading === user.id}
                          className="px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 text-violet-500 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <Crown className="w-3 h-3" />
                          {actionLoading === user.id ?  '...' : 'Promote'}
                        </button>
                      )}

                      {/* Reset Password */}
                      <button
                        onClick={() => openResetModal(user.id)}
                        disabled={actionLoading === user.id}
                        className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-500 rounded-lg text-xs font-medium transition-colors disabled: opacity-50 flex items-center gap-1"
                      >
                        <Key className="w-3 h-3" />
                        Reset
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="py-12 text-center">
              <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 w-full max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Key className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">Reset Password</h2>
                <p className="text-sm text-slate-400">Set a temporary password for the user</p>
              </div>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Temporary Password
                </label>
                <input
                  type="text"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e. target.value)}
                  placeholder="Enter temporary password"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus: border-emerald-500"
                  required
                  minLength={6}
                />
                <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeResetModal}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Reset Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}