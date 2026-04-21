import { create } from 'zustand';

interface OnboardingStore {
  isCompleted: boolean;
  complete: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  isCompleted: false, // Default to false for mock
  complete: () => set({ isCompleted: true }),
  reset: () => set({ isCompleted: false }),
}));
