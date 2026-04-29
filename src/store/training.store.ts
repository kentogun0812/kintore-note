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
  }))
}));
