import '@/i18n';
import { initSqliteDb, getSqliteDb } from '@/infra/db/sqlite';
import { seedPresetTemplatesSqlite } from '@/infra/db/seed-sqlite';
import { SyncService } from '@/infra/db/sync-service';
import { useEffect, useState } from 'react';
import { Platform, LogBox, AppState } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { checkAppVersion } from '@/utils/versionCheck';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth.store';
import { useOfflineSync } from '@/hooks/use-offline-sync';
import { useAppLock } from '@/hooks/use-app-lock';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppLockScreen } from '@/components/AppLockScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CustomSplashScreen } from '@/components/CustomSplashScreen';
import { useSettingsStore } from '@/store/settings.store';
import { useOnboardingStore } from '@/store/onboarding.store';
import { isMockAdminMode } from '@/constants/mockAdmin';
import i18n from '@/i18n';
import * as SystemUI from 'expo-system-ui';
import * as SplashScreen from 'expo-splash-screen';

LogBox.ignoreLogs([
  'No native splash screen registered for given view controller',
]);
SplashScreen.preventAutoHideAsync().catch(() => { });
const queryClient = new QueryClient();

function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, isLoading, initialize } = useAuthStore();
  const { hasCompletedOnboarding, hasSeenIntro } = useOnboardingStore();
  const { language } = useSettingsStore();
  const { isLocked, unlock } = useAppLock();
  const [isPreloading, setIsPreloading] = useState(true);

  useOfflineSync();

  useEffect(() => {
    async function preload() {
      const minDelay = new Promise(resolve => setTimeout(resolve, 3500));
      const authInit = initialize();

      initSqliteDb();

      const db = getSqliteDb();
      let isEmpty = false;
      try {
        const countRes = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM exercises WHERE is_system = 1;');
        isEmpty = !countRes || countRes.count === 0;
      } catch (e) {
        isEmpty = true;
      }

      let didSeed = false;
      if (isEmpty) {
        console.log('[Layout] Exercises database is empty. Attempting initial sync from Supabase...');
        try {
          const didSync = await SyncService.syncMasterExercises();
          if (didSync) {
            console.log('[Layout] Initial sync from Supabase succeeded.');
            didSeed = true;
          } else {
            console.warn('[Layout] Initial sync from Supabase returned false (no internet or server error).');
          }
        } catch (error) {
          console.error('[Layout] Initial remote sync failed:', error);
        }
      } else {
        // Background Monthly Master Exercises Sync
        setTimeout(async () => {
          try {
            const didSync = await SyncService.syncMasterExercises();
            if (didSync) {
              queryClient.invalidateQueries({ queryKey: ['exercises'] });
              queryClient.invalidateQueries({ queryKey: ['exercises_library'] });
            }
          } catch (e) {
            console.warn('[SQLite] Background exercise sync failed:', e);
          }
        }, 5000);
      }

      seedPresetTemplatesSqlite();
      if (didSeed) {
        queryClient.invalidateQueries({ queryKey: ['exercises'] });
        queryClient.invalidateQueries({ queryKey: ['exercises_library'] });
      }

      await Promise.all([minDelay, authInit]);
      setIsPreloading(false);
    }

    preload();

    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync(colors.dark.bg.primary);
    }
  }, [initialize]);

  // Version check listener on app mount and foreground resume
  useEffect(() => {
    // Initial check (non-blocking)
    checkAppVersion();

    // AppState listener for subsequent resumes
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkAppVersion(true); // force check on foreground resume
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  useEffect(() => {
    if (isLoading || isPreloading) return;

    const routeSegments = segments as string[];
    const inAuthGroup = routeSegments[0] === 'auth';
    const isIntro = inAuthGroup && routeSegments.length > 1 && routeSegments[1] === 'intro';
    const isOnboarding = inAuthGroup && routeSegments.length > 1 && routeSegments[1] === 'onboarding';

    const effectiveHasSeenIntro = isMockAdminMode || hasSeenIntro;
    const effectiveHasCompletedOnboarding = isMockAdminMode || hasCompletedOnboarding;

    if (!effectiveHasSeenIntro && !isIntro) {
      router.replace('/auth/intro');
      SplashScreen.hideAsync().catch(() => { });
      return;
    }
    if (effectiveHasSeenIntro) {
      if (!session) {
        if (inAuthGroup && !isIntro && routeSegments.length > 1 && routeSegments[1] !== 'login' && routeSegments[1] !== 'register') {
          router.replace('/(tabs)/home');
        }
      } else {
        if (!effectiveHasCompletedOnboarding) {
          if (!isOnboarding) {
            router.replace('/auth/onboarding');
          }
        } else {
          if (inAuthGroup) {
            router.replace('/(tabs)/home');
          }
        }
      }
    }

    SplashScreen.hideAsync().catch(() => { });
  }, [session, segments, isLoading, isPreloading, hasSeenIntro, hasCompletedOnboarding]);

  if (isLoading || isPreloading) {
    return <CustomSplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.dark.bg.primary },
              headerTintColor: colors.dark.text.primary,
              contentStyle: { backgroundColor: colors.dark.bg.primary },
              headerShadowVisible: false,
              gestureEnabled: true,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="training" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="camera/index" options={{ headerShown: false }} />
            <Stack.Screen name="modals/hanko-stamp" options={{ presentation: 'fullScreenModal', headerShown: false }} />
            <Stack.Screen name="modals/session-summary" options={{ presentation: 'formSheet', headerShown: false }} />
          </Stack>

          {/* App Lock Overlay — only for logged-in users, renders on top of everything */}
          {isLocked && !!session && <AppLockScreen onUnlock={unlock} />}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default RootLayout;
