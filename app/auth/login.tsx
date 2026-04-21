import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Icon } from '@/components/Icon';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Thiếu thông tin', 'Bạn vui lòng nhập đầy đủ email và mật khẩu nhé! 💪');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Đăng nhập không thành công', 'Email hoặc mật khẩu chưa chính xác. Bạn thử kiểm tra lại xem sao nhé! 🧐');
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      if (credential.identityToken) {
        setLoading(true);
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });
        setLoading(false);
        if (error) throw error;
        router.replace('/(tabs)/home');
      } else {
        throw new Error('No identity token.');
      }
    } catch (e: any) {
      setLoading(false);
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Lỗi kết nối', 'Không thể kết nối với Apple lúc này. Bạn thử lại sau nhé! 🍎');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>🏋️</Text>
            </View>
            <Text style={styles.title}>Kintore Note</Text>
            <Text style={styles.subtitle}>Welcome back, let's lift.</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput 
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={colors.dark.text.tertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="email-address"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <TextInput 
              ref={passwordRef}
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              placeholderTextColor={colors.dark.text.tertiary}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="default"
            />
            
            <Pressable 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Entering...' : 'Sign In'}
              </Text>
            </Pressable>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <Pressable 
            style={({ pressed }) => [
              styles.appleButton, 
              { opacity: pressed ? 0.9 : 1 }
            ]} 
            onPress={handleAppleLogin}
          >
            <View style={styles.appleButtonContent}>
              <Icon name="logo-apple" size={18} color={colors.black} />
              <Text style={styles.appleButtonText}>Sign In with Apple</Text>
            </View>
          </Pressable>
        </View>

        {/* Bottom Footer */}
        <View style={styles.footer}>
          <Pressable 
            style={styles.footerLink}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={styles.footerText}>
              Don't have an account? <Text style={styles.footerLinkBold}>Register</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.dark.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: 'heavy',
    color: colors.dark.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.dark.text.secondary,
    marginTop: spacing.xs,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.dark.bg.secondary,
    color: colors.dark.text.primary,
    paddingHorizontal: spacing.base,
    padding: spacing.medium,
    borderRadius: 12,
    fontSize: typography.fontSize.md,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  button: {
    backgroundColor: colors.dark.accent.primary,
    padding: spacing.medium,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.dark.text.inverse,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.dark.border.subtle,
  },
  dividerText: {
    color: colors.dark.text.tertiary,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
  },
  appleButton: {
    width: '100%',
    height: 54,
    backgroundColor: colors.white,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  appleButtonText: {
    color: colors.black,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  footerLink: {
    padding: spacing.sm,
  },
  footerText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.base,
  },
  footerLinkBold: {
    color: colors.dark.accent.primary,
    fontWeight: 'bold',
  },
});
