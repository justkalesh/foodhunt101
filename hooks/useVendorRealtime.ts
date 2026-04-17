
import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Vendor } from '../types';

/**
 * Subscribes to real-time UPDATE events on the vendors table.
 * Calls onUpdate with the updated vendor row whenever a change occurs.
 * Cleans up the subscription on unmount.
 *
 * NOTE: Supabase Realtime must be enabled for the `vendors` table
 * in your Supabase Dashboard → Database → Replication.
 */
export function useVendorRealtime(
  onUpdate: (updated: Partial<Vendor> & { id: string }) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel('vendor-status-live')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vendors',
        },
        (payload) => {
          onUpdate(payload.new as Partial<Vendor> & { id: string });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}
