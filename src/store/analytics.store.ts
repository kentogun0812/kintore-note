import { create } from 'zustand';
import { WorkoutRepository } from '@/infra/repositories/workout.repository';
import { useAuthStore } from './auth.store';

export type TimeRange = 'day' | 'month' | 'year';

export interface ChartDataPoint {
  date: string;
  volume: number;
}

export interface DetailedMuscleStat {
  muscleGroupId: string;
  exerciseId: string;
  exerciseNameEn: string;
  exerciseNameJa: string;
  muscleNameEn: string;
  muscleNameJa: string;
  workoutCount: number;
  setCount: number;
  volume: number;
  lastActiveAt: string | null;
}

export interface WorkoutsTrendPoint {
  date: string;
  count: number;
}

export interface VolumeTrendPoint {
  date: string;
  volume: number;
}

export interface MuscleSplitPoint {
  id: string;
  nameEn: string;
  nameJa: string;
  count: number;
  percentage: number;
  color: string;
}

export interface StreakInfo {
  current: number;
}

export interface PRInfo {
  exerciseId: string;
  exerciseNameEn: string;
  exerciseNameJa: string;
  weight: number;
  date: string;
}

export interface WorkoutHistoryItem {
  id: string;
  templateName: string | null;
  startedAt: string;
  completedAt: string;
  totalVolume: number;
  notes: string | null;
  exercises: {
    id: string;
    nameEn: string;
    nameJa: string;
    setsCount: number;
  }[];
}

interface AnalyticsState {
  startDate: string;
  endDate: string;
  timeRange: TimeRange;
  
  heatmapData: DetailedMuscleStat[];
  workoutsTrend: WorkoutsTrendPoint[];
  volumeTrend: VolumeTrendPoint[];
  muscleSplit: MuscleSplitPoint[];
  streak: StreakInfo;
  prs: PRInfo[];
  history: WorkoutHistoryItem[];
  avgDuration: number;
  totalSetsCount: number;
  
  isLoading: boolean;
  
  fetchAnalyticsData: (startDate: string, endDate: string, range: TimeRange) => Promise<void>;
  setDateRange: (startDate: string, endDate: string, range: TimeRange) => Promise<void>;
}

const MUSCLE_COLORS: { [key: string]: string } = {
  'mg-chest': '#FF5E5E',
  'mg-back': '#2ECC71',
  'mg-shoulders': '#F39C12',
  'mg-arms': '#FF80DF',
  'mg-core': '#3498DB',
  'mg-legs': '#9B59B6',
  'mg-glutes': '#FF6699',
  'mg-forearms': '#E066FF',
  'mg-fullbody': '#1ABC9C',
  'mg-cardio': '#E67E22',
};

function getGroupedTrendData(raw: any[], startDateStr: string, endDateStr: string) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays <= 31) {
    const daysMap = new Map<string, { workouts: Set<string>; volume: number }>();
    const curr = new Date(start);
    while (curr <= end) {
      const dStr = curr.toISOString().split('T')[0];
      daysMap.set(dStr, { workouts: new Set(), volume: 0 });
      curr.setDate(curr.getDate() + 1);
    }

    for (const set of raw) {
      const entry = daysMap.get(set.workoutDate);
      if (entry) {
        entry.workouts.add(set.sessionId);
        entry.volume += set.weight * set.reps;
      }
    }

    const workoutsTrend: WorkoutsTrendPoint[] = [];
    const volumeTrend: VolumeTrendPoint[] = [];

    for (const [date, val] of daysMap.entries()) {
      const label = date.replace(/-/g, '/'); // YYYY/MM/DD
      workoutsTrend.push({ date: label, count: val.workouts.size });
      volumeTrend.push({ date: label, volume: val.volume });
    }

    return { workoutsTrend, volumeTrend };
  } else {
    const numBuckets = 6;
    const bucketSizeDays = Math.floor(diffDays / numBuckets);
    const buckets: { start: Date; end: Date; label: string; workouts: Set<string>; volume: number }[] = [];

    const curr = new Date(start);
    for (let i = 0; i < numBuckets; i++) {
      const bStart = new Date(curr);
      const bEnd = new Date(curr);
      bEnd.setDate(bEnd.getDate() + (i === numBuckets - 1 ? (diffDays - (numBuckets - 1) * bucketSizeDays - 1) : (bucketSizeDays - 1)));
      
      const label = `${bStart.getFullYear()}/${String(bStart.getMonth() + 1).padStart(2, '0')}/${String(bStart.getDate()).padStart(2, '0')}`;
      buckets.push({
        start: bStart,
        end: bEnd,
        label,
        workouts: new Set(),
        volume: 0
      });

      curr.setDate(curr.getDate() + bucketSizeDays);
    }

    for (const set of raw) {
      const setDate = new Date(set.workoutDate);
      for (const bucket of buckets) {
        if (setDate >= bucket.start && setDate <= bucket.end) {
          bucket.workouts.add(set.sessionId);
          bucket.volume += set.weight * set.reps;
          break;
        }
      }
    }

    const workoutsTrend: WorkoutsTrendPoint[] = buckets.map(b => ({ date: b.label, count: b.workouts.size }));
    const volumeTrend: VolumeTrendPoint[] = buckets.map(b => ({ date: b.label, volume: b.volume }));

    return { workoutsTrend, volumeTrend };
  }
}

