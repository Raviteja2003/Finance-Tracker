import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import apiRequest from '../../lib/apiClient';
import { fetchAccounts } from './accountsSlice';
import {
  selectDateRange,
  selectAccountFilter,
  selectTransactionTypeFilter,
  selectSearchText,
} from './filtersSlice';

// Field names match TransactionOut exactly (account_id, is_income, ISO
// datetime `date`) - same convention as Account/AccountOut in
// accountsSlice.js. No camelCase translation on the way in.

const initialState = {
  list: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,

  // UI-only state - same convention as accountsSlice's modal fields.
  isModalOpen: false,
  editingTransactionId: null, // null = create mode, id = edit mode
};

function getToken(state) {
  return state.auth.token ?? undefined;
}

// --- async thunks ---

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (_args, { getState, rejectWithValue }) => {
    try {
      return await apiRequest('/transactions', { token: getToken(getState()) });
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch transactions');
    }
  },
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (payload, { dispatch, getState, rejectWithValue }) => {
    try {
      const result = await apiRequest('/transactions', {
        method: 'POST',
        body: payload,
        token: getToken(getState()),
      });
      // Balance changed server-side (see transaction_service.py) - refresh
      // accounts so any mounted component showing balances updates without
      // needing a manual reload.
      dispatch(fetchAccounts());
      return result;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to create transaction');
    }
  },
);

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, ...body }, { dispatch, getState, rejectWithValue }) => {
    try {
      const result = await apiRequest(`/transactions/${id}`, {
        method: 'PUT',
        body,
        token: getToken(getState()),
      });
      dispatch(fetchAccounts());
      return result;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update transaction');
    }
  },
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id, { dispatch, getState, rejectWithValue }) => {
    try {
      await apiRequest(`/transactions/${id}`, {
        method: 'DELETE',
        token: getToken(getState()),
      });
      dispatch(fetchAccounts());
      return id;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete transaction');
    }
  },
);

// --- slice ---

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    openCreateModal: (state) => {
      state.isModalOpen = true;
      state.editingTransactionId = null;
    },
    openEditModal: (state, action) => {
      state.isModalOpen = true;
      state.editingTransactionId = action.payload;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingTransactionId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to fetch transactions';
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const idx = state.list.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.list = state.list.filter((t) => t.id !== action.payload);
      });
  },
});

export const { openCreateModal, openEditModal, closeModal } = transactionsSlice.actions;
export default transactionsSlice.reducer;

// --- selectors ---

export const selectAllTransactions = (state) => state.transactions.list;
export const selectTransactionsStatus = (state) => state.transactions.status;
export const selectTransactionsError = (state) => state.transactions.error;
export const selectIsModalOpen = (state) => state.transactions.isModalOpen;
export const selectEditingTransactionId = (state) => state.transactions.editingTransactionId;
export const selectEditingTransaction = (state) =>
  state.transactions.list.find((t) => t.id === state.transactions.editingTransactionId);

// Composes transactionsSlice data with filtersSlice criteria - the payoff
// of keeping filters in Redux rather than component state: this selector
// (and the filter bar that feeds it) works identically no matter which
// page mounts it, with no props drilled through.
export const selectFilteredTransactions = createSelector(
  [selectAllTransactions, selectDateRange, selectAccountFilter, selectTransactionTypeFilter, selectSearchText],
  (transactions, dateRange, accountIds, transactionTypes, searchText) => {
    const search = searchText.trim().toLowerCase();
    return transactions.filter((t) => {
      const txDate = t.date.slice(0, 10); // ISO datetime -> yyyy-mm-dd
      if (dateRange.preset !== 'all_time' && (txDate < dateRange.start || txDate > dateRange.end)) return false;
      if (accountIds.length > 0 && !accountIds.includes(t.account_id)) return false;
      if (transactionTypes.length > 0) {
        const type = t.is_income ? 'income' : 'expense';
        if (!transactionTypes.includes(type)) return false;
      }
      if (search !== '' && !(t.description ?? '').toLowerCase().includes(search)) return false;
      return true;
    });
  },
);