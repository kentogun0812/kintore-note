import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingStore {
  hasCompletedOnboarding: boolean;
  hasSeenIntro: boolean;
  complete: () => void;
  reset: () => void;
  setHasSeenIntro: (value: boolean) => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      hasSeenIntro: false,
      complete: () => set({ hasCompletedOnboarding: true }),
      reset: () => set({ hasCompletedOnboarding: false, hasSeenIntro: false }),
      setHasSeenIntro: (value: boolean) => set({ hasSeenIntro: value }),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
