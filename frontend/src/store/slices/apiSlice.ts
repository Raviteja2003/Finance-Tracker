import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Single RTK Query base instance. All feature endpoints (auth, accounts, ...)
// inject into this via apiSlice.injectEndpoints() rather than creating
// separate createApi() instances — keeps one cache, one middleware.
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
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