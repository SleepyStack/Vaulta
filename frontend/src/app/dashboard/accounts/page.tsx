'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Wallet, 
  Plus,
  X,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightLeft
} from 'lucide-react';

interface Account {
  accountNumber: string;
  accountType: string;
  balance: number;
  username: string;
}

type ModalType = 'create' | 'deposit' | 'withdraw' | 'transfer' | null;

export default function AccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  
  const [createForm, setCreateForm] = useState({
    accountType: 'CHECKING',
    initialDeposit: '',
  });
  
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    targetAccount: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('vaulta_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchAccounts(token);
  }, [router]);

  const fetchAccounts = async (token:  string) => {
    try {
      const response = await axios. get('http://localhost:8080/api/v1/accounts/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('vaulta_token');
    if (!token) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(
        'http://localhost:8080/api/v1/accounts/open',
        {
          accountType: createForm.accountType,
          initialDeposit: createForm.initialDeposit ?  parseFloat(createForm.initialDeposit) : 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      closeModal();
      fetchAccounts(token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('vaulta_token');
    if (!token || !selectedAccount) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(
        'http://localhost:8080/api/v1/transactions/deposit',
        {
          accountNumber: selectedAccount,
          amount: parseFloat(transactionForm. amount),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      closeModal();
      fetchAccounts(token);
    } catch (err: any) {
      setError(err. response?.data?.message || 'Failed to deposit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async (e:  React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('vaulta_token');
    if (!token || !selectedAccount) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(
        'http://localhost:8080/api/v1/transactions/withdraw',
        {
          accountNumber: selectedAccount,
          amount: parseFloat(transactionForm.amount),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      closeModal();
      fetchAccounts(token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to withdraw');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransfer = async (e:  React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('vaulta_token');
    if (!token || !selectedAccount) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(
        'http://localhost:8080/api/v1/transactions/transfer',
        {
          accountNumber:  selectedAccount,
          targetAccountNumber: transactionForm.targetAccount,
          amount: parseFloat(transactionForm.amount),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      closeModal();
      fetchAccounts(token);
    } catch (err: any) {
      setError(err.response?.data?. message || 'Failed to transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (type: ModalType, accountNumber?: string) => {
    setModalType(type);
    setSelectedAccount(accountNumber || null);
    setError(null);
    setTransactionForm({ amount: '', targetAccount: '' });
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedAccount(null);
    setCreateForm({ accountType: 'CHECKING', initialDeposit: '' });
    setTransactionForm({ amount: '', targetAccount: '' });
    setError(null);
  };

  const handleCloseAccount = async (accountNumber: string) => {
    if (! confirm('Are you sure?  Balance must be $0.00')) return;

    const token = localStorage.getItem('vaulta_token');
    if (!token) return;

    try {
      await axios.delete(`http://localhost:8080/api/v1/accounts/${accountNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAccounts(token);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to close account');
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">My Accounts</h1>
          <p className="text-slate-400 mt-1">Manage your banking accounts</p>
        </div>
        <button
          onClick={() => openModal('create')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Open New Account</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <DollarSign className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-slate-400">Total Balance</p>
        </div>
        <p className="text-4xl font-bold text-emerald-500">
          ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((account) => (
          <div
            key={account.accountNumber}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Wallet className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{account.accountType}</h3>
                  <p className="text-sm text-slate-400 font-mono">{account.accountNumber}</p>
                </div>
              </div>
              <button
                onClick={() => handleCloseAccount(account.accountNumber)}
                className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <span className="text-sm text-slate-400">Balance</span>
              <p className="text-2xl font-bold text-slate-100">
                ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openModal('deposit', account.accountNumber)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg text-sm font-medium transition-all border border-emerald-500/20"
              >
                <ArrowDownCircle className="w-4 h-4" />
                Deposit
              </button>
              <button
                onClick={() => openModal('withdraw', account.accountNumber)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-all border border-red-500/20"
              >
                <ArrowUpCircle className="w-4 h-4" />
                Withdraw
              </button>
              <button
                onClick={() => openModal('transfer', account. accountNumber)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-500 rounded-lg text-sm font-medium transition-all border border-violet-500/20"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Transfer
              </button>
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <Wallet className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-100 mb-2">No Accounts Yet</h3>
            <p className="text-slate-400 mb-6">Open your first account to start banking</p>
            <button
              onClick={() => openModal('create')}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all"
            >
              Open Your First Account
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalType === 'create' && (
        <Modal title="Open New Account" onClose={closeModal}>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Account Type</label>
              <select
                value={createForm.accountType}
                onChange={(e) => setCreateForm({ ...createForm, accountType: e.target. value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
              >
                <option value="CHECKING">Checking Account</option>
                <option value="SAVINGS">Savings Account</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Initial Deposit (Optional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={createForm.initialDeposit}
                onChange={(e) => setCreateForm({ ...createForm, initialDeposit: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>
            <ModalActions onCancel={closeModal} isSubmitting={isSubmitting} submitText="Create Account" />
          </form>
        </Modal>
      )}

      {modalType === 'deposit' && (
        <Modal title="Deposit Funds" onClose={closeModal}>
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={transactionForm. amount}
                onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>
            <ModalActions onCancel={closeModal} isSubmitting={isSubmitting} submitText="Deposit" />
          </form>
        </Modal>
      )}

      {modalType === 'withdraw' && (
        <Modal title="Withdraw Funds" onClose={closeModal}>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={transactionForm. amount}
                onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>
            <ModalActions onCancel={closeModal} isSubmitting={isSubmitting} submitText="Withdraw" />
          </form>
        </Modal>
      )}

      {modalType === 'transfer' && (
        <Modal title="Transfer Funds" onClose={closeModal}>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Recipient Account Number</label>
              <input
                type="text"
                required
                value={transactionForm. targetAccount}
                onChange={(e) => setTransactionForm({ ... transactionForm, targetAccount: e.target.value })}
                placeholder="888XXXXXXX"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={transactionForm. amount}
                onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>
            <ModalActions onCancel={closeModal} isSubmitting={isSubmitting} submitText="Transfer" />
          </form>
        </Modal>
      )}
    </div>
  );
}

// Helper Components
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-all">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onCancel, isSubmitting, submitText }:  { onCancel: () => void; isSubmitting: boolean; submitText: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all disabled:opacity-50"
      >
        {isSubmitting ? 'Processing...' : submitText}
      </button>
    </div>
  );
}