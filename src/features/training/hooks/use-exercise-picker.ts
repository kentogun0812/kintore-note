import { useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { ExerciseRepository } from '@/infra/repositories/exercise.repository';
import { DEFAULT_EXERCISES, DEFAULT_MUSCLE_GROUPS } from '@/constants/defaultExercises';

export function useExercisePicker(initialSelectedIds: string[] = []) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedMuscleGroupId, setSelectedMuscleGroupId] = useState<string | null>(null);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>(initialSelectedIds);
  
  const [showCreateCustomMGModal, setShowCreateCustomMGModal] = useState(false);
  const [showCreateCustomExerciseModal, setShowCreateCustomExerciseModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [newMGNameJa, setNewMGNameJa] = useState('');
  const [newMGNameEn, setNewMGNameEn] = useState('');
  const [newExNameJa, setNewExNameJa] = useState('');
  const [newExNameEn, setNewExNameEn] = useState('');
  const [newExMGId, setNewExMGId] = useState('');

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

  return {
    isLoading,
    error,
    allExercises,
    allMuscleGroups,
    filteredExercises,
    selectedMuscleGroupId,
    setSelectedMuscleGroupId,
    selectedExerciseIds,
    setSelectedExerciseIds,
    handleToggleSelectExercise,
    showCreateCustomMGModal,
    setShowCreateCustomMGModal,
    showCreateCustomExerciseModal,
    setShowCreateCustomExerciseModal,
    toastMessage,
    setToastMessage,
    newMGNameJa, setNewMGNameJa,
    newMGNameEn, setNewMGNameEn,
    newExNameJa, setNewExNameJa,
    newExNameEn, setNewExNameEn,
    newExMGId, setNewExMGId,
    handleCreateCustomMuscleGroup,
    handleCreateCustomExercise,
    handleDeleteCustomMuscleGroup,
    handleDeleteCustomExercise
  };
}
