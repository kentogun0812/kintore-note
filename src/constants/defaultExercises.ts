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

export const DEFAULT_EXERCISES: ExerciseSeed[] = [];
