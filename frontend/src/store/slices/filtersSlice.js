import { createSlice, createSelector } from '@reduxjs/toolkit';

// This is the central Redux learning vehicle for the project: a single
// filter state that several unrelated feature areas (Dashboard,
// Transactions, Analytics, Chatbot) all read from and write to. This is
// exactly the case Redux is good for — Context would force you to either
// wrap all four in one provider (coupling them) or duplicate the filter
// state per-feature (losing the "single source of truth" property).
//
// Note this slice has NO createAsyncThunk usage, unlike accountsSlice —
// there's nothing to fetch here, it's pure client-side UI state.

function getDefaultDateRange() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    start: startOfMonth.toISOString().slice(0, 10),
    end: today.toISOString().slice(0, 10),
    preset: 'this_month', // 'this_month' | 'last_month' | 'last_30_days' | 'custom' | 'all_time'
  };
}

// Pure helper — the ONLY place date-range math should live. Given a preset
// name, computes concrete start/end bounds. 'custom' is intentionally a
// no-op here since its bounds come from user-picked dates, not math.
function getDateRangeForPreset(preset, referenceDate = new Date()) {
  const toISO = (d) => d.toISOString().slice(0, 10);
  const today = referenceDate;

  switch (preset) {
    case 'this_month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: toISO(start), end: toISO(today), preset };
    }
    case 'last_month': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0); // day 0 = last day of prev month
      return { start: toISO(start), end: toISO(end), preset };
    }
    case 'last_30_days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 30);
      return { start: toISO(start), end: toISO(today), preset };
    }
    case 'all_time':
      return { start: null, end: null, preset };
    case 'custom':
    default:
      return { preset };
  }
}

const initialState = {
  dateRange: getDefaultDateRange(),
  accountIds: [], // empty array = "all accounts"
  categoryIds: [], // empty array = "all categories"
  transactionTypes: [], // empty array = "all types" ('income' | 'expense')
  searchText: '',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      const { preset } = action.payload;
      if (preset && preset !== 'custom') {
        // Known preset — always recompute both bounds so stale start/end
        // from a previous preset can never leak through.
        state.dateRange = getDateRangeForPreset(preset);
      } else {
        // 'custom' (or no preset given) — trust the explicit start/end
        // passed in from the date-picker inputs.
        state.dateRange = { ...state.dateRange, ...action.payload };
      }
    },
    setAccountFilter: (state, action) => {
      state.accountIds = action.payload;
    },
    toggleAccountFilter: (state, action) => {
      const id = action.payload;
      state.accountIds = state.accountIds.includes(id)
        ? state.accountIds.filter((existing) => existing !== id)
        : [...state.accountIds, id];
    },
    setCategoryFilter: (state, action) => {
      state.categoryIds = action.payload;
    },
    toggleCategoryFilter: (state, action) => {
      const id = action.payload;
      state.categoryIds = state.categoryIds.includes(id)
        ? state.categoryIds.filter((existing) => existing !== id)
        : [...state.categoryIds, id];
    },
    setTransactionTypeFilter: (state, action) => {
      state.transactionTypes = action.payload;
    },
    toggleTransactionType: (state, action) => {
      const type = action.payload;
      state.transactionTypes = state.transactionTypes.includes(type)
        ? state.transactionTypes.filter((existing) => existing !== type)
        : [...state.transactionTypes, type];
    },
    setSearchText: (state, action) => {
      state.searchText = action.payload;
    },
    resetFilters: () => ({ ...initialState, dateRange: getDefaultDateRange() }),
  },
});

export const {
  setDateRange,
  setAccountFilter,
  toggleAccountFilter,
  setCategoryFilter,
  toggleCategoryFilter,
  setTransactionTypeFilter,
  toggleTransactionType,
  setSearchText,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;

// --- selectors ---

export const selectDateRange = (state) => state.filters.dateRange;
export const selectAccountFilter = (state) => state.filters.accountIds;
export const selectCategoryFilter = (state) => state.filters.categoryIds;
export const selectTransactionTypeFilter = (state) => state.filters.transactionTypes;
export const selectSearchText = (state) => state.filters.searchText;

export const selectActiveFilterCount = createSelector(
  [selectAccountFilter, selectCategoryFilter, selectTransactionTypeFilter, selectSearchText, selectDateRange],
  (accountIds, categoryIds, transactionTypes, searchText, dateRange) => {
    let count = 0;
    if (accountIds.length > 0) count += 1;
    if (categoryIds.length > 0) count += 1;
    if (transactionTypes.length > 0) count += 1;
    if (searchText.trim() !== '') count += 1;
    if (dateRange.preset !== 'this_month') count += 1;
    return count;
  },
);