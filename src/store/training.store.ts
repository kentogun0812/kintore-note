import { create } from 'zustand';
import { WorkoutRepository } from '@/infra/repositories/workout.repository';

interface SetRecord {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
}

interface ExerciseRecord {
  id: string;
  exerciseId: string;
  name: string;
  notes?: string;
  unit?: string;
  sets: SetRecord[];
}

interface activeSessionState {
  isActive: boolean;
  startTime: Date | null;
  exercises: ExerciseRecord[];
  latestStreak: number;
  startSession: (exercises: any[]) => void;
  endSession: () => void;
  saveActiveSession: (userId: string) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<SetRecord>) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  toggleSetComplete: (exerciseId: string, setId: string) => void;
  toggleExerciseComplete: (exerciseId: string) => void;
  updateExerciseNote: (exerciseId: string, note: string) => void;
  removeExercise: (exerciseId: string) => void;
  reorderSessionExercises: (fromIndex: number, toIndex: number) => void;
  updateExercises: (exercises: ExerciseRecord[]) => void;
  addExercise: (exercise: any) => void;
}

export const useTrainingStore = create<activeSessionState>((set, get) => ({
  isActive: false,
  startTime: null,
  exercises: [],
  latestStreak: 0,
  
  startSession: (initialExercises) => set({
    isActive: true,
    startTime: new Date(),
    exercises: initialExercises.map(ex => ({
      id: Math.random().toString(),
      exerciseId: ex.id,
      name: ex.name,
      unit: ex.unit || 'kg',
      sets: [
        { id: Math.random().toString(), weight: '', reps: '', completed: false }
      ]
    }))
  }),

  endSession: () => set({
    isActive: false,
    startTime: null,
    exercises: []
  }),

  saveActiveSession: (userId) => {
    const { startTime, exercises } = get();
    if (!startTime || exercises.length === 0) return;

    let totalVolume = 0;
    const mappedExercises = exercises.map(ex => {
      const mappedSets = ex.sets
        .filter(s => s.completed)
        .map(s => {
          const weight = parseFloat(s.weight) || 0;
          const reps = parseInt(s.reps, 10) || 0;
          totalVolume += weight * reps;
          return {
            weight,
            reps,
            completed: true
          };
        });

      return {
        exerciseId: ex.exerciseId,
        notes: ex.notes,
        sets: mappedSets
      };
    }).filter(ex => ex.sets.length > 0);

    if (mappedExercises.length === 0) return;

    // Save Workout Session
    const sessionId = WorkoutRepository.saveWorkoutSession({
      userId,
      startedAt: startTime,
      completedAt: new Date(),
      totalVolume,
      exercises: mappedExercises
    });

    // Save Hanko Stamp for today
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    const streak = WorkoutRepository.saveHankoStamp(userId, sessionId, todayStr);
    set({ latestStreak: streak });
  },

  updateSet: (exerciseId, setId, updates) => set((state) => ({
    exercises: state.exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
      };
    })
  })),

  addSet: (exerciseId) => set((state) => ({
    exercises: state.exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      // Copy last set values
      const lastSet = ex.sets[ex.sets.length - 1];
      return {
        ...ex,
        sets: [...ex.sets, { 
          id: Math.random().toString(), 
          weight: lastSet ? lastSet.weight : '', 
          reps: lastSet ? lastSet.reps : '', 
          completed: false 
        }]
      };
    })
  })),

  toggleSetComplete: (exerciseId, setId) => set((state) => ({
    exercises: state.exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s)
      };
    })
  })),

  toggleExerciseComplete: (exerciseId) => set((state) => ({
    exercises: state.exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const allCompleted = ex.sets.every(s => s.completed);
      return {
        ...ex,
        sets: ex.sets.map(s => ({ ...s, completed: !allCompleted }))
      };
    })
  })),

  removeSet: (exerciseId, setId) => set((state) => ({
    exercises: state.exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.filter(s => s.id !== setId)
      };
    })
  })),

  updateExerciseNote: (exerciseId, note) => set((state) => ({
    exercises: state.exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return { ...ex, notes: note };
    })
  })),

  removeExercise: (exerciseId) => set((state) => ({
    exercises: state.exercises.filter(ex => ex.id !== exerciseId)
  })),

  reorderSessionExercises: (fromIndex, toIndex) => set((state) => {
    const newExercises = [...state.exercises];
    const [moved] = newExercises.splice(fromIndex, 1);
    newExercises.splice(toIndex, 0, moved);
    return { exercises: newExercises };
  }),

  updateExercises: (newExercises) => set({ exercises: newExercises }),

  addExercise: (exercise) => set((state) => ({
    exercises: [...state.exercises, {
      id: Math.random().toString(),
      exerciseId: exercise.id,
      name: exercise.name,
      unit: exercise.unit || 'kg',
      sets: [
        { id: Math.random().toString(), weight: '', reps: '', completed: false }
      ]
    }]
  }))
}));
