import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiRequest from '../../lib/apiClient';

// Category types must match the backend CategoryType enum exactly:
// 'income' | 'expense'

const initialState = {
  // Server data — same createAsyncThunk approach as accountsSlice (see
  // that file for the full RTK Query vs createAsyncThunk reasoning).
  list: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,

  // UI-only state — independent of the server data above
  isModalOpen: false,
  editingCategoryId: null, // null = create mode, id = edit mode
};

// --- helpers ---

function getToken(state) {
  return state.auth.token ?? undefined;
}

// --- async thunks ---

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_args, { getState, rejectWithValue }) => {
    try {
      return await apiRequest('/categories', { token: getToken(getState()) });
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch categories');
    }
  },
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (payload, { getState, rejectWithValue }) => {
    try {
      return await apiRequest('/categories', {
        method: 'POST',
        body: payload,
        token: getToken(getState()),
      });
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to create category');
    }
  },
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, ...body }, { getState, rejectWithValue }) => {
    try {
      return await apiRequest(`/categories/${id}`, {
        method: 'PUT',
        body,
        token: getToken(getState()),
      });
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update category');
    }
  },
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { getState, rejectWithValue }) => {
    try {
      await apiRequest(`/categories/${id}`, {
        method: 'DELETE',
        token: getToken(getState()),
      });
      return id; // return the id so the reducer can remove it from the list
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete category');
    }
  },
);

// --- slice ---

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    openCreateModal: (state) => {
      state.isModalOpen = true;
      state.editingCategoryId = null;
    },
    openEditModal: (state, action) => {
      state.isModalOpen = true;
      state.editingCategoryId = action.payload;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingCategoryId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to fetch categories';
      })
      // create — append to list, no re-fetch needed
      .addCase(createCategory.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      // update — swap the matching entry in place
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      // delete — remove by id
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      });
  },
});

export const { openCreateModal, openEditModal, closeModal } = categoriesSlice.actions;
export default categoriesSlice.reducer;

// --- selectors ---

export const selectCategoriesList = (state) => state.categories.list;
export const selectCategoriesStatus = (state) => state.categories.status;
export const selectCategoriesError = (state) => state.categories.error;
export const selectIsCategoryModalOpen = (state) => state.categories.isModalOpen;
export const selectEditingCategoryId = (state) => state.categories.editingCategoryId;

// Derived selector — find the category currently being edited
export const selectEditingCategory = (state) =>
  state.categories.list.find((c) => c.id === state.categories.editingCategoryId);

// Derived selectors — split by type, useful for dropdowns elsewhere
// (transaction forms, budget forms) that only want one side.
export const selectIncomeCategories = (state) =>
  state.categories.list.filter((c) => c.type === 'income');

export const selectExpenseCategories = (state) =>
  state.categories.list.filter((c) => c.type === 'expense');