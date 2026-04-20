import React from 'react';
import { View, ViewProps } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';

interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({ children, style, elevated = false, ...props }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: elevated ? colors.dark.bg.elevated : colors.dark.bg.secondary,
          borderRadius: radius.lg,
          padding: spacing.base,
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: colors.dark.border.subtle,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
