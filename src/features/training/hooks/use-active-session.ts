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
import { DEFAULT_EXERCISES, DEFAULT_MUSCLE_GROUPS } from '@/constants/defaultExercises';

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
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [selectedMuscleGroupId, setSelectedMuscleGroupId] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [restLeft, setRestLeft] = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal visibility states
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showCreateCustomMGModal, setShowCreateCustomMGModal] = useState(false);
  const [showCreateCustomExerciseModal, setShowCreateCustomExerciseModal] = useState(false);
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

  // New Custom Muscle Group inputs
  const [newMGNameJa, setNewMGNameJa] = useState('');
  const [newMGNameEn, setNewMGNameEn] = useState('');

  // New Custom Exercise inputs
  const [newExNameJa, setNewExNameJa] = useState('');
  const [newExNameEn, setNewExNameEn] = useState('');
  const [newExMGId, setNewExMGId] = useState('');

  // Sync selected exercise IDs when editing is opened or when exercises list in store updates
  useEffect(() => {
    if (isEditingTemplate) {
      setSelectedExerciseIds(exercises.map(ex => ex.exerciseId));
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

  // Fetch exercises from SQLite
  const { data: exercisesData, isLoading, error } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const userId = useAuthStore.getState().user?.id || 'guest';
      return ExerciseRepository.getAllExercises(userId);
    },
    enabled: true,
  });

  // Fetch muscle groups from SQLite
  const { data: muscleGroupsData } = useQuery({
    queryKey: ['muscleGroups'],
    queryFn: async () => {
      const userId = useAuthStore.getState().user?.id || 'guest';
      return ExerciseRepository.getMuscleGroups(userId);
    },
    enabled: true,
  });

  // Combine standard and custom muscle groups
  const allMuscleGroups = useMemo(() => {
    const groups = muscleGroupsData || DEFAULT_MUSCLE_GROUPS.map(mg => ({
      id: mg.id,
      name_ja: mg.nameJa,
      name_en: mg.nameEn,
      sort_order: mg.sortOrder,
    }));

    const merged = [...groups];

    // Append "Other" at the end of muscle groups
    merged.push({
      id: 'mg-other',
      name_ja: 'その他',
      name_en: 'Other',
      sort_order: 9999,
    });

    return merged.sort((a, b) => a.sort_order - b.sort_order);
  }, [muscleGroupsData]);

  // Merge static and custom exercises
  const allExercises = useMemo(() => {
    return exercisesData || DEFAULT_EXERCISES.map(ex => {
      const mg = DEFAULT_MUSCLE_GROUPS.find(m => m.id === ex.primaryGroup);
      return {
        id: ex.id,
        name_en: ex.nameEn,
        name_ja: ex.nameJa,
        muscle_groups: mg ? {
          id: mg.id,
          name_en: mg.nameEn,
          name_ja: mg.nameJa,
          sort_order: mg.sortOrder,
        } : {
          id: 'unknown',
          name_en: 'Unknown',
          name_ja: '不明',
          sort_order: 999,
        }
      };
    });
  }, [exercisesData]);

  const selectedMuscleGroupObj = useMemo(() => {
    return allMuscleGroups.find(mg => mg.id === selectedMuscleGroupId) || null;
  }, [allMuscleGroups, selectedMuscleGroupId]);

  const filteredExercises = useMemo(() => {
    if (!selectedMuscleGroupId) return [];
    return allExercises.filter(ex => ex.muscle_groups?.id === selectedMuscleGroupId);
  }, [allExercises, selectedMuscleGroupId]);

  const handleToggleSelectExercise = useCallback((exId: string) => {
    setSelectedExerciseIds(prev => {
      if (prev.includes(exId)) {
        return prev.filter(id => id !== exId);
      } else {
        return [...prev, exId];
      }
    });
  }, []);

  const handleConfirmTemplate = useCallback(() => {
    if (selectedExerciseIds.length === 0) return;

    const selectedExs = selectedExerciseIds.map(id => {
      const exObj = allExercises.find(e => e.id === id);
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
  }, [selectedExerciseIds, allExercises, i18n.language, exercises, updateExercises]);

  const handleCreateCustomMuscleGroup = useCallback(() => {
    if (!newMGNameJa.trim() && !newMGNameEn.trim()) return;

    const finalJa = newMGNameJa.trim() || newMGNameEn.trim();
    const finalEn = newMGNameEn.trim() || newMGNameJa.trim();

    const isDuplicate = allMuscleGroups.some(mg =>
      mg.name_ja.toLowerCase() === finalJa.toLowerCase() ||
      mg.name_en.toLowerCase() === finalEn.toLowerCase()
    );

    if (isDuplicate) {
      setToastMessage(t('session.muscleGroupExists'));
      return;
    }

    const userId = useAuthStore.getState().user?.id || 'guest';
    const sortOrder = 100 + allMuscleGroups.length;

    const newId = ExerciseRepository.createCustomMuscleGroup(finalJa, finalEn, sortOrder, userId);

    queryClient.invalidateQueries({ queryKey: ['muscleGroups'] });

    setNewMGNameJa('');
    setNewMGNameEn('');
    setShowCreateCustomMGModal(false);
    setSelectedMuscleGroupId(newId);
  }, [newMGNameJa, newMGNameEn, allMuscleGroups, queryClient, t]);

  const handleCreateCustomExercise = useCallback(() => {
    if (!newExNameJa.trim() && !newExNameEn.trim()) return;
    const targetMGId = newExMGId || selectedMuscleGroupId || 'mg-other';

    const nameJa = newExNameJa.trim() || newExNameEn.trim();
    const nameEn = newExNameEn.trim() || newExNameJa.trim();

    const userId = useAuthStore.getState().user?.id || 'guest';
    const newId = ExerciseRepository.createCustomExercise(nameJa, nameEn, targetMGId, userId);

    queryClient.invalidateQueries({ queryKey: ['exercises'] });

    setNewExNameJa('');
    setNewExNameEn('');
    setNewExMGId('');
    setShowCreateCustomExerciseModal(false);

    setSelectedExerciseIds(prev => [...prev, newId]);
  }, [newExNameJa, newExNameEn, newExMGId, selectedMuscleGroupId, queryClient]);

  const handleDeleteCustomMuscleGroup = useCallback((id: string) => {
    Alert.alert(
      t('session.deleteCustomMuscle'),
      t('session.deleteCustomMuscleDesc'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            const userId = useAuthStore.getState().user?.id || 'guest';
            ExerciseRepository.deleteCustomMuscleGroup(id, userId);
            queryClient.invalidateQueries({ queryKey: ['muscleGroups'] });
            if (selectedMuscleGroupId === id) {
              setSelectedMuscleGroupId('');
            }
          }
        }
      ]
    );
  }, [selectedMuscleGroupId, queryClient, t]);

  const handleDeleteCustomExercise = useCallback((id: string) => {
    Alert.alert(
      t('session.deleteCustomExercise'),
      t('session.deleteCustomExerciseDesc'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            const userId = useAuthStore.getState().user?.id || 'guest';
            ExerciseRepository.deleteCustomExercise(id, userId);
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
            setSelectedExerciseIds(prev => prev.filter(exId => exId !== id));
          }
        }
      ]
    );
  }, [queryClient, t]);

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
      Alert.alert(t('common.error'), t('todayWorkout.nameEmpty'));
      return;
    }
    if (trimmedName.length > 50) {
      Alert.alert(t('common.error'), t('todayWorkout.nameTooLong'));
      return;
    }
    if (dangerousCharsRegex.test(trimmedName)) {
      Alert.alert(t('common.error'), t('todayWorkout.nameInvalidChars'));
      return;
    }

    try {
      const userId = useAuthStore.getState().user?.id || 'guest';
      const { savedWorkouts, fetchSavedWorkouts } = useWorkoutStore.getState();
      if (userId === 'guest' && savedWorkouts.length >= 1) {
        Alert.alert(
          t('todayWorkout.guestLimitTitle'),
          t('todayWorkout.guestLimitDesc')
        );
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
      Alert.alert(t('common.error'), err.message);
      console.log(err);
    }
  }, [templateName, exercises, saveActiveSession, endSession, t]);

  return {
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
    showTimerPresets,
    selectedRestIndex,
    newMGNameJa,
    newMGNameEn,
    newExNameJa,
    newExNameEn,
    newExMGId,
    allMuscleGroups,
    allExercises,
    selectedMuscleGroupObj,
    filteredExercises,
    allExercisesDone,
    isLoading,
    error,

    // Refs / Values
    pan,
    scrollY,
    timerAnimation,
    panResponder,

    // State Setters
    setIsEditingTemplate,
    setSelectedExerciseIds,
    setSelectedMuscleGroupId,
    setFocusedInput,
    setToastMessage,
    setShowCreateCustomMGModal,
    setShowCreateCustomExerciseModal,
    setShowTimerPresets,
    setSelectedRestIndex,
    setNewMGNameJa,
    setNewMGNameEn,
    setNewExNameJa,
    setNewExNameEn,
    setNewExMGId,

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
    handleToggleSelectExercise,
    handleConfirmTemplate,
    handleCreateCustomMuscleGroup,
    handleCreateCustomExercise,
    handleDeleteCustomMuscleGroup,
    handleDeleteCustomExercise,
    getMuscleGroupColor,
    handleFinishSession,
    t,
    i18n,
    width,
    height,
  };
}
