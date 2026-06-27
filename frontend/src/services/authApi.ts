import { apiSlice } from '../store/slices/apiSlice';
import { setCredentials, logout } from '../store/slices/authSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),

    login: builder.mutation({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      // On a successful login, immediately push the token/user into authSlice
      // so the rest of the app (ProtectedRoute, Header, etc.) reacts right away
      // instead of waiting on a re-render from the query cache.
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          // swallow - the mutation's own `error` state surfaces this to the form
        }
      },
    }),

    getCurrentUser: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetCurrentUserQuery,
} = authApi;

// re-export for convenience where a component only needs to log out
export { logout };