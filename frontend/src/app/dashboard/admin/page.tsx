'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  DollarSign, 
  Users, 
  UserX, 
  Activity,
  ShieldOff,
  UserCheck,
  Mail,
  Shield
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  totalSystemBalance: number;
  totalTransactionsCount: number;
}

interface UserManagement {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  tokenVersion: number;
  totalBalance: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('vaulta_token');
    const role = localStorage.getItem('vaulta_role');

    if (!token) {
      router.push('/login');
      return;
    }

    if (role !== 'ADMIN') {
      router.push('/dashboard/user');
      return;
    }

    fetchAdminData(token);
  }, [router]);

  const fetchAdminData = async (token: string) => {
  setIsLoading(true);
  setError(null);
  
  try {
    // Fetch stats first
    const statsResponse = await axios.get('http://localhost:8080/api/v1/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStats(statsResponse.data);

    // Then fetch users
    const usersResponse = await axios.get('http://localhost:8080/api/v1/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(usersResponse.data);
  } catch (err: any) {
    console.error('Failed to fetch admin data:', err);
    setError(err.response?.data?.message || 'Failed to load admin data');
  } finally {
    setIsLoading(false);
  }
};

  const toggleUserStatus = async (userId: number) => {
  const token = localStorage.getItem('vaulta_token');
  if (!token) return;

  setActionLoading(userId);
  try {
    const response = await axios.patch(
      `http://localhost:8080/api/v1/admin/users/${userId}/status`,
      {}, 
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Refresh the users list
    const usersResponse = await axios.get('http://localhost:8080/api/v1/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(usersResponse. data);
  } catch (err:  any) {
    console.error('Failed to toggle status:', err);
    alert(err.response?.data?.message || 'Failed to toggle user status');
  } finally {
    setActionLoading(null);
  }
};

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
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
    <div className="space-y-8">
      {/* Global Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-sm text-slate-400 mb-1">Platform Liquidity</p>
          <p className="text-2xl font-bold text-emerald-500">
            ${stats?.totalSystemBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm text-slate-400 mb-1">Active Users</p>
          <p className="text-2xl font-bold text-blue-500">{stats?.activeUsers}</p>
          <p className="text-xs text-slate-500 mt-1">of {stats?.totalUsers} total</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <UserX className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-sm text-slate-400 mb-1">Locked Users</p>
          <p className="text-2xl font-bold text-red-500">{stats?.lockedUsers}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-violet-500" />
          </div>
          <p className="text-sm text-slate-400 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-violet-500">
            {stats?.totalTransactionsCount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-100">User Management</h3>
          <p className="text-sm text-slate-400">Monitor and manage platform users</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-400">#{user.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-100">{user.username}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'
                    }`}>
                      {user.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-emerald-500">
                    ${user.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      disabled={actionLoading === user.id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        user.status === 'ACTIVE'
                          ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/20'
                          : 'bg-green-500/20 text-green-500 hover:bg-green-500/30 border border-green-500/20'
                      } ${actionLoading === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {actionLoading === user.id ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : user.status === 'ACTIVE' ? (
                        <>
                          <ShieldOff className="w-3 h-3" />
                          Lock User
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3 h-3" />
                          Unlock User
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}