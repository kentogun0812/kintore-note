export interface ExerciseDetailInfo {
  exerciseId: string;
  descriptionJa: string;
  descriptionEn: string;
  benefitsJa: string[];
  benefitsEn: string[];
  imageUrl?: string;
  videoUrl?: string;
}

export const EXERCISE_DETAILS_MAP: Record<string, ExerciseDetailInfo> = {};

export function getExerciseDetailFallback(
  exerciseId: string,
  nameJa?: string,
  nameEn?: string,
  muscleGroupJa?: string,
  muscleGroupEn?: string
): ExerciseDetailInfo {
  const nJa = nameJa || 'トレーニング種目';
  const nEn = nameEn || 'Exercise';
  const mJa = muscleGroupJa || '対象部位';
  const mEn = muscleGroupEn || 'Target Muscle';

  return {
    exerciseId,
    descriptionJa: `${nJa}は${mJa}を中心とした筋肉群を鍛える効果的なエクササイズです。正しいフォームを意識して丁寧に動作を行いましょう。`,
    descriptionEn: `${nEn} is an effective movement targeting the ${mEn}. Focus on maintaining proper form throughout the full range of motion.`,
    benefitsJa: [
      `${mJa}の筋力向上面 và hiệu quả săn chắc`,
      'トレーニングパフォーマンスの向上とフォーム習得',
    ],
    benefitsEn: [
      `Improves strength and muscle tone in ${mEn}`,
      'Enhances movement pattern proficiency and stability',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  };
}
