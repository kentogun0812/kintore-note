import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Button } from '@/components/Button';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  withSequence,
  withDelay, 
  runOnJS,
  Easing
} from 'react-native-reanimated';

export default function HankoStampModal() {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const streakOpacity = useSharedValue(0);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  useEffect(() => {
    // Opacity fades in fast
    opacity.value = withTiming(1, { duration: 200 });
    
    // Scale bounces up to 1.2 then settles at 1.0
    scale.value = withSequence(
      withTiming(1.2, { duration: 200, easing: Easing.out(Easing.cubic) }, () => {
        runOnJS(triggerHaptic)();
      }),
      withSpring(1.0, { damping: 10, stiffness: 150 })
    );

    // Fade in text slightly after
    streakOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
  }, []);

  const animatedStampStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { rotate: '-10deg' } // Organic tilt
      ],
    };
  });

  const animatedStreakStyle = useAnimatedStyle(() => {
    return {
      opacity: streakOpacity.value,
      transform: [
        { translateY: withTiming(streakOpacity.value === 1 ? 0 : 20, { duration: 400 }) }
      ]
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.dark.bg.primary, justifyContent: 'center', alignItems: 'center' }}>
      <Stack.Screen options={{ presentation: 'fullScreenModal', headerShown: false }} />
      
      <View style={{ alignItems: 'center', gap: spacing.xl, marginBottom: 100 }}>
        <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize['2xl'], fontWeight: 'heavy' }}>
          よくできました！
        </Text>
        
        <View style={styles.hankoHitbox}>
          <Animated.View style={[styles.hankoContainer, animatedStampStyle]}>
            <View style={styles.hankoBorder}>
              <Text style={styles.hankoText}>済</Text>
            </View>
          </Animated.View>
        </View>
        
        <Animated.View style={animatedStreakStyle}>
          <Text style={{ color: colors.dark.accent.warning, fontSize: typography.fontSize.xl, fontWeight: 'bold' }}>
            🔥 15日連続
          </Text>
        </Animated.View>
      </View>
      
      <View style={{ position: 'absolute', bottom: spacing['4xl'], width: '100%', paddingHorizontal: spacing.xl }}>
        <Button 
          label="Close" 
          fullWidth
          onPress={() => {
            router.dismissAll();
            router.replace('/(tabs)/home');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hankoHitbox: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  hankoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: colors.dark.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    shadowColor: colors.dark.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  hankoBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.dark.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hankoText: {
    color: colors.dark.accent.primary,
    fontSize: 56,
    fontWeight: 'bold',
    opacity: 0.9,
  }
});
