import { create } from 'zustand';
import { WeeklyPlanRepository } from '@/infra/repositories/weekly-plan.repository';
import { useAuthStore } from './auth.store';

export interface WeeklyPlan {
  id: string;
  name: string;
  description?: string;
  total_weeks: number;
  start_date?: string;
  is_active: boolean;
  created_at: string;
}

interface WeeklyPlanState {
  weeklyPlans: WeeklyPlan[];
  activeWeeklyPlan: WeeklyPlan | null;
  fetchWeeklyPlans: () => Promise<void>;
  createWeeklyPlan: (name: string, total_weeks: number, start_date?: string) => Promise<string | null>;
  activateWeeklyPlan: (planId: string) => Promise<void>;
  assignTemplateToWeek: (planId: string, templateId: string, week: number) => Promise<void>;
  fetchPlanTemplates: (planId: string) => Promise<any[]>;
}

export const useWeeklyPlanStore = create<WeeklyPlanState>((set, get) => ({
  weeklyPlans: [],
  activeWeeklyPlan: null,

  fetchWeeklyPlans: async () => {
    const userId = useAuthStore.getState().user?.id || 'guest';
    try {
      const data = WeeklyPlanRepository.fetchWeeklyPlans(userId);
      const active = data.find((p) => p.is_active) || null;
      set({ weeklyPlans: data, activeWeeklyPlan: active });
    } catch (error) {
      console.error('[WeeklyPlanStore] Error fetching plans:', error);
    }
  },

  createWeeklyPlan: async (name, total_weeks, start_date) => {
    const userId = useAuthStore.getState().user?.id || 'guest';
    try {
      const id = WeeklyPlanRepository.createWeeklyPlan(userId, name, total_weeks, start_date);
      await get().fetchWeeklyPlans();
      return id;
    } catch (error) {
      console.error('[WeeklyPlanStore] Error creating plan:', error);
      return null;
    }
  },

  activateWeeklyPlan: async (planId) => {
    const userId = useAuthStore.getState().user?.id || 'guest';
    try {
      WeeklyPlanRepository.activateWeeklyPlan(userId, planId);
      await get().fetchWeeklyPlans();
    } catch (error) {
      console.error('[WeeklyPlanStore] Error activating plan:', error);
    }
  },

  assignTemplateToWeek: async (planId, templateId, week) => {
    try {
      WeeklyPlanRepository.assignTemplateToWeek(planId, templateId, week);
    } catch (error) {
      console.error('[WeeklyPlanStore] Error assigning template to week:', error);
    }
  },

  fetchPlanTemplates: async (planId) => {
    try {
      return WeeklyPlanRepository.fetchPlanTemplates(planId);
    } catch (error) {
      console.error('[WeeklyPlanStore] Error fetching plan templates:', error);
      return [];
    }
  }
}));

