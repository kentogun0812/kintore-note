export interface MuscleGroupSeed {
  id: string;
  nameJa: string;
  nameEn: string;
  bodyRegion: string;
  sortOrder: number;
}

export interface ExerciseSeed {
  id: string;
  nameJa: string;
  nameEn: string;
  primaryGroup: string; // Maps to muscle_group_id
  secondaryGroups?: string[];
  sortOrder: number;
  isDefault: boolean;
}

export const DEFAULT_MUSCLE_GROUPS: MuscleGroupSeed[] = [
  { id: 'mg-chest', nameJa: '胸', nameEn: 'Chest', bodyRegion: 'upper', sortOrder: 1 },
  { id: 'mg-back', nameJa: '背中', nameEn: 'Back', bodyRegion: 'upper', sortOrder: 2 },
  { id: 'mg-shoulders', nameJa: '肩', nameEn: 'Shoulders', bodyRegion: 'upper', sortOrder: 3 },
  { id: 'mg-arms', nameJa: '腕', nameEn: 'Arms', bodyRegion: 'upper', sortOrder: 4 },
  { id: 'mg-core', nameJa: '腹筋', nameEn: 'Core', bodyRegion: 'core', sortOrder: 5 },
  { id: 'mg-legs', nameJa: '脚', nameEn: 'Legs', bodyRegion: 'lower', sortOrder: 6 },
  { id: 'mg-glutes', nameJa: '臀部', nameEn: 'Glutes', bodyRegion: 'lower', sortOrder: 7 },
  { id: 'mg-forearms', nameJa: '前腕', nameEn: 'Forearms', bodyRegion: 'upper', sortOrder: 8 },
  { id: 'mg-fullbody', nameJa: '全身', nameEn: 'Full Body', bodyRegion: 'full_body', sortOrder: 9 },
  { id: 'mg-cardio', nameJa: '有酸素', nameEn: 'Cardio', bodyRegion: 'cardio', sortOrder: 10 },
];

