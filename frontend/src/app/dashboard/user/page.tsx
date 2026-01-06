'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Wallet, 
  CreditCard, 
  ShieldCheck, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';

interface Transaction {
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
}

interface DashboardSummary {
  totalBalance: number;
  primaryAccountNumber: string;
  recentTransactions: Transaction[];
  userStatus: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('vaulta_token');
    const role = localStorage.getItem('vaulta_role');

    if (!token) {
      router.push('/login');
      return;
    }

    if (role === 'ADMIN') {
      router.push('/dashboard/admin');
      return;
    }

    fetchDashboardData(token);
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/dashboard/summary', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDashboardData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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

  const getTransactionType = (transaction: Transaction) => {
    const primaryAccount = dashboardData?.primaryAccountNumber;
    return transaction.fromAccountNumber === primaryAccount ? 'outgoing' : 'incoming';
  };

  return (
    <div className="space-y-8">
      {/* Hero Stats */}
      <div className="grid grid-cols-3 gap-6">
        {/* Total Balance */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="w-8 h-8 text-emerald-500" />
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-sm text-slate-400 mb-1">Total Balance</p>
          <p className="text-3xl font-bold text-emerald-500">
            ${dashboardData?.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Primary Account */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm text-slate-400 mb-1">Primary Account</p>
          <p className="text-2xl font-bold text-slate-100">
            {dashboardData?.primaryAccountNumber || 'N/A'}
          </p>
        </div>

        {/* Security Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <ShieldCheck className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-slate-400 mb-1">Security Status</p>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              dashboardData?.userStatus === 'ACTIVE' 
                ? 'bg-green-500/20 text-green-500' 
                : 'bg-red-500/20 text-red-500'
            }`}>
              {dashboardData?.userStatus}
            </span>
          </div>
        </div>
      </div>

      {dashboardData && dashboardData.primaryAccountNumber && (
      <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-violet-500/20 rounded-lg">
            <Sparkles className="w-6 h-6 text-violet-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-100 mb-1">Suggested Action</h3>
            <p className="text-slate-400 text-sm mb-3">
              It&apos;s a great time to review your spending habits!  Would you like to transfer to your savings? 
            </p>
            <button 
              onClick={() => window.location.href = '/dashboard/accounts'}
              className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-sm font-medium transition-all"
            >
              Go to Accounts
            </button>
          </div>
        </div>
      </div>
    )}

      {/* Recent Transactions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-100">Recent Transactions</h3>
          <p className="text-sm text-slate-400">Your latest account activity</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  To
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {dashboardData?.recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                dashboardData?.recentTransactions.map((transaction, index) => {
                  const type = getTransactionType(transaction);
                  return (
                    <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {type === 'incoming' ? (
                            <>
                              <ArrowDownRight className="w-4 h-4 text-green-500" />
                              <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs font-medium">
                                Incoming
                              </span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-4 h-4 text-red-500" />
                              <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded text-xs font-medium">
                                Outgoing
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${
                          type === 'incoming' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {type === 'incoming' ? '+' : '-'}$
                          {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300 font-mono">
                        {transaction.fromAccountNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300 font-mono">
                        {transaction.toAccountNumber || 'N/A'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}