// Redux Toolkit store — slices are wired in here as each phase is built.
// Phase 1: authSlice only. RTK Query base API added alongside it.
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    // auth: authReducer,  // wired up in Phase 1
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
