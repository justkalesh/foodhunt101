import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/mockDatabase';
import { User } from '../types';

/**
 * Fetches a user profile by ID.
 */
export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID');
      const res = await api.users.getMe(userId);
      if (res.success && res.data) return res.data;
      throw new Error(res.message);
    },
    enabled: !!userId,
  });
};

/**
 * Fetches user activity (recent reviews, splits).
 * staleTime: 3 min.
 */
export const useActivity = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['activity', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID');
      const res = await api.users.getActivity(userId);
      if (res.success && res.data) return res.data;
      throw new Error(res.message);
    },
    enabled: !!userId,
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Mutation: Update user profile. Invalidates profile cache.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      const res = await api.users.updateProfile(userId, updates);
      if (!res.success) throw new Error(res.message);
      return res;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['activity', variables.userId] });
    },
  });
};
