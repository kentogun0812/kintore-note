import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/Button';
import { useMenuStore } from '@/store/menu.store';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const addExercise = useMenuStore((state) => state.addExerciseToMenu);
  
  // In a real app we'd fetch the exercise details using the ID from WatermelonDB or Supabase.
  
  const handleAddToMenu = () => {
    addExercise({ id: Array.isArray(id) ? id[0] : id, name: 'ベンチプレス (Bench Press)' });
    router.back();
  };

  return (
    <ScrollView 
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.dark.bg.primary }}
    >
      <Stack.Screen options={{ title: 'Details', headerLargeTitle: false }} />
      
      <View style={{ width: '100%', aspectRatio: 16/9, backgroundColor: colors.dark.bg.elevated, justifyContent: 'center', alignItems: 'center' }}>
        <Icon name="image-outline" size={48} color={colors.dark.text.tertiary} />
      </View>
      
      <View style={{ padding: spacing.xl, gap: spacing.md }}>
        <View>
          <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize.xl, fontWeight: 'bold' }}>
            ベンチプレス (Bench Press)
          </Text>
          <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.md, marginTop: spacing.xs }}>
            大胸筋 (Chest)
          </Text>
        </View>

        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <Text style={{ color: colors.dark.text.primary, fontWeight: 'semibold', fontSize: typography.fontSize.md }}>
            Description
          </Text>
          <Text style={{ color: colors.dark.text.secondary, lineHeight: typography.lineHeight.relaxed }}>
            ベンチに仰向けになり、バーベルを胸の高さまで下ろしてから押し上げるトレーニングです。大胸筋を中心に、三角筋前部、上腕三頭筋を鍛えることができます。
          </Text>
        </View>

        <Button 
          label="Add to Menu" 
          iconName="add-circle"
          fullWidth
          style={{ marginTop: spacing.xl }}
          onPress={handleAddToMenu}
        />
      </View>
    </ScrollView>
  );
}
