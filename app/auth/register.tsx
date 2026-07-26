import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Icon } from '@/components/Icon';
import { supabase } from '@/lib/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useOnboardingStore } from '@/store/onboarding.store';
import { useTranslation } from 'react-i18next';
import { AppErrorHandler, ValidationError, BusinessError, NetworkError } from '@/lib/error-handler';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      AppErrorHandler.handleError(new ValidationError(t('auth.register.errors.missingInfoDesc'), 'MISSING_INFO'));
      return;
    }
    if (password !== confirmPassword) {
      AppErrorHandler.handleError(new ValidationError(t('auth.register.errors.passwordMismatchDesc'), 'PASSWORD_MISMATCH'));
      return;
    }
    setLoading(true);
    useOnboardingStore.getState().resetOnboardingAccount();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      AppErrorHandler.handleError(new BusinessError(t('auth.register.errors.registerErrorDesc'), 'REGISTER_FAILED', error));
    } else if (!data.session) {
      Alert.alert(t('auth.register.errors.registerSuccessTitle'), t('auth.register.errors.registerSuccessDesc'));
      router.replace('/auth/login');
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
        if (error) {
          AppErrorHandler.handleError(new NetworkError(t('auth.register.errors.connectionErrorDesc'), 'CONNECTION_ERROR', error));
          return;
        }
        router.replace('/(tabs)/home');
      } else {
        setLoading(false);
        AppErrorHandler.handleError(new NetworkError(t('auth.register.errors.connectionErrorDesc'), 'CONNECTION_ERROR', new Error('No identity token')));
        return;
      }
    } catch (e: any) {
      setLoading(false);
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        AppErrorHandler.handleError(new NetworkError(t('auth.register.errors.connectionErrorDesc'), 'CONNECTION_ERROR', e));
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.backButtonContainer}>
        <Pressable 
          onPress={() => router.back()} 
          hitSlop={12} 
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={20} color={colors.dark.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>🏋️</Text>
            </View>
            <Text style={styles.title}>{t('auth.register.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.register.subtitle')}</Text>
          </View>

          <View style={styles.form}>
            <TextInput 
              style={styles.input}
              placeholder={t('auth.register.emailPlaceholder')}
              placeholderTextColor={colors.dark.text.tertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="default"
              textContentType="emailAddress"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />
            <TextInput 
              ref={passwordRef}
              style={styles.input}
              placeholder={t('auth.register.passwordPlaceholder')}
              secureTextEntry
              placeholderTextColor={colors.dark.text.tertiary}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="default"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              blurOnSubmit={false}
            />
            <TextInput 
              ref={confirmPasswordRef}
              style={styles.input}
              placeholder={t('auth.register.confirmPasswordPlaceholder')}
              secureTextEntry
              placeholderTextColor={colors.dark.text.tertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="default"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              blurOnSubmit={false}
            />
            
            <Pressable 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? t('auth.register.creating') : t('auth.register.continue')}
              </Text>
            </Pressable>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.register.orContinueWith')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable 
            style={({ pressed }) => [
              styles.appleButton, 
              { opacity: pressed ? 0.9 : 1 }
            ]} 
            onPress={handleAppleLogin}
          >
            <View style={styles.appleButtonContent}>
              <Icon name="logo-apple" size={18} color={colors.black} />
              <Text style={styles.appleButtonText}>{t('auth.register.signUpApple')}</Text>
            </View>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.guestButton, 
              { opacity: pressed ? 0.7 : 1 }
            ]} 
            onPress={() => router.replace('/(tabs)/home')}
          >
            <View style={styles.guestButtonContent}>
              <Icon name="person-outline" size={18} color={colors.dark.text.secondary} />
              <Text style={styles.guestButtonText}>{t('auth.login.continueAsGuest')}</Text>
            </View>
          </Pressable>
        </View>
        
        <View style={styles.footer}>
          <Pressable 
            style={styles.footerLink}
            onPress={() => router.back()}
          >
            <Text style={styles.footerText}>
              {t('auth.register.haveAccount')} <Text style={styles.footerLinkBold}>{t('auth.register.signIn')}</Text>
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
  backButtonContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    paddingBottom: spacing.lg,
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
    padding: spacing.ld,
    borderRadius: 12,
    fontSize: typography.fontSize.md,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  button: {
    backgroundColor: colors.dark.accent.primary,
    padding: spacing.ld,
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
    padding: spacing.ld,
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
  guestButton: {
    width: '100%',
    padding: spacing.ld,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.dark.border.default,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  guestButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  guestButtonText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
});
