import { create } from 'zustand';
import { WorkoutRepository } from '@/infra/repositories/workout.repository';
import { useAuthStore } from './auth.store';

export type TimeRange = '7d' | '30d' | 'all';

export interface ChartDataPoint {
  date: string; // YYYY-MM-DD
  volume: number;
}

export interface HeatmapRegionData {
  id: string;
  name: string;
  volume: number;
}

interface AnalyticsState {
  heatmapData: HeatmapRegionData[];
  chartData: ChartDataPoint[];
  isLoadingHeatmap: boolean;
  isLoadingChart: boolean;
  
  fetchHeatmapData: (range: TimeRange) => Promise<void>;
  fetchVolumeChartData: (exerciseId: string, range: TimeRange) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  heatmapData: [],
  chartData: [],
  isLoadingHeatmap: false,
  isLoadingChart: false,

  fetchHeatmapData: async (range: TimeRange) => {
    set({ isLoadingHeatmap: true });
    try {
      const userId = useAuthStore.getState().user?.id || 'guest';
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 'all';
      
      const heatmapArray = await WorkoutRepository.getHeatmapVolume(userId, days);
      set({ heatmapData: heatmapArray });
    } catch (err) {
      console.log('[Analytics] Error fetching heatmap data:', err);
    } finally {
      set({ isLoadingHeatmap: false });
    }
  },

  fetchVolumeChartData: async (exerciseId: string, range: TimeRange) => {
    set({ isLoadingChart: true });
    try {
      const userId = useAuthStore.getState().user?.id || 'guest';
      if (!exerciseId) return;

      const days = range === '7d' ? 7 : range === '30d' ? 30 : 'all';
      const chartPoints = await WorkoutRepository.getVolumeTrend(userId, exerciseId, days);
      
      set({ chartData: chartPoints });
    } catch (err) {
      console.log('[Analytics] Error fetching chart data:', err);
    } finally {
      set({ isLoadingChart: false });
    }
  }
}));
