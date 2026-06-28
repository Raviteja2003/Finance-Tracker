import { apiSlice } from '../store/slices/apiSlice';

/**
 * Accounts API endpoints injected into the shared RTK Query API slice.
 *
 * Provides queries and mutations for account CRUD operations and uses
 * cache tags to keep the account list and individual account data in sync.
 */
export const accountsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAccounts: builder.query({
      query: () => '/accounts',
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'Account', id })),
        { type: 'Account', id: 'LIST' },
      ],
    }),

    createAccount: builder.mutation({
      query: (body) => ({
        url: '/accounts',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Account', id: 'LIST' }],
    }),

    updateAccount: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/accounts/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Account', id }],
    }),

    deleteAccount: builder.mutation({
      query: (id) => ({
        url: `/accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Account', id: 'LIST' }],
    }),
  }),
});

/**
 * Exported hooks for account data operations.
 */
export const {
  useGetAccountsQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} = accountsApi;