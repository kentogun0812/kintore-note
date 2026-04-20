import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.dark.bg.primary }}>
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
              Kintore Note
            </Text>
            <Text style={{ fontSize: typography.fontSize.base, color: colors.dark.text.secondary, marginTop: spacing.xs }}>
              Welcome back, let's lift.
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
            
            <Pressable 
              style={{ 
                backgroundColor: colors.dark.accent.primary, 
                padding: spacing.lg, 
                borderRadius: 12, 
                alignItems: 'center', 
                marginTop: spacing.xs, 
                opacity: loading ? 0.7 : 1,
              }}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={{ color: colors.dark.text.inverse, fontSize: typography.fontSize.md, fontWeight: 'bold' }}>
                {loading ? 'Entering...' : 'Sign In'}
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

          {/* Social Login */}
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={12}
            style={{ width: '100%', height: 50 }}
            onPress={handleAppleLogin}
          />
        </View>

        {/* Bottom Footer */}
        <View style={{ alignItems: 'center', paddingBottom: spacing.xl }}>
          <Pressable 
            style={{ padding: spacing.sm }}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.base }}>
              Don't have an account? <Text style={{ color: colors.dark.accent.primary, fontWeight: 'bold' }}>Register</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
