import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { APP_NAME } from '@/constants/app';
import * as SplashScreen from 'expo-splash-screen';

export function CustomSplashScreen() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    // Hide native splash screen quickly so we see this one
    SplashScreen.hideAsync().catch(() => {});

    // Animate text in
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Text style={styles.appName}>{APP_NAME}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.dark.text.primary,
    letterSpacing: 1.5,
  },
});
