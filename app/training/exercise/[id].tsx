import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/Button';
import { useMenuStore } from '@/store/menu.store';
import { useTranslation } from 'react-i18next';

export default function ExerciseDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const addExercise = useMenuStore((state) => state.addExerciseToMenu);
  
  const handleAddToMenu = () => {
    addExercise({ id: Array.isArray(id) ? id[0] : id, name: 'ベンチプレス (Bench Press)' });
    router.back();
  };

  return (
    <ScrollView 
      contentInsetAdjustmentBehavior="automatic"
      style={styles.container}
    >
      <Stack.Screen options={{ title: t('exerciseDetail.title'), headerLargeTitle: false }} />
      
      <View style={styles.imagePlaceholder}>
        <Icon name="image-outline" size={48} color={colors.dark.text.tertiary} />
      </View>
      
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>
            ベンチプレス (Bench Press)
          </Text>
          <Text style={styles.category}>
            大胸筋 (Chest)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            Description
          </Text>
          <Text style={styles.description}>
            ベンチに仰向けになり、バーベルを胸 của 高さまで下ろしてから押し上げるトレーニングです。大胸筋を中心に、三角筋前部、上腕三頭筋を鍛えることができます。
          </Text>
        </View>

        <Button 
          label={t('exerciseDetail.addToMenu')} 
          iconName="add-circle"
          fullWidth
          style={styles.addButton}
          onPress={handleAddToMenu}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: colors.dark.bg.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
  },
  category: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.md,
    marginTop: spacing.xs,
  },
  section: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  sectionHeader: {
    color: colors.dark.text.primary,
    fontWeight: 'semibold',
    fontSize: typography.fontSize.md,
  },
  description: {
    color: colors.dark.text.secondary,
    lineHeight: typography.lineHeight.relaxed,
  },
  addButton: {
    marginTop: spacing.xl,
  },
});

