
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse, UserRole } from '../types';
import { supabase } from '../services/supabase';
import { api } from '../services/mockDatabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  signup: (data: any) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<any>;
  completeGoogleSignup: (data: any, firebaseUser: any) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const res = await api.users.getMe(userId);
    if (res.success && res.data) {
      setUser(res.data);
    } else {
      console.error("Profile fetch failed:", res.message);
      // maybe sign out if no profile?
    }
    setIsLoading(false);
  };

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });

      if (error) throw error;
      if (!data.user) throw new Error("No user returned");

      const res = await api.users.getMe(data.user.id);
      if (res.success && res.data) {
        setUser(res.data);
        return { success: true, message: 'Login successful.', token: data.session?.access_token, user: res.data };
      }
      return { success: false, message: 'User profile not found.' };

    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, message: error.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: any) => {
    setIsLoading(true);
    try {
      if (data.password !== data.confirm_password) return { success: false, message: 'Passwords do not match.' };

      // Signup with Supabase Auth
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      if (!authData.user) throw new Error("Signup failed");

      // Create Public Profile
      const newUser: User = {
        id: authData.user.id,
        email: data.email,
        name: data.name,
        semester: data.semester,
        role: UserRole.STUDENT,
        is_disabled: false,
        created_at: new Date().toISOString(),
        loyalty_points: 0,
        pfp_url: ''
      };

      // Direct insert via Supabase client (using mapping in api is awkward for direct insert of User type if api.users.create doesn't exist.
      // But we can use supabase directly here or add create to api. 
      // Let's use supabase directly for profile creation to be sure.
      const { error: profileError } = await supabase.from('users').insert(newUser);
      if (profileError) throw profileError;

      // Welcome Message
      try {
        // ensure system user exists or handle implicitly? Supabase won't have system user by default.
        // We might skipping this or need to seed system user.
        // Let's try sending.
        await api.messages.send('foodhunt101lpu@gmail.com', newUser.id, `Welcome to Food Hunt!`);
      } catch (e) {
        console.log("Welcome msg check failed or ignored", e);
      }

      setUser(newUser);
      return { success: true, message: 'Signup successful.', token: authData.session?.access_token, user: newUser };

    } catch (error: any) {
      console.error("Signup error:", error);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    // Supabase Google Auth requires redirection usually.
    // For this dev setup, we might stick to Email/Pass or use signInWithOAuth
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Redirecting...' };
  };

  const completeGoogleSignup = async (data: any, firebaseUser: any) => {
    // This flow effectively changes for Supabase as OAuth handles user creation differently.
    // We will assume for now this is legacy or needs redesign. 
    return { success: false, message: "Use Email Signup for this beta." };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, signInWithGoogle, completeGoogleSignup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
