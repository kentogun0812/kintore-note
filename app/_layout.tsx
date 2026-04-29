import '@/i18n';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SystemUI from 'expo-system-ui';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth.store';
import { useOfflineSync } from '@/hooks/use-offline-sync';
import { useAppLock } from '@/hooks/use-app-lock';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppLockScreen } from '@/components/AppLockScreen';

const queryClient = new QueryClient();

import { useSettingsStore } from '@/store/settings.store';
import { useOnboardingStore } from '@/store/onboarding.store';
import i18n from '@/i18n';

function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, isLoading, initialize } = useAuthStore();
  const { hasCompletedOnboarding, hasSeenIntro } = useOnboardingStore();
  const { language } = useSettingsStore();
  const { isLocked, unlock } = useAppLock();

  useOfflineSync();

  useEffect(() => {
    initialize();
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync(colors.dark.bg.primary);
    }
  }, [initialize]);

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  useEffect(() => {
    if (isLoading) return;

    const routeSegments = segments as string[];
    const inAuthGroup = routeSegments[0] === 'auth';
    const isIntro = inAuthGroup && routeSegments.length > 1 && routeSegments[1] === 'intro';
    const isOnboarding = inAuthGroup && routeSegments.length > 1 && routeSegments[1] === 'onboarding';

    if (!hasSeenIntro && !isIntro) {
      router.replace('/auth/intro');
      SplashScreen.hideAsync();
      return;
    }
    if (hasSeenIntro) {
      if (!session) {
        if (inAuthGroup && !isIntro && routeSegments.length > 1 && routeSegments[1] !== 'login' && routeSegments[1] !== 'register') {
          router.replace('/(tabs)/home');
        }
      } else {
        if (!hasCompletedOnboarding) {
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

    SplashScreen.hideAsync();
  }, [session, segments, isLoading, hasSeenIntro, hasCompletedOnboarding]);

  if (isLoading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.dark.bg.primary },
            headerTintColor: colors.dark.text.primary,
            contentStyle: { backgroundColor: colors.dark.bg.primary },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="training" options={{ headerShown: false }} />
          <Stack.Screen name="settings/index" options={{ headerShown: false }} />
          <Stack.Screen name="camera/index" options={{ headerShown: false }} />
          <Stack.Screen name="modals/hanko-stamp" options={{ presentation: 'fullScreenModal', headerShown: false }} />
          <Stack.Screen name="modals/session-summary" options={{ presentation: 'formSheet', headerShown: false }} />
        </Stack>

        {/* App Lock Overlay — only for logged-in users, renders on top of everything */}
        {isLocked && !!session && <AppLockScreen onUnlock={unlock} />}
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default RootLayout;
