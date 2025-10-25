/**
 * React Query Provider
 * 
 * Global provider for React Query (TanStack Query)
 * Wraps app to enable server state management and caching
 * 
 * Configuration:
 * - staleTime: 5 minutes - Data considered fresh for 5 min
 * - cacheTime: 10 minutes - Cache persists for 10 min after unused
 * 
 * Benefits:
 * - Automatic background refetching
 * - Request deduplication
 * - Optimistic updates
 * - Cache management
 * - Loading/error states
 * 
 * Queries Using This Provider:
 * - useLoggedInUser: Current user data
 * - useSignin/useSignup: Authentication mutations
 * - useSignOut: Logout mutation
 * - All future API queries
 * 
 * Client-Side Only:
 * - "use client" directive for Next.js App Router
 * - useState ensures QueryClient created only once
 * - Prevents multiple instances on re-renders
 * 
 * Usage:
 * Wrapped in app/layout.jsx around entire app
 * All child components can use React Query hooks
 */
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
