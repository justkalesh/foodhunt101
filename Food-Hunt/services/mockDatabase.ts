
import { User, Vendor, Review, MealSplit, GenericResponse, MenuItem, Message, Conversation } from '../types';
import { supabase } from './supabase';

// --- Helper Functions ---
// Supabase returns { data, error }. We map this to our GenericResponse.

export const api = {
  // USERS ENDPOINTS
  users: {
    getMe: async (userId: string): Promise<GenericResponse<User>> => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        if (data) return { success: true, message: 'Fetched user.', data: data as User };
        return { success: false, message: 'User not found.' };
      } catch (error: any) {
        return { success: false, message: error.message || 'Error fetching user' };
      }
    },
    updateProfile: async (userId: string, updates: Partial<User>): Promise<GenericResponse<User>> => {
      try {
        const { id, email, role, ...safeUpdates } = updates;
        const { data, error } = await supabase
          .from('users')
          .update({ ...safeUpdates, updated_at: new Date().toISOString() })
          .eq('id', userId)
          .select()
          .single();

        if (error) throw error;
        return { success: true, message: 'Profile updated.', data: data as User };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },
    getActivity: async (userId: string) => {
      try {
        // Recent Reviews
        const { data: reviews, error: reviewError } = await supabase
          .from('reviews')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(3);

        if (reviewError) throw reviewError;

        // Recent Splits (joined)
        // 'people_joined_ids' is an array.
        const { data: splits, error: splitError } = await supabase
          .from('meal_splits')
          .select('*')
          .contains('people_joined_ids', [userId])
          .order('created_at', { ascending: false })
          .limit(5);

        if (splitError) throw splitError;

        return {
          success: true,
          message: 'Activity fetched',
          data: {
            recentReviews: reviews || [],
            recentSplits: (splits || []).slice(0, 3)
          }
        };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },
    search: async (queryText: string): Promise<GenericResponse<User>> => {
      try {
        // Search by ID or Email
        // Try ID first if it looks like a uuid (skip for now, just text search)
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .or(`id.eq.${queryText},email.eq.${queryText}`)
          .maybeSingle();

        if (error) throw error;
        if (data) return { success: true, message: 'User found.', data: data as User };

        return { success: false, message: 'User not found.' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    }
  },

  // VENDOR ENDPOINTS
  vendors: {
    getAll: async (): Promise<GenericResponse<Vendor[]>> => {
      try {
        const { data, error } = await supabase.from('vendors').select('*');
        if (error) throw error;
        return { success: true, message: 'Fetched vendors.', data: data as Vendor[] };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    getById: async (id: string): Promise<GenericResponse<Vendor>> => {
      try {
        const { data, error } = await supabase.from('vendors').select('*').eq('id', id).single();
        if (error) throw error;
        return { success: true, message: 'Fetched vendor.', data: data as Vendor };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    getReviews: async (vendorId: string): Promise<GenericResponse<Review[]>> => {
      try {
        // Fetch reviews AND user names ideally. 
        // For now, raw fetch.
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('vendor_id', vendorId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, message: 'Fetched reviews.', data: data as Review[] };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    addReview: async (vendorId: string, userId: string, rating: number, text: string): Promise<GenericResponse<Review>> => {
      try {
        const newReview = {
          user_id: userId,
          vendor_id: vendorId,
          rating,
          review_text: text,
          created_at: new Date().toISOString()
        };

        const { data, error } = await supabase.from('reviews').insert(newReview).select().single();
        if (error) throw error;

        // Award Loyalty Points using RPC or client-side update
        // Client side for now to match logic:
        const { data: user } = await supabase.from('users').select('loyalty_points').eq('id', userId).single();
        if (user) {
          await supabase.from('users').update({ loyalty_points: (user.loyalty_points || 0) + 5 }).eq('id', userId);
        }

        return { success: true, message: 'Review posted. +5 Loyalty Points!', data: data as Review };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    getMenuItems: async (vendorId: string): Promise<GenericResponse<MenuItem[]>> => {
      try {
        const { data, error } = await supabase.from('menu_items').select('*').eq('vendor_id', vendorId);
        if (error) throw error;
        return { success: true, message: 'Fetched menu items.', data: data as MenuItem[] };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    updateMenuItem: async (item: MenuItem): Promise<GenericResponse<MenuItem>> => {
      try {
        const { data, error } = await supabase.from('menu_items').update(item).eq('id', item.id).select().single();
        if (error) throw error;
        return { success: true, message: 'Menu item updated.', data: data as MenuItem };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    deleteReview: async (reviewId: string): Promise<GenericResponse<null>> => {
      try {
        const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
        if (error) throw error;
        return { success: true, message: 'Review deleted.' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    }
  },

  // MEAL SPLITS
  splits: {
    getAll: async (): Promise<GenericResponse<MealSplit[]>> => {
      try {
        const { data, error } = await supabase
          .from('meal_splits')
          .select('*')
          .eq('is_closed', false)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, message: 'Fetched splits.', data: data as MealSplit[] };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    create: async (splitData: any): Promise<GenericResponse<MealSplit>> => {
      try {
        // Check if user has active split
        const { data: user } = await supabase.from('users').select('active_split_id').eq('id', splitData.creator_id).single();
        if (user?.active_split_id) {
          return { success: false, message: 'You already have an active split.' };
        }

        const newSplit = {
          ...splitData,
          people_joined_ids: [splitData.creator_id],
          is_closed: false,
          created_at: new Date().toISOString()
        };

        const { data: split, error } = await supabase.from('meal_splits').insert(newSplit).select().single();
        if (error) throw error;

        // Update User
        await supabase.from('users').update({ active_split_id: split.id }).eq('id', splitData.creator_id);

        return { success: true, message: 'Split created.', data: split as MealSplit };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    join: async (splitId: string, userId: string): Promise<GenericResponse<MealSplit>> => {
      try {
        const { data: split, error: fetchError } = await supabase.from('meal_splits').select('*').eq('id', splitId).single();
        if (fetchError || !split) return { success: false, message: 'Split not found' };

        const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();

        if (user?.active_split_id) return { success: false, message: 'Leave your current split first.' };
        if (split.people_joined_ids.includes(userId)) return { success: false, message: 'Already joined.' };

        const newPeople = [...split.people_joined_ids, userId];
        const isClosed = newPeople.length >= split.people_needed;

        const { data: updatedSplit, error: updateError } = await supabase
          .from('meal_splits')
          .update({ people_joined_ids: newPeople, is_closed: isClosed })
          .eq('id', splitId)
          .select()
          .single();

        if (updateError) throw updateError;

        await supabase.from('users').update({ active_split_id: splitId }).eq('id', userId);

        return { success: true, message: 'Joined split!', data: updatedSplit as MealSplit };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    leave: async (splitId: string, userId: string): Promise<GenericResponse<null>> => {
      try {
        const { data: split, error: fetchError } = await supabase.from('meal_splits').select('*').eq('id', splitId).single();
        if (fetchError || !split) return { success: false, message: 'Split not found' };

        const newPeople = split.people_joined_ids.filter((id: string) => id !== userId);
        const isClosed = newPeople.length >= split.people_needed; // Likely false

        await supabase
          .from('meal_splits')
          .update({ people_joined_ids: newPeople, is_closed: isClosed })
          .eq('id', splitId);

        await supabase.from('users').update({ active_split_id: null }).eq('id', userId);

        return { success: true, message: 'Left split successfully.' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    getById: async (splitId: string): Promise<GenericResponse<MealSplit>> => {
      try {
        const { data, error } = await supabase.from('meal_splits').select('*').eq('id', splitId).single();
        if (error) throw error;
        return { success: true, message: 'Fetched split', data: data as MealSplit };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    delete: async (splitId: string): Promise<GenericResponse<null>> => {
      try {
        const { error } = await supabase.from('meal_splits').delete().eq('id', splitId);
        if (error) throw error;
        return { success: true, message: 'Split deleted successfully.' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    }
  },

  // MESSAGES ENDPOINTS (Refactored for Supabase)
  messages: {
    getInbox: async (userId: string): Promise<GenericResponse<Conversation[]>> => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .contains('participants', [userId])
          .order('updated_at', { ascending: false });

        if (error) throw error;
        return { success: true, message: 'Inbox fetched', data: data as Conversation[] };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    getChat: async (conversationId: string): Promise<GenericResponse<Message[]>> => {
      try {
        console.log(`[DEBUG] fetching chat for: ${conversationId}`);
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true }); // Chronological

        if (error) {
          console.error('[DEBUG] Supabase error:', error);
          throw error;
        }
        console.log(`[DEBUG] fetched ${data?.length} messages`);
        return { success: true, message: 'Chat fetched', data: data as Message[] };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    send: async (senderId: string, receiverId: string, content: string): Promise<GenericResponse<Message>> => {
      try {
        const chatId = [senderId, receiverId].sort().join('_');

        // 1. Get/Create Conversation
        let { data: chat } = await supabase.from('conversations').select('*').eq('id', chatId).single();

        const now = new Date().toISOString();

        if (!chat) {
          // Fetch names
          const { data: sender } = await supabase.from('users').select('name, email, pfp_url').eq('id', senderId).single();
          const { data: receiver } = await supabase.from('users').select('name, email, pfp_url').eq('id', receiverId).single();

          const newConv = {
            id: chatId,
            participants: [senderId, receiverId],
            participant_details: {
              [senderId]: sender || { name: 'Unknown' },
              [receiverId]: receiver || { name: 'Unknown' }
            },
            last_message: { content, sender_id: senderId, created_at: now, is_read: false },
            unread_counts: { [senderId]: 0, [receiverId]: 1 },
            updated_at: now
          };

          const { error: createError } = await supabase.from('conversations').insert(newConv);
          // If concurrent create, this fails, but we can ignore or retry. Simplified here.
        } else {
          // Update existng
          const unread = (chat.unread_counts?.[receiverId] || 0) + 1;
          const updatedCounts = { ...chat.unread_counts, [receiverId]: unread };

          await supabase.from('conversations').update({
            last_message: { content, sender_id: senderId, created_at: now, is_read: false },
            unread_counts: updatedCounts,
            updated_at: now
          }).eq('id', chatId);
        }

        // 2. Insert Message
        const newMessage = {
          conversation_id: chatId,
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          is_read: false,
          created_at: now
        };

        const { data: msg, error: msgError } = await supabase.from('messages').insert(newMessage).select().single();
        if (msgError) throw msgError;

        return { success: true, message: 'Message sent.', data: msg as Message };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    markAsRead: async (conversationId: string, userId: string): Promise<GenericResponse<null>> => {
      try {
        // Fetch current to merge json
        const { data: chat } = await supabase.from('conversations').select('unread_counts').eq('id', conversationId).single();
        if (chat) {
          const newCounts = { ...chat.unread_counts, [userId]: 0 };
          await supabase.from('conversations').update({ unread_counts: newCounts }).eq('id', conversationId);
        }
        // Also update individual messages if we wanted strict read receipts
        return { success: true, message: 'Marked as read' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    deleteConversation: async (userId: string, conversationId: string): Promise<GenericResponse<null>> => {
      try {
        // Cascade delete should handle messages
        const { error } = await supabase.from('conversations').delete().eq('id', conversationId);
        if (error) throw error;
        return { success: true, message: 'Conversation deleted.' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    clearAll: async (userId: string): Promise<GenericResponse<null>> => {
      try {
        const { error } = await supabase.from('conversations').delete().contains('participants', [userId]);
        if (error) throw error;
        return { success: true, message: 'Inbox cleared.' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    }
  },

  // ADMIN ENDPOINTS (Stubbed for now, Supabase has simpler counts)
  admin: {
    getStats: async (): Promise<GenericResponse<any>> => {
      const { count: u } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: v } = await supabase.from('vendors').select('*', { count: 'exact', head: true });
      const { count: r } = await supabase.from('reviews').select('*', { count: 'exact', head: true });
      return { success: true, message: 'Stats', data: { totalUsers: u, totalVendors: v, totalReviews: r } };
    },
    users: {
      getAll: async () => {
        const { data } = await supabase.from('users').select('*');
        return { success: true, message: 'Users', data: data as User[] };
      },
      toggleStatus: async (id: string) => {
        // Fetch first
        const { data } = await supabase.from('users').select('is_disabled').eq('id', id).single();
        if (data) {
          const { data: updated } = await supabase.from('users').update({ is_disabled: !data.is_disabled }).eq('id', id).select().single();
          return { success: true, message: 'Toggled', data: updated as User };
        }
        return { success: false, message: 'User not found' };
      },
      create: async () => ({ success: false, message: "Use signup" })
    },
    vendors: {
      create: async (data: any) => {
        const { data: v, error } = await supabase.from('vendors').insert(data).select().single();
        if (error) return { success: false, message: error.message };
        return { success: true, message: 'Created', data: v };
      },
      update: async (id: string, data: any) => {
        const { data: v, error } = await supabase.from('vendors').update(data).eq('id', id).select().single();
        if (error) return { success: false, message: error.message };
        return { success: true, message: 'Updated', data: v };
      },
      delete: async (id: string) => {
        await supabase.from('vendors').delete().eq('id', id);
        return { success: true, message: 'Deleted' };
      }
    }
  }
};