export const DEFAULT_EXERCISES: ExerciseSeed[] = [
  // Chest
  { id: 'ex-chest-01', nameJa: 'ベンチプレス', nameEn: 'Bench Press', primaryGroup: 'mg-chest', sortOrder: 1, isDefault: true },
  { id: 'ex-chest-02', nameJa: 'インクラインベンチプレス', nameEn: 'Incline Bench Press', primaryGroup: 'mg-chest', sortOrder: 2, isDefault: true },
  { id: 'ex-chest-03', nameJa: 'デクラインベンチプレス', nameEn: 'Decline Bench Press', primaryGroup: 'mg-chest', sortOrder: 3, isDefault: true },
  { id: 'ex-chest-04', nameJa: 'ダンベルプレス', nameEn: 'Dumbbell Press', primaryGroup: 'mg-chest', sortOrder: 4, isDefault: true },
  { id: 'ex-chest-05', nameJa: 'インクラインダンベルプレス', nameEn: 'Incline Dumbbell Press', primaryGroup: 'mg-chest', sortOrder: 5, isDefault: true },
  { id: 'ex-chest-06', nameJa: 'ダンベルフライ', nameEn: 'Dumbbell Fly', primaryGroup: 'mg-chest', sortOrder: 6, isDefault: true },
  { id: 'ex-chest-07', nameJa: 'ケーブルフライ', nameEn: 'Cable Fly', primaryGroup: 'mg-chest', sortOrder: 7, isDefault: true },
  { id: 'ex-chest-08', nameJa: 'ペックデックフライ', nameEn: 'Pec Deck Fly', primaryGroup: 'mg-chest', sortOrder: 8, isDefault: true },
  { id: 'ex-chest-09', nameJa: 'プッシュアップ', nameEn: 'Push Up', primaryGroup: 'mg-chest', sortOrder: 9, isDefault: true },
  { id: 'ex-chest-10', nameJa: 'ディップス', nameEn: 'Dips', primaryGroup: 'mg-chest', sortOrder: 10, isDefault: true },

  // Back
  { id: 'ex-back-01', nameJa: 'デッドリフト', nameEn: 'Deadlift', primaryGroup: 'mg-back', sortOrder: 11, isDefault: true },
  { id: 'ex-back-02', nameJa: 'ラットプルダウン', nameEn: 'Lat Pulldown', primaryGroup: 'mg-back', sortOrder: 12, isDefault: true },
  { id: 'ex-back-03', nameJa: '懸垂', nameEn: 'Pull Up', primaryGroup: 'mg-back', sortOrder: 13, isDefault: true },
  { id: 'ex-back-04', nameJa: 'チンニング', nameEn: 'Chin Up', primaryGroup: 'mg-back', sortOrder: 14, isDefault: true },
  { id: 'ex-back-05', nameJa: 'バーベルロー', nameEn: 'Barbell Row', primaryGroup: 'mg-back', sortOrder: 15, isDefault: true },
  { id: 'ex-back-06', nameJa: 'ワンハンドダンベルロー', nameEn: 'One Arm Dumbbell Row', primaryGroup: 'mg-back', sortOrder: 16, isDefault: true },
  { id: 'ex-back-07', nameJa: 'シーテッドロー', nameEn: 'Seated Row', primaryGroup: 'mg-back', sortOrder: 17, isDefault: true },
  { id: 'ex-back-08', nameJa: 'Tバーロー', nameEn: 'T-Bar Row', primaryGroup: 'mg-back', sortOrder: 18, isDefault: true },
  { id: 'ex-back-09', nameJa: 'ストレートアームプルダウン', nameEn: 'Straight Arm Pulldown', primaryGroup: 'mg-back', sortOrder: 19, isDefault: true },
  { id: 'ex-back-10', nameJa: 'バックエクステンション', nameEn: 'Back Extension', primaryGroup: 'mg-back', sortOrder: 20, isDefault: true },

  // Shoulders
  { id: 'ex-shoulders-01', nameJa: 'ショルダープレス', nameEn: 'Shoulder Press', primaryGroup: 'mg-shoulders', sortOrder: 21, isDefault: true },
  { id: 'ex-shoulders-02', nameJa: 'ミリタリープレス', nameEn: 'Military Press', primaryGroup: 'mg-shoulders', sortOrder: 22, isDefault: true },
  { id: 'ex-shoulders-03', nameJa: 'ダンベルショルダープレス', nameEn: 'Dumbbell Shoulder Press', primaryGroup: 'mg-shoulders', sortOrder: 23, isDefault: true },
  { id: 'ex-shoulders-04', nameJa: 'サイドレイズ', nameEn: 'Lateral Raise', primaryGroup: 'mg-shoulders', sortOrder: 24, isDefault: true },
  { id: 'ex-shoulders-05', nameJa: 'フロントレイズ', nameEn: 'Front Raise', primaryGroup: 'mg-shoulders', sortOrder: 25, isDefault: true },
  { id: 'ex-shoulders-06', nameJa: 'リアレイズ', nameEn: 'Rear Delt Raise', primaryGroup: 'mg-shoulders', sortOrder: 26, isDefault: true },
  { id: 'ex-shoulders-07', nameJa: 'フェイスプル', nameEn: 'Face Pull', primaryGroup: 'mg-shoulders', sortOrder: 27, isDefault: true },
  { id: 'ex-shoulders-08', nameJa: 'アップライトロー', nameEn: 'Upright Row', primaryGroup: 'mg-shoulders', sortOrder: 28, isDefault: true },
  { id: 'ex-shoulders-09', nameJa: 'シュラッグ', nameEn: 'Shrug', primaryGroup: 'mg-shoulders', sortOrder: 29, isDefault: true },

  // Arms - Biceps
  { id: 'ex-arms-01', nameJa: 'バーベルカール', nameEn: 'Barbell Curl', primaryGroup: 'mg-arms', sortOrder: 30, isDefault: true },
  { id: 'ex-arms-02', nameJa: 'ダンベルカール', nameEn: 'Dumbbell Curl', primaryGroup: 'mg-arms', sortOrder: 31, isDefault: true },
  { id: 'ex-arms-03', nameJa: 'ハンマーカール', nameEn: 'Hammer Curl', primaryGroup: 'mg-arms', sortOrder: 32, isDefault: true },
  { id: 'ex-arms-04', nameJa: 'プリーチャーカール', nameEn: 'Preacher Curl', primaryGroup: 'mg-arms', sortOrder: 33, isDefault: true },
  { id: 'ex-arms-05', nameJa: 'ケーブルカール', nameEn: 'Cable Curl', primaryGroup: 'mg-arms', sortOrder: 34, isDefault: true },
  { id: 'ex-arms-06', nameJa: 'コンセントレーションカール', nameEn: 'Concentration Curl', primaryGroup: 'mg-arms', sortOrder: 35, isDefault: true },

  // Arms - Triceps
  { id: 'ex-arms-07', nameJa: 'トライセプスプレスダウン', nameEn: 'Triceps Pushdown', primaryGroup: 'mg-arms', sortOrder: 36, isDefault: true },
  { id: 'ex-arms-08', nameJa: 'オーバーヘッドエクステンション', nameEn: 'Overhead Extension', primaryGroup: 'mg-arms', sortOrder: 37, isDefault: true },
  { id: 'ex-arms-09', nameJa: 'スカルクラッシャー', nameEn: 'Skull Crusher', primaryGroup: 'mg-arms', sortOrder: 38, isDefault: true },
  { id: 'ex-arms-10', nameJa: 'ケーブルトライセプスエクステンション', nameEn: 'Cable Extension', primaryGroup: 'mg-arms', sortOrder: 39, isDefault: true },
  { id: 'ex-arms-11', nameJa: 'ナローベンチプレス', nameEn: 'Close Grip Bench Press', primaryGroup: 'mg-arms', sortOrder: 40, isDefault: true },
  { id: 'ex-arms-12', nameJa: 'ディップス', nameEn: 'Dips', primaryGroup: 'mg-arms', sortOrder: 41, isDefault: true }, 

  // Core
  { id: 'ex-core-01', nameJa: 'クランチ', nameEn: 'Crunch', primaryGroup: 'mg-core', sortOrder: 42, isDefault: true },
  { id: 'ex-core-02', nameJa: 'シットアップ', nameEn: 'Sit Up', primaryGroup: 'mg-core', sortOrder: 43, isDefault: true },
  { id: 'ex-core-03', nameJa: 'レッグレイズ', nameEn: 'Leg Raise', primaryGroup: 'mg-core', sortOrder: 44, isDefault: true },
  { id: 'ex-core-04', nameJa: 'ハンギングレッグレイズ', nameEn: 'Hanging Leg Raise', primaryGroup: 'mg-core', sortOrder: 45, isDefault: true },
  { id: 'ex-core-05', nameJa: 'プランク', nameEn: 'Plank', primaryGroup: 'mg-core', sortOrder: 46, isDefault: true },
  { id: 'ex-core-06', nameJa: 'サイドプランク', nameEn: 'Side Plank', primaryGroup: 'mg-core', sortOrder: 47, isDefault: true },
  { id: 'ex-core-07', nameJa: 'ロシアンツイスト', nameEn: 'Russian Twist', primaryGroup: 'mg-core', sortOrder: 48, isDefault: true },
  { id: 'ex-core-08', nameJa: 'アブローラー', nameEn: 'Ab Wheel Rollout', primaryGroup: 'mg-core', sortOrder: 49, isDefault: true },
  { id: 'ex-core-09', nameJa: 'ケーブルクランチ', nameEn: 'Cable Crunch', primaryGroup: 'mg-core', sortOrder: 50, isDefault: true },

  // Legs
  { id: 'ex-legs-01', nameJa: 'バックスクワット', nameEn: 'Back Squat', primaryGroup: 'mg-legs', sortOrder: 51, isDefault: true },
  { id: 'ex-legs-02', nameJa: 'フロントスクワット', nameEn: 'Front Squat', primaryGroup: 'mg-legs', sortOrder: 52, isDefault: true },
  { id: 'ex-legs-03', nameJa: 'レッグプレス', nameEn: 'Leg Press', primaryGroup: 'mg-legs', sortOrder: 53, isDefault: true },
  { id: 'ex-legs-04', nameJa: 'ブルガリアンスクワット', nameEn: 'Bulgarian Split Squat', primaryGroup: 'mg-legs', sortOrder: 54, isDefault: true },
  { id: 'ex-legs-05', nameJa: 'ランジ', nameEn: 'Lunge', primaryGroup: 'mg-legs', sortOrder: 55, isDefault: true },
  { id: 'ex-legs-06', nameJa: 'レッグエクステンション', nameEn: 'Leg Extension', primaryGroup: 'mg-legs', sortOrder: 56, isDefault: true },
  { id: 'ex-legs-07', nameJa: 'レッグカール', nameEn: 'Leg Curl', primaryGroup: 'mg-legs', sortOrder: 57, isDefault: true },
  { id: 'ex-legs-08', nameJa: 'ハックスクワット', nameEn: 'Hack Squat', primaryGroup: 'mg-legs', sortOrder: 58, isDefault: true },
  { id: 'ex-legs-09', nameJa: 'スミスマシンスクワット', nameEn: 'Smith Machine Squat', primaryGroup: 'mg-legs', sortOrder: 59, isDefault: true },

  // Glutes
  { id: 'ex-glutes-01', nameJa: 'ヒップスラスト', nameEn: 'Hip Thrust', primaryGroup: 'mg-glutes', sortOrder: 60, isDefault: true },
  { id: 'ex-glutes-02', nameJa: 'グルートブリッジ', nameEn: 'Glute Bridge', primaryGroup: 'mg-glutes', sortOrder: 61, isDefault: true },
  { id: 'ex-glutes-03', nameJa: 'ケーブルキックバック', nameEn: 'Cable Kickback', primaryGroup: 'mg-glutes', sortOrder: 62, isDefault: true },
  { id: 'ex-glutes-04', nameJa: 'ドンキーキック', nameEn: 'Donkey Kick', primaryGroup: 'mg-glutes', sortOrder: 63, isDefault: true },
  { id: 'ex-glutes-05', nameJa: 'ヒップアブダクション', nameEn: 'Hip Abduction', primaryGroup: 'mg-glutes', sortOrder: 64, isDefault: true },
  { id: 'ex-glutes-06', nameJa: 'ステップアップ', nameEn: 'Step Up', primaryGroup: 'mg-glutes', sortOrder: 65, isDefault: true },

  // Forearms
  { id: 'ex-forearms-01', nameJa: 'リストカール', nameEn: 'Wrist Curl', primaryGroup: 'mg-forearms', sortOrder: 66, isDefault: true },
  { id: 'ex-forearms-02', nameJa: 'リバースリストカール', nameEn: 'Reverse Wrist Curl', primaryGroup: 'mg-forearms', sortOrder: 67, isDefault: true },
  { id: 'ex-forearms-03', nameJa: 'リバースカール', nameEn: 'Reverse Curl', primaryGroup: 'mg-forearms', sortOrder: 68, isDefault: true },
  { id: 'ex-forearms-04', nameJa: 'ファーマーズウォーク', nameEn: 'Farmer\'s Walk', primaryGroup: 'mg-forearms', sortOrder: 69, isDefault: true },
  { id: 'ex-forearms-05', nameJa: 'プレートピンチ', nameEn: 'Plate Pinch', primaryGroup: 'mg-forearms', sortOrder: 70, isDefault: true },

  // Full Body
  { id: 'ex-fullbody-01', nameJa: 'クリーン', nameEn: 'Clean', primaryGroup: 'mg-fullbody', sortOrder: 71, isDefault: true },
  { id: 'ex-fullbody-02', nameJa: 'クリーン＆プレス', nameEn: 'Clean and Press', primaryGroup: 'mg-fullbody', sortOrder: 72, isDefault: true },
  { id: 'ex-fullbody-03', nameJa: 'スラスター', nameEn: 'Thruster', primaryGroup: 'mg-fullbody', sortOrder: 73, isDefault: true },
  { id: 'ex-fullbody-04', nameJa: 'ケトルベルスイング', nameEn: 'Kettlebell Swing', primaryGroup: 'mg-fullbody', sortOrder: 74, isDefault: true },
  { id: 'ex-fullbody-05', nameJa: 'バーピー', nameEn: 'Burpee', primaryGroup: 'mg-fullbody', sortOrder: 75, isDefault: true },
  { id: 'ex-fullbody-06', nameJa: 'スナッチ', nameEn: 'Snatch', primaryGroup: 'mg-fullbody', sortOrder: 76, isDefault: true },

  // Cardio
  { id: 'ex-cardio-01', nameJa: 'ランニング', nameEn: 'Running', primaryGroup: 'mg-cardio', sortOrder: 77, isDefault: true },
  { id: 'ex-cardio-02', nameJa: 'ウォーキング', nameEn: 'Walking', primaryGroup: 'mg-cardio', sortOrder: 78, isDefault: true },
  { id: 'ex-cardio-03', nameJa: 'サイクリング', nameEn: 'Cycling', primaryGroup: 'mg-cardio', sortOrder: 79, isDefault: true },
  { id: 'ex-cardio-04', nameJa: '縄跳び', nameEn: 'Jump Rope', primaryGroup: 'mg-cardio', sortOrder: 80, isDefault: true },
  { id: 'ex-cardio-05', nameJa: 'ローイング', nameEn: 'Rowing', primaryGroup: 'mg-cardio', sortOrder: 81, isDefault: true },
  { id: 'ex-cardio-06', nameJa: '階段昇降', nameEn: 'Stair Climbing', primaryGroup: 'mg-cardio', sortOrder: 82, isDefault: true },
  { id: 'ex-cardio-07', nameJa: 'エアロバイク', nameEn: 'Exercise Bike', primaryGroup: 'mg-cardio', sortOrder: 83, isDefault: true },
  { id: 'ex-cardio-08', nameJa: 'クロストレーナー', nameEn: 'Cross Trainer', primaryGroup: 'mg-cardio', sortOrder: 84, isDefault: true },
];
