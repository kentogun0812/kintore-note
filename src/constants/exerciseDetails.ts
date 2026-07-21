export interface ExerciseDetailInfo {
  exerciseId: string;
  descriptionJa: string;
  descriptionEn: string;
  benefitsJa: string[];
  benefitsEn: string[];
  imageUrl?: string;
  videoUrl?: string;
}

export const EXERCISE_DETAILS_MAP: Record<string, ExerciseDetailInfo> = {
  'ex-chest-01': {
    exerciseId: 'ex-chest-01',
    descriptionJa: 'ベンチプレスは、大胸筋、上腕三頭筋、三角筋前部を効果的に鍛える胸の基本複合種目です。',
    descriptionEn: 'The Bench Press is a fundamental compound movement targeting the chest, triceps, and anterior deltoids.',
    benefitsJa: ['上半身の筋力と押し出す力を大幅向上', '大胸筋全体の厚みとボリュームを構築', '骨密度の向上と体幹の安定'],
    benefitsEn: ['Maximizes upper body pushing strength', 'Builds overall chest mass and volume', 'Improves bone density and core stability'],
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
  },
  'ex-chest-02': {
    exerciseId: 'ex-chest-02',
    descriptionJa: 'インクラインベンチプレスは、ベンチに角度をつけて大胸筋上部を重点的に刺激する種目です。',
    descriptionEn: 'Incline Bench Press targets the upper portion of the pectoralis major and upper chest region.',
    benefitsJa: ['大胸筋上部の立体感と厚みを創出', '肩関節まわりの補強と押し出し力の強化'],
    benefitsEn: ['Develops upper chest volume and upper line', 'Strengthens shoulder girdle and incline pressing ability'],
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
  },
  'ex-chest-09': {
    exerciseId: 'ex-chest-09',
    descriptionJa: '自重を利用して胸、肩、腕を鍛えるクラシックなトレーニング種目です。',
    descriptionEn: 'A classic bodyweight exercise that builds chest, shoulder, and triceps strength anywhere.',
    benefitsJa: ['特別な器具が不要でどこでも実施可能', '体幹の協調性と安定性を強化'],
    benefitsEn: ['Requires no equipment and can be done anywhere', 'Enhances core tension and functional movement integration'],
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80',
  },
  'ex-back-01': {
    exerciseId: 'ex-back-01',
    descriptionJa: 'デッドリフトは全身の背面筋群（広背筋、脊柱起立筋、臀筋、ハムストリングス）を強力に動員する最重要種目です。',
    descriptionEn: 'The Deadlift is the ultimate posterior chain exercise, recruiting lats, spinal erectors, glutes, and hamstrings.',
    benefitsJa: ['全身の圧倒的なパワーと筋量を向上', '姿勢の改善と腰部の補強', '握力と体幹剛性の強化'],
    benefitsEn: ['Dramatically builds total body raw power', 'Enhances posture and lower back resilience', 'Maximizes grip strength and trunk stiffness'],
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  },
  'ex-back-02': {
    exerciseId: 'ex-back-02',
    descriptionJa: 'バーを胸元に引くことで広背筋を意識しやすく、広い背中を作るための代表的なマシン種目です。',
    descriptionEn: 'A staple vertical pulling exercise focused on strengthening the latissimus dorsi for a wide back.',
    benefitsJa: ['逆三角形の広い背中を構築', '引き寄せる筋力と肩甲骨の可動性を向上'],
    benefitsEn: ['Creates V-taper lat width', 'Improves vertical pulling strength and scapular mobility'],
    imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',
  },
  'ex-shoulders-01': {
    exerciseId: 'ex-shoulders-01',
    descriptionJa: 'ウエイトを頭上に押し上げ、三角筋の各ヘッドと上腕三頭筋を連動して鍛える基本種目です。',
    descriptionEn: 'Overhead pressing movement that builds rounded deltoid mass and overhead lock-out stability.',
    benefitsJa: ['丸みのある立体的な肩の形成', '頭上への押し出し能力と体幹バランスの強化'],
    benefitsEn: ['Builds 3D shoulder fullness and width', 'Improves overhead stability and core control'],
    imageUrl: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=800&q=80',
  },
  'ex-legs-01': {
    exerciseId: 'ex-legs-01',
    descriptionJa: 'バックスクワットはキング・オブ・エクササイズと呼ばれ、大腿四頭筋・臀筋・ハチマキ筋を包括的に鍛えます。',
    descriptionEn: 'The Back Squat is known as the king of exercises, building leg strength, quads, and glutes.',
    benefitsJa: ['下半身全体の爆発的な筋力向上', '成長ホルモンの分泌と代謝の向上', '関節と腱の補強'],
    benefitsEn: ['Maximizes lower body power and leg hyper-trophy', 'Boosts hormonal response and metabolism', 'Strengthens knee and hip joints'],
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
  },
  'ex-arms-01': {
    exerciseId: 'ex-arms-01',
    descriptionJa: 'バーベルを使用して上腕二頭筋に強い負荷をかけ、力こぶのサイズアップを狙う孤立種目です。',
    descriptionEn: 'Classic isolation exercise focused on overloading the biceps brachii for arm thickness.',
    benefitsJa: ['力こぶのピークと太さを構築', '肘屈曲力の強化'],
    benefitsEn: ['Increases bicep peak and arm size', 'Enhances elbow flexion power'],
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
  },
  'ex-core-05': {
    exerciseId: 'ex-core-05',
    descriptionJa: '前腕と足先で身体を一直線に支え、腹直筋・腹横筋を中心とする深層体幹筋をアイソメトリックに鍛えます。',
    descriptionEn: 'An isometric core hold that builds abdominal endurance, spinal alignment, and deep stability.',
    benefitsJa: ['腰痛予防と綺麗な姿勢の維持', 'ブレない体幹の軸を強化'],
    benefitsEn: ['Protects lower back and refines posture', 'Develops solid midsection stability'],
    imageUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=800&q=80',
  },
};

/**
 * Fallback generator for custom or unmapped exercises
 */
export function getExerciseDetailFallback(
  exerciseId: string,
  nameJa?: string,
  nameEn?: string,
  muscleGroupJa?: string,
  muscleGroupEn?: string
): ExerciseDetailInfo {
  if (EXERCISE_DETAILS_MAP[exerciseId]) {
    return EXERCISE_DETAILS_MAP[exerciseId];
  }

  const nJa = nameJa || 'トレーニング種目';
  const nEn = nameEn || 'Exercise';
  const mJa = muscleGroupJa || '対象部位';
  const mEn = muscleGroupEn || 'Target Muscle';

  return {
    exerciseId,
    descriptionJa: `${nJa}は${mJa}を中心とした筋肉群を鍛える効果的なエクササイズです。正しいフォームを意識して丁寧に動作を行いましょう。`,
    descriptionEn: `${nEn} is an effective movement targeting the ${mEn}. Focus on maintaining proper form throughout the full range of motion.`,
    benefitsJa: [
      `${mJa}の筋力向上面と引き締め効果`,
      'トレーニングパフォーマンスの向上とフォーム習得',
    ],
    benefitsEn: [
      `Improves strength and muscle tone in ${mEn}`,
      'Enhances movement pattern proficiency and stability',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  };
}
