import React, { useCallback } from 'react';
import { View, Text, Pressable, Animated, TouchableOpacity } from 'react-native';
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
import { ExercisePicker } from '@/features/training/components/ExercisePicker';

export default function SessionScreen() {
  const {
    // States
    exercises,
    isEditingTemplate,
    focusedInput,
    restLeft,
    restTotal,
    showSaveTemplateModal,
    templateName,
    showTimerPresets,
    selectedRestIndex,
    allExercisesDone,
    // Refs & Animations
    pan,
    scrollY,
    timerAnimation,
    panResponder,
    // State Setters
    setIsEditingTemplate,
    setFocusedInput,
    setShowSaveTemplateModal,
    setTemplateName,
    setShowTimerPresets,
    setSelectedRestIndex,
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
    handleConfirmTemplate,
    handleConfirmSaveTemplate,
    handleFinishSession,
    picker,
    t,
    i18n,
    width,
  } = useActiveSession();

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
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={{ flex: 1 }}>
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
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">{t('session.title')}</Text>
          <View style={styles.headerRight} />
        </View>

        {isEditingTemplate ? (
          <>
            <ExercisePicker picker={picker} />
            {/* Sticky Submit Button */}
            {picker.selectedExerciseIds.length > 0 && (
              <View style={styles.submitButtonContainer}>
                <Button
                  label={exercises.length > 0
                    ? t('session.saveWorkoutTemplate')
                    : t('session.createWorkoutTemplate')}
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
              style={[styles.globalAddExerciseBtn, { marginHorizontal: spacing.base, marginTop: spacing.base, marginBottom: 10, zIndex: 10 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setIsEditingTemplate(true);
              }}
            >
              <Ionicons name="add" size={20} color={colors.dark.text.primary} style={{ marginRight: spacing.xs }} />
              <Text style={styles.globalAddExerciseText}>
                {t('session.addExercise')}
              </Text>
            </Pressable>
            <DraggableFlatList
              data={exercises}
              keyExtractor={(item) => item.id}
              onDragEnd={({ data }) => updateExercises(data)}
              renderItem={renderItem}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.base }]}
              containerStyle={{ flex: 1 }}
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {!isEditingTemplate && exercises.length > 0 && (
          <View style={styles.submitButtonContainer}>
            <Button
              label={t('session.finish')}
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
          visible={picker.showCreateCustomMGModal}
          onRequestClose={() => picker.setShowCreateCustomMGModal(false)}
          newMGNameJa={picker.newMGNameJa}
          setNewMGNameJa={picker.setNewMGNameJa}
          newMGNameEn={picker.newMGNameEn}
          setNewMGNameEn={picker.setNewMGNameEn}
          handleCreateCustomMuscleGroup={picker.handleCreateCustomMuscleGroup}
          t={t}
        />

        <CreateCustomExerciseModal
          visible={picker.showCreateCustomExerciseModal}
          onRequestClose={() => picker.setShowCreateCustomExerciseModal(false)}
          newExNameJa={picker.newExNameJa}
          setNewExNameJa={picker.setNewExNameJa}
          newExNameEn={picker.newExNameEn}
          setNewExNameEn={picker.setNewExNameEn}
          newExMGId={picker.newExMGId}
          setNewExMGId={picker.setNewExMGId}
          allMuscleGroups={picker.allMuscleGroups}
          selectedMuscleGroupId={picker.selectedMuscleGroupId}
          handleCreateCustomExercise={picker.handleCreateCustomExercise}
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

        {picker.toastMessage && (
          <View style={styles.toastContainer}>
            <Icon name="alert-circle-outline" size={20} color={colors.dark.accent.warning} />
            <Text style={styles.toastText}>{picker.toastMessage}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}




