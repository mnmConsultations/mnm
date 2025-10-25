/**
 * React Query Provider Component
 * 
 * Purpose:
 * - Wraps application with React Query (TanStack Query) context
 * - Enables data fetching, caching, and state management throughout app
 * - Configures global query defaults for consistent behavior
 * 
 * Configuration:
 * - staleTime: 60 seconds (data considered fresh for 1 minute)
 * - retry: 1 attempt (retry failed requests once before giving up)
 * 
 * React Query Features Used:
 * - Automatic background refetching
 * - Cache management and invalidation
 * - Loading and error states
 * - Optimistic updates
 * - Request deduplication
 * 
 * QueryClient Initialization:
 * - Created using useState to ensure stable instance across renders
 * - Single instance shared by all components
 * - Prevents re-creation on component re-renders
 * 
 * Usage:
 * - Wrap app in app/layout.jsx or _app.js
 * - All child components can use React Query hooks
 * - Examples: useQuery, useMutation, useQueryClient
 * 
 * Implementation Pattern:
 * ```javascript
 * <QueryProvider>
 *   <App />
 * </QueryProvider>
 * ```
 * 
 * Benefits:
 * - Centralized server state management
 * - Reduced boilerplate for API calls
 * - Automatic cache synchronization
 * - Better UX with loading/error states
 * 
 * Related Files:
 * - hooks/auth.hooks.js: Uses useQuery/useMutation
 * - lib/hooks/auth.hooks.js: Alternative auth hooks implementation
 * 
 * Note: Similar to lib/providers/QueryProvider.jsx
 * Consider consolidating these providers in future refactoring
 */
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
