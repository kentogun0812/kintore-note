import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useTrainingStore } from '@/store/training.store';

export default function SessionSummaryModal() {
  const { exercises, endSession } = useTrainingStore();
  
  // Calculate total volume (weight * reps) across all completed sets
  let totalVolume = 0;
  let totalSets = 0;
  
  exercises.forEach(ex => {
    ex.sets.forEach(set => {
      if (set.completed) {
        totalSets++;
        const weight = parseFloat(set.weight) || 0;
        const reps = parseInt(set.reps, 10) || 0;
        totalVolume += weight * reps;
      }
    });
  });

  const handleFinish = () => {
    endSession();
    router.replace('/modals/hanko-stamp');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.dark.bg.primary, padding: spacing.xl, paddingTop: spacing['3xl'] }}>
      <Stack.Screen options={{ title: 'Summary', presentation: 'formSheet', headerShown: false }} />
      
      <View style={{ alignItems: 'center', marginBottom: spacing['3xl'] }}>
        <Icon name="checkmark-circle" size={80} color={colors.dark.accent.success} />
        <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize['2xl'], fontWeight: 'heavy', marginTop: spacing.lg }}>
          Workout Complete
        </Text>
        <Text style={{ color: colors.dark.text.secondary, marginTop: spacing.xs }}>
          Awesome job!
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing['3xl'] }}>
        <View style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
          <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.sm }}>Total Volume</Text>
          <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize.xl, fontWeight: 'bold' }}>{totalVolume} kg</Text>
        </View>
        <View style={{ width: 1, backgroundColor: colors.dark.border.subtle }} />
        <View style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
          <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.sm }}>Total Sets</Text>
          <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize.xl, fontWeight: 'bold' }}>{totalSets}</Text>
        </View>
      </View>

      <Button 
        label="Stamp Hanko" 
        iconName="checkmark-done"
        fullWidth
        onPress={handleFinish}
        style={{ marginBottom: spacing.md }}
      />
      <Button 
        label="Done" 
        variant="secondary"
        fullWidth
        onPress={() => {
          endSession();
          router.dismissAll();
          router.replace('/(tabs)/home');
        }}
      />
    </View>
  );
}
