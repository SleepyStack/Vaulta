'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Search,
  Download,
  TrendingUp,
  Activity,
} from 'lucide-react';

interface Transaction {
  id: number;
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  type: string;
  timestamp: string;
}

type TransactionTypeFilter = 'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('ALL');

  useEffect(() => {
    const token = localStorage.getItem('vaulta_token');
    const role = localStorage.getItem('vaulta_role');

    if (!token || role !== 'ADMIN') {
      router.push('/dashboard/user');
      return;
    }

    fetchTransactions();
  }, [router]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, typeFilter]);

  const fetchTransactions = async () => {
    try {
      const data = await apiClient.get<Transaction[]>(
        'http://localhost:8080/api/v1/admin/transactions'
      );
      setTransactions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter((txn) => txn.type === typeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (txn) =>
          txn.fromAccountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          txn.toAccountNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': 
        return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case 'TRANSFER': 
        return <RefreshCw className="w-5 h-5 text-blue-500" />;
      default:
        return <Activity className="w-5 h-5 text-slate-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT': 
        return 'text-green-500';
      case 'WITHDRAWAL':
        return 'text-red-500';
      case 'TRANSFER': 
        return 'text-blue-500';
      default: 
        return 'text-slate-500';
    }
  };

  const totalVolume = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  const deposits = transactions.filter((t) => t.type === 'DEPOSIT').length;
  const withdrawals = transactions.filter((t) => t.type === 'WITHDRAWAL').length;
  const transfers = transactions.filter((t) => t.type === 'TRANSFER').length;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">All Transactions</h1>
          <p className="text-slate-400 mt-1">Complete transaction history across the platform</p>
        </div>
        <button className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 rounded-lg font-medium transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-violet-500" />
            <p className="text-sm text-slate-400">Total Transactions</p>
          </div>
          <p className="text-3xl font-bold text-violet-500">{transactions.length}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <ArrowDownLeft className="w-8 h-8 text-green-500" />
            <p className="text-sm text-slate-400">Deposits</p>
          </div>
          <p className="text-3xl font-bold text-green-500">{deposits}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <ArrowUpRight className="w-8 h-8 text-red-500" />
            <p className="text-sm text-slate-400">Withdrawals</p>
          </div>
          <p className="text-3xl font-bold text-red-500">{withdrawals}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-emerald-500" />
            <p className="text-sm text-slate-400">Total Volume</p>
          </div>
          <p className="text-3xl font-bold text-emerald-500">
            ${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by account number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus: border-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {(['ALL', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER'] as TransactionTypeFilter[]).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    typeFilter === type
                      ? 'bg-emerald-500 text-white'
                      :  'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {type}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  To
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Date & Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(txn. type)}
                      <span className={`font-medium ${getTransactionColor(txn.type)}`}>
                        {txn.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-slate-300">
                      {txn.fromAccountNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-slate-300">
                      {txn. toAccountNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-mono text-sm font-semibold ${getTransactionColor(txn.type)}`}>
                      ${txn.amount. toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-400">
                      <p>{new Date(txn.timestamp).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-600">
                        {new Date(txn.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="py-12 text-center">
              <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">No transactions found matching your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}