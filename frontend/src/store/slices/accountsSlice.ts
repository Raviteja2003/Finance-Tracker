import { createSlice } from '@reduxjs/toolkit';

// IMPORTANT (learning note): this slice deliberately does NOT store the
// account list itself — that data is server state and lives in the
// RTK Query cache (see services/accountsApi.js + useGetAccountsQuery).
// This slice only holds local UI state *about* accounts: which one is
// selected, and whether the add/edit modal is open. Mixing server data
// into a slice like this is the classic anti-pattern RTK Query exists
// to avoid (duplicated source of truth, manual cache invalidation).
const initialState = {
  selectedAccountId: null,
  isAccountModalOpen: false,
  editingAccountId: null, // null = "create" mode, id = "edit" mode
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    selectAccount: (state, action) => {
      state.selectedAccountId = action.payload;
    },
    openCreateAccountModal: (state) => {
      state.isAccountModalOpen = true;
      state.editingAccountId = null;
    },
    openEditAccountModal: (state, action) => {
      state.isAccountModalOpen = true;
      state.editingAccountId = action.payload;
    },
    closeAccountModal: (state) => {
      state.isAccountModalOpen = false;
      state.editingAccountId = null;
    },
  },
});

export const {
  selectAccount,
  openCreateAccountModal,
  openEditAccountModal,
  closeAccountModal,
} = accountsSlice.actions;

export default accountsSlice.reducer;

export const selectSelectedAccountId = (state) => state.accounts.selectedAccountId;
export const selectIsAccountModalOpen = (state) => state.accounts.isAccountModalOpen;
export const selectEditingAccountId = (state) => state.accounts.editingAccountId;