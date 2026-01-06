'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  DollarSign,
  Calendar,
  RefreshCw,
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

export default function TransactionsPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------- AUTH + DATA ------------------------- */

  useEffect(() => {
    const token = localStorage.getItem('vaulta_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      const accountsResponse = await axios.get(
        'http://localhost:8080/api/v1/accounts/me',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAccounts(accountsResponse.data);

      if (accountsResponse.data.length > 0) {
        await fetchTransactions(token, accountsResponse.data[0].accountNumber);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async (token: string, accountNumber: string) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/transactions/${accountNumber}/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTransactions(response.data);
      setSelectedAccount(accountNumber);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    }
  };

  /* ------------------------- HELPERS ------------------------- */

  const isDeposit = (t: Transaction) => t.fromAccountNumber === 'DEPOSIT';
  const isWithdrawal = (t: Transaction) => t.toAccountNumber === 'WITHDRAWAL';

  const getTransactionType = (transaction: Transaction) => {
    if (selectedAccount === 'all') {
      const myAccounts = accounts.map(a => a.accountNumber);
      if (
        myAccounts.includes(transaction.fromAccountNumber) &&
        myAccounts.includes(transaction.toAccountNumber)
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
    return getTransactionType(t); // incoming | outgoing | internal
  };

  /* ------------------------- STATS ------------------------- */

  const totalReceived = transactions
    .filter(t => isDeposit(t) || getTransactionType(t) === 'incoming')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSent = transactions
    .filter(t => isWithdrawal(t) || getTransactionType(t) === 'outgoing')
    .reduce((sum, t) => sum + t.amount, 0);

  /* ------------------------- UI ------------------------- */

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Transactions</h1>
          <p className="text-slate-400 mt-1">View your transaction history</p>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedAccount}
            onChange={e => {
              const token = localStorage.getItem('vaulta_token');
              if (!token) return;
              if (e.target.value === 'all') {
                setSelectedAccount('all');
              } else {
                fetchTransactions(token, e.target.value);
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
              const token = localStorage.getItem('vaulta_token');
              if (token && selectedAccount !== 'all') {
                fetchTransactions(token, selectedAccount);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-6">
        <Stat
          icon={<ArrowDownRight className="w-5 h-5 text-green-500" />}
          label="Total Received"
          value={totalReceived}
          color="green"
        />
        <Stat
          icon={<ArrowUpRight className="w-5 h-5 text-red-500" />}
          label="Total Sent"
          value={totalSent}
          color="red"
        />
        <Stat
          icon={<DollarSign className="w-5 h-5 text-blue-500" />}
          label="Total Transactions"
          value={transactions.length}
          color="blue"
          isMoney={false}
        />
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-100">
            Transaction History
          </h3>
          <p className="text-sm text-slate-400">
            {selectedAccount === 'all'
              ? 'All accounts'
              : `Account ${selectedAccount}`}
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="mx-auto mb-4 w-8 h-8 text-slate-600" />
            <p className="text-slate-400">No transactions yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-slate-400">Type</th>
                <th className="px-6 py-3 text-left text-xs text-slate-400">Amount</th>
                <th className="px-6 py-3 text-left text-xs text-slate-400">From</th>
                <th className="px-6 py-3 text-left text-xs text-slate-400">To</th>
                <th className="px-6 py-3 text-left text-xs text-slate-400">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {transactions.map(t => {
                const displayType = getDisplayType(t);
                const isCredit =
                  displayType === 'deposit' || displayType === 'incoming';

                return (
                  <tr
                    key={`${t.timestamp}-${t.amount}`}
                    className="hover:bg-slate-800/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {displayType === 'internal' ? (
                          <ArrowLeftRight className="text-blue-500 w-4 h-4" />
                        ) : isCredit ? (
                          <ArrowDownRight className="text-green-500 w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="text-red-500 w-4 h-4" />
                        )}
                        <span className="text-sm capitalize">
                          {displayType}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      <span
                        className={
                          isCredit ? 'text-green-500' : 'text-red-500'
                        }
                      >
                        {isCredit ? '+' : '-'}$
                        {t.amount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-sm">
                      {isDeposit(t) ? 'Cash Deposit' : t.fromAccountNumber}
                    </td>

                    <td className="px-6 py-4 font-mono text-sm">
                      {isWithdrawal(t) ? 'Cash Withdrawal' : t.toAccountNumber}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(t.timestamp).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ------------------------- SMALL STAT COMPONENT ------------------------- */

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
  color: 'green' | 'red' | 'blue';
  isMoney?: boolean;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 bg-${color}-500/20 rounded-lg`}>{icon}</div>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
      <p className="text-2xl font-bold text-slate-100">
        {isMoney
          ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
          : value}
      </p>
    </div>
  );
}
