import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { syncWatermelonDB } from '@/infra/db/sync';
import { supabase } from '@/infra/api/supabase.client';
import { useAuthStore } from '@/store/auth.store';

export function useOfflineSync() {
  const appState = useRef(AppState.currentState);
  const isSyncing = useRef(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const { isGuest } = useAuthStore();

  const performSync = async () => {
    // Prevent overlapping sync operations
    if (isSyncing.current) return;
    
    // Validate auth session exists and user is not a guest before attempting sync
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || isGuest) {
      console.log('Skipping sync: No active user session or user is Guest');
      return; 
    }

    try {
      isSyncing.current = true;
      console.log('Starting DB sync...');
      await syncWatermelonDB(session.user.id);
      console.log('DB sync completed successfully.');
      setLastSyncedAt(new Date());
    } catch (error) {
      console.error('DB sync failed:', error);
    } finally {
      isSyncing.current = false;
    }
  };

  useEffect(() => {
    // 1. Sync on Mount
    performSync();

    // 2. Sync on AppState change (Foreground / Background)
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // Transitioned from Background to Active
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App came to foreground, triggering sync');
        performSync();
      }
      appState.current = nextAppState;
    });

    // 3. Sync on Network change (Offline -> Online)
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('Network connected, triggering sync');
        performSync();
      }
    });

    // 4. Fallback interval sync (every 5 minutes)
    const syncInterval = setInterval(() => {
      performSync();
    }, 5 * 60 * 1000);

    return () => {
      subscription.remove();
      unsubscribeNetInfo();
      clearInterval(syncInterval);
    };
  }, []);

  return { lastSyncedAt, isSyncing: isSyncing.current };
}
