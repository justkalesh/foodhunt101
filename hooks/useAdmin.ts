import { useQuery } from '@tanstack/react-query';
import { api } from '../services/mockDatabase';

/**
 * Fetches admin dashboard stats.
 * staleTime: 2 min.
 */
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await api.admin.getStats();
      if (res.success && res.data) return res.data;
      throw new Error(res.message);
    },
    staleTime: 2 * 60 * 1000,
  });
};
