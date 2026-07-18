import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon } from '@/components/Icon';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

interface DismissibleBannerProps {
  bannerId: string;
  description: string;
}

export function DismissibleBanner({ bannerId, description }: DismissibleBannerProps) {
  const [isVisible, setIsVisible] = useState<boolean | null>(null);

  useEffect(() => {
    const checkBannerState = async () => {
      try {
        const state = await AsyncStorage.getItem(`@banner_${bannerId}`);
        setIsVisible(state !== 'dismissed');
      } catch (error) {
        console.error('Failed to read banner state', error);
        setIsVisible(true);
      }
    };
    checkBannerState();
  }, [bannerId]);

  const handleDismiss = async () => {
    setIsVisible(false);
    try {
      await AsyncStorage.setItem(`@banner_${bannerId}`, 'dismissed');
    } catch (error) {
      console.error('Failed to save banner state', error);
    }
  };

  if (isVisible === null || !isVisible) {
    return null;
  }

  return (
    <Animated.View 
      entering={FadeInUp.duration(300)} 
      exiting={FadeOutUp.duration(300)}
      style={styles.container}
    >
      <View style={styles.textContainer}>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Pressable 
        onPress={handleDismiss} 
        hitSlop={8} 
        style={styles.closeButton}
      >
        <Icon name="close" size={20} color={colors.dark.text.secondary} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.dark.alpha.warning10,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.alpha.warning20,
  },
  textContainer: {
    flex: 1,
  },
  description: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
});
