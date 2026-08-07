import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { unregisterFCMToken } from '@/lib/fcm';
import { isMockAdminMode, mockAdminSession, mockAdminUser } from '@/constants/mockAdmin';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isGuest: boolean;
  isSessionExpired: boolean;
  
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  isSessionValid: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: isMockAdminMode ? mockAdminSession : null,
  user: isMockAdminMode ? mockAdminUser : null,
  isLoading: true,
  isGuest: !isMockAdminMode,
  isSessionExpired: false,

  setSession: (session) => {
    set({ 
      session, 
      user: session?.user ?? null, 
      isGuest: !session,
      isSessionExpired: false,
      isLoading: false 
    });
  },

  isSessionValid: () => {
    const { session } = get();
    if (!session) return false;
    
    const expiresAt = session.expires_at;
    if (!expiresAt) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return expiresAt > now + 60;
  },

  signOut: async () => {
    try {
      await unregisterFCMToken();
    } catch (e) {
      console.warn('[AuthStore] Failed to unregister FCM token during sign out:', e);
    }
    await supabase.auth.signOut();
    set({ session: null, user: null, isGuest: true, isSessionExpired: false });
  },

  initialize: async () => {
    if (isMockAdminMode) {
      set({ 
        session: mockAdminSession, 
        user: mockAdminUser, 
        isGuest: false,
        isSessionExpired: false,
        isLoading: false 
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      let isExpired = false;
      if (session?.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        isExpired = session.expires_at <= now;
      }
      
      set({ 
        session: isExpired ? null : session, 
        user: isExpired ? null : session?.user, 
        isGuest: isExpired || !session,
        isSessionExpired: isExpired,
        isLoading: false 
      });
      
      // Setup auth state change listener
      // Supabase handles token refresh automatically (`autoRefreshToken: true`).
      // This listener captures all auth events:
      //   - SIGNED_IN: user logged in
      //   - SIGNED_OUT: user logged out
      //   - TOKEN_REFRESHED: access token was refreshed (happens ~every hour)
      //   - USER_UPDATED: user profile updated
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          set({ 
            session: null, 
            user: null, 
            isGuest: true,
            isSessionExpired: false,
            isLoading: false 
          });
        } else if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          set({ 
            session, 
            user: session?.user ?? null, 
            isGuest: !session,
            isSessionExpired: false,
            isLoading: false 
          });
        } else {
          set({ 
            session, 
            user: session?.user ?? null, 
            isGuest: !session,
            isLoading: false 
          });
        }
      });
    } catch (e) {
      set({ isLoading: false, isGuest: true });
    }
  }
}));
