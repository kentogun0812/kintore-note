import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Icon } from '@/components/Icon';
import { supabase } from '@/lib/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Thiếu thông tin', 'Hãy nhập đầy đủ thông tin để tạo tài khoản mới bạn nhé! ✨');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Mật khẩu không khớp', 'Mật khẩu và xác nhận mật khẩu phải giống nhau nhé! 🧐');
      return;
    }
    
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Lỗi đăng ký', 'Có chút trục trặc khi tạo tài khoản. Bạn kiểm tra lại email hoặc mật khẩu (tối thiểu 6 ký tự) nhé! 🛠️');
    } else {
      router.replace('/auth/onboarding');
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
        Alert.alert('Lỗi kết nối', 'Không thể kết nối với Apple lúc này. 🍎');
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.dark.bg.primary }}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Back Button */}
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
        <Pressable 
          onPress={() => router.back()} 
          hitSlop={12} 
          style={{ 
            width: 36, 
            height: 36, 
            borderRadius: 18, 
            borderWidth: 1, 
            borderColor: colors.dark.border.default, 
            justifyContent: 'center', 
            alignItems: 'center',
          }}
        >
          <Icon name="chevron-back" size={20} color={colors.dark.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: spacing['2xl'] }}>
            <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: colors.dark.accent.primary, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ fontSize: 36 }}>🏋️</Text>
            </View>
            <Text style={{ fontSize: typography.fontSize['3xl'], fontWeight: 'heavy', color: colors.dark.text.primary }}>
              Create Account
            </Text>
            <Text style={{ fontSize: typography.fontSize.base, color: colors.dark.text.secondary, marginTop: spacing.xs }}>
              Join Kintore Note and start lifting.
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: spacing.md }}>
            <TextInput 
              style={{
                backgroundColor: colors.dark.bg.secondary,
                color: colors.dark.text.primary,
                padding: spacing.lg,
                borderRadius: 12,
                fontSize: typography.fontSize.md,
                borderWidth: 1,
                borderColor: colors.dark.border.subtle,
              }}
              placeholder="Email address"
              placeholderTextColor={colors.dark.text.tertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput 
              style={{
                backgroundColor: colors.dark.bg.secondary,
                color: colors.dark.text.primary,
                padding: spacing.lg,
                borderRadius: 12,
                fontSize: typography.fontSize.md,
                borderWidth: 1,
                borderColor: colors.dark.border.subtle,
              }}
              placeholder="Password"
              secureTextEntry
              placeholderTextColor={colors.dark.text.tertiary}
              value={password}
              onChangeText={setPassword}
            />
            <TextInput 
              style={{
                backgroundColor: colors.dark.bg.secondary,
                color: colors.dark.text.primary,
                padding: spacing.lg,
                borderRadius: 12,
                fontSize: typography.fontSize.md,
                borderWidth: 1,
                borderColor: colors.dark.border.subtle,
              }}
              placeholder="Confirm Password"
              secureTextEntry
              placeholderTextColor={colors.dark.text.tertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            
            <Pressable 
              style={{ 
                backgroundColor: colors.dark.accent.primary, 
                padding: spacing.lg, 
                borderRadius: 12, 
                alignItems: 'center', 
                marginTop: spacing.xs, 
                opacity: loading ? 0.7 : 1,
              }}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={{ color: colors.dark.text.inverse, fontSize: typography.fontSize.md, fontWeight: 'bold' }}>
                {loading ? 'Creating Account...' : 'Continue'}
              </Text>
            </Pressable>
          </View>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.dark.border.subtle }} />
            <Text style={{ color: colors.dark.text.tertiary, paddingHorizontal: spacing.md, fontSize: typography.fontSize.sm }}>
              OR CONTINUE WITH
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.dark.border.subtle }} />
          </View>

          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={12}
            style={{ width: '100%', height: 50 }}
            onPress={handleAppleLogin}
          />
        </View>
        
        <View style={{ alignItems: 'center', paddingBottom: spacing.xl }}>
          <Pressable 
            style={{ padding: spacing.sm }}
            onPress={() => router.back()}
          >
            <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.base }}>
              Already have an account? <Text style={{ color: colors.dark.accent.primary, fontWeight: 'bold' }}>Sign In</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
