"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/utils/redux";

/**
 * ReduxProvider
 *
 * Wraps the application with the Redux store.
 * Must be mounted in the root layout as a client component.
 *
 * Location: components/Providers/ReduxProvider/
 * Rule: Global providers live in components/Providers/ (project-structure.md)
 */

interface ReduxProviderProps {
    children: React.ReactNode;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
    return <Provider store={store}>{children}</Provider>;
}
