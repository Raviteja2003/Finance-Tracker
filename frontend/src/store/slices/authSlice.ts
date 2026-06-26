import { createSlice } from '@reduxjs/toolkit';

const tokenFromStorage = localStorage.getItem('ft_token');

const initialState = {
  token: tokenFromStorage || null,
  user: null,
  isAuthenticated: Boolean(tokenFromStorage),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Called from authApi's onQueryStarted after a successful login,
    // and from Register flow once it also logs the user in.
    setCredentials: (state, action) => {
      const { access_token, token, user } = action.payload;
      const resolvedToken = access_token || token;
      state.token = resolvedToken;
      state.user = user || state.user;
      state.isAuthenticated = true;
      if (resolvedToken) {
        localStorage.setItem('ft_token', resolvedToken);
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('ft_token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

// selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectToken = (state) => state.auth.token;