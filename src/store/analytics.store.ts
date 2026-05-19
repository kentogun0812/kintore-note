import { create } from 'zustand';
import { supabase } from '@/infra/api/supabase.client';

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

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  heatmapData: [],
  chartData: [],
  isLoadingHeatmap: false,
  isLoadingChart: false,

  fetchHeatmapData: async (range: TimeRange) => {
    set({ isLoadingHeatmap: true });
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return;

      let query = supabase
        .from('session_sets')
        .select(`
          weight_kg,
          reps,
          exercises ( muscle_groups ( id, name_en ) ),
          training_sessions!inner ( user_id, started_at )
        `)
        .eq('training_sessions.user_id', userId);

      if (range !== 'all') {
        const days = range === '7d' ? 7 : 30;
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - days);
        query = query.gte('training_sessions.started_at', pastDate.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        console.log('[Analytics] Fetch error:', error);
        return;
      }

      const aggregated: Record<string, { name: string; volume: number }> = {};
      
      data?.forEach((row: any) => {
        const volume = (row.weight_kg || 0) * (row.reps || 0);
        const muscleGroup = row.exercises?.muscle_groups;
        
        if (muscleGroup && muscleGroup.id && volume > 0) {
          if (!aggregated[muscleGroup.id]) {
            aggregated[muscleGroup.id] = { name: muscleGroup.name_en || 'Unknown', volume: 0 };
          }
          aggregated[muscleGroup.id].volume += volume;
        }
      });

      const heatmapArray = Object.entries(aggregated).map(([id, info]) => ({
        id,
        name: info.name,
        volume: info.volume
      }));

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
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId || !exerciseId) return;

      let query = supabase
        .from('session_sets')
        .select(`
          weight_kg,
          reps,
          training_sessions!inner ( user_id, started_at )
        `)
        .eq('training_sessions.user_id', userId)
        .eq('exercise_id', exerciseId);

      if (range !== 'all') {
        const days = range === '7d' ? 7 : 30;
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - days);
        query = query.gte('training_sessions.started_at', pastDate.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        console.log('[Analytics] Fetch chart error:', error);
        return;
      }

      // Group by YYYY-MM-DD
      const dailyVolume: Record<string, number> = {};
      
      data?.forEach((row: any) => {
        if (!row.training_sessions?.started_at) return;
        const dateStr = row.training_sessions.started_at.split('T')[0];
        const volume = (row.weight_kg || 0) * (row.reps || 0);
        
        dailyVolume[dateStr] = (dailyVolume[dateStr] || 0) + volume;
      });

      // Convert to sorted array
      const chartPoints = Object.entries(dailyVolume)
        .map(([date, volume]) => ({ date, volume }))
        .sort((a, b) => a.date.localeCompare(b.date));

      set({ chartData: chartPoints });
    } catch (err) {
      console.log('[Analytics] Error fetching chart data:', err);
    } finally {
      set({ isLoadingChart: false });
    }
  }
}));
