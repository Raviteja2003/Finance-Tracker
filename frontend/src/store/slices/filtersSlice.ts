import { createSlice } from '@reduxjs/toolkit';

// This is the central Redux learning vehicle for the project: a single
// filter state that several unrelated feature areas (Dashboard,
// Transactions, Analytics, Chatbot) all read from and write to. This is
// exactly the case Redux is good for — Context would force you to either
// wrap all four in one provider (coupling them) or duplicate the filter
// state per-feature (losing the "single source of truth" property).

const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const initialState = {
  dateRange: {
    // ISO date strings (yyyy-mm-dd) so they serialize cleanly and are
    // trivial to pass straight into <input type="date">.
    start: startOfMonth.toISOString().slice(0, 10),
    end: today.toISOString().slice(0, 10),
    preset: 'this_month', // 'this_month' | 'last_month' | 'last_30_days' | 'custom' | 'all_time'
  },
  accountIds: [], // empty array = "all accounts"
  categoryIds: [], // empty array = "all categories"
  searchText: '',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      // action.payload: { start, end, preset }
      state.dateRange = { ...state.dateRange, ...action.payload };
    },
    setAccountFilter: (state, action) => {
      state.accountIds = action.payload; // array of account ids
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
    setSearchText: (state, action) => {
      state.searchText = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const {
  setDateRange,
  setAccountFilter,
  toggleAccountFilter,
  setCategoryFilter,
  setSearchText,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;

// selectors
export const selectDateRange = (state) => state.filters.dateRange;
export const selectAccountFilter = (state) => state.filters.accountIds;
export const selectCategoryFilter = (state) => state.filters.categoryIds;
export const selectSearchText = (state) => state.filters.searchText;