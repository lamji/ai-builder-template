import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";

/**
 * Typed Redux Hooks
 *
 * ALWAYS use these hooks instead of raw `useDispatch` and `useSelector`.
 * They provide proper TypeScript inference for the store's state and dispatch.
 *
 * Usage:
 *   const dispatch = useAppDispatch();
 *   const count = useAppSelector(selectCount);
 */

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
