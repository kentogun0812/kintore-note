import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutTemplateRepository } from '@/infra/repositories/workout-template.repository';
import { useAuthStore } from './auth.store';

export interface WorkoutTemplateExercise {
  id: string; // The exercise DB id
  name_ja: string;
  name_en: string;
}

export interface SavedWorkoutTemplate {
  id: string;
  name: string;
  exercises: WorkoutTemplateExercise[];
  createdAt: string;
}

interface WorkoutBuilderState {
  workoutName: string;
  exercises: WorkoutTemplateExercise[];
  savedWorkouts: SavedWorkoutTemplate[];
  setWorkoutName: (name: string) => void;
  setExercises: (exercises: WorkoutTemplateExercise[]) => void;
  addExerciseToWorkout: (exercise: WorkoutTemplateExercise) => void;
  removeExerciseFromWorkout: (exerciseId: string) => void;
  reorderExercises: (fromIndex: number, toIndex: number) => void;
  clearWorkoutBuilder: () => void;
  saveCurrentWorkout: () => Promise<{ success: boolean; error?: any } | undefined>;
  fetchSavedWorkouts: () => Promise<void>;
  updateSavedWorkout: (id: string, name: string, exercises: WorkoutTemplateExercise[]) => Promise<{ success: boolean; error?: any }>;
}

export const useWorkoutStore = create<WorkoutBuilderState>()(
  persist(
    (set, get) => ({
      workoutName: '',
      exercises: [],
      savedWorkouts: [],
      
      setWorkoutName: (name) => set({ workoutName: name }),
      setExercises: (exercises) => set({ exercises }),
      
      addExerciseToWorkout: (exercise) => set((state) => {
        if (state.exercises.find(e => e.id === exercise.id)) return state;
        return { exercises: [...state.exercises, exercise] };
      }),
      
      removeExerciseFromWorkout: (exerciseId) => set((state) => ({
        exercises: state.exercises.filter(e => e.id !== exerciseId)
      })),

      reorderExercises: (fromIndex, toIndex) => set((state) => {
        const newExercises = [...state.exercises];
        const [moved] = newExercises.splice(fromIndex, 1);
        newExercises.splice(toIndex, 0, moved);
        return { exercises: newExercises };
      }),

      clearWorkoutBuilder: () => set({
        workoutName: '',
        exercises: []
      }),

      fetchSavedWorkouts: async () => {
        const userId = useAuthStore.getState().user?.id || 'guest';
        try {
          const parsed = await WorkoutTemplateRepository.fetchSavedWorkoutTemplates(userId);
          set({ savedWorkouts: parsed });
        } catch (error) {
          console.error('[WorkoutStore] Error fetching Workouts:', error);
        }
      },

      updateSavedWorkout: async (id, name, exercises) => {
        try {
          await WorkoutTemplateRepository.updateWorkoutTemplate(id, name, exercises);
          await get().fetchSavedWorkouts();
          return { success: true };
        } catch (err: any) {
          console.error('[WorkoutStore] Failed to update Workout:', err);
          return { success: false, error: err.message };
        }
      },

      saveCurrentWorkout: async () => {
        const { workoutName, exercises, savedWorkouts } = get();
        if (!workoutName || exercises.length === 0) return { success: false };

        try {
          const userId = useAuthStore.getState().user?.id || 'guest';
          
          if (userId === 'guest') {
            if (savedWorkouts.length >= 1) {
              return { success: false, error: 'GUEST_LIMIT_REACHED' };
            }
          }

          await WorkoutTemplateRepository.saveWorkoutTemplate(userId, workoutName, exercises);
          await get().fetchSavedWorkouts();

          set({ workoutName: '', exercises: [] });
          return { success: true };
        } catch(err: any) {
          console.log('[WorkoutStore] Failed to save Workout:', err);
          return { success: false, error: err.message };
        }
      }
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

