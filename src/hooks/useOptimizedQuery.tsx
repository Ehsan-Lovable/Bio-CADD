import { useQuery } from '@tanstack/react-query';

// Optimized query hook with better defaults for performance
export function useOptimizedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
    refetchOnWindowFocus: false,
    retry: 1,
  });
}