import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth.store';
import { useOfflineSync } from '@/hooks/use-offline-sync';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a client for React Query
const queryClient = new QueryClient();

function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, isLoading, initialize } = useAuthStore();

  // Initialize offline sync behavior globally
  useOfflineSync();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const isRegisteringLevel = segments.length > 1 && (segments as string[])[1] === 'onboarding';

    if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (session && inAuthGroup && !isRegisteringLevel) {
      // Only redirect out of auth group if they are NOT in onboarding
      router.replace('/(tabs)/home');
    }

    // Hide splash screen after routing evaluation is done
    SplashScreen.hideAsync();
  }, [session, segments, isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.dark.bg.primary },
          headerTintColor: colors.dark.text.primary,
          contentStyle: { backgroundColor: colors.dark.bg.primary },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="training" options={{ headerShown: false }} />
        <Stack.Screen name="settings/index" options={{ headerShown: false }} />
        <Stack.Screen name="camera/index" options={{ headerShown: false }} />
        <Stack.Screen name="modals/hanko-stamp" options={{ presentation: 'fullScreenModal', headerShown: false }} />
        <Stack.Screen name="modals/session-summary" options={{ presentation: 'formSheet', headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}

export default RootLayout;
