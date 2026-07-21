import React, { useState, useMemo } from 'react';
import { View, Text, SectionList, ActivityIndicator, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { ExerciseCard } from '@/components/ExerciseCard';
import { Icon, IconName } from '@/components/Icon';
import { SearchBar } from '@/components/SearchBar';
import { DismissibleBanner } from '@/components/DismissibleBanner';
import { ExerciseDetailModal, ExerciseDetailItem } from '@/components/ExerciseDetailModal';
import { ExerciseRepository } from '@/infra/repositories/exercise.repository';
import { useAuthStore } from '@/store/auth.store';
import { useWorkoutStore } from '@/store/workout.store';
import { useTrainingStore } from '@/store/training.store';

export default function ExerciseLibraryScreen() {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<ExerciseDetailItem | null>(null);

  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isSelectionMode = Boolean(mode);

  const { addExerciseToWorkout } = useWorkoutStore();
  const { addExercise } = useTrainingStore();

  const handleConfirmSelectExercise = (exerciseItem: ExerciseDetailItem) => {
    if (mode === 'session') {
      addExercise({ id: exerciseItem.id, name: exerciseItem.name_ja });
    } else {
      addExerciseToWorkout({ 
        id: exerciseItem.id, 
        name_ja: exerciseItem.name_ja, 
        name_en: exerciseItem.name_en 
      });
    }
    setSelectedExerciseForModal(null);
    router.back();
  };

  // Fetch exercises and muscle groups from SQLite
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['exercises_library'],
    queryFn: async () => {
      const userId = useAuthStore.getState().user?.id || 'guest';
      const exercises = ExerciseRepository.getAllExercises(userId);
      const muscleGroups = ExerciseRepository.getMuscleGroups(userId);
      return { exercises, muscleGroups };
    }
  });

  const muscleGroups = rawData?.muscleGroups || [];
  const exercises = rawData?.exercises || [];

  // Construct Category Tabs list
  const categories = useMemo(() => {
    const allTab = {
      id: 'all',
      name_ja: t('exerciseDetail.allCategories'),
      name_en: t('exerciseDetail.allCategories'),
    };
    return [allTab, ...muscleGroups];
  }, [muscleGroups, t]);

  // Group and format data for SectionList based on search and category tab
  const groupedData = useMemo(() => {
    if (!exercises) return [];

    const query = searchQuery.toLowerCase().trim();

    const filtered = exercises.filter(ex => {
      // Category tab filter
      if (selectedCategoryId !== 'all' && ex.muscle_group_id !== selectedCategoryId) {
        return false;
      }
      // Search query filter
      if (query) {
        const matchNameEn = ex.name_en.toLowerCase().includes(query);
        const matchNameJa = ex.name_ja.includes(query);
        const matchGroupEn = ex.muscle_groups?.name_en.toLowerCase().includes(query) || false;
        const matchGroupJa = ex.muscle_groups?.name_ja.includes(query) || false;
        return matchNameEn || matchNameJa || matchGroupEn || matchGroupJa;
      }
      return true;
    });

    const getIconForGroup = (groupNameEn: string = ''): IconName => {
      const g = groupNameEn.toLowerCase();
      if (g.includes('chest')) return 'body';
      if (g.includes('back')) return 'accessibility';
      if (g.includes('leg')) return 'walk';
      if (g.includes('core') || g.includes('abs')) return 'fitness';
      if (g.includes('shoulder')) return 'barbell';
      if (g.includes('arm') || g.includes('bicep') || g.includes('tricep')) return 'barbell';
      return 'barbell-outline';
    };

    const groups: Record<string, { title: string, order: number, data: ExerciseDetailItem[] }> = {};
    
    filtered.forEach(ex => {
      const mgId = ex.muscle_groups?.id || 'unknown';
      const mgSort = ex.muscle_groups?.sort_order || 999;
      const mgTitle = ex.muscle_groups 
        ? `${ex.muscle_groups.name_ja} (${ex.muscle_groups.name_en})` 
        : 'Other';
      
      if (!groups[mgId]) {
        groups[mgId] = { title: mgTitle, order: mgSort, data: [] };
      }
      
      groups[mgId].data.push({
        id: ex.id,
        name_ja: ex.name_ja,
        name_en: ex.name_en,
        muscle_group_ja: ex.muscle_groups?.name_ja,
        muscle_group_en: ex.muscle_groups?.name_en,
        muscleGroup: ex.muscle_groups ? (i18n.language === 'ja' ? ex.muscle_groups.name_ja : ex.muscle_groups.name_en) : 'Other',
        iconName: getIconForGroup(ex.muscle_groups?.name_en),
        details: ex.details,
      });
    });

    return Object.values(groups)
      .sort((a, b) => a.order - b.order)
      .map(group => ({ 
        title: group.title, 
        data: group.data.map(item => ({
          ...item,
          name: `${item.name_ja} (${item.name_en})`,
        })) 
      }));

  }, [exercises, searchQuery, selectedCategoryId, i18n.language]);

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
      
      <View style={styles.topContainer}>
        <DismissibleBanner
          bannerId="library"
          description={t('banners.libraryDesc')}
        />
        <View style={styles.searchBarWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('library.searchPlaceholder')}
          />
        </View>

        {/* Category Tab Panel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsContainer}
        >
          {categories.map(cat => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategoryId(cat.id)}
                style={[
                  styles.categoryTab,
                  isSelected && styles.categoryTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    isSelected && styles.categoryTabTextActive,
                  ]}
                >
                  {i18n.language === 'ja' ? cat.name_ja : cat.name_en}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.dark.accent.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>{t('library.loadError')}</Text>
          <Text style={styles.errorSubtitle}>
            {t('common.unknownError')}
          </Text>
        </View>
      ) : (
        <Animated.View 
          key={selectedCategoryId} 
          entering={FadeInUp.duration(200)}
          style={{ flex: 1 }}
        >
          <SectionList
            contentInsetAdjustmentBehavior="automatic"
            sections={groupedData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <ExerciseCard 
                  exercise={item} 
                  onPress={() => setSelectedExerciseForModal(item)} 
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
        </Animated.View>
      )}

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        visible={selectedExerciseForModal !== null}
        exercise={selectedExerciseForModal}
        isSelectionMode={isSelectionMode}
        onClose={() => setSelectedExerciseForModal(null)}
        onSelect={handleConfirmSelectExercise}
      />
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
  topContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
    backgroundColor: colors.dark.bg.primary,
    gap: spacing.md,
  },
  searchBarWrapper: {
    width: '100%',
  },
  categoryTabsContainer: {
    gap: spacing.sm,
    paddingRight: spacing.base,
    paddingVertical: spacing.xs,
  },
  categoryTab: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.dark.bg.secondary,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  categoryTabActive: {
    backgroundColor: colors.dark.accent.primary + '20',
    borderColor: colors.dark.accent.primary,
  },
  categoryTabText: {
    fontSize: typography.fontSize.base,
    color: colors.dark.text.secondary,
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: colors.dark.accent.primary,
    fontWeight: 'bold',
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
