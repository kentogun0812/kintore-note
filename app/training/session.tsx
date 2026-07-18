import React, { useCallback } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator, Animated, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import * as Haptics from 'expo-haptics';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { Ionicons } from '@expo/vector-icons';
import { useActiveSession } from '@/features/training/hooks/use-active-session';
import { ActiveTimerOverlay } from '@/features/training/components/ActiveTimerOverlay';
import { CreateCustomMGModal } from '@/features/training/components/CreateCustomMGModal';
import { CreateCustomExerciseModal } from '@/features/training/components/CreateCustomExerciseModal';
import { SaveWorkoutTemplateModal } from '@/features/training/components/SaveWorkoutTemplateModal';
import { styles } from '@/features/training/session.styles';
import { ExerciseSection } from '@/features/training/components/ExerciseSection';
import { MuscleGroupIcon } from '@/components/MuscleGroupIcon';

export default function SessionScreen() {
  const {
    // States
    exercises,
    isEditingTemplate,
    selectedExerciseIds,
    selectedMuscleGroupId,
    focusedInput,
    restLeft,
    restTotal,
    toastMessage,
    showCreateCustomMGModal,
    showCreateCustomExerciseModal,
    showSaveTemplateModal,
    templateName,
    showTimerPresets,
    selectedRestIndex,
    newMGNameJa,
    newMGNameEn,
    newExNameJa,
    newExNameEn,
    newExMGId,
    allMuscleGroups,
    filteredExercises,
    allExercisesDone,
    isLoading,
    error,
    // Refs & Animations
    pan,
    scrollY,
    timerAnimation,
    panResponder,
    // State Setters
    setIsEditingTemplate,
    setSelectedMuscleGroupId,
    setFocusedInput,
    setShowCreateCustomMGModal,
    setShowCreateCustomExerciseModal,
    setShowSaveTemplateModal,
    setTemplateName,
    setShowTimerPresets,
    setSelectedRestIndex,
    setNewMGNameJa,
    setNewMGNameEn,
    setNewExNameJa,
    setNewExNameEn,
    setNewExMGId,
    // Actions
    addSet,
    removeSet,
    updateSet,
    removeExercise,
    updateExercises,
    startRest,
    cancelRest,
    formatRest,
    handleToggleExercise,
    handleToggleSelectExercise,
    handleConfirmTemplate,
    handleCreateCustomMuscleGroup,
    handleCreateCustomExercise,
    handleDeleteCustomMuscleGroup,
    handleDeleteCustomExercise,
    getMuscleGroupColor,
    handleConfirmSaveTemplate,
    handleFinishSession,
    t,
    i18n,
    width,
  } = useActiveSession();

  // Calculate dynamic width for muscle group items to ensure perfect fit across all devices
  const gridContainerWidth = width - (spacing.base * 2 + spacing.md * 2);
  const minItemWidth = 90;
  const gridGap = spacing.sm;
  const numColumns = Math.max(2, Math.floor((gridContainerWidth + gridGap) / (minItemWidth + gridGap)));
  const itemWidth = (gridContainerWidth - (numColumns - 1) * gridGap) / numColumns;

  const renderItem = useCallback(({ item: ex, drag, isActive }: RenderItemParams<any>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={drag}
          delayLongPress={300}
          disabled={isActive}
          style={{ flex: 1 }}
        >
          <ExerciseSection
            ex={ex}
            drag={drag || (() => { })}
            isActive={isActive || false}
            focusedInput={focusedInput}
            setFocusedInput={setFocusedInput}
            updateSet={updateSet}
            addSet={addSet}
            removeSet={removeSet}
            handleToggleExercise={handleToggleExercise}
            removeExercise={removeExercise}
            t={t}
          />
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }, [focusedInput, handleToggleExercise, t, addSet, removeSet, updateSet, removeExercise]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Stack.Screen
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />

        <View style={styles.customHeader}>
          <Pressable
            onPress={() => {
              if (isEditingTemplate && exercises.length > 0) {
                setIsEditingTemplate(false);
              } else {
                router.back();
              }
            }}
            hitSlop={8}
            style={styles.headerBackButton}
          >
            <Icon name="chevron-back" size={24} color={colors.dark.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>{t('session.title')}</Text>
          <View style={styles.headerRight} />
        </View>

        {isEditingTemplate ? (
          <>
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
                                <MuscleGroupIcon
                                  id={mg.id}
                                  size={20}
                                  color={isSelected ? colors.white : colors.dark.text.primary}
                                />
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
                        renderItem={({ item }) => {
                          const name = i18n.language === 'ja' ? item.name_ja : item.name_en;
                          const isChecked = selectedExerciseIds.includes(item.id);
                          return (
                            <Pressable
                              style={[
                                styles.exerciseSelectItem,
                                isChecked && styles.exerciseSelectItemChecked
                              ]}
                              onPress={() => handleToggleSelectExercise(item.id)}
                            >
                              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={[styles.exerciseSelectName, { flexShrink: 1 }]}>{name}</Text>
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
                        bounces={false}
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

            {/* Sticky Submit Button */}
            {selectedExerciseIds.length > 0 && (
              <View style={styles.submitButtonContainer}>
                <Button
                  label={exercises.length > 0
                    ? t('session.saveWorkoutTemplate')
                    : t('session.createWorkoutTemplate')}
                  iconName="checkmark-done"
                  fullWidth
                  onPress={handleConfirmTemplate}
                />
                {exercises.length > 0 && (
                  <Pressable onPress={() => setIsEditingTemplate(false)} style={styles.cancelEditBtn}>
                    <Text style={styles.cancelEditText}>{t('common.cancel')}</Text>
                  </Pressable>
                )}
              </View>
            )}
          </>
        ) : (
          <View style={{ flex: 1 }}>
            <Pressable
              style={[styles.globalAddExerciseBtn, { marginHorizontal: spacing.base, marginTop: spacing.base, marginBottom: 0, zIndex: 10 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setIsEditingTemplate(true);
              }}
            >
              <Ionicons name="pencil-sharp" size={18} color={colors.dark.text.primary} style={{ marginRight: spacing.xs }} />
              <Text style={styles.globalAddExerciseText}>
                {t('session.editWorkoutTemplate')}
              </Text>
            </Pressable>
            <DraggableFlatList
              data={exercises}
              keyExtractor={(item) => item.id}
              onDragEnd={({ data }) => updateExercises(data)}
              renderItem={renderItem}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
              containerStyle={{ flex: 1 }}
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              bounces={false}
            />
          </View>
        )}

        {!isEditingTemplate && exercises.length > 0 && (
          <View style={styles.submitButtonContainer}>
            <Button
              label={t('session.finish')}
              iconName="checkmark-done"
              fullWidth
              onPress={handleFinishSession}
              style={!allExercisesDone && { opacity: 0.4 }}
            />
          </View>
        )}

        {/* Floating Timer Bubble */}
        {!isEditingTemplate && exercises.length > 0 && restLeft === 0 && !showTimerPresets && (
          <Animated.View
            {...panResponder.panHandlers}
            style={[styles.floatingBubble, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
          >
            <Pressable
              style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
              onPress={() => setShowTimerPresets(true)}
            >
              <Icon name="timer-outline" size={32} color={colors.white} />
            </Pressable>
          </Animated.View>
        )}

        {/* Extracted Modals & Overlays */}
        <ActiveTimerOverlay
          restLeft={restLeft}
          restTotal={restTotal}
          showTimerPresets={showTimerPresets}
          setShowTimerPresets={setShowTimerPresets}
          selectedRestIndex={selectedRestIndex}
          setSelectedRestIndex={setSelectedRestIndex}
          startRest={startRest}
          cancelRest={cancelRest}
          formatRest={formatRest}
          scrollY={scrollY}
          timerAnimation={timerAnimation}
          t={t}
        />

        <CreateCustomMGModal
          visible={showCreateCustomMGModal}
          onRequestClose={() => setShowCreateCustomMGModal(false)}
          newMGNameJa={newMGNameJa}
          setNewMGNameJa={setNewMGNameJa}
          newMGNameEn={newMGNameEn}
          setNewMGNameEn={setNewMGNameEn}
          handleCreateCustomMuscleGroup={handleCreateCustomMuscleGroup}
          t={t}
        />

        <CreateCustomExerciseModal
          visible={showCreateCustomExerciseModal}
          onRequestClose={() => setShowCreateCustomExerciseModal(false)}
          newExNameJa={newExNameJa}
          setNewExNameJa={setNewExNameJa}
          newExNameEn={newExNameEn}
          setNewExNameEn={setNewExNameEn}
          newExMGId={newExMGId}
          setNewExMGId={setNewExMGId}
          allMuscleGroups={allMuscleGroups}
          selectedMuscleGroupId={selectedMuscleGroupId}
          handleCreateCustomExercise={handleCreateCustomExercise}
          t={t}
          i18n={i18n}
        />

        <SaveWorkoutTemplateModal
          visible={showSaveTemplateModal}
          onRequestClose={() => setShowSaveTemplateModal(false)}
          templateName={templateName}
          setTemplateName={setTemplateName}
          onSave={handleConfirmSaveTemplate}
          t={t}
        />

        {toastMessage && (
          <View style={styles.toastContainer}>
            <Icon name="alert-circle-outline" size={20} color={colors.dark.accent.warning} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}




