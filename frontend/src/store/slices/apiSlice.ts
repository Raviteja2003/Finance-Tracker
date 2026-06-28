import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Single RTK Query base API slice for the application.
 *
 * All feature endpoints (auth, accounts, budgets, etc.) should inject into this
 * slice using `apiSlice.injectEndpoints()` rather than creating separate
 * createApi() instances. This keeps a single cache and one middleware instance.
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    /**
     * Adds the Authorization header to requests when an auth token exists.
     */
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Account', 'User'],
  endpoints: () => ({}),
});