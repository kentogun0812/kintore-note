import React, { useState, useMemo } from 'react';
import { View, Text, SectionList, TextInput, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { ExerciseCard } from '@/components/ExerciseCard';
import { Icon } from '@/components/Icon';
import { ExerciseRepository } from '@/infra/repositories/exercise.repository';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { useWorkoutStore } from '@/store/workout.store';
import { useTranslation } from 'react-i18next';
import { DismissibleBanner } from '@/components/DismissibleBanner';

import { useLocalSearchParams } from 'expo-router';
import { useTrainingStore } from '@/store/training.store';
import { DEFAULT_EXERCISES, DEFAULT_MUSCLE_GROUPS } from '@/constants/defaultExercises';

// Interface matching the joined query result
interface ExerciseRow {
  id: string;
  name_en: string;
  name_ja: string;
  muscle_groups: {
    id: string;
    name_en: string;
    name_ja: string;
    sort_order: number;
  };
}

export default function ExerciseLibraryScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { addExerciseToWorkout } = useWorkoutStore();
  const { addExercise } = useTrainingStore();

  const handleSelectExercise = (exerciseId: string, exerciseNameJa: string, exerciseNameEn: string, exerciseName: string) => {
    if (mode === 'session') {
      addExercise({ id: exerciseId, name: exerciseName });
    } else {
      addExerciseToWorkout({ id: exerciseId, name_ja: exerciseNameJa, name_en: exerciseNameEn });
    }
    router.back();
  };

  // Fetch exercises and their muscle groups from SQLite
  const { data: exercises, isLoading, error } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const userId = useAuthStore.getState().user?.id || 'guest';
      return ExerciseRepository.getAllExercises(userId);
    }
  });

  // Group and format data for SectionList
  const groupedData = useMemo(() => {
    if (!exercises) return [];

    const filtered = exercises.filter(ex => {
      const query = searchQuery.toLowerCase();
      return ex.name_en.toLowerCase().includes(query) || 
             ex.name_ja.includes(query) ||
             ex.muscle_groups?.name_en.toLowerCase().includes(query);
    });

    const getIconForGroup = (groupNameEn: string = '') => {
      const g = groupNameEn.toLowerCase();
      if (g.includes('chest')) return 'body';
      if (g.includes('back')) return 'accessibility';
      if (g.includes('leg')) return 'walk';
      if (g.includes('core') || g.includes('abs')) return 'fitness';
      if (g.includes('shoulder')) return 'barbell';
      if (g.includes('arm') || g.includes('bicep') || g.includes('tricep')) return 'barbell';
      return 'barbell-outline';
    };

    const groups: Record<string, { title: string, order: number, data: any[] }> = {};
    
    filtered.forEach(ex => {
      const mgId = ex.muscle_groups?.id || 'unknown';
      const mgSort = ex.muscle_groups?.sort_order || 999;
      const mgTitle = ex.muscle_groups ? `${ex.muscle_groups.name_ja} (${ex.muscle_groups.name_en})` : 'Other';
      
      if (!groups[mgId]) {
        groups[mgId] = { title: mgTitle, order: mgSort, data: [] };
      }
      
      groups[mgId].data.push({
        id: ex.id,
        name: `${ex.name_ja} (${ex.name_en})`,
        name_ja: ex.name_ja,
        name_en: ex.name_en,
        muscleGroup: ex.muscle_groups?.name_ja || 'Other',
        iconName: getIconForGroup(ex.muscle_groups?.name_en)
      });
    });

    return Object.values(groups)
      .sort((a, b) => a.order - b.order)
      .map(group => ({ title: group.title, data: group.data }));

  }, [exercises, searchQuery]);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: t('library.title'), 
          headerLargeTitle: false,
          headerTitleAlign: 'center',
          headerBackVisible: true,
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              hitSlop={8} 
              style={styles.headerBackButton}
            >
              <Icon name="chevron-back" size={20} color={colors.dark.text.primary} />
            </Pressable>
          ),
        }} 
      />
      
      <View style={styles.searchContainer}>
        <DismissibleBanner
          bannerId="library"
          description={t('banners.libraryDesc')}
        />
        <View style={styles.searchBar}>
          <Icon name="search" size={16} color={colors.dark.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('library.searchPlaceholder')}
            placeholderTextColor={colors.dark.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.dark.accent.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>{t('library.loadError')}</Text>
          <Text style={styles.errorSubtitle}>
            {error instanceof Error ? error.message : JSON.stringify(error)}
          </Text>
        </View>
      ) : (
        <SectionList
          contentInsetAdjustmentBehavior="automatic"
          sections={groupedData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <ExerciseCard 
                exercise={item} 
                onPress={() => handleSelectExercise(item.id, item.name_ja, item.name_en, item.name)} 
              />
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('library.noResults')}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  headerBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  searchContainer: {
    padding: spacing.base,
    backgroundColor: colors.dark.bg.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.bg.elevated,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: colors.dark.text.primary,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.base,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    color: colors.dark.accent.primary,
    textAlign: 'center',
  },
  errorSubtitle: {
    color: colors.dark.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  itemContainer: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
  },
  sectionHeader: {
    backgroundColor: colors.dark.bg.primary,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.subtle,
  },
  sectionTitle: {
    color: colors.dark.text.primary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.md,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.dark.text.secondary,
  },
});

