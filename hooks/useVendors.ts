import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/mockDatabase';
import { Vendor, Review, MenuItem } from '../types';

/**
 * Fetches all active vendors. Shared across VendorList, MealSplits, Chatbot, MegaFooter.
 * staleTime: 5 min (default) — vendors rarely change.
 */
export const useVendors = () => {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await api.vendors.getAll();
      if (res.success && res.data) return res.data;
      throw new Error(res.message);
    },
  });
};

/**
 * Fetches a single vendor by ID.
 */
export const useVendor = (id: string | undefined) => {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      if (!id) throw new Error('No vendor ID');
      const res = await api.vendors.getById(id);
      if (res.success && res.data) return res.data;
      throw new Error(res.message);
    },
    enabled: !!id,
  });
};

/**
 * Fetches reviews for a vendor.
 * staleTime: 2 min — reviews are more dynamic.
 */
export const useVendorReviews = (vendorId: string | undefined) => {
  return useQuery({
    queryKey: ['reviews', vendorId],
    queryFn: async () => {
      if (!vendorId) throw new Error('No vendor ID');
      const res = await api.vendors.getReviews(vendorId);
      if (res.success && res.data) return res.data;
      throw new Error(res.message);
    },
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Fetches menu items for a vendor.
 * staleTime: 10 min — menus rarely change.
 */
export const useMenuItems = (vendorId: string | undefined) => {
  return useQuery({
    queryKey: ['menuItems', vendorId],
    queryFn: async () => {
      if (!vendorId) throw new Error('No vendor ID');
      const res = await api.vendors.getMenuItems(vendorId);
      if (res.success && res.data) return res.data;
      throw new Error(res.message);
    },
    enabled: !!vendorId,
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Mutation: Add a review. Invalidates the vendor's reviews and vendor detail caches.
 */
export const useAddReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vendorId, userId, rating, text }: {
      vendorId: string;
      userId: string;
      rating: number;
      text: string;
    }) => {
      const res = await api.vendors.addReview(vendorId, userId, rating, text);
      if (!res.success) throw new Error(res.message);
      return res;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};
