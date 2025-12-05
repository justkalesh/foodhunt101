
import { User, Vendor, Review, MealSplit, GenericResponse, MenuItem, Message } from '../types';
import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
  writeBatch
} from 'firebase/firestore';

// --- Helper Functions ---
const mapDoc = <T>(doc: any): T => ({ id: doc.id, ...doc.data() } as T);

export const api = {
  // USERS ENDPOINTS
  users: {
    getMe: async (userId: string): Promise<GenericResponse<User>> => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          return { success: true, message: 'Fetched user.', data: mapDoc<User>(userDoc) };
        }
        return { success: false, message: 'User not found.' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },
    updateProfile: async (userId: string, updates: Partial<User>): Promise<GenericResponse<User>> => {
      try {
        const userRef = doc(db, 'users', userId);
        // Prevent updating restricted fields via this endpoint
        const { id, email, role, ...safeUpdates } = updates;

        await updateDoc(userRef, { ...safeUpdates, updated_at: new Date().toISOString() });
        const updatedDoc = await getDoc(userRef);
        return { success: true, message: 'Profile updated.', data: mapDoc<User>(updatedDoc) };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },
    getActivity: async (userId: string) => {
      try {
        // Recent Reviews
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('user_id', '==', userId),
          orderBy('created_at', 'desc'),
          limit(3)
        );
        const reviewsSnap = await getDocs(reviewsQuery);
        const reviews = reviewsSnap.docs.map(d => mapDoc<Review>(d));

        // Recent Splits (Created or Joined)
        // Firestore doesn't support logical OR in simple queries easily for arrays + fields.
        // We'll fetch splits where user is creator OR user is in people_joined_ids separately or just fetch all active and filter (if small dataset).
        // For scalability, we should have a better structure, but for now let's fetch recent splits where user is joined.

        const splitsQuery = query(
          collection(db, 'meal_splits'),
          where('people_joined_ids', 'array-contains', userId),
          orderBy('created_at', 'desc'),
          limit(5)
        );
        const splitsSnap = await getDocs(splitsQuery);
        const splits = splitsSnap.docs.map(d => mapDoc<MealSplit>(d));

        return {
          success: true,
          message: 'Activity fetched',
          data: {
            recentReviews: reviews,
            recentSplits: splits.slice(0, 3)
          }
        };
      } catch (error: any) {
        console.error(error);
        return { success: false, message: error.message };
      }
    },
    search: async (queryText: string): Promise<GenericResponse<User>> => {
      try {
        // Simple search by ID or exact College ID
        // Firestore doesn't support full-text search natively without 3rd party (Algolia/Typesense).
        // We will implement exact match for Email or User ID.

        // Check by ID
        const userDoc = await getDoc(doc(db, 'users', queryText));
        if (userDoc.exists()) return { success: true, message: 'User found.', data: mapDoc<User>(userDoc) };

        // Check by Email
        const q = query(collection(db, 'users'), where('email', '==', queryText));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          return { success: true, message: 'User found.', data: mapDoc<User>(querySnap.docs[0]) };
        }

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
        const querySnap = await getDocs(collection(db, 'vendors'));
        const vendors = querySnap.docs.map(d => mapDoc<Vendor>(d));
        return { success: true, message: 'Fetched vendors.', data: vendors };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    getById: async (id: string): Promise<GenericResponse<Vendor>> => {
      try {
        const docSnap = await getDoc(doc(db, 'vendors', id));
        if (docSnap.exists()) {
          return { success: true, message: 'Fetched vendor.', data: mapDoc<Vendor>(docSnap) };
        }
        return { success: false, message: 'Vendor not found.' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    getReviews: async (vendorId: string): Promise<GenericResponse<Review[]>> => {
      try {
        const q = query(collection(db, 'reviews'), where('vendor_id', '==', vendorId), orderBy('created_at', 'desc'));
        const querySnap = await getDocs(q);

        // We need user names for reviews. In a real app, we'd duplicate the name in the review or fetch users.
        // Let's assume we fetch users for now or just show 'User'.
        // Optimization: Store user_name in review document.

        const reviews = querySnap.docs.map(d => mapDoc<Review>(d));
        return { success: true, message: 'Fetched reviews.', data: reviews };
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
        const docRef = await addDoc(collection(db, 'reviews'), newReview);

        // Award 5 Loyalty Points to the user
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const currentPoints = userSnap.data().loyalty_points || 0;
          await updateDoc(userRef, { loyalty_points: currentPoints + 5 });
        }

        return { success: true, message: 'Review posted. +5 Loyalty Points!', data: { id: docRef.id, ...newReview } as Review };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    getMenuItems: async (vendorId: string): Promise<GenericResponse<MenuItem[]>> => {
      try {
        const q = query(collection(db, 'menu_items'), where('vendor_id', '==', vendorId));
        const querySnap = await getDocs(q);
        const items = querySnap.docs.map(d => mapDoc<MenuItem>(d));
        return { success: true, message: 'Fetched menu items.', data: items };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    updateMenuItem: async (item: MenuItem): Promise<GenericResponse<MenuItem>> => {
      try {
        await updateDoc(doc(db, 'menu_items', item.id), item as any);
        return { success: true, message: 'Menu item updated.', data: item };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    deleteReview: async (reviewId: string): Promise<GenericResponse<null>> => {
      try {
        await deleteDoc(doc(db, 'reviews', reviewId));
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
        const q = query(collection(db, 'meal_splits'), where('is_closed', '==', false));
        const querySnap = await getDocs(q);
        const splits = querySnap.docs.map(d => mapDoc<MealSplit>(d));
        // Sort in memory to avoid composite index requirement
        splits.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return { success: true, message: 'Fetched splits.', data: splits };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    create: async (splitData: any): Promise<GenericResponse<MealSplit>> => {
      try {
        // Check if user has active split
        const userDoc = await getDoc(doc(db, 'users', splitData.creator_id));
        if (userDoc.exists() && userDoc.data().active_split_id) {
          return { success: false, message: 'You already have an active split.' };
        }

        const newSplit = {
          ...splitData,
          people_joined_ids: [splitData.creator_id],
          is_closed: false,
          created_at: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'meal_splits'), newSplit);
        const splitId = docRef.id;

        // Update User
        await updateDoc(doc(db, 'users', splitData.creator_id), { active_split_id: splitId });

        return { success: true, message: 'Split created.', data: { id: splitId, ...newSplit } as MealSplit };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    join: async (splitId: string, userId: string): Promise<GenericResponse<MealSplit>> => {
      try {
        const splitRef = doc(db, 'meal_splits', splitId);
        const splitSnap = await getDoc(splitRef);

        if (!splitSnap.exists()) return { success: false, message: 'Split not found' };
        const split = mapDoc<MealSplit>(splitSnap);

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        const user = userSnap.data() as User;

        if (user.active_split_id) return { success: false, message: 'Leave your current split first.' };
        if (split.people_joined_ids.includes(userId)) return { success: false, message: 'Already joined.' };

        const newPeople = [...split.people_joined_ids, userId];
        const isClosed = newPeople.length >= split.people_needed;

        await updateDoc(splitRef, { people_joined_ids: newPeople, is_closed: isClosed });
        if (!isClosed) {
          await updateDoc(userRef, { active_split_id: splitId });
        } else {
          // If closed, do we still set active_split_id? Yes, usually.
          await updateDoc(userRef, { active_split_id: splitId });
        }

        return { success: true, message: 'Joined split!', data: { ...split, people_joined_ids: newPeople, is_closed: isClosed } };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    leave: async (splitId: string, userId: string): Promise<GenericResponse<null>> => {
      try {
        const splitRef = doc(db, 'meal_splits', splitId);
        const splitSnap = await getDoc(splitRef);
        if (!splitSnap.exists()) return { success: false, message: 'Split not found' };

        const split = mapDoc<MealSplit>(splitSnap);
        const newPeople = split.people_joined_ids.filter(id => id !== userId);

        // Re-open if it was closed
        const isClosed = newPeople.length >= split.people_needed; // Likely false now

        await updateDoc(splitRef, { people_joined_ids: newPeople, is_closed: isClosed });
        await updateDoc(doc(db, 'users', userId), { active_split_id: null });

        return { success: true, message: 'Left split successfully.' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    getById: async (splitId: string): Promise<GenericResponse<MealSplit>> => {
      try {
        const docSnap = await getDoc(doc(db, 'meal_splits', splitId));
        if (docSnap.exists()) return { success: true, message: 'Fetched split', data: mapDoc<MealSplit>(docSnap) };
        return { success: false, message: 'Split not found' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },

    delete: async (splitId: string): Promise<GenericResponse<null>> => {
      try {
        await deleteDoc(doc(db, 'meal_splits', splitId));
        return { success: true, message: 'Split deleted successfully.' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    }
  },

  // MESSAGES ENDPOINTS
  messages: {
    get: async (userId: string): Promise<GenericResponse<Message[]>> => {
      try {
        // Firestore OR queries are limited. We need messages where sender==userId OR receiver==userId.
        // We will fetch both and merge.
        const q1 = query(collection(db, 'messages'), where('sender_id', '==', userId));
        const q2 = query(collection(db, 'messages'), where('receiver_id', '==', userId));

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

        const messages = [...snap1.docs, ...snap2.docs].map(d => mapDoc<Message>(d));
        // Remove duplicates and sort
        const unique = Array.from(new Map(messages.map(m => [m.id, m])).values());
        unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return { success: true, message: 'Messages fetched', data: unique };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },
    send: async (senderId: string, receiverId: string, content: string): Promise<GenericResponse<Message>> => {
      try {
        // Get sender name
        const senderDoc = await getDoc(doc(db, 'users', senderId));
        const senderName = senderDoc.exists() ? senderDoc.data().name : 'Unknown';

        const newMessage = {
          sender_id: senderId,
          sender_name: senderName,
          receiver_id: receiverId,
          content,
          is_read: false,
          created_at: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'messages'), newMessage);
        return { success: true, message: 'Message sent.', data: { id: docRef.id, ...newMessage } as Message };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },
    markAsRead: async (msgId: string): Promise<GenericResponse<null>> => {
      try {
        await updateDoc(doc(db, 'messages', msgId), { is_read: true });
        return { success: true, message: 'Marked as read' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },
    deleteConversation: async (userId: string, otherId: string): Promise<GenericResponse<null>> => {
      try {
        const q1 = query(collection(db, 'messages'), where('sender_id', '==', userId), where('receiver_id', '==', otherId));
        const q2 = query(collection(db, 'messages'), where('sender_id', '==', otherId), where('receiver_id', '==', userId));

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const docs = [...snap1.docs, ...snap2.docs];

        if (docs.length === 0) return { success: true, message: 'No messages to delete.' };

        const batch = writeBatch(db);
        docs.forEach(d => batch.delete(d.ref));
        await batch.commit();

        return { success: true, message: 'Conversation deleted.' };
      } catch (error: any) {
        console.error("Delete conversation error:", error);
        return { success: false, message: error.message };
      }
    },
    clearAll: async (userId: string): Promise<GenericResponse<null>> => {
      try {
        const q1 = query(collection(db, 'messages'), where('sender_id', '==', userId));
        const q2 = query(collection(db, 'messages'), where('receiver_id', '==', userId));

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const docs = [...snap1.docs, ...snap2.docs];

        if (docs.length === 0) return { success: true, message: 'Inbox cleared.' };

        const batch = writeBatch(db);
        // Unique docs only to avoid double deletion error in batch
        const seen = new Set();
        docs.forEach(d => {
          if (!seen.has(d.id)) {
            batch.delete(d.ref);
            seen.add(d.id);
          }
        });

        await batch.commit();

        return { success: true, message: 'Inbox cleared.' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    }
  },

  // ADMIN ENDPOINTS
  admin: {
    getStats: async (): Promise<GenericResponse<any>> => {
      try {
        const [usersSnap, vendorsSnap, reviewsSnap] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'vendors')),
          getCountFromServer(collection(db, 'reviews'))
        ]);

        return {
          success: true,
          message: 'Stats fetched',
          data: {
            totalUsers: usersSnap.data().count,
            totalVendors: vendorsSnap.data().count,
            totalReviews: reviewsSnap.data().count
          }
        };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },
    users: {
      getAll: async (): Promise<GenericResponse<User[]>> => {
        try {
          const snap = await getDocs(collection(db, 'users'));
          return { success: true, message: 'Users fetched', data: snap.docs.map(d => mapDoc<User>(d)) };
        } catch (error: any) { return { success: false, message: error.message }; }
      },
      toggleStatus: async (id: string): Promise<GenericResponse<User>> => {
        try {
          const ref = doc(db, 'users', id);
          const snap = await getDoc(ref);
          if (!snap.exists()) return { success: false, message: 'User not found' };
          const newVal = !snap.data().is_disabled;
          await updateDoc(ref, { is_disabled: newVal });
          return { success: true, message: `User ${newVal ? 'disabled' : 'enabled'}`, data: { ...mapDoc<User>(snap), is_disabled: newVal } };
        } catch (error: any) { return { success: false, message: error.message }; }
      },
      create: async (userData: any): Promise<GenericResponse<User>> => {
        return { success: false, message: "Admin creation of users is not supported in this client-only version. Please use the Sign Up page." };
      }
    },
    vendors: {
      create: async (data: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>): Promise<GenericResponse<Vendor>> => {
        try {
          const newVendor = {
            ...data,
            created_at: new Date().toISOString(),
            is_active: true,
            rating_avg: 0,
            rating_count: 0
          };
          const ref = await addDoc(collection(db, 'vendors'), newVendor);
          return { success: true, message: 'Vendor created.', data: { id: ref.id, ...newVendor } as Vendor };
        } catch (error: any) { return { success: false, message: error.message }; }
      },
      update: async (id: string, data: Partial<Vendor>): Promise<GenericResponse<Vendor>> => {
        try {
          await updateDoc(doc(db, 'vendors', id), { ...data, updated_at: new Date().toISOString() });
          return { success: true, message: 'Vendor updated.', data: { id, ...data } as Vendor };
        } catch (error: any) { return { success: false, message: error.message }; }
      },
      delete: async (id: string): Promise<GenericResponse<null>> => {
        try {
          await deleteDoc(doc(db, 'vendors', id));
          return { success: true, message: 'Vendor deleted.' };
        } catch (error: any) { return { success: false, message: error.message }; }
      }
    }
  }
};
