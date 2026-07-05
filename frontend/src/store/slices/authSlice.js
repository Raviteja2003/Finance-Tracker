import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiRequest from '../../lib/apiClient';

const tokenFromStorage = typeof window !== 'undefined' ? localStorage.getItem('ft_token') : null;

/**
 * Authentication slice initial state.
 *
 * - `token` stores the current auth token if available.
 * - `user` holds the authenticated user details.
 * - `isAuthenticated` is true when a token exists.
 * - `status` tracks async operation state: 'idle' | 'loading' | 'succeeded' | 'failed'.
 * - `error` stores the last error message if any operation failed.
 */
const initialState = {
  token: tokenFromStorage || null,
  user: null,
  isAuthenticated: Boolean(tokenFromStorage),
  status: 'idle',
  error: null,
};

/**
 * Async thunk that calls POST /auth/register to create a new user account.
 */
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      return await apiRequest('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });
    } catch (err) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue('Registration failed');
    }
  },
);

/**
 * Async thunk that calls POST /auth/login to authenticate a user.
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
    } catch (err) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue('Login failed');
    }
  },
);

/**
 * Async thunk that calls GET /auth/me to fetch the current authenticated user.
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_args, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await apiRequest('/auth/me', { token: token ?? undefined });
    } catch (err) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue('Failed to load user');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('ft_token');
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.access_token ?? null;
        state.user = action.payload.user ?? null;
        state.isAuthenticated = true;
        if (action.payload.access_token) {
          localStorage.setItem('ft_token', action.payload.access_token);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Login failed';
      })
      // register
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
        // Register doesn't return a token (backend returns the created
        // user only) - Register.jsx chains straight into loginUser after
        // this resolves.
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Registration failed';
      })
      // fetch current user
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;