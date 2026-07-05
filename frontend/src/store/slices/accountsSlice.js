import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiRequest from '../../lib/apiClient';

// Account types must match the backend AccountType enum exactly:
// 'checking' | 'savings' | 'credit_card' | 'cash' | 'salary' | 'fixed_deposit'

const initialState = {
  // Server data — lives here instead of an RTK Query cache since we're
  // using createAsyncThunk throughout this project. The tradeoff vs RTK
  // Query is that we manage loading/error state manually (below), but we
  // get a simpler mental model: one slice owns everything about accounts.
  list: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,

  // UI-only state — independent of the server data above
  selectedAccountId: null,
  isModalOpen: false,
  editingAccountId: null, // null = create mode, id = edit mode
};

// --- helpers ---

function getToken(state) {
  return state.auth.token ?? undefined;
}

// --- async thunks ---

export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (_args, { getState, rejectWithValue }) => {
    try {
      return await apiRequest('/accounts', { token: getToken(getState()) });
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch accounts');
    }
  },
);

export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (payload, { getState, rejectWithValue }) => {
    try {
      return await apiRequest('/accounts', {
        method: 'POST',
        body: payload,
        token: getToken(getState()),
      });
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to create account');
    }
  },
);

export const updateAccount = createAsyncThunk(
  'accounts/updateAccount',
  async ({ id, ...body }, { getState, rejectWithValue }) => {
    try {
      return await apiRequest(`/accounts/${id}`, {
        method: 'PUT',
        body,
        token: getToken(getState()),
      });
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update account');
    }
  },
);

export const deleteAccount = createAsyncThunk(
  'accounts/deleteAccount',
  async (id, { getState, rejectWithValue }) => {
    try {
      await apiRequest(`/accounts/${id}`, {
        method: 'DELETE',
        token: getToken(getState()),
      });
      return id; // return the id so the reducer can remove it from the list
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete account');
    }
  },
);

// --- slice ---

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    selectAccount: (state, action) => {
      state.selectedAccountId = action.payload;
    },
    openCreateModal: (state) => {
      state.isModalOpen = true;
      state.editingAccountId = null;
    },
    openEditModal: (state, action) => {
      state.isModalOpen = true;
      state.editingAccountId = action.payload;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingAccountId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAccounts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to fetch accounts';
      })
      // create — append to list, no re-fetch needed
      .addCase(createAccount.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      // update — swap the matching entry in place
      .addCase(updateAccount.fulfilled, (state, action) => {
        const idx = state.list.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      // delete — remove by id
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.list = state.list.filter((a) => a.id !== action.payload);
        if (state.selectedAccountId === action.payload) {
          state.selectedAccountId = null;
        }
      });
  },
});

export const { selectAccount, openCreateModal, openEditModal, closeModal } = accountsSlice.actions;
export default accountsSlice.reducer;

// --- selectors ---

export const selectAccountsList = (state) => state.accounts.list;
export const selectAccountsStatus = (state) => state.accounts.status;
export const selectAccountsError = (state) => state.accounts.error;
export const selectSelectedAccountId = (state) => state.accounts.selectedAccountId;
export const selectIsModalOpen = (state) => state.accounts.isModalOpen;
export const selectEditingAccountId = (state) => state.accounts.editingAccountId;

// Derived selector — find the account currently being edited
export const selectEditingAccount = (state) =>
  state.accounts.list.find((a) => a.id === state.accounts.editingAccountId);