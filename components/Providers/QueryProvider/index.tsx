"use client";

import { useState } from "react";
import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";

/**
 * QueryProvider (React Query)
 *
 * Wraps the application with a pre-configured QueryClient.
 * Provides server-state caching, background refetching, and retry logic.
 *
 * Location: components/Providers/QueryProvider/
 * Rule: Global providers live in components/Providers/ (project-structure.md)
 *
 * Configuration rationale:
 * - staleTime 60s: Avoids excessive refetches on navigation
 * - retry 1: One retry on failure before surfacing error
 * - refetchOnWindowFocus false: Prevents surprise refetches during dev
 */

interface QueryProviderProps {
    children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 60 seconds
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
