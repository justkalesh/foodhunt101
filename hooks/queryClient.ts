import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes before data is considered stale
      gcTime: 30 * 60 * 1000,         // 30 minutes cache lifetime
      retry: 1,                        // Single retry on failure
      refetchOnWindowFocus: true,      // Silent refresh when user returns to tab
      networkMode: 'offlineFirst',     // Serve cached data when offline
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});
