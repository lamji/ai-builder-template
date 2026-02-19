import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

/**
 * Counter Slice (Sample)
 *
 * This is a sample Redux slice to demonstrate the pattern.
 * Use this as a template when creating new slices.
 *
 * Pattern:
 * 1. Define the state interface
 * 2. Set the initial state
 * 3. Create the slice with reducers
 * 4. Export actions and selector
 */

// ─── State Interface ─────────────────────────────────────
interface CounterState {
  value: number;
}

// ─── Initial State ───────────────────────────────────────
const initialState: CounterState = {
  value: 0,
};

// ─── Slice ───────────────────────────────────────────────
const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    reset: (state) => {
      state.value = 0;
    },
  },
});

// ─── Action Exports ──────────────────────────────────────
export const {
  increment,
  decrement,
  incrementByAmount,
  reset,
} = counterSlice.actions;

// ─── Selector Export ─────────────────────────────────────
export const selectCount = (state: RootState) => state.counter.value;

// ─── Reducer Export ──────────────────────────────────────
export default counterSlice.reducer;
