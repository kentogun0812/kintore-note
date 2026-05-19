import { create } from 'zustand';

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
  sets: SetRecord[];
}

interface activeSessionState {
  isActive: boolean;
  startTime: Date | null;
  exercises: ExerciseRecord[];
  startSession: (exercises: any[]) => void;
  endSession: () => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<SetRecord>) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  toggleSetComplete: (exerciseId: string, setId: string) => void;
  updateExerciseNote: (exerciseId: string, note: string) => void;
  removeExercise: (exerciseId: string) => void;
  reorderSessionExercises: (fromIndex: number, toIndex: number) => void;
}

export const useTrainingStore = create<activeSessionState>((set) => ({
  isActive: false,
  startTime: null,
  exercises: [],
  
  startSession: (initialExercises) => set({
    isActive: true,
    startTime: new Date(),
    exercises: initialExercises.map(ex => ({
      id: Math.random().toString(),
      exerciseId: ex.id,
      name: ex.name,
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
  })
}));
