import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Animated, PanResponder, useWindowDimensions, Alert, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useTrainingStore } from '@/store/training.store';
import { useAuthStore } from '@/store/auth.store';
import { useWorkoutStore } from '@/store/workout.store';
import { ExerciseRepository } from '@/infra/repositories/exercise.repository';
import { WorkoutTemplateRepository } from '@/infra/repositories/workout-template.repository';
import { useExercisePicker } from '@/features/training/hooks/use-exercise-picker';
import { DEFAULT_EXERCISES, DEFAULT_MUSCLE_GROUPS } from '@/constants/defaultExercises';
import { AppErrorHandler, ValidationError, BusinessError } from '@/lib/error-handler';

const dangerousCharsRegex = /[<>"';\\\{\}\[\]]/;

export const PRESET_TIMES = [30, 45, 60, 90, 120, 150, 180, 240, 300];
export const ITEM_HEIGHT = 44;

export function useActiveSession() {
  const { width, height } = useWindowDimensions();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const {
    exercises,
    updateExercises,
    addSet,
    removeSet,
    updateSet,
    toggleSetComplete,
    toggleExerciseComplete,
    removeExercise,
    addExercise,
    saveActiveSession,
    endSession
  } = useTrainingStore();

  // Layout & selection state
  const [isEditingTemplate, setIsEditingTemplate] = useState(exercises.length === 0);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [restLeft, setRestLeft] = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal visibility states
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showTimerPresets, setShowTimerPresets] = useState(false);
  const [selectedRestIndex, setSelectedRestIndex] = useState(2);

  const pan = useRef(new Animated.ValueXY()).current;
  const scrollY = useRef(new Animated.Value(2 * ITEM_HEIGHT)).current;
  const timerAnimation = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gestureState) => {
        const minX = -(width - 96);
        const maxX = 0;
        const minY = -(height - 200); 
        const maxY = 180;

        const offsetX = (pan.x as any)._offset;
        const offsetY = (pan.y as any)._offset;

        let nextX = gestureState.dx;
        let nextY = gestureState.dy;

        if (offsetX + nextX < minX) nextX = minX - offsetX;
        if (offsetX + nextX > maxX) nextX = maxX - offsetX;
        if (offsetY + nextY < minY) nextY = minY - offsetY;
        if (offsetY + nextY > maxY) nextY = maxY - offsetY;

        pan.setValue({ x: nextX, y: nextY });
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        
        // Always snap back to the right edge
        Animated.spring(pan.x, {
          toValue: 0,
          useNativeDriver: false,
          friction: 7,
          tension: 20
        }).start();
      }
    })
  ).current;

  const picker = useExercisePicker(exercises.map(ex => ex.exerciseId));

  // Sync selected exercise IDs when editing is opened or when exercises list in store updates
  useEffect(() => {
    if (isEditingTemplate) {
      picker.setSelectedExerciseIds(exercises.map(ex => ex.exerciseId));
    }
  }, [isEditingTemplate, exercises]);

  // Sync countdown logic
  useEffect(() => {
    let interval: any;
    if (restLeft > 0) {
      interval = setInterval(() => {
        setRestLeft(prev => {
          if (prev <= 1) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restLeft]);

  // Sync toast message auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const startRest = useCallback((seconds: number) => {
    setRestLeft(seconds);
    setRestTotal(seconds);
    timerAnimation.setValue(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [timerAnimation]);

  // Sync animation exactly with the countdown state to prevent drift
  useEffect(() => {
    if (restLeft > 0 && restTotal > 0) {
      const targetValue = 1 - (restLeft - 1) / restTotal;
      Animated.timing(timerAnimation, {
        toValue: targetValue,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  }, [restLeft, restTotal, timerAnimation]);

  const cancelRest = useCallback(() => {
    setRestLeft(0);
    timerAnimation.stopAnimation();
  }, [timerAnimation]);

  const formatRest = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleToggleExercise = useCallback((ex: any) => {
    toggleExerciseComplete(ex.id);
  }, [toggleExerciseComplete]);

  const handleConfirmTemplate = useCallback(() => {
    if (picker.selectedExerciseIds.length === 0) return;

    const selectedExs = picker.selectedExerciseIds.map(id => {
      const exObj = picker.allExercises.find(e => e.id === id);
      return {
        id: id,
        name: i18n.language === 'ja' ? exObj?.name_ja : exObj?.name_en,
        unit: 'kg'
      };
    });

    const updatedExercises = selectedExs.map(sel => {
      const existing = exercises.find(ex => ex.exerciseId === sel.id);
      if (existing) {
        return existing;
      }
      return {
        id: Math.random().toString(),
        exerciseId: sel.id,
        name: sel.name || 'Exercise',
        unit: 'kg',
        sets: [
          { id: Math.random().toString(), weight: '', reps: '', completed: false }
        ]
      };
    });

    updateExercises(updatedExercises);
    setIsEditingTemplate(false);
  }, [picker.selectedExerciseIds, picker.allExercises, i18n.language, exercises, updateExercises]);

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
        return { bg: 'rgba(100, 210, 255, 0.12)', selectedBg: 'rgba(100, 210, 255, 0.35)', border: 'rgba(100, 210, 255, 0.6)' };
      case 'mg-glutes':
        return { bg: 'rgba(255, 55, 95, 0.12)', selectedBg: 'rgba(255, 55, 95, 0.35)', border: 'rgba(255, 55, 95, 0.6)' };
      case 'mg-forearms':
        return { bg: 'rgba(255, 214, 10, 0.12)', selectedBg: 'rgba(255, 214, 10, 0.35)', border: 'rgba(255, 214, 10, 0.6)' };
      case 'mg-fullbody':
        return { bg: 'rgba(94, 92, 230, 0.12)', selectedBg: 'rgba(94, 92, 230, 0.35)', border: 'rgba(94, 92, 230, 0.6)' };
      case 'mg-cardio':
        return { bg: 'rgba(0, 245, 160, 0.12)', selectedBg: 'rgba(0, 245, 160, 0.35)', border: 'rgba(0, 245, 160, 0.6)' };
      default: // custom / other
        return { bg: 'rgba(142, 142, 147, 0.12)', selectedBg: 'rgba(142, 142, 147, 0.35)', border: 'rgba(142, 142, 147, 0.6)' };
    }
  }, []);

  const allExercisesDone = useMemo(() => {
    return exercises.length > 0 && exercises.every(ex =>
      ex.sets.length > 0 && ex.sets.every((s: any) => s.completed)
    );
  }, [exercises]);

  const handleFinishSession = useCallback(() => {
    if (allExercisesDone) {
      Alert.alert(
        t('session.finishTitle'),
        t('session.saveAsTemplatePrompt'),
        [
          {
            text: t('common.no'),
            onPress: () => {
              const userId = useAuthStore.getState().user?.id || 'guest';
              saveActiveSession(userId);
              endSession();
              queryClient.invalidateQueries({ queryKey: ['exercisesForDate'] });
              router.push('/modals/hanko-stamp');
            }
          },
          {
            text: t('common.yes'),
            onPress: () => {
              const today = new Date().toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' });
              setTemplateName(t('session.defaultTemplateName', { date: today }));
              setShowSaveTemplateModal(true);
            }
          }
        ]
      );
    } else {
      setToastMessage(t('session.pleaseMarkAllDone'));
    }
  }, [allExercisesDone, saveActiveSession, endSession, t, i18n.language]);

  const handleConfirmSaveTemplate = useCallback(async () => {
    const trimmedName = templateName.trim();
    if (!trimmedName) {
      AppErrorHandler.handleError(new ValidationError(t('todayWorkout.nameEmpty'), 'NAME_EMPTY'));
      return;
    }
    if (trimmedName.length > 50) {
      AppErrorHandler.handleError(new ValidationError(t('todayWorkout.nameTooLong'), 'NAME_TOO_LONG'));
      return;
    }
    if (dangerousCharsRegex.test(trimmedName)) {
      AppErrorHandler.handleError(new ValidationError(t('todayWorkout.nameInvalidChars'), 'INVALID_CHARS'));
      return;
    }

    try {
      const userId = useAuthStore.getState().user?.id || 'guest';
      const { savedWorkouts, fetchSavedWorkouts } = useWorkoutStore.getState();
      if (userId === 'guest' && savedWorkouts.length >= 1) {
        AppErrorHandler.handleError(new BusinessError(t('todayWorkout.guestLimitDesc'), 'GUEST_LIMIT_REACHED'));
        saveActiveSession(userId);
        endSession();
        setShowSaveTemplateModal(false);
        queryClient.invalidateQueries({ queryKey: ['exercisesForDate'] });
        router.push('/modals/hanko-stamp');
        return;
      }

      const templateExercises = exercises.map(ex => ({
        id: ex.exerciseId,
        name: ex.name
      }));

      WorkoutTemplateRepository.saveWorkoutTemplate(userId, trimmedName, templateExercises);
      await fetchSavedWorkouts();

      saveActiveSession(userId);
      endSession();
      setShowSaveTemplateModal(false);
      queryClient.invalidateQueries({ queryKey: ['exercisesForDate'] });
      router.push('/modals/hanko-stamp');
    } catch (err: any) {
      AppErrorHandler.handleError(err);
    }
  }, [templateName, exercises, saveActiveSession, endSession, t]);

  return {
    // States
    exercises,
    isEditingTemplate,
    focusedInput,
    restLeft,
    restTotal,
    showTimerPresets,
    selectedRestIndex,
    allExercisesDone,

    // Refs / Values
    pan,
    scrollY,
    timerAnimation,
    panResponder,

    // State Setters
    setIsEditingTemplate,
    setFocusedInput,
    setShowTimerPresets,
    setSelectedRestIndex,

    // Action Handlers
    addSet,
    removeSet,
    updateSet,
    toggleSetComplete,
    removeExercise,
    addExercise,
    updateExercises,
    saveActiveSession,
    endSession,
    
    showSaveTemplateModal,
    templateName,
    setShowSaveTemplateModal,
    setTemplateName,
    handleConfirmSaveTemplate,
    
    startRest,
    cancelRest,
    formatRest,
    handleToggleExercise,
    handleConfirmTemplate,
    getMuscleGroupColor,
    handleFinishSession,
    picker,
    t,
    i18n,
    width,
    height,
  };
}
