import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import FilterBar from '../components/FilterBar';
import { fetchAccounts, selectAccountsList, selectAccountsStatus } from '../store/slices/accountsSlice';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  openCreateModal,
  openEditModal,
  closeModal,
  selectFilteredTransactions,
  selectTransactionsStatus,
  selectTransactionsError,
  selectIsModalOpen,
  selectEditingTransaction,
} from '../store/slices/transactionsSlice';

function formatAmount(value, isIncome) {
  const formatted = value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  return isIncome ? `+${formatted}` : `-${formatted}`;
}

export default function Transactions() {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(selectAccountsList);
  const accountsStatus = useAppSelector(selectAccountsStatus);
  const status = useAppSelector(selectTransactionsStatus);
  const error = useAppSelector(selectTransactionsError);
  const filtered = useAppSelector(selectFilteredTransactions);
  const isModalOpen = useAppSelector(selectIsModalOpen);
  const editingTransaction = useAppSelector(selectEditingTransaction);

  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

  useEffect(() => {
    if (accountsStatus === 'idle') dispatch(fetchAccounts());
  }, [accountsStatus, dispatch]);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchTransactions());
  }, [status, dispatch]);

  const accountNameById = new Map(accounts.map((a) => [a.id, a.name]));

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-text">Transactions</h1>
          <p className="mt-1.5 text-sm text-muted">All transactions across your accounts.</p>
        </div>
        <button
          onClick={() => dispatch(openCreateModal())}
          disabled={accounts.length === 0}
          className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
        >
          Add transaction
        </button>
      </div>

      <div className="mt-6">
        <FilterBar />
      </div>

      {accounts.length === 0 && accountsStatus !== 'loading' && (
        <p className="mt-4 text-sm text-muted">Add an account first before recording transactions.</p>
      )}

      {error && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <span>{error}</span>
          <button
            onClick={() => dispatch(fetchTransactions())}
            className="shrink-0 font-medium underline underline-offset-2 hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {status === 'loading' && (
        <div className="mt-6 space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-11 animate-pulse rounded-md border border-border bg-surface" />
          ))}
        </div>
      )}

      {status !== 'loading' && !error && filtered.length === 0 && (
        <div className="mt-6 rounded-md border border-dashed border-border px-6 py-12 text-center">
          <p className="font-display text-lg text-text">No transactions match these filters</p>
          <p className="mt-1 text-sm text-muted">Try widening the date range, clearing a filter, or add one above.</p>
        </div>
      )}

      {status !== 'loading' && filtered.length > 0 && (
        <div className="ledger-rule-top mt-6 overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left">
              <tr>
                <th className="px-4 py-3"><span className="ledger-eyebrow">Date</span></th>
                <th className="px-4 py-3"><span className="ledger-eyebrow">Description</span></th>
                <th className="px-4 py-3"><span className="ledger-eyebrow">Account</span></th>
                <th className="px-4 py-3 text-right"><span className="ledger-eyebrow">Amount</span></th>
                <th className="px-4 py-3 text-right"><span className="ledger-eyebrow">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dotted divide-border">
              {filtered.map((t) => {
                const isConfirming = confirmingDeleteId === t.id;
                return (
                  <tr key={t.id} className="group bg-bg hover:bg-surface/50">
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted">{t.date.slice(0, 10)}</td>
                    <td className="px-4 py-2.5 text-text">{t.description || '—'}</td>
                    <td className="px-4 py-2.5 text-muted">{accountNameById.get(t.account_id) ?? 'Unknown'}</td>
                    <td
                      className={`whitespace-nowrap px-4 py-2.5 text-right font-mono tabular-nums ${
                        t.is_income ? 'text-success' : 'text-text'
                      }`}
                    >
                      {formatAmount(t.amount, t.is_income)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      {isConfirming ? (
                        <span className="inline-flex gap-1">
                          <button
                            onClick={() => {
                              dispatch(deleteTransaction(t.id));
                              setConfirmingDeleteId(null);
                            }}
                            className="rounded px-2 py-1 text-xs font-medium text-danger hover:bg-danger/10"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmingDeleteId(null)}
                            className="rounded px-2 py-1 text-xs font-medium text-muted hover:bg-text/5"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <span className="inline-flex gap-1 opacity-0 transition group-hover:opacity-100">
                          <button
                            onClick={() => dispatch(openEditModal(t.id))}
                            className="rounded px-2 py-1 text-xs font-medium text-muted hover:bg-text/5 hover:text-text"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmingDeleteId(t.id)}
                            className="rounded px-2 py-1 text-xs font-medium text-muted hover:bg-danger/10 hover:text-danger"
                          >
                            Delete
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <TransactionModal
          key={editingTransaction?.id ?? 'create'}
          initial={editingTransaction ?? null}
          accounts={accounts}
          onClose={() => dispatch(closeModal())}
        />
      )}
    </div>
  );
}

function TransactionModal({ initial, accounts, onClose }) {
  const dispatch = useAppDispatch();
  const isEditing = initial !== null;

  const [accountId, setAccountId] = useState(initial?.account_id ?? accounts[0]?.id ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [date, setDate] = useState(initial ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [isIncome, setIsIncome] = useState(initial?.is_income ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    const parsedAmount = Number(amount);
    if (!accountId) {
      setFormError('Choose an account.');
      return;
    }
    if (amount.trim() === '' || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Enter a valid amount greater than 0.');
      return;
    }

    const payload = {
      account_id: accountId,
      amount: parsedAmount,
      description: description.trim() || null,
      date: `${date}T00:00:00`,
      is_income: isIncome,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await dispatch(updateTransaction({ id: initial.id, ...payload })).unwrap();
      } else {
        await dispatch(createTransaction(payload)).unwrap();
      }
      onClose();
    } catch (err) {
      setFormError(typeof err === 'string' ? err : 'Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="ledger-rule-top w-full max-w-sm rounded-lg border border-border bg-bg p-6 shadow-xl"
      >
        <h2 className="font-display text-xl font-semibold text-text">{isEditing ? 'Edit transaction' : 'Add transaction'}</h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Income / expense toggle */}
          <div className="flex rounded-md border border-border p-1">
            <button
              type="button"
              onClick={() => setIsIncome(false)}
              className={`flex-1 rounded py-1.5 text-sm font-medium transition ${
                !isIncome ? 'bg-text/10 text-text' : 'text-muted'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setIsIncome(true)}
              className={`flex-1 rounded py-1.5 text-sm font-medium transition ${
                isIncome ? 'bg-success/15 text-success' : 'text-muted'
              }`}
            >
              Income
            </button>
          </div>

          <div>
            <label htmlFor="tx-account" className="block text-sm font-medium text-text/80">
              Account
            </label>
            <select
              id="tx-account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id} className="bg-bg text-text">
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tx-amount" className="block text-sm font-medium text-text/80">
              Amount
            </label>
            <input
              id="tx-amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
              className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 font-mono text-sm text-text outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="tx-description" className="block text-sm font-medium text-text/80">
              Description
            </label>
            <input
              id="tx-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Grocery run"
              className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="tx-date" className="block text-sm font-medium text-text/80">
              Date
            </label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          </div>

          {formError && <p className="text-sm text-danger">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-text/70 hover:bg-text/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}