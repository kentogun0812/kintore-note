import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Summary', presentation: 'formSheet', headerShown: false }} />
      
      <View style={styles.header}>
        <Icon name="checkmark-circle" size={80} color={colors.dark.accent.success} />
        <Text style={styles.title}>
          Workout Complete
        </Text>
        <Text style={styles.subtitle}>
          Awesome job!
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Volume</Text>
          <Text style={styles.statValue}>{totalVolume} kg</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Sets</Text>
          <Text style={styles.statValue}>{totalSets}</Text>
        </View>
      </View>

      <Button 
        label="Stamp Hanko" 
        iconName="checkmark-done"
        fullWidth
        onPress={handleFinish}
        style={styles.finishButton}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
    padding: spacing.xl,
    paddingTop: spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  title: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'heavy',
    marginTop: spacing.lg,
  },
  subtitle: {
    color: colors.dark.text.secondary,
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing['3xl'],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statLabel: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  statValue: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    backgroundColor: colors.dark.border.subtle,
  },
  finishButton: {
    marginBottom: spacing.md,
  },
});

