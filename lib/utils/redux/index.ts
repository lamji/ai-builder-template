/**
 * Redux Barrel Export
 *
 * Import everything Redux-related from this single entry point:
 *   import { store, useAppDispatch, useAppSelector, increment } from "@/lib/utils/redux";
 */

// Store
export { store } from "./store";
export type { RootState, AppDispatch } from "./store";

// Typed Hooks
export { useAppDispatch, useAppSelector } from "./hooks";

// Slices — register exports below ↓
export {
  increment,
  decrement,
  incrementByAmount,
  reset,
  selectCount,
} from "./slices/counterSlice";
