import React, { useCallback } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { styles } from '@/features/training/session.styles';
import { useExercisePicker } from '@/features/training/hooks/use-exercise-picker';
import { EXERCISE_MEDIA } from '@/constants/exerciseMedia';

interface ExercisePickerProps {
  picker: ReturnType<typeof useExercisePicker>;
}

export function ExercisePicker({ picker }: ExercisePickerProps) {
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const gridContainerWidth = width - (spacing.base * 2 + spacing.md * 2);
  const minItemWidth = 90;
  const gridGap = spacing.sm;
  const numColumns = Math.max(2, Math.floor((gridContainerWidth + gridGap) / (minItemWidth + gridGap)));
  const itemWidth = (gridContainerWidth - (numColumns - 1) * gridGap) / numColumns;

  const {
    isLoading, error, allMuscleGroups, selectedMuscleGroupId,
    setSelectedMuscleGroupId, setShowCreateCustomMGModal,
    handleDeleteCustomMuscleGroup, filteredExercises,
    selectedExerciseIds, handleToggleSelectExercise,
    handleDeleteCustomExercise, setShowCreateCustomExerciseModal
  } = picker;

  const getMuscleGroupColor = useCallback((id: string) => {
    switch (id) {
      case 'mg-chest':
        return { bg: 'rgba(229, 77, 66, 0.12)', selectedBg: 'rgba(229, 77, 66, 0.35)', border: 'rgba(229, 77, 66, 0.6)' };
      case 'mg-back':
        return { bg: 'rgba(10, 132, 255, 0.12)', selectedBg: 'rgba(10, 132, 255, 0.35)', border: 'rgba(10, 132, 255, 0.6)' };
      case 'mg-shoulders':
        return { bg: 'rgba(255, 159, 10, 0.12)', selectedBg: 'rgba(255, 159, 10, 0.35)', border: 'rgba(255, 159, 10, 0.6)' };
      case 'mg-arms':
        return { bg: 'rgba(191, 90, 242, 0.12)', selectedBg: 'rgba(191, 90, 242, 0.35)', border: 'rgba(191, 90, 242, 0.6)' };
      case 'mg-core':
        return { bg: 'rgba(48, 209, 88, 0.12)', selectedBg: 'rgba(48, 209, 88, 0.35)', border: 'rgba(48, 209, 88, 0.6)' };
      case 'mg-legs':
        return { bg: 'rgba(255, 69, 58, 0.12)', selectedBg: 'rgba(255, 69, 58, 0.35)', border: 'rgba(255, 69, 58, 0.6)' };
      case 'mg-cardio':
        return { bg: 'rgba(50, 173, 230, 0.12)', selectedBg: 'rgba(50, 173, 230, 0.35)', border: 'rgba(50, 173, 230, 0.6)' };
      default:
        return { bg: 'rgba(142, 142, 147, 0.12)', selectedBg: 'rgba(142, 142, 147, 0.35)', border: 'rgba(142, 142, 147, 0.6)' };
    }
  }, []);

  return (
    <View style={styles.selectionContainer}>
      <Text style={styles.selectionTitle}>
        {t('session.selectMuscleGroup')}
      </Text>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.dark.accent.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={{ color: colors.dark.text.secondary }}>
            {t('library.loadError')}
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Muscle Groups Section */}
          <View style={styles.muscleGroupsSection}>
            <View style={styles.muscleGroupGrid}>
              {allMuscleGroups.map(mg => {
                if (mg.id === 'mg-other') {
                  return (
                    <View key={mg.id} style={[styles.muscleGroupItemWrapper, { width: itemWidth }]}>
                      <Pressable
                        style={[
                          styles.muscleGroupItem,
                          {
                            backgroundColor: colors.dark.bg.tertiary,
                            borderColor: colors.dark.border.subtle,
                            borderStyle: 'dashed'
                          }
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setShowCreateCustomMGModal(true);
                        }}
                      >
                        <Ionicons name="add" size={24} color={colors.dark.text.secondary} />
                      </Pressable>
                    </View>
                  );
                }

                const isSelected = selectedMuscleGroupId === mg.id;
                const softColor = getMuscleGroupColor(mg.id);
                return (
                  <View key={mg.id} style={[styles.muscleGroupItemWrapper, { width: itemWidth }]}>
                    <Pressable
                      style={[
                        styles.muscleGroupItem,
                        {
                          backgroundColor: isSelected ? softColor.selectedBg : softColor.bg,
                          borderColor: isSelected ? softColor.border : colors.dark.border.subtle
                        }
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedMuscleGroupId(mg.id);
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[
                          styles.muscleGroupText,
                          { color: isSelected ? colors.white : colors.dark.text.primary }
                        ]}>
                          {i18n.language === 'ja' ? mg.name_ja : mg.name_en}
                        </Text>
                      </View>
                      {mg.id.startsWith('mg-custom') && (
                        <Pressable
                          onPress={() => handleDeleteCustomMuscleGroup(mg.id)}
                          hitSlop={15}
                          style={styles.deleteBadge}
                        >
                          <Ionicons name="close" size={12} color={colors.white} />
                        </Pressable>
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Selected Muscle Group's Exercises List */}
          {selectedMuscleGroupId ? (
            <View style={{ flex: 1, marginTop: spacing.md }}>
              <View style={styles.exercisesHeaderRow}>
                <Text style={styles.exercisesListTitle}>
                  {t('session.exercises')}
                </Text>
              </View>

              <FlatList
                data={filteredExercises}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const name = i18n.language === 'ja' ? item.name_ja : item.name_en;
                  const isChecked = selectedExerciseIds.includes(item.id);
                  const media = EXERCISE_MEDIA[item.id];
                  const thumbnailUrl = media?.image;

                  return (
                    <Pressable
                      style={[
                        styles.exerciseSelectItem,
                        isChecked && styles.exerciseSelectItemChecked
                      ]}
                      onPress={() => handleToggleSelectExercise(item.id)}
                    >
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={styles.thumbnailContainer}>
                          {thumbnailUrl ? (
                            <Image
                              source={thumbnailUrl}
                              style={styles.thumbnail}
                              contentFit="cover"
                            />
                          ) : (
                            <Ionicons name="barbell-outline" size={20} color={colors.dark.text.tertiary} />
                          )}
                        </View>
                        <Text style={[styles.exerciseSelectName, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">
                          {name}
                        </Text>
                        {item.id.startsWith('ex-custom') && (
                          <Pressable onPress={() => handleDeleteCustomExercise(item.id)} hitSlop={12} style={{ padding: 4 }}>
                            <Ionicons name="close-circle" size={20} color={colors.dark.accent.warning} />
                          </Pressable>
                        )}
                      </View>
                      <View style={[
                        styles.checkboxCircle,
                        isChecked && styles.checkboxCircleChecked
                      ]}>
                        {isChecked && <Ionicons name="checkmark" size={14} color={colors.white} />}
                      </View>
                    </Pressable>
                  );
                }}
                contentContainerStyle={styles.selectListContent}
                style={{ flex: 1 }}
                ListEmptyComponent={
                  <View style={styles.emptyExercisesContainer}>
                    <Text style={styles.emptyExercisesText}>
                      {t('session.noExercisesCreate')}
                    </Text>
                  </View>
                }
                ListFooterComponent={
                  <Pressable
                    style={[
                      styles.exerciseSelectItem,
                      {
                        justifyContent: 'center',
                        backgroundColor: colors.dark.bg.tertiary,
                        borderStyle: 'dashed',
                        marginTop: 0,
                        marginBottom: spacing.md
                      }
                    ]}
                    onPress={() => setShowCreateCustomExerciseModal(true)}
                  >
                    <Ionicons name="add" size={24} color={colors.dark.text.primary} />
                  </Pressable>
                }
              />
            </View>
          ) : (
            <View style={styles.emptyExercisesContainer}>
              <Text style={styles.emptyExercisesText}>
                {t('session.selectMuscleGroupView')}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
