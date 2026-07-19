import { create } from 'zustand';
import { WeeklyPlanRepository } from '@/infra/repositories/weekly-plan.repository';
import { useAuthStore } from './auth.store';

export interface AssignedTemplate {
  id: string | null;
  name: string | null;
  plan_week: number;
  day_of_week: number;
  is_rest_day: boolean;
}

export interface WeeklyPlan {
  id: string;
  name: string;
  description?: string;
  total_weeks: number;
  start_date?: string;
  is_active: boolean;
  created_at: string;
  assigned_templates?: AssignedTemplate[];
}

interface WeeklyPlanState {
  weeklyPlans: WeeklyPlan[];
  activeWeeklyPlan: WeeklyPlan | null;
  fetchWeeklyPlans: () => Promise<void>;
  createWeeklyPlan: (name: string, total_weeks: number, start_date?: string) => Promise<string | null>;
  updateWeeklyPlan: (planId: string, name: string, total_weeks: number, start_date?: string) => Promise<void>;
  activateWeeklyPlan: (planId: string) => Promise<void>;
  deleteWeeklyPlan: (planId: string) => Promise<void>;
  assignToDay: (planId: string, templateId: string | null, week: number, dayOfWeek: number, isRestDay?: boolean) => Promise<void>;
  fetchPlanTemplates: (planId: string) => Promise<AssignedTemplate[]>;
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

  updateWeeklyPlan: async (planId, name, total_weeks, start_date) => {
    try {
      WeeklyPlanRepository.updateWeeklyPlan(planId, name, total_weeks, start_date);
      await get().fetchWeeklyPlans();
    } catch (error) {
      console.error('[WeeklyPlanStore] Error updating plan:', error);
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

  deleteWeeklyPlan: async (planId) => {
    try {
      WeeklyPlanRepository.deleteWeeklyPlan(planId);
      await get().fetchWeeklyPlans();
    } catch (error) {
      console.error('[WeeklyPlanStore] Error deleting plan:', error);
    }
  },

  assignToDay: async (planId, templateId, week, dayOfWeek, isRestDay = false) => {
    try {
      WeeklyPlanRepository.assignToDay(planId, templateId, week, dayOfWeek, isRestDay);
    } catch (error) {
      console.error('[WeeklyPlanStore] Error assigning template to day:', error);
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

