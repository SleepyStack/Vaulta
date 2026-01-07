'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/constants';
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Download,
  TrendingUp,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Transaction {
  id: number;
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  type: string;
  timestamp: string;
}

interface PageInfo {
  content: Transaction[];
  totalPages:  number;
  totalElements: number;
  number: number;
  size: number;
}

type TransactionTypeFilter = 'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';

export default function AdminTransactionsPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('ALL');
  // Removed searchTerm state
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    const token = localStorage.getItem('vaulta_token');
    const role = localStorage.getItem('vaulta_role');

    if (!token || role !== 'ADMIN') {
      router.push('/dashboard/user');
      return;
    }

    fetchTransactions(0);
  }, [router]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, typeFilter]);

  const fetchTransactions = async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<PageInfo>(
        API_ENDPOINTS.ADMIN.TRANSACTIONS(page, pageSize)
      );
      
      setTransactions(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(response.number);
    } catch (err:  any) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchTransactions(newPage);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter((txn) => txn.type === typeFilter);
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

  if (isLoading && transactions.length === 0) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">All Transactions</h1>
          <p className="text-slate-400 mt-1">Complete transaction history across the platform</p>
        </div>
        <button className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 rounded-lg font-medium transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Volume</p>
              <p className="text-2xl font-bold text-slate-100">
                ${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Deposits</p>
              <p className="text-2xl font-bold text-slate-100">{deposits}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-500/10 text-red-500">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Withdrawals</p>
              <p className="text-2xl font-bold text-slate-100">{withdrawals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Removed search by account number input */}

          <div className="flex gap-2">
            {(['ALL', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER'] as TransactionTypeFilter[]).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    typeFilter === type
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
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
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-100">Transaction History</h3>
          {totalElements > 0 && (
            <span className="text-sm text-slate-400">
              Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements}
            </span>
          )}
        </div>

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
                      {getTransactionIcon(txn.type)}
                      <span className={`font-medium ${getTransactionColor(txn.type)}`}>
                        {txn.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-slate-300">
                      {txn. fromAccountNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-slate-300">
                      {txn.toAccountNumber}
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0 || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">
                Page {currentPage + 1} of {totalPages}
              </span>
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1 || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-100 rounded-lg transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}