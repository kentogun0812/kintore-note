import React from 'react';
import { Pressable, Text, View, PressableProps, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon, IconName } from '@/components/Icon';
import * as Haptics from 'expo-haptics';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  iconName?: IconName;
  iconPosition?: 'left' | 'right';
  textStyle?: StyleProp<TextStyle>;
}

export function Button({ 
  label, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  iconName,
  iconPosition = 'left',
  style,
  textStyle,
  onPress,
  ...props 
}: ButtonProps) {
  
  const getBackgroundColor = (pressed: boolean) => {
    switch (variant) {
      case 'primary': return pressed ? colors.dark.button.primaryPressed : colors.dark.button.primary;
      case 'secondary': return pressed ? colors.dark.bg.elevated : colors.dark.bg.secondary;
      case 'outline': return pressed ? colors.dark.bg.secondary : 'transparent';
      case 'ghost': return pressed ? colors.dark.bg.secondary : 'transparent';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary': return colors.white;
      case 'secondary': return colors.dark.text.primary;
      case 'outline': return colors.dark.text.primary;
      case 'ghost': return colors.dark.text.primary;
    }
  };

  const getHeight = () => {
    switch (size) {
      case 'sm': return 36;
      case 'md': return 48;
      case 'lg': return 56;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'md': return 20;
      case 'lg': return 22;
    }
  };

  const handlePress = (e: any) => {
    if (props.disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress(e);
  };

  const iconElement = iconName ? (
    <Icon name={iconName} size={getIconSize()} color={getTextColor()} />
  ) : null;

  return (
    <Pressable
      onPress={handlePress}
      style={(state) => [
        styles.base,
        {
          height: getHeight(),
          backgroundColor: getBackgroundColor(state.pressed),
          width: fullWidth ? '100%' : 'auto',
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: variant === 'outline' ? colors.dark.border.default : 'transparent',
          opacity: props.disabled ? 0.5 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      {iconPosition === 'left' && iconElement}
      <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
        {label}
      </Text>
      {iconPosition === 'right' && iconElement}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    borderCurve: 'continuous',
  },
  text: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});

