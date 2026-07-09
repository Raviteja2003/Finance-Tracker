import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import accountsReducer from './slices/accountsSlice';
import filtersReducer from './slices/filtersSlice';
import transactionsReducer from './slices/transactionsSlice';
import categoriesReducer from './slices/categoriesSlice';

// No RTK Query here on purpose — every domain slice (accounts,
// transactions, and the ones that follow them) owns its server data via
// createAsyncThunk + a plain fetch wrapper (src/lib/apiClient.js). See
// accountsSlice.js for the full reasoning.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    categories: categoriesReducer,
    filters: filtersReducer,
    transactions: transactionsReducer,
  },
});