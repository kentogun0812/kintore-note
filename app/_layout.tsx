import { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SystemUI from 'expo-system-ui';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth.store';
import { useOfflineSync } from '@/hooks/use-offline-sync';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient();

function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, isLoading, initialize } = useAuthStore();

  // Initialize offline sync behavior globally
  useOfflineSync();

  useEffect(() => {
    initialize();
    // Set root view background color to match the theme (avoids black bars on Android)
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync(colors.dark.bg.primary);
    }
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
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="training" options={{ headerShown: false }} />
          <Stack.Screen name="settings/index" options={{ headerShown: false }} />
          <Stack.Screen name="camera/index" options={{ headerShown: false }} />
          <Stack.Screen name="modals/hanko-stamp" options={{ presentation: 'fullScreenModal', headerShown: false }} />
          <Stack.Screen name="modals/session-summary" options={{ presentation: 'formSheet', headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default RootLayout;
