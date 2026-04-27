import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/mockDatabase';

/**
 * Fetches all splits (with user's closed splits if userId provided).
 * staleTime: 1 min — splits are dynamic.
 */
export const useSplits = (userId?: string) => {
  return useQuery({
    queryKey: ['splits', userId ?? 'anon'],
    queryFn: async () => {
      const res = await api.splits.getAll(userId);
      if (res.success && res.data) return res.data;
      throw new Error(res.message);
    },
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Fetches the current user's pending join requests.
 * staleTime: 1 min.
 */
export const useMyRequests = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['myRequests', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID');
      const res = await api.splits.getMyRequests(userId);
      if (res.success && res.data) return res.data;
      throw new Error(res.message);
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Mutation: Request to join a split. Invalidates splits and myRequests caches.
 */
export const useRequestJoin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ splitId, userId }: { splitId: string; userId: string }) => {
      const res = await api.splits.requestJoin(splitId, userId);
      if (!res.success) throw new Error(res.message);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['splits'] });
      queryClient.invalidateQueries({ queryKey: ['myRequests'] });
    },
  });
};

/**
 * Mutation: Create a new split. Invalidates splits cache.
 */
export const useCreateSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (splitData: Parameters<typeof api.splits.create>[0]) => {
      const res = await api.splits.create(splitData);
      if (!res.success) throw new Error(res.message);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['splits'] });
    },
  });
};
