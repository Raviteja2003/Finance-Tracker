import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchAccounts, selectAccountsList, selectAccountsStatus } from '../store/slices/accountsSlice';
import {
  selectDateRange,
  selectAccountFilter,
  selectTransactionTypeFilter,
  selectSearchText,
  selectActiveFilterCount,
  setDateRange,
  toggleAccountFilter,
  toggleTransactionType,
  setSearchText,
  resetFilters,
} from '../store/slices/filtersSlice';

const DATE_PRESETS = [
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'all_time', label: 'All time' },
  { value: 'custom', label: 'Custom range' },
];

const TRANSACTION_TYPES = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];

/**
 * Cross-cutting filter bar — mounted by Dashboard, Transactions, Analytics,
 * and the Chatbot page. All of it reads and writes filtersSlice, so
 * changing a filter on one page is reflected the moment another page
 * mounts. Category filtering is left out until categoriesSlice exists.
 */
export default function FilterBar() {
  const dispatch = useAppDispatch();
  const [openMenu, setOpenMenu] = useState(null); // 'date' | 'accounts' | 'type' | null
  const containerRef = useRef(null);

  const accounts = useAppSelector(selectAccountsList);
  const accountsStatus = useAppSelector(selectAccountsStatus);
  const dateRange = useAppSelector(selectDateRange);
  const accountIds = useAppSelector(selectAccountFilter);
  const transactionTypes = useAppSelector(selectTransactionTypeFilter);
  const searchText = useAppSelector(selectSearchText);
  const activeFilterCount = useAppSelector(selectActiveFilterCount);

  useEffect(() => {
    if (accountsStatus === 'idle') {
      dispatch(fetchAccounts());
    }
  }, [accountsStatus, dispatch]);

  // Local input state decoupled from the committed Redux value — debounced
  // so every keystroke doesn't dispatch and re-render every subscribed page.
  const [searchDraft, setSearchDraft] = useState(searchText);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchDraft !== searchText) dispatch(setSearchText(searchDraft));
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  // Close any open dropdown on outside click.
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const dateLabel =
    dateRange.preset === 'custom'
      ? `${dateRange.start} → ${dateRange.end}`
      : DATE_PRESETS.find((p) => p.value === dateRange.preset)?.label ?? 'Date range';

  const accountsLabel = accountIds.length === 0 ? 'All accounts' : `${accountIds.length} account${accountIds.length === 1 ? '' : 's'}`;

  const typeLabel = transactionTypes.length === 0 ? 'All types' : transactionTypes.map((t) => (t === 'income' ? 'Income' : 'Expense')).join(', ');

  return (
    <div ref={containerRef} className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface p-2">
      {/* Date range */}
      <div className="relative">
        <FilterButton label={dateLabel} active={dateRange.preset !== 'this_month'} onClick={() => setOpenMenu(openMenu === 'date' ? null : 'date')} />
        {openMenu === 'date' && (
          <div className="ledger-rule-top absolute left-0 top-full z-10 mt-1 w-56 rounded-md border border-border bg-bg p-2 shadow-lg">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => {
                  dispatch(setDateRange({ preset: preset.value }));
                  if (preset.value !== 'custom') setOpenMenu(null);
                }}
                className={`block w-full rounded px-3 py-2 text-left text-sm ${
                  dateRange.preset === preset.value ? 'bg-primary/10 text-primary' : 'text-text hover:bg-surface-hover'
                }`}
              >
                {preset.label}
              </button>
            ))}
            {dateRange.preset === 'custom' && (
              <div className="mt-2 space-y-2 border-t border-dotted border-border pt-2">
                <label className="block text-xs font-medium text-muted">
                  From
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => dispatch(setDateRange({ start: e.target.value, preset: 'custom' }))}
                    className="mt-1 w-full rounded border border-border bg-bg px-2 py-1 text-sm text-text"
                  />
                </label>
                <label className="block text-xs font-medium text-muted">
                  To
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => dispatch(setDateRange({ end: e.target.value, preset: 'custom' }))}
                    className="mt-1 w-full rounded border border-border bg-bg px-2 py-1 text-sm text-text"
                  />
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accounts */}
      <div className="relative">
        <FilterButton label={accountsLabel} active={accountIds.length > 0} onClick={() => setOpenMenu(openMenu === 'accounts' ? null : 'accounts')} />
        {openMenu === 'accounts' && (
          <div className="ledger-rule-top absolute left-0 top-full z-10 mt-1 w-56 rounded-md border border-border bg-bg p-2 shadow-lg">
            {accounts.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted">No accounts yet</p>
            ) : (
              accounts.map((account) => (
                <label
                  key={account.id}
                  className="flex items-center gap-2 rounded px-3 py-2 text-sm text-text hover:bg-surface-hover"
                >
                  <input
                    type="checkbox"
                    checked={accountIds.includes(account.id)}
                    onChange={() => dispatch(toggleAccountFilter(account.id))}
                    className="accent-primary"
                  />
                  {account.name}
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {/* Transaction type */}
      <div className="relative">
        <FilterButton label={typeLabel} active={transactionTypes.length > 0} onClick={() => setOpenMenu(openMenu === 'type' ? null : 'type')} />
        {openMenu === 'type' && (
          <div className="ledger-rule-top absolute left-0 top-full z-10 mt-1 w-44 rounded-md border border-border bg-bg p-2 shadow-lg">
            {TRANSACTION_TYPES.map((t) => (
              <label
                key={t.value}
                className="flex items-center gap-2 rounded px-3 py-2 text-sm text-text hover:bg-surface-hover"
              >
                <input
                  type="checkbox"
                  checked={transactionTypes.includes(t.value)}
                  onChange={() => dispatch(toggleTransactionType(t.value))}
                  className="accent-primary"
                />
                {t.label}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative flex-1 min-w-[160px]">
        <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          placeholder="Search transactions…"
          className="w-full rounded border border-border bg-bg py-1.5 pl-8 pr-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Clear */}
      {activeFilterCount > 0 && (
        <button
          onClick={() => {
            dispatch(resetFilters());
            setSearchDraft('');
            setOpenMenu(null);
          }}
          className="flex items-center gap-1 rounded px-2.5 py-1.5 text-sm font-medium text-muted hover:bg-surface-hover hover:text-text"
        >
          <X size={14} />
          Clear ({activeFilterCount})
        </button>
      )}
    </div>
  );
}

function FilterButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border text-text hover:bg-surface-hover'
      }`}
    >
      {label}
      <ChevronDown size={14} />
    </button>
  );
}