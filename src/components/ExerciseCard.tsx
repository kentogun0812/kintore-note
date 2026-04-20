import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/Icon';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Link } from 'expo-router';

export interface ExerciseProps {
  id: string;
  name: string;
  muscleGroup: string;
  thumbnailUrl?: string;
  iconName?: any;
}

export function ExerciseCard({ exercise, onPress }: { exercise: ExerciseProps, onPress?: () => void }) {
  const content = (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: pressed ? colors.dark.bg.elevated : colors.dark.bg.secondary,
          padding: spacing.md,
          borderRadius: radius.md,
          gap: spacing.md,
          borderCurve: 'continuous',
        }
      ]}
    >
      <View style={{ width: 60, height: 60, borderRadius: radius.sm, backgroundColor: colors.dark.bg.tertiary, justifyContent: 'center', alignItems: 'center' }}>
        {exercise.thumbnailUrl ? (
          <Image 
            source={{ uri: exercise.thumbnailUrl }} 
            style={{ width: '100%', height: '100%', borderRadius: radius.sm }} 
            contentFit="cover" 
          />
        ) : (
          <Icon name={exercise.iconName || "barbell"} size={28} color={colors.dark.text.secondary} />
        )}
      </View>
      
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize.base, fontWeight: 'bold' }}>
          {exercise.name}
        </Text>
        <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.sm }}>
          {exercise.muscleGroup}
        </Text>
      </View>
      
      <Icon name="chevron-forward" size={16} color={colors.dark.text.tertiary} />
    </Pressable>
  );

  if (onPress) {
         return content;
     }

  return (
    <Link href={`/training/exercise/${exercise.id}`} asChild>
        {content}
    </Link>
  );
}
