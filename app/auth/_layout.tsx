import { Stack, router } from 'expo-router';
import { Pressable } from 'react-native';
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
        headerLeft: () => (
          <Pressable 
            onPress={() => router.back()} 
            hitSlop={8} 
            style={{ 
              width: 36, 
              height: 36, 
              borderRadius: 18, 
              borderWidth: 1, 
              borderColor: colors.dark.border.default, 
              justifyContent: 'center', 
              alignItems: 'center',
              marginLeft: spacing.xs
            }}
          >
            <Icon name="chevron-back" size={20} color={colors.dark.text.primary} />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Login', headerShown: false }} />
      <Stack.Screen name="register" options={{ title: 'Register', headerTitle: '' }} />
      <Stack.Screen name="onboarding" options={{ title: 'Welcome', headerShown: false }} />
    </Stack>
  );
}
