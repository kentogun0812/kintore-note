import { Stack, router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { Icon } from '@/components/Icon';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.dark.bg.primary },
        headerTintColor: colors.dark.text.primary,
        contentStyle: { backgroundColor: colors.dark.bg.primary },
        headerShadowVisible: false,
        headerBackVisible: false,
        gestureEnabled: false,
        headerLeft: () => (
          <Pressable 
            onPress={() => router.back()} 
            hitSlop={8} 
            style={styles.backButton}
          >
            <Icon name="chevron-back" size={20} color={colors.dark.text.primary} />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="intro" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="login" options={{ title: 'Login', headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="register" options={{ title: 'Register', headerTitle: '', gestureEnabled: false }} />
      <Stack.Screen name="onboarding" options={{ title: 'Welcome', headerShown: false, gestureEnabled: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
});

