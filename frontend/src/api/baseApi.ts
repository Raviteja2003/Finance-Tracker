// RTK Query base API — individual domain endpoints (accounts, transactions,
// categories, budgets, analytics, chatbot) inject endpoints into this base.
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
    prepareHeaders: (headers, { getState }) => {
      // token will be read from authSlice state once Phase 1 auth is wired up
      return headers;
    },
  }),
  endpoints: () => ({}),
});
