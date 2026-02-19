import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./slices/counterSlice";

/**
 * Redux Store
 *
 * Central state management configuration.
 * All new slices MUST be registered here.
 *
 * Location: lib/utils/redux/store.ts
 * Rule: Global state providers must use Redux (coding-standard.md)
 */

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    // Register new slices below ↓
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: true,
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// ─── Type Exports ────────────────────────────────────────
// These types are used throughout the app for type-safe dispatch and selectors.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
