import { useEffect, useState } from 'react';
import { Wallet, PiggyBank, CreditCard, Banknote, Landmark, Percent } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import StampBadge from '../components/StampBadge';
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
} from '../store/slices/accountsSlice';

// Each account type gets a fixed icon + fill color — a semantic category
// mark, not decoration, so it stays consistent regardless of light/dark
// theme.
const TYPE_META = {
  checking: { label: 'Checking', icon: Wallet, color: 'blue' },
  savings: { label: 'Savings', icon: PiggyBank, color: 'green' },
  credit_card: { label: 'Credit card', icon: CreditCard, color: 'red' },
  cash: { label: 'Cash', icon: Banknote, color: 'brass' },
  salary: { label: 'Salary', icon: Landmark, color: 'indigo' },
  fixed_deposit: { label: 'Fixed deposit', icon: Percent, color: 'violet' },
};

const TYPE_ORDER = ['checking', 'savings', 'credit_card', 'cash', 'salary', 'fixed_deposit'];

function formatBalance(value) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

// Short subtitle under the badge — only for types that have extra fields
// worth surfacing at a glance. Nothing shown for types with no data set.
function accountSummary(account) {
  if (account.type === 'credit_card') {
    const parts = [];
    if (account.credit_limit != null) parts.push(`Limit ${formatBalance(account.credit_limit)}`);
    if (account.billing_cycle_day != null) parts.push(`Bill day ${account.billing_cycle_day}`);
    if (account.is_secured_by_fd) parts.push('FD-secured');
    return parts.length > 0 ? parts.join(' · ') : null;
  }
  if (account.type === 'fixed_deposit') {
    const parts = [];
    if (account.interest_rate != null) parts.push(`${account.interest_rate}% p.a.`);
    if (account.maturity_date) parts.push(`Matures ${account.maturity_date.slice(0, 10)}`);
    return parts.length > 0 ? parts.join(' · ') : null;
  }
  return null;
}

