'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/constants';
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  DollarSign,
  Calendar,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Transaction {
  amount: number;
  fromAccountNumber: string;
  toAccountNumber: string;
  timestamp: string;
}

interface Account {
  accountNumber: string;
  accountType: string;
  balance: number;
}

interface PageInfo {
  content: Transaction[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export default function TransactionsPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    const token = localStorage.getItem('vaulta_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setError(null);
    try {
      const accountsData = await apiClient.get<Account[]>(
        API_ENDPOINTS.ACCOUNTS.MY_ACCOUNTS
      );

      setAccounts(accountsData);

      if (accountsData.length > 0) {
        await fetchTransactions(accountsData[0].accountNumber, 0);
      } else {
        setTransactions([]);
      }
    } catch (err:  any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async (accountNumber: string, page: number) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await apiClient.get<PageInfo>(
        API_ENDPOINTS.TRANSACTIONS.HISTORY(accountNumber, page, pageSize)
      );
      
      setTransactions(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(response.number);
      setSelectedAccount(accountNumber);
    } catch (err: any) {
      setError(err.response?. data?.message || 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (selectedAccount && selectedAccount !== 'all' && newPage >= 0 && newPage < totalPages) {
      fetchTransactions(selectedAccount, newPage);
    }
  };

  const isDeposit = (t: Transaction) => t.fromAccountNumber === 'DEPOSIT';
  const isWithdrawal = (t: Transaction) => t.toAccountNumber === 'WITHDRAWAL';

  const getTransactionType = (transaction: Transaction) => {
    if (selectedAccount === 'all') {
      const myAccounts = accounts.map(a => a.accountNumber);
      if (
        myAccounts.includes(transaction.fromAccountNumber) &&
        myAccounts.includes(transaction. toAccountNumber)
      ) {
        return 'internal';
      }
      return myAccounts.includes(transaction.fromAccountNumber)
        ? 'outgoing'
        : 'incoming';
    }
    return transaction.fromAccountNumber === selectedAccount
      ? 'outgoing'
      : 'incoming';
  };

  const getDisplayType = (t: Transaction) => {
    if (isDeposit(t)) return 'deposit';
    if (isWithdrawal(t)) return 'withdrawal';
    return getTransactionType(t);
  };

  const totalReceived = transactions
    .filter(t => isDeposit(t) || getTransactionType(t) === 'incoming')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSent = transactions
    .filter(t => isWithdrawal(t) || getTransactionType(t) === 'outgoing')
    .reduce((sum, t) => sum + t.amount, 0);

  if (isLoading && transactions.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Transactions</h1>
          <p className="text-slate-400 mt-1">View your transaction history</p>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedAccount}
            onChange={e => {
              if (e.target.value === 'all') {
                setSelectedAccount('all');
              } else {
                fetchTransactions(e.target.value, 0);
              }
            }}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
          >
            <option value="all">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc.accountNumber} value={acc.accountNumber}>
                {acc.accountType} - {acc.accountNumber}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              if (selectedAccount && selectedAccount !== 'all') {
                fetchTransactions(selectedAccount, currentPage);
              } else if (accounts.length > 0) {
                fetchTransactions(accounts[0].accountNumber, 0);
              }
            }}
            disabled={isLoading || accounts.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Stat
          icon={<DollarSign className="w-5 h-5" />}
          label="Total Received"
          value={totalReceived}
          color="green"
        />
        <Stat
          icon={<ArrowUpRight className="w-5 h-5" />}
          label="Total Sent"
          value={totalSent}
          color="red"
        />
        <Stat
          icon={<Calendar className="w-5 h-5" />}
          label="Transactions"
          value={totalElements}
          color="blue"
          isMoney={false}
        />
      </div>

      {/* Transaction Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              Transaction History
            </h3>
            <p className="text-sm text-slate-400">
              {selectedAccount === 'all'
                ? 'All accounts'
                : `Account ${selectedAccount}`}
            </p>
          </div>
          
          {totalElements > 0 && (
            <span className="text-sm text-slate-400">
              Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements}
            </span>
          )}
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="mx-auto mb-4 w-8 h-8 text-slate-600" />
            <p className="text-slate-400">No transactions yet</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-slate-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs text-slate-400 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs text-slate-400 uppercase">From</th>
                  <th className="px-6 py-3 text-left text-xs text-slate-400 uppercase">To</th>
                  <th className="px-6 py-3 text-left text-xs text-slate-400 uppercase">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {transactions.map((t, idx) => {
                  const displayType = getDisplayType(t);
                  const isCredit = displayType === 'deposit' || displayType === 'incoming';

                  return (
                    <tr
                      key={`${t.timestamp}-${t.amount}-${idx}`}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {displayType === 'internal' ?  (
                            <>
                              <ArrowLeftRight className="text-blue-500 w-4 h-4" />
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded text-xs font-medium">
                                Transfer
                              </span>
                            </>
                          ) : isCredit ? (
                            <>
                              <ArrowDownRight className="text-green-500 w-4 h-4" />
                              <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs font-medium capitalize">
                                {displayType}
                              </span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="text-red-500 w-4 h-4" />
                              <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded text-xs font-medium capitalize">
                                {displayType}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`font-semibold ${
                            isCredit ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {isCredit ? '+' : '-'}$
                          {t.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono text-sm text-slate-300">
                        {isDeposit(t) ? 'Cash Deposit' : t.fromAccountNumber}
                      </td>

                      <td className="px-6 py-4 font-mono text-sm text-slate-300">
                        {isWithdrawal(t) ? 'Cash Withdrawal' :  t.toAccountNumber}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(t.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover: bg-slate-700 disabled: opacity-50 disabled:cursor-not-allowed text-slate-100 rounded-lg transition-colors"
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
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover: bg-slate-700 disabled: opacity-50 disabled:cursor-not-allowed text-slate-100 rounded-lg transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  color,
  isMoney = true,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color:  'green' | 'red' | 'blue';
  isMoney?: boolean;
}) {
  const colors = {
    green: 'bg-green-500/10 text-green-500',
    red: 'bg-red-500/10 text-red-500',
    blue: 'bg-blue-500/10 text-blue-500',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-100">
            {isMoney ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : value}
          </p>
        </div>
      </div>
    </div>
  );
}