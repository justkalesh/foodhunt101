
export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
  VENDOR = 'vendor',
}

export interface User {
  id: string;
  email: string; // Unique, Email address
  name: string;
  semester: string;
  role: UserRole;
  is_disabled: boolean;
  created_at: string;
  updated_at?: string;
  // Frontend specific (simulated join or additional data)
  loyalty_points?: number;
  active_split_id?: string | null;
  pfp_url?: string;
}

export type OriginTag = 'North' | 'South' | 'West' | 'Chinese' | 'Indo-Chinese' | 'Other';
export type RushLevel = 'low' | 'mid' | 'high';

export interface Vendor {
  id: string;
  name: string;
  description: string;
  location: string;
  cuisine: string;
  origin_tag: OriginTag;
  rush_level: RushLevel;
  logo_url: string;
  menu_image_urls: string[];
  contact_number: string;
  lowest_item_price: number;
  avg_price_per_meal: number;
  popularity_score: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  // Computed fields for UI
  rating_avg?: number;
  rating_count?: number;
}

// Replaces previous Rating interface
export interface Review {
  id: string;
  user_id: string;
  vendor_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  // UI helper
  user_name?: string;
}

export interface MenuItem {
  id: string;
  vendor_id: string;
  name: string;
  price: number;
  is_active: boolean;
}

// Keep existing types for MealSplit to maintain feature compatibility
export interface MealSplit {
  id: string;
  creator_id: string;
  creator_name: string;
  vendor_id: string;
  vendor_name: string;
  dish_name: string;
  total_price: number;
  people_needed: number;
  people_joined_ids: string[];
  time_note: string;
  split_time?: string; // ISO string for expiration check
  is_closed: boolean;
  created_at: string;
}

export interface GenericResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

// New Conversation and Message Types
export interface Conversation {
  id: string;
  participants: string[]; // [userId1, userId2] for querying
  participant_details: Record<string, { name: string; email: string; avatar?: string }>; // Cache user info
  last_message: {
    content: string;
    sender_id: string;
    created_at: string;
    is_read: boolean; // "Global" read status for the last message
  };
  unread_counts: Record<string, number>; // { userId: count }
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string; // Still useful for reference
  content: string;
  is_read: boolean;
  created_at: string;
}