// Set initial dates (default to last 30 days for Day filter)
const initialEnd = new Date();
const initialStart = new Date();
initialStart.setDate(initialEnd.getDate() - 30);

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  startDate: initialStart.toISOString().split('T')[0],
  endDate: initialEnd.toISOString().split('T')[0],
  timeRange: 'day',
  
  heatmapData: [],
  workoutsTrend: [],
  volumeTrend: [],
  muscleSplit: [],
  streak: { current: 0 },
  prs: [],
  history: [],
  avgDuration: 0,
  totalSetsCount: 0,
  isLoading: false,

  fetchAnalyticsData: async (startDate: string, endDate: string, range: TimeRange) => {
    set({ isLoading: true });
    try {
      const userId = useAuthStore.getState().user?.id || 'guest';
      
      // 1. Fetch raw data from DB
      const raw = WorkoutRepository.getRawWorkoutDataInRange(userId, startDate, endDate);
      
      // 2. Heatmap & Grouped stats
      const heatmapMap = new Map<string, DetailedMuscleStat>();
      for (const setItem of raw) {
        const key = `${setItem.muscleGroupId}_${setItem.exerciseId}`;
        const existing = heatmapMap.get(key);
        const setVolume = setItem.weight * setItem.reps;
        
        if (existing) {
          existing.setCount += 1;
          existing.volume += setVolume;
          if (setItem.workoutDate > (existing.lastActiveAt || '')) {
            existing.lastActiveAt = setItem.workoutDate;
          }
        } else {
          heatmapMap.set(key, {
            muscleGroupId: setItem.muscleGroupId,
            exerciseId: setItem.exerciseId,
            exerciseNameEn: setItem.exerciseNameEn,
            exerciseNameJa: setItem.exerciseNameJa,
            muscleNameEn: setItem.muscleNameEn,
            muscleNameJa: setItem.muscleNameJa,
            workoutCount: 0, // calculated below
            setCount: 1,
            volume: setVolume,
            lastActiveAt: setItem.workoutDate
          });
        }
      }
      
      // Update workout counts for heatmap groups (unique workouts per exercise/muscle group)
      const workoutCountsMap = new Map<string, Set<string>>();
      for (const setItem of raw) {
        const key = `${setItem.muscleGroupId}_${setItem.exerciseId}`;
        let setOfSessions = workoutCountsMap.get(key);
        if (!setOfSessions) {
          setOfSessions = new Set<string>();
          workoutCountsMap.set(key, setOfSessions);
        }
        setOfSessions.add(setItem.sessionId);
      }
      
      for (const [key, value] of heatmapMap.entries()) {
        value.workoutCount = workoutCountsMap.get(key)?.size || 0;
      }
      const heatmapData = Array.from(heatmapMap.values());

      // 3. Workouts Trend, Volume Trend
      const { workoutsTrend, volumeTrend } = getGroupedTrendData(raw, startDate, endDate);

      // 4. Muscle Split (Donut Chart)
      const muscleSplitMap = new Map<string, { count: number; nameEn: string; nameJa: string }>();
      let totalSets = 0;
      for (const setItem of raw) {
        totalSets++;
        const existing = muscleSplitMap.get(setItem.muscleGroupId);
        if (existing) {
          existing.count++;
        } else {
          muscleSplitMap.set(setItem.muscleGroupId, {
            count: 1,
            nameEn: setItem.muscleNameEn,
            nameJa: setItem.muscleNameJa
          });
        }
      }
      
      const muscleSplit: MuscleSplitPoint[] = Array.from(muscleSplitMap.entries()).map(([id, info]) => ({
        id,
        nameEn: info.nameEn,
        nameJa: info.nameJa,
        count: info.count,
        percentage: totalSets > 0 ? Math.round((info.count / totalSets) * 100) : 0,
        color: MUSCLE_COLORS[id] || '#95A5A6'
      })).sort((a, b) => b.count - a.count);

      // 5. Streak Info (Current active streak only)
      const allTrainedDates = WorkoutRepository.getHankoStampedDates(userId);
      const uniqueDates = Array.from(new Set(allTrainedDates)).sort();
      let currentStreak = 0;
      
      if (uniqueDates.length > 0) {
        const lastDateStr = uniqueDates[uniqueDates.length - 1];
        const lastDate = new Date(lastDateStr);
        const today = new Date();
        today.setHours(0,0,0,0);
        lastDate.setHours(0,0,0,0);
        
        const diffTimeToday = Math.abs(today.getTime() - lastDate.getTime());
        const diffDaysToday = Math.ceil(diffTimeToday / (1000 * 60 * 60 * 24));
        
        if (diffDaysToday <= 1) {
          let activeStreak = 1;
          for (let i = uniqueDates.length - 2; i >= 0; i--) {
            const prev = new Date(uniqueDates[i]);
            const curr = new Date(uniqueDates[i + 1]);
            prev.setHours(0,0,0,0);
            curr.setHours(0,0,0,0);
            const diff = Math.ceil(Math.abs(curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
              activeStreak++;
            } else {
              break;
            }
          }
          currentStreak = activeStreak;
        } else {
          currentStreak = 0;
        }
      }

      // 7. PRs Achieved in Range
      const maxWeightsBefore = WorkoutRepository.getMaxWeightsBeforeDate(userId, startDate);
      const maxWeightsBeforeMap = new Map<string, number>();
      for (const item of maxWeightsBefore) {
        maxWeightsBeforeMap.set(item.exerciseId, item.maxWeight);
      }

      const maxWeightInPeriodMap = new Map<string, { weight: number; reps: number; date: string; nameEn: string; nameJa: string }>();
      for (const set of raw) {
        const existing = maxWeightInPeriodMap.get(set.exerciseId);
        if (!existing || set.weight > existing.weight) {
          maxWeightInPeriodMap.set(set.exerciseId, {
            weight: set.weight,
            reps: set.reps,
            date: set.workoutDate,
            nameEn: set.exerciseNameEn,
            nameJa: set.exerciseNameJa
          });
        }
      }

      const prs: PRInfo[] = [];
      for (const [exId, periodData] of maxWeightInPeriodMap.entries()) {
        const allTimeBeforeMax = maxWeightsBeforeMap.get(exId);
        if (allTimeBeforeMax === undefined || periodData.weight > allTimeBeforeMax) {
          prs.push({
            exerciseId: exId,
            exerciseNameEn: periodData.nameEn,
            exerciseNameJa: periodData.nameJa,
            weight: periodData.weight,
            date: periodData.date
          });
        }
      }

      // 8. Workout History, total/average duration, and total sets count
      const sessionsMap = new Map<string, {
        id: string;
        templateName: string | null;
        startedAt: string;
        completedAt: string;
        notes: string | null;
        totalVolume: number;
        exercisesMap: Map<string, { id: string; nameEn: string; nameJa: string; setsCount: number }>;
      }>();

      for (const setItem of raw) {
        let session = sessionsMap.get(setItem.sessionId);
        if (!session) {
          session = {
            id: setItem.sessionId,
            templateName: setItem.templateName || null,
            startedAt: setItem.startedAt,
            completedAt: setItem.completedAt,
            notes: setItem.sessionNotes || null,
            totalVolume: 0,
            exercisesMap: new Map()
          };
          sessionsMap.set(setItem.sessionId, session);
        }
        
        session.totalVolume += setItem.weight * setItem.reps;
        
        let ex = session.exercisesMap.get(setItem.exerciseId);
        if (!ex) {
          ex = {
            id: setItem.exerciseId,
            nameEn: setItem.exerciseNameEn,
            nameJa: setItem.exerciseNameJa,
            setsCount: 0
          };
          session.exercisesMap.set(setItem.exerciseId, ex);
        }
        ex.setsCount += 1;
      }

      const history: WorkoutHistoryItem[] = Array.from(sessionsMap.values()).map(s => ({
        id: s.id,
        templateName: s.templateName,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        totalVolume: s.totalVolume,
        notes: s.notes,
        exercises: Array.from(s.exercisesMap.values())
      })).sort((a, b) => b.completedAt.localeCompare(a.completedAt));

      let totalDuration = 0;
      for (const s of sessionsMap.values()) {
        if (s.startedAt && s.completedAt) {
          const start = new Date(s.startedAt).getTime();
          const end = new Date(s.completedAt).getTime();
          const durMin = (end - start) / (1000 * 60);
          if (durMin > 0 && durMin < 1440) {
            totalDuration += durMin;
          }
        }
      }
      const avgDuration = sessionsMap.size > 0 ? Math.round(totalDuration / sessionsMap.size) : 0;
      const totalSetsCount = raw.length;

      set({
        startDate,
        endDate,
        timeRange: range,
        heatmapData,
        workoutsTrend,
        volumeTrend,
        muscleSplit,
        streak: { current: currentStreak },
        prs: prs.sort((a, b) => b.weight - a.weight),
        history,
        avgDuration,
        totalSetsCount
      });
    } catch (err) {
      console.log('[Analytics] Error calculating analytical data:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  setDateRange: async (startDate: string, endDate: string, range: TimeRange) => {
    set({ startDate, endDate, timeRange: range });
    await get().fetchAnalyticsData(startDate, endDate, range);
  }
}));
