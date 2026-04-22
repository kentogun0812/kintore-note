import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isGuest: boolean;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  isGuest: false,
  setSession: (session) => set({ 
    session, 
    user: session?.user ?? null, 
    isGuest: !session,
    isLoading: false 
  }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, isGuest: true });
  },
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ 
        session, 
        user: session?.user ?? null, 
        isGuest: !session,
        isLoading: false 
      });
      
      // Setup listener
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ 
          session, 
          user: session?.user ?? null, 
          isGuest: !session,
          isLoading: false 
        });
      });
    } catch (e) {
      set({ isLoading: false, isGuest: true });
    }
  }
}));
