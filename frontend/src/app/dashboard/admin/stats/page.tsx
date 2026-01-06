'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  UserCheck,
  UserX,
  ArrowUpRight,
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  totalSystemBalance: number;
  totalTransactionsCount: number;
  userActivityRate: number;
  avgBalancePerUser: number;
  avgTransactionsPerUser: number;
}

export default function AdminStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    fetchStats(token);
  }, [router]);

  const fetchStats = async (token: string) => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (err:  any) {
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setIsLoading(false);
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">System Statistics</h1>
        <p className="text-slate-400 mt-1">Detailed analytics and performance metrics</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-emerald-500" />
            <span className="flex items-center gap-1 text-xs text-emerald-500">
              <TrendingUp className="w-3 h-3" />
              +12.5%
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-1">Platform Liquidity</p>
          <p className="text-2xl font-bold text-emerald-500">
            ${stats?.totalSystemBalance. toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-500" />
            <span className="flex items-center gap-1 text-xs text-blue-500">
              <ArrowUpRight className="w-3 h-3" />
              +8
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-blue-500">{stats?.totalUsers}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <UserCheck className="w-8 h-8 text-green-500" />
            <span className="text-xs text-green-500">
              {stats?.userActivityRate. toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-1">Active Users</p>
          <p className="text-2xl font-bold text-green-500">{stats?.activeUsers}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-violet-500" />
          </div>
          <p className="text-sm text-slate-400 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-violet-500">
            {stats?.totalTransactionsCount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-2 gap-6">
        {/* User Statistics */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-6">User Statistics</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Registered</p>
                  <p className="text-xl font-bold text-slate-100">{stats?.totalUsers}</p>
                </div>
              </div>
              <span className="text-xs text-slate-500">100%</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <UserCheck className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Active Users</p>
                  <p className="text-xl font-bold text-slate-100">{stats?.activeUsers}</p>
                </div>
              </div>
              <span className="text-xs text-slate-500">
                {stats?.userActivityRate. toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <UserX className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Locked/Frozen</p>
                  <p className="text-xl font-bold text-slate-100">{stats?. lockedUsers}</p>
                </div>
              </div>
              <span className="text-xs text-slate-500">
                {stats ?  ((stats.lockedUsers / stats.totalUsers) * 100).toFixed(1) : '0'}%
              </span>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-6">Financial Overview</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Total Platform Balance</span>
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-500">
                ${stats?.totalSystemBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500 mt-2">Across all user accounts</p>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Average Balance per User</span>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-500">
                ${stats?. avgBalancePerUser.toLocaleString('en-US', { minimumFractionDigits:  2 })}
              </p>
              <p className="text-xs text-slate-500 mt-2">Per registered user</p>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Transaction Volume</span>
                <Activity className="w-5 h-5 text-violet-500" />
              </div>
              <p className="text-2xl font-bold text-violet-500">
                {stats?.totalTransactionsCount.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-2">Total transactions processed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-6">Key Performance Indicators</h3>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <p className="text-3xl font-bold text-emerald-500 mb-1">
              {stats?.userActivityRate.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-400">User Activity Rate</p>
          </div>

          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <p className="text-3xl font-bold text-blue-500 mb-1">
              {stats?.avgTransactionsPerUser.toFixed(1)}
            </p>
            <p className="text-xs text-slate-400">Avg Transactions/User</p>
          </div>

          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <p className="text-3xl font-bold text-violet-500 mb-1">98. 5%</p>
            <p className="text-xs text-slate-400">System Uptime</p>
          </div>

          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <p className="text-3xl font-bold text-orange-500 mb-1">&lt;100ms</p>
            <p className="text-xs text-slate-400">Avg Response Time</p>
          </div>
        </div>
      </div>
    </div>
  );
}