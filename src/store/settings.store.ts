import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WeightUnit = 'kg' | 'lbs';
export type AppLanguage = 'en' | 'ja';

interface SettingsState {
  notificationsEnabled: boolean;
  language: AppLanguage;
  weightUnit: WeightUnit;
  setNotificationsEnabled: (enabled: boolean) => void;
  setLanguage: (lang: AppLanguage) => void;
  setWeightUnit: (unit: WeightUnit) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      language: 'ja',
      weightUnit: 'kg',
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setLanguage: (lang) => set({ language: lang }),
      setWeightUnit: (unit) => set({ weightUnit: unit }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
