import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { isMockAdminMode, mockAdminSession, mockAdminUser } from '@/constants/mockAdmin';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isGuest: boolean;
  
  /** Whether the session token has expired and needs re-authentication */
  isSessionExpired: boolean;
  
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  
  /**
   * Check if the current session is still valid.
   * Supabase JWTs have `expires_at` (Unix timestamp in seconds).
   * Returns true if the session is valid and not expired.
   */
  isSessionValid: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: isMockAdminMode ? mockAdminSession : null,
  user: isMockAdminMode ? mockAdminUser : null,
  isLoading: true,
  isGuest: !isMockAdminMode,
  isSessionExpired: false,

  setSession: (session) => set({ 
    session, 
    user: session?.user ?? null, 
    isGuest: !session,
    isSessionExpired: false,
    isLoading: false 
  }),

  isSessionValid: () => {
    const { session } = get();
    if (!session) return false;
    
    // Supabase session.expires_at is a Unix timestamp in seconds
    const expiresAt = session.expires_at;
    if (!expiresAt) return true; // If no expiry info, assume valid
    
    const now = Math.floor(Date.now() / 1000);
    // Consider expired if less than 60 seconds remain
    return expiresAt > now + 60;
  },

  signOut: async () => {
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
      
      // Check if session has expired
      let isExpired = false;
      if (session?.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        isExpired = session.expires_at <= now;
      }
      
      set({ 
        session: isExpired ? null : session, 
        user: isExpired ? null : (session?.user ?? null), 
        isGuest: !session || isExpired,
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
          // USER_UPDATED, etc.
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
