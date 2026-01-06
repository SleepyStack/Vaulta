'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign,
  Calendar,
  Filter
} from 'lucide-react';

export default function TransactionsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vaulta_token');
    if (!token) {
      router.push('/login');
      return;
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Transactions</h1>
          <p className="text-slate-400 mt-1">View and manage your transaction history</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <ArrowDownRight className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-slate-400">Total Received</p>
          </div>
          <p className="text-2xl font-bold text-slate-100">$0.00</p>
          <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <ArrowUpRight className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-sm text-slate-400">Total Sent</p>
          </div>
          <p className="text-2xl font-bold text-slate-100">$0.00</p>
          <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-slate-400">Total Transactions</p>
          </div>
          <p className="text-2xl font-bold text-slate-100">0</p>
          <p className="text-xs text-slate-500 mt-1">All time</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-100">Transaction History</h3>
          <p className="text-sm text-slate-400">All your account transactions</p>
        </div>

        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4">
            <Calendar className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100 mb-2">No Transactions Yet</h3>
          <p className="text-slate-400 mb-6">
            Start by making a deposit or transfer to see your transaction history here. 
          </p>
          <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all">
            Make a Transaction
          </button>
        </div>
      </div>
    </div>
  );
}