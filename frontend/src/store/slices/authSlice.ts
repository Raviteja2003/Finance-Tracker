import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import apiRequest from '../../lib/apiClient';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthUser {
  [key: string]: unknown;
}

interface AuthResponse {
  access_token?: string;
  user?: AuthUser;
}

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
  token: tokenFromStorage || null as string | null,
  user: null as AuthUser | null,
  isAuthenticated: Boolean(tokenFromStorage),
  status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
  error: null as string | null,
};

/**
 * Async thunk that calls POST /auth/register to create a new user account.
 *
 * @param {{ name: string; email: string; password: string }} - User registration details.
 * @returns The created user object (backend does not return a token).
 */
export const registerUser = createAsyncThunk<AuthUser, RegisterPayload, { rejectValue: string; state: RootState }>(
  'auth/registerUser',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      return await apiRequest('/auth/register', {
        method: 'POST',
        body: { name, email, password },
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Registration failed');
    }
  },
);

/**
 * Async thunk that calls POST /auth/login to authenticate a user.
 *
 * @param {{ email: string; password: string }} - User login credentials.
 * @returns Login response with access_token and user object.
 */
export const loginUser = createAsyncThunk<AuthResponse, LoginPayload, { rejectValue: string; state: RootState }>(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Login failed');
    }
  },
);

/**
 * Async thunk that calls GET /auth/me to fetch the current authenticated user.
 *
 * @returns The current user object from the server.
 */
export const fetchCurrentUser = createAsyncThunk<AuthUser, void, { rejectValue: string; state: RootState }>(
  'auth/fetchCurrentUser',
  async (_args, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      return await apiRequest('/auth/me', { token: token ?? undefined });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
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
        // this resolves, same as it did with RTK Query mutations.
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

/**
 * Selector for the current authenticated user object.
 */
export const selectCurrentUser = (state: RootState) => state.auth.user;

/**
 * Selector that returns whether the user is authenticated.
 */
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

/**
 * Selector for the stored auth token.
 */
export const selectToken = (state: RootState) => state.auth.token;

/**
 * Selector for the current async operation status.
 * Returns 'idle' | 'loading' | 'succeeded' | 'failed'.
 */
export const selectAuthStatus = (state: RootState) => state.auth.status;

/**
 * Selector for the last auth error message, if any.
 */
export const selectAuthError = (state: RootState) => state.auth.error;