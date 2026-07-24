import { DetailedMuscleStat } from '@/store/analytics.store';
import { colors } from '@/constants/colors';

export type SvgMuscleKey =
  | 'traps'
  | 'shoulders'
  | 'chest'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'lats'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'lower_back';

export interface AggregatedMuscleStat {
  key: SvgMuscleKey;
  nameJa: string;
  nameEn: string;
  workoutCount: number;
  setCount: number;
  volume: number;
  lastActiveAt: string | null;
}

export const SVG_MUSCLE_NAMES: Record<SvgMuscleKey, { ja: string; en: string }> = {
  chest: { ja: '胸 (Chest)', en: 'Chest' },
  shoulders: { ja: '肩 (Shoulders)', en: 'Shoulders' },
  biceps: { ja: '上腕二頭筋 (Biceps)', en: 'Biceps' },
  triceps: { ja: '上腕三頭筋 (Triceps)', en: 'Triceps' },
  forearms: { ja: '前腕 (Forearms)', en: 'Forearms' },
  abs: { ja: '腹筋 (Abs)', en: 'Abs' },
  obliques: { ja: '腹斜筋 (Obliques)', en: 'Obliques' },
  traps: { ja: '僧帽筋 (Traps)', en: 'Trapezius' },
  lats: { ja: '広背筋 (Lats)', en: 'Latissimus Dorsi' },
  lower_back: { ja: '脊柱起立筋 (Lower Back)', en: 'Lower Back' },
  glutes: { ja: '臀部 (Glutes)', en: 'Glutes' },
  quads: { ja: '大腿四頭筋 (Quads)', en: 'Quadriceps' },
  hamstrings: { ja: 'ハムストリングス (Hamstrings)', en: 'Hamstrings' },
  calves: { ja: 'ふくらはぎ (Calves)', en: 'Calves' },
};

/**
 * Green Heatmap Color palette (unworked -> light green -> vibrant green)
 */
export function getMuscleColor(volume: number, maxVolume: number): string {
  if (!volume || volume <= 0 || maxVolume <= 0) {
    return '#1E1E1E'; // Gray / Unworked (tertiary bg)
  }

  const intensity = Math.min(volume / maxVolume, 1.0);

  if (intensity < 0.2) return '#143823'; // Very light green tint
  if (intensity < 0.4) return '#1E5936'; // Light green
  if (intensity < 0.6) return '#2D824E'; // Medium green
  if (intensity < 0.8) return '#3DB36B'; // Bright green
  return '#52D685';                       // Intense green
}

/**
 * Maps exercise ID / DB muscle group ID to specific SvgMuscleKeys
 */
export function mapExerciseToSvgMuscleKeys(exerciseId: string, mgId: string): SvgMuscleKey[] {
  const ex = exerciseId.toLowerCase();
  
  // Specific Exercise Mappings
  if (ex.includes('ex-chest')) return ['chest'];
  if (ex.includes('ex-shoulders')) return ['shoulders'];
  if (ex.includes('ex-arms')) {
    // Distinguish biceps vs triceps from exercise ID/name
    if (['ex-arms-01', 'ex-arms-02', 'ex-arms-03', 'ex-arms-04', 'ex-arms-05', 'ex-arms-06'].some(id => ex.includes(id))) {
      return ['biceps'];
    }
    if (['ex-arms-07', 'ex-arms-08', 'ex-arms-09', 'ex-arms-10', 'ex-arms-11', 'ex-arms-12'].some(id => ex.includes(id))) {
      return ['triceps'];
    }
    return ['biceps', 'triceps'];
  }
  if (ex.includes('ex-forearms')) return ['forearms'];
  if (ex.includes('ex-core')) {
    if (ex.includes('ex-core-06') || ex.includes('ex-core-07')) return ['obliques'];
    return ['abs'];
  }
  if (ex.includes('ex-legs')) {
    if (ex.includes('ex-legs-07')) return ['hamstrings'];
    return ['quads'];
  }
  if (ex.includes('ex-glutes')) return ['glutes'];
  if (ex.includes('ex-back')) {
    if (ex.includes('ex-back-01') || ex.includes('ex-back-10')) return ['lower_back'];
    if (ex.includes('ex-back-09')) return ['traps'];
    return ['lats'];
  }

  // Fallback by DB muscle group ID
  switch (mgId) {
    case 'mg-chest': return ['chest'];
    case 'mg-shoulders': return ['shoulders'];
    case 'mg-arms': return ['biceps', 'triceps'];
    case 'mg-forearms': return ['forearms'];
    case 'mg-core': return ['abs'];
    case 'mg-legs': return ['quads', 'calves'];
    case 'mg-glutes': return ['glutes'];
    case 'mg-back': return ['lats', 'traps'];
    default: return [];
  }
}

