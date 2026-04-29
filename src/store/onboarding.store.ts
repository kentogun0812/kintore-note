import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingStore {
  hasCompletedOnboarding: boolean;
  hasSeenIntro: boolean;
  showWelcome: boolean;
  complete: () => void;
  reset: () => void;
  setHasSeenIntro: (value: boolean) => void;
  dismissWelcome: () => void;
  resetOnboardingAccount: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      hasSeenIntro: false,
      showWelcome: false,
      complete: () => set({ hasCompletedOnboarding: true, showWelcome: true }),
      reset: () => set({ hasCompletedOnboarding: false, hasSeenIntro: false, showWelcome: false }),
      resetOnboardingAccount: () => set({ hasCompletedOnboarding: false, showWelcome: false }),
      setHasSeenIntro: (value: boolean) => set({ hasSeenIntro: value }),
      dismissWelcome: () => set({ showWelcome: false }),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