export default function Accounts() {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(selectAccountsList);
  const status = useAppSelector(selectAccountsStatus);
  const error = useAppSelector(selectAccountsError);
  const isModalOpen = useAppSelector(selectIsModalOpen);
  const editingAccount = useAppSelector(selectEditingAccount);

  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAccounts());
    }
  }, [status, dispatch]);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  async function handleConfirmDelete(accountId) {
    setDeleteError(null);
    try {
      await dispatch(deleteAccount(accountId)).unwrap();
    } catch (err) {
      // Backend returns 409 with a clear message when the account still
      // has transactions - surface it instead of failing silently.
      setDeleteError(typeof err === 'string' ? err : 'Failed to delete account.');
    } finally {
      setConfirmingDeleteId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-text">Accounts</h1>
          <p className="mt-1.5 text-sm text-muted">
            {accounts.length === 0 ? (
              'No accounts yet'
            ) : (
              <>
                {accounts.length} account{accounts.length === 1 ? '' : 's'} · total{' '}
                <span className="font-mono font-medium text-brass">{formatBalance(totalBalance)}</span>
              </>
            )}
          </p>
        </div>
        <button
          onClick={() => dispatch(openCreateModal())}
          className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          Add account
        </button>
      </div>

      {error && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <span>{error}</span>
          <button
            onClick={() => dispatch(fetchAccounts())}
            className="shrink-0 font-medium underline underline-offset-2 hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {deleteError && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="shrink-0 font-medium underline underline-offset-2 hover:no-underline">
            Dismiss
          </button>
        </div>
      )}

      {status === 'loading' && accounts.length === 0 && (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-md border border-border bg-surface" />
          ))}
        </div>
      )}

      {status !== 'loading' && accounts.length === 0 && !error && (
        <div className="mt-6 rounded-md border border-dashed border-border px-6 py-12 text-center">
          <p className="font-display text-lg text-text">Add your first account</p>
          <p className="mt-1 text-sm text-muted">
            Checking, savings, credit card, cash, salary, or fixed deposit — track balances in one place.
          </p>
          <button
            onClick={() => dispatch(openCreateModal())}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Add account
          </button>
        </div>
      )}

      {accounts.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {accounts.map((account) => {
            const meta = TYPE_META[account.type];
            const summary = accountSummary(account);
            const isConfirming = confirmingDeleteId === account.id;
            return (
              <div
                key={account.id}
                className="ledger-rule-top group relative flex items-center gap-4 rounded-md border border-border bg-surface px-4 py-4"
              >
                <StampBadge icon={meta.icon} color={meta.color} size={40} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="truncate text-sm font-medium text-text">{account.name}</p>
                    <span className="ledger-eyebrow shrink-0 text-[0.6rem]">{meta.label}</span>
                  </div>
                  {summary && <p className="mt-1 text-xs text-muted">{summary}</p>}
                </div>

                <div className="flex items-center gap-3">
                  <p className="font-mono text-base tabular-nums text-text">
                    {formatBalance(account.balance)}
                  </p>
                  <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                    {isConfirming ? (
                      <>
                        <button
                          onClick={() => handleConfirmDelete(account.id)}
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
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => dispatch(openEditModal(account.id))}
                          aria-label={`Edit ${account.name}`}
                          className="rounded p-1.5 text-muted hover:bg-text/5 hover:text-text"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          onClick={() => setConfirmingDeleteId(account.id)}
                          aria-label={`Delete ${account.name}`}
                          className="rounded p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                        >
                          <TrashIcon />
                        </button>
                      </>
                    )}
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

function AccountModal({ initial, onClose }) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState(initial?.type ?? 'checking');
  const [balance, setBalance] = useState(initial ? String(initial.balance) : '');

  // Credit card only
  const [creditLimit, setCreditLimit] = useState(initial?.credit_limit != null ? String(initial.credit_limit) : '');
  const [billingCycleDay, setBillingCycleDay] = useState(initial?.billing_cycle_day != null ? String(initial.billing_cycle_day) : '');
  const [dueDateDays, setDueDateDays] = useState(initial?.due_date_days_after_billing != null ? String(initial.due_date_days_after_billing) : '');
  const [isSecuredByFd, setIsSecuredByFd] = useState(initial?.is_secured_by_fd ?? false);

  // Fixed deposit only
  const [interestRate, setInterestRate] = useState(initial?.interest_rate != null ? String(initial.interest_rate) : '');
  const [maturityDate, setMaturityDate] = useState(initial?.maturity_date ? initial.maturity_date.slice(0, 10) : '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const isEditing = initial !== null;

  // Clear the other family's fields when the type changes away from it -
  // otherwise a stale credit_limit from before switching to "savings"
  // would get submitted and rejected by the backend's type validator.
  function handleTypeChange(newType) {
    setType(newType);
    if (newType !== 'credit_card') {
      setCreditLimit('');
      setBillingCycleDay('');
      setDueDateDays('');
      setIsSecuredByFd(false);
    }
    if (newType !== 'fixed_deposit') {
      setInterestRate('');
      setMaturityDate('');
    }
  }

  async function handleSubmit(e) {
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

    const payload = { name: trimmedName, type, balance: parsedBalance };

    if (type === 'credit_card') {
      if (creditLimit.trim() !== '') payload.credit_limit = Number(creditLimit);
      if (billingCycleDay.trim() !== '') {
        const day = Number(billingCycleDay);
        if (day < 1 || day > 31) {
          setFormError('Billing day must be between 1 and 31.');
          return;
        }
        payload.billing_cycle_day = day;
      }
      if (dueDateDays.trim() !== '') payload.due_date_days_after_billing = Number(dueDateDays);
      payload.is_secured_by_fd = isSecuredByFd;
    }

    if (type === 'fixed_deposit') {
      if (interestRate.trim() !== '') payload.interest_rate = Number(interestRate);
      if (maturityDate.trim() !== '') payload.maturity_date = `${maturityDate}T00:00:00`;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await dispatch(updateAccount({ id: initial.id, ...payload })).unwrap();
      } else {
        await dispatch(createAccount(payload)).unwrap();
      }
      onClose();
    } catch (err) {
      setFormError(typeof err === 'string' ? err : 'Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="ledger-rule-top w-full max-w-sm rounded-lg border border-border bg-bg p-6 shadow-xl"
      >
        <h2 className="font-display text-xl font-semibold text-text">
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
              className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="account-type" className="block text-sm font-medium text-text/80">
              Type
            </label>
            <select
              id="account-type"
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-text outline-none focus:border-primary"
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
              className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 font-mono text-sm text-text outline-none focus:border-primary"
            />
          </div>

          {type === 'credit_card' && (
            <div className="space-y-3 rounded-md border border-border p-3">
              <p className="ledger-eyebrow">Credit card details</p>

              <div>
                <label htmlFor="cc-limit" className="block text-sm font-medium text-text/80">
                  Credit limit
                </label>
                <input
                  id="cc-limit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  placeholder="e.g. 50000"
                  className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 font-mono text-sm text-text outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="cc-billing-day" className="block text-sm font-medium text-text/80">
                    Bill day
                  </label>
                  <input
                    id="cc-billing-day"
                    type="number"
                    min="1"
                    max="31"
                    value={billingCycleDay}
                    onChange={(e) => setBillingCycleDay(e.target.value)}
                    placeholder="1-31"
                    className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-text outline-none focus:border-primary"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="cc-due-days" className="block text-sm font-medium text-text/80">
                    Due (days after)
                  </label>
                  <input
                    id="cc-due-days"
                    type="number"
                    min="0"
                    value={dueDateDays}
                    onChange={(e) => setDueDateDays(e.target.value)}
                    placeholder="e.g. 20"
                    className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-text outline-none focus:border-primary"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-text/80">
                <input
                  type="checkbox"
                  checked={isSecuredByFd}
                  onChange={(e) => setIsSecuredByFd(e.target.checked)}
                  className="accent-primary"
                />
                Secured against a fixed deposit
              </label>
            </div>
          )}

          {type === 'fixed_deposit' && (
            <div className="space-y-3 rounded-md border border-border p-3">
              <p className="ledger-eyebrow">Fixed deposit details</p>

              <div>
                <label htmlFor="fd-rate" className="block text-sm font-medium text-text/80">
                  Interest rate (% p.a.)
                </label>
                <input
                  id="fd-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="e.g. 6.5"
                  className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 font-mono text-sm text-text outline-none focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="fd-maturity" className="block text-sm font-medium text-text/80">
                  Maturity date
                </label>
                <input
                  id="fd-maturity"
                  type="date"
                  value={maturityDate}
                  onChange={(e) => setMaturityDate(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-text outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

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