/**
 * Aggregates raw stats from DB store into a dictionary of SVG muscle keys -> AggregatedMuscleStat
 */
export function aggregateMuscleStats(rawStats: DetailedMuscleStat[]): {
  statsMap: Record<SvgMuscleKey, AggregatedMuscleStat>;
  maxVolume: number;
} {
  const statsMap: Record<SvgMuscleKey, AggregatedMuscleStat> = {
    chest: { key: 'chest', nameJa: SVG_MUSCLE_NAMES.chest.ja, nameEn: SVG_MUSCLE_NAMES.chest.en, workoutCount: 0, setCount: 0, volume: 0, lastActiveAt: null },
    shoulders: { key: 'shoulders', nameJa: SVG_MUSCLE_NAMES.shoulders.ja, nameEn: SVG_MUSCLE_NAMES.shoulders.en, workoutCount: 0, setCount: 0, volume: 0, lastActiveAt: null },
    biceps: { key: 'biceps', nameJa: SVG_MUSCLE_NAMES.biceps.ja, nameEn: SVG_MUSCLE_NAMES.biceps.en, workoutCount: 0, setCount: 0, volume: 0, lastActiveAt: null },
    triceps: { key: 'triceps', nameJa: SVG_MUSCLE_NAMES.triceps.ja, nameEn: SVG_MUSCLE_NAMES.triceps.en, workoutCount: 0, setCount: 0, volume: 0, lastActiveAt: null },
    forearms: { key: 'forearms', nameJa: SVG_MUSCLE_NAMES.forearms.ja, nameEn: SVG_MUSCLE_NAMES.forearms.en, workoutCount: 0, setCount: 0, volume: 0, lastActiveAt: null },
    abs: { key: 'abs', nameJa: SVG_MUSCLE_NAMES.abs.ja, nameEn: SVG_MUSCLE_NAMES.abs.en, workoutCount: 0, setCount: 0, volume: 0, lastActiveAt: null },
    obliques: { key: 'obliques', nameJa: SVG_MUSCLE_NAMES.obliques.ja, nameEn: SVG_MUSCLE_NAMES.obliques.en, workoutCount: 0, setCount: 0, volume: 0, lastActiveAt: null },
    traps: { key: 'traps', nameJa: SVG_MUSCLE_NAMES.traps.ja, nameEn: SVG_MUSCLE_NAMES.traps.en, workoutCount: 0, setCount: 0, volume: 0, lastActiveAt: null },
    lats: { key: 'lats', nameJa: SVG_MUSCLE_NAMES.lats.ja, nameEn: SVG_MUSCLE_NAMES.lats.en, workoutCount: 0, setCount: 0, volume: 0, lastActiveAt: null },
    lower_back: { key: 'lower_back', nameJa: SVG_MUSCLE_NAMES.lower_back.ja, nameEn: SVG_MUSCLE_NAMES.lower_back.en, workoutCount: 0, setCount: 0, volume: 0, lastActiveAt: null },
    glutes: { key: 'glutes', nameJa: SVG_MUSCLE_NAMES.glutes.ja, nameEn: SVG_MUSCLE_NAMES.glutes.en, workoutCount: 0, setCount: 0, volume: 0, lastActiveAt: null },
    quads: { key: 'quads', nameJa: SVG_MUSCLE_NAMES.quads.ja, nameEn: SVG_MUSCLE_NAMES.quads.en, workoutCount: 0, setCount: 0, volume: 0, lastActiveAt: null },
    hamstrings: { key: 'hamstrings', nameJa: SVG_MUSCLE_NAMES.hamstrings.ja, nameEn: SVG_MUSCLE_NAMES.hamstrings.en, workoutCount: 0, setCount: 0, volume: 0, lastActiveAt: null },
    calves: { key: 'calves', nameJa: SVG_MUSCLE_NAMES.calves.ja, nameEn: SVG_MUSCLE_NAMES.calves.en, workoutCount: 0, setCount: 0, volume: 0, lastActiveAt: null },
  };

  for (const item of rawStats) {
    const keys = mapExerciseToSvgMuscleKeys(item.exerciseId, item.muscleGroupId);
    for (const key of keys) {
      if (statsMap[key]) {
        statsMap[key].workoutCount += item.workoutCount;
        statsMap[key].setCount += item.setCount;
        statsMap[key].volume += item.volume;
        if (item.lastActiveAt) {
          if (!statsMap[key].lastActiveAt || new Date(item.lastActiveAt) > new Date(statsMap[key].lastActiveAt!)) {
            statsMap[key].lastActiveAt = item.lastActiveAt;
          }
        }
      }
    }
  }

  const volumes = Object.values(statsMap).map(s => s.volume);
  const maxVolume = Math.max(...volumes, 1);

  return { statsMap, maxVolume };
}
