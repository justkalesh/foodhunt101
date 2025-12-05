
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse, UserRole } from '../types';
import { auth, db, googleProvider } from '../services/firebase';
import { api } from '../services/mockDatabase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  signup: (data: any) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<any>; // Changed to any to support isNewUser flag
  completeGoogleSignup: (data: any, firebaseUser: any) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // Fallback if doc doesn't exist yet (shouldn't happen in normal flow)
          console.error("User document not found for", firebaseUser.uid);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      // Map college_id to email - REMOVED
      // const email = `${college_id}@foodhunt.app`;
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);

      // Fetch user data
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser(userData);
        return { success: true, message: 'Login successful.', token: await userCredential.user.getIdToken(), user: userData };
      } else {
        return { success: false, message: 'User profile not found.' };
      }
    } catch (error: any) {
      console.error("Login error:", error);
      alert(`Login Error: ${error.message}`); // Added for debugging
      let msg = 'Login failed.';
      if (error.code === 'auth/invalid-credential') msg = 'Invalid ID or password.';
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: any) => {
    setIsLoading(true);
    try {
      // Validation
      if (data.password !== data.confirm_password) {
        return { success: false, message: 'Passwords do not match.' };
      }


      // const email = `${data.college_id}@foodhunt.app`;
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);

      // Create User Profile in Firestore
      const newUser: User = {
        id: userCredential.user.uid,
        email: data.email,
        name: data.name,
        semester: data.semester,
        role: UserRole.STUDENT,
        is_disabled: false,
        created_at: new Date().toISOString(),
        loyalty_points: 0,
        pfp_url: ''
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);

      // Send Welcome Message
      try {
        await api.messages.send(
          'yCQPgtxNaYODawOaP8BEtDONSUE2', // System User ID
          newUser.id,
          `Welcome to Food Hunt, ${newUser.name}! 🍔\n\nWe're excited to have you on board. Explore campus food spots, split meals with friends, and enjoy tasty treats!\n\nIf you have any questions, feel free to reply to this message.`
        );
      } catch (msgError) {
        console.error("Failed to send welcome message:", msgError);
        // Don't fail signup if message fails
      }

      setUser(newUser);
      return { success: true, message: 'Signup successful.', token: await userCredential.user.getIdToken(), user: newUser };
    } catch (error: any) {
      console.error("Signup error:", error);
      let msg = 'Signup failed.';
      if (error.code === 'auth/email-already-in-use') msg = 'User with this Email already exists.';
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser(userData);
        return { success: true, message: 'Login successful.', token: await firebaseUser.getIdToken(), user: userData };
      } else {
        // User doesn't exist, return flag to redirect to completion page
        return { success: true, message: 'Please complete your profile.', isNewUser: true, firebaseUser: firebaseUser };
      }
    } catch (error: any) {
      console.error("Google Sign-In error:", error);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const completeGoogleSignup = async (data: any, firebaseUser: any) => {
    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);

      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || data.email,
        name: data.name,
        semester: data.semester,
        role: UserRole.STUDENT,
        is_disabled: false,
        created_at: new Date().toISOString(),
        loyalty_points: 0,
        pfp_url: firebaseUser.photoURL || ''
      };

      await setDoc(userDocRef, newUser);
      await setDoc(userDocRef, newUser);

      // Send Welcome Message
      try {
        await api.messages.send(
          'yCQPgtxNaYODawOaP8BEtDONSUE2', // System User ID
          newUser.id,
          `Welcome to Food Hunt, ${newUser.name}! 🍔\n\nWe're excited to have you on board. Explore campus food spots, split meals with friends, and enjoy tasty treats!\n\nIf you have any questions, feel free to reply to this message.`
        );
      } catch (msgError) {
        console.error("Failed to send welcome message:", msgError);
      }

      setUser(newUser);
      return { success: true, message: 'Signup successful.', token: await firebaseUser.getIdToken(), user: newUser };
    } catch (error: any) {
      console.error("Complete Profile error:", error);
      let msg = 'Profile completion failed.';
      if (error.code === 'auth/email-already-in-use') msg = 'User with this Email already exists.'; // Unlikely for Firestore setDoc but good to have
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // In a real app, we might want to sync this back to Firestore immediately,
    // but for now we just update local state to reflect UI changes.
    // The actual Firestore update should happen via api calls.
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
