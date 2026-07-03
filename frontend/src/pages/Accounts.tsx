import { useEffect, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  openCreateModal,
  openEditModal,
  closeModal,
  selectAccountsList,
  selectAccountsStatus,
  selectAccountsError,
  selectIsModalOpen,
  selectEditingAccount,
  type AccountType,
} from '../store/slices/accountsSlice';

// Each account type gets a fixed color used for the card's left edge and
// its badge — a real ledger convention (type-coded entries), not decoration.
// These sit outside the bg/surface/text/primary token system on purpose:
// they're semantic category colors, not theme colors, so they stay fixed
// across light/dark rather than flipping with the palette.
const TYPE_META: Record<AccountType, { label: string; edge: string; badge: string }> = {
  checking: { label: 'Checking', edge: 'bg-blue-500', badge: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/10' },
  savings: { label: 'Savings', edge: 'bg-emerald-500', badge: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10' },
  credit_card: { label: 'Credit card', edge: 'bg-rose-500', badge: 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-500/10' },
  cash: { label: 'Cash', edge: 'bg-amber-500', badge: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/10' },
};

const TYPE_ORDER: AccountType[] = ['checking', 'savings', 'credit_card', 'cash'];

function formatBalance(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function Accounts() {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(selectAccountsList);
  const status = useAppSelector(selectAccountsStatus);
  const error = useAppSelector(selectAccountsError);
  const isModalOpen = useAppSelector(selectIsModalOpen);
  const editingAccount = useAppSelector(selectEditingAccount);

  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAccounts());
    }
  }, [status, dispatch]);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Accounts</h1>
          <p className="mt-1 text-sm text-text/60">
            {accounts.length === 0
              ? 'No accounts yet'
              : `${accounts.length} account${accounts.length === 1 ? '' : 's'} · total ${formatBalance(totalBalance)}`}
          </p>
        </div>
        <button
          onClick={() => dispatch(openCreateModal())}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          Add account
        </button>
      </div>

      {error && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300">
          <span>{error}</span>
          <button
            onClick={() => dispatch(fetchAccounts())}
            className="shrink-0 font-medium underline underline-offset-2 hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {status === 'loading' && accounts.length === 0 && (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg border border-text/10 bg-surface" />
          ))}
        </div>
      )}

      {status !== 'loading' && accounts.length === 0 && !error && (
        <div className="mt-6 rounded-lg border border-dashed border-text/20 px-6 py-12 text-center">
          <p className="text-sm font-medium text-text">Add your first account</p>
          <p className="mt-1 text-sm text-text/60">
            Checking, savings, credit card, or cash — track balances in one place.
          </p>
          <button
            onClick={() => dispatch(openCreateModal())}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Add account
          </button>
        </div>
      )}

      {accounts.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {accounts.map((account) => {
            const meta = TYPE_META[account.type];
            const isConfirming = confirmingDeleteId === account.id;
            return (
              <div
                key={account.id}
                className="group relative flex overflow-hidden rounded-lg border border-text/10 bg-surface"
              >
                <div className={`w-1.5 shrink-0 ${meta.edge}`} />
                <div className="flex flex-1 items-center justify-between gap-4 px-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">{account.name}</p>
                    <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-xs font-medium ${meta.badge}`}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-base tabular-nums text-text">
                      {formatBalance(account.balance)}
                    </p>
                    <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      {isConfirming ? (
                        <>
                          <button
                            onClick={() => {
                              dispatch(deleteAccount(account.id));
                              setConfirmingDeleteId(null);
                            }}
                            className="rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmingDeleteId(null)}
                            className="rounded px-2 py-1 text-xs font-medium text-text/60 hover:bg-text/5"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => dispatch(openEditModal(account.id))}
                            aria-label={`Edit ${account.name}`}
                            className="rounded p-1.5 text-text/40 hover:bg-text/5 hover:text-text"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            onClick={() => setConfirmingDeleteId(account.id)}
                            aria-label={`Delete ${account.name}`}
                            className="rounded p-1.5 text-text/40 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                          >
                            <TrashIcon />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <AccountModal
          key={editingAccount?.id ?? 'create'}
          initial={editingAccount ?? null}
          onClose={() => dispatch(closeModal())}
        />
      )}
    </div>
  );
}

function AccountModal({
  initial,
  onClose,
}: {
  initial: { id: string; name: string; type: AccountType; balance: number } | null;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<AccountType>(initial?.type ?? 'checking');
  const [balance, setBalance] = useState(initial ? String(initial.balance) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEditing = initial !== null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const parsedBalance = Number(balance);

    if (!trimmedName) {
      setFormError('Name is required.');
      return;
    }
    if (balance.trim() === '' || Number.isNaN(parsedBalance)) {
      setFormError('Enter a valid balance.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await dispatch(updateAccount({ id: initial.id, name: trimmedName, type, balance: parsedBalance })).unwrap();
      } else {
        await dispatch(createAccount({ name: trimmedName, type, balance: parsedBalance })).unwrap();
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
        className="w-full max-w-sm rounded-xl border border-text/10 bg-bg p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-text">
          {isEditing ? 'Edit account' : 'Add account'}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="account-name" className="block text-sm font-medium text-text/80">
              Name
            </label>
            <input
              id="account-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Everyday checking"
              autoFocus
              className="mt-1 w-full rounded-lg border border-text/20 bg-transparent px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="account-type" className="block text-sm font-medium text-text/80">
              Type
            </label>
            <select
              id="account-type"
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="mt-1 w-full rounded-lg border border-text/20 bg-transparent px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              {TYPE_ORDER.map((t) => (
                <option key={t} value={t} className="bg-bg text-text">
                  {TYPE_META[t].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="account-balance" className="block text-sm font-medium text-text/80">
              Balance
            </label>
            <input
              id="account-balance"
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0.00"
              className="mt-1 w-full rounded-lg border border-text/20 bg-transparent px-3 py-2 font-mono text-sm text-text outline-none focus:border-primary"
            />
          </div>

          {formError && <p className="text-sm text-rose-600 dark:text-rose-400">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-text/70 hover:bg-text/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}