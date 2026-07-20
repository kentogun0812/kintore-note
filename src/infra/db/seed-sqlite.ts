import { getSqliteDb } from './sqlite';
import { DEFAULT_EXERCISES, DEFAULT_MUSCLE_GROUPS } from '@/constants/defaultExercises';
import * as Crypto from 'expo-crypto';

export function seedDefaultDataSqlite(): boolean {
  const db = getSqliteDb();
  try {
    // Check if seeded already
    const mgCount = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM muscle_groups;');
    const exCount = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM exercises;');

    if (mgCount && mgCount.count === 0 && exCount && exCount.count === 0) {
      console.log('[SQLite] Seeding default muscle groups and exercises...');

      db.withTransactionSync(() => {
        // Seed Muscle Groups
        for (const mg of DEFAULT_MUSCLE_GROUPS) {
          db.runSync(
            `INSERT INTO muscle_groups (id, name_ja, name_en, body_region, sort_order) 
             VALUES (?, ?, ?, ?, ?)`,
            [mg.id, mg.nameJa, mg.nameEn, mg.bodyRegion, mg.sortOrder]
          );
        }

        // Seed Exercises
        for (const ex of DEFAULT_EXERCISES) {
          db.runSync(
            `INSERT INTO exercises (id, name_ja, name_en, muscle_group_id, is_system) 
             VALUES (?, ?, ?, ?, ?)`,
            [ex.id, ex.nameJa, ex.nameEn, ex.primaryGroup, ex.isDefault ? 1 : 0]
          );
        }
      });

      console.log('[SQLite] Default data seeded successfully!');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[SQLite] Error seeding default data:', error);
    return false;
  }
}

export function seedPresetTemplatesSqlite(): boolean {
  const db = getSqliteDb();
  try {
    const count = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM preset_weekly_plans;');
    if (count && count.count > 0) {
      return false;
    }

    console.log('[SQLite] Seeding preset templates...');

    const presets = [
      {
        id: 'fullbody_beginner',
        name_ja: '初心者向け全身プログラム',
        name_en: 'Beginner Full Body',
        desc_ja: '週3日 • 基礎的な筋力と体力をバランスよく養うプログラム。',
        desc_en: '3 Days/Week • Perfect for building solid foundational strength.',
        days: 3,
        weeks: 4,
        level: 'beginner',
        workouts: [
          { day: 1, name_ja: '全身 A', name_en: 'Full Body A', exercises: ['ex-legs-01', 'ex-chest-01', 'ex-back-02', 'ex-shoulders-01', 'ex-core-01'] },
          { day: 3, name_ja: '全身 B', name_en: 'Full Body B', exercises: ['ex-back-01', 'ex-chest-02', 'ex-back-03', 'ex-shoulders-04', 'ex-core-03'] },
          { day: 5, name_ja: '全身 A', name_en: 'Full Body A', exercises: ['ex-legs-01', 'ex-chest-01', 'ex-back-02', 'ex-shoulders-01', 'ex-core-01'] },
        ]
      },
      {
        id: 'upperlower_beginner',
        name_ja: '初心者向け上半身・下半身分割',
        name_en: 'Beginner Upper / Lower',
        desc_ja: '週3日 • 上半身と下半身の日を交互に行う無理のない分割プログラム。',
        desc_en: '3 Days/Week • Focuses on alternating upper and lower muscle groups.',
        days: 3,
        weeks: 4,
        level: 'beginner',
        workouts: [
          { day: 1, name_ja: '上半身 A', name_en: 'Upper Body A', exercises: ['ex-chest-01', 'ex-back-02', 'ex-shoulders-01'] },
          { day: 3, name_ja: '下半身 A', name_en: 'Lower Body A', exercises: ['ex-legs-01', 'ex-legs-03', 'ex-core-01'] },
          { day: 5, name_ja: '上半身 B', name_en: 'Upper Body B', exercises: ['ex-chest-04', 'ex-back-05', 'ex-arms-02'] },
        ]
      },
      {
        id: 'weightloss_beginner',
        name_ja: '初心者向けダイエット・引き締め',
        name_en: 'Beginner Weight Loss',
        desc_ja: '週3日 • 自重トレーニングと有酸素中心の脂肪燃焼プログラム。',
        desc_en: '3 Days/Week • High-intensity bodyweight and cardiovascular focus.',
        days: 3,
        weeks: 4,
        level: 'beginner',
        workouts: [
          { day: 1, name_ja: '脂肪燃焼 A', name_en: 'Fat Burn A', exercises: ['ex-cardio-01', 'ex-chest-09', 'ex-core-01', 'ex-core-05'] },
          { day: 3, name_ja: '脂肪燃焼 B', name_en: 'Fat Burn B', exercises: ['ex-legs-01', 'ex-back-03', 'ex-core-03'] },
          { day: 5, name_ja: '脂肪燃焼 A', name_en: 'Fat Burn A', exercises: ['ex-cardio-01', 'ex-chest-09', 'ex-core-01', 'ex-core-05'] },
        ]
      },
      {
        id: 'ppl_experienced',
        name_ja: '中・上級者向け PPL',
        name_en: 'Experienced Push / Pull / Legs',
        desc_ja: '週6日 • 胸肩三頭／背中二頭／脚に分ける本格的な筋肥大分割法。',
        desc_en: '6 Days/Week • Standard bodybuilding split for muscle hypertrophy.',
        days: 6,
        weeks: 4,
        level: 'experienced',
        workouts: [
          { day: 1, name_ja: 'プッシュの日', name_en: 'Push Day', exercises: ['ex-chest-01', 'ex-chest-02', 'ex-shoulders-03', 'ex-shoulders-04', 'ex-arms-07'] },
          { day: 2, name_ja: 'プルの日', name_en: 'Pull Day', exercises: ['ex-back-01', 'ex-back-02', 'ex-back-07', 'ex-arms-02', 'ex-shoulders-07'] },
          { day: 3, name_ja: '脚の日', name_en: 'Legs Day', exercises: ['ex-legs-01', 'ex-legs-03', 'ex-legs-04', 'ex-core-01', 'ex-core-05'] },
          { day: 4, name_ja: 'プッシュの日', name_en: 'Push Day', exercises: ['ex-chest-01', 'ex-chest-02', 'ex-shoulders-03', 'ex-shoulders-04', 'ex-arms-07'] },
          { day: 5, name_ja: 'プルの日', name_en: 'Pull Day', exercises: ['ex-back-01', 'ex-back-02', 'ex-back-07', 'ex-arms-02', 'ex-shoulders-07'] },
          { day: 6, name_ja: '脚の日', name_en: 'Legs Day', exercises: ['ex-legs-01', 'ex-legs-03', 'ex-legs-04', 'ex-core-01', 'ex-core-05'] },
        ]
      },
      {
        id: 'arnold_experienced',
        name_ja: '中・上級者向け アーノルドスプリット',
        name_en: 'Experienced Arnold Split',
        desc_ja: '週5日 • 胸背中／肩腕／脚に分けるクラシックな分割プログラム。',
        desc_en: '5 Days/Week • The famous chest/back and shoulder/arm split.',
        days: 5,
        weeks: 4,
        level: 'experienced',
        workouts: [
          { day: 1, name_ja: '胸 & 背中', name_en: 'Chest & Back', exercises: ['ex-chest-01', 'ex-chest-02', 'ex-back-02', 'ex-back-05'] },
          { day: 2, name_ja: '肩 & 腕', name_en: 'Shoulders & Arms', exercises: ['ex-shoulders-01', 'ex-shoulders-04', 'ex-arms-01', 'ex-arms-07'] },
          { day: 3, name_ja: '脚 & 腹筋', name_en: 'Legs & Core', exercises: ['ex-legs-01', 'ex-legs-03', 'ex-core-01', 'ex-core-05'] },
          { day: 4, name_ja: '胸 & 背中', name_en: 'Chest & Back', exercises: ['ex-chest-01', 'ex-chest-02', 'ex-back-02', 'ex-back-05'] },
          { day: 5, name_ja: '肩 & 腕', name_en: 'Shoulders & Arms', exercises: ['ex-shoulders-01', 'ex-shoulders-04', 'ex-arms-01', 'ex-arms-07'] },
        ]
      },
      {
        id: 'strength_experienced',
        name_ja: '中・上級者向け パワーリフティング',
        name_en: 'Experienced Powerlifting Strength',
        desc_ja: '週4日 • スクワット、ベンチプレス、デッドリフトの主要3種目を強化。',
        desc_en: '4 Days/Week • Focus on the big compound lifts (Squat, Bench, Deadlift).',
        days: 4,
        weeks: 4,
        level: 'experienced',
        workouts: [
          { day: 1, name_ja: 'スクワット重視', name_en: 'Squat Focus', exercises: ['ex-legs-01', 'ex-legs-03', 'ex-core-05'] },
          { day: 2, name_ja: 'ベンチプレス重視', name_en: 'Bench Focus', exercises: ['ex-chest-01', 'ex-chest-02', 'ex-shoulders-04', 'ex-arms-07'] },
          { day: 4, name_ja: 'デッドリフト重視', name_en: 'Deadlift Focus', exercises: ['ex-back-01', 'ex-back-05', 'ex-core-03'] },
          { day: 5, name_ja: 'プレス重視', name_en: 'Press Focus', exercises: ['ex-shoulders-02', 'ex-shoulders-01', 'ex-back-03', 'ex-arms-02'] },
        ]
      }
    ];

    db.withTransactionSync(() => {
      for (const preset of presets) {
        db.runSync(
          `INSERT INTO preset_weekly_plans (id, name_ja, name_en, desc_ja, desc_en, days, weeks, level) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [preset.id, preset.name_ja, preset.name_en, preset.desc_ja, preset.desc_en, preset.days, preset.weeks, preset.level]
        );

        for (const w of preset.workouts) {
          let sortOrder = 0;
          for (const exId of w.exercises) {
            const exerciseLinkId = Crypto.randomUUID();
            db.runSync(
              `INSERT INTO preset_weekly_plan_exercises (id, preset_plan_id, day_of_week, workout_name_ja, workout_name_en, exercise_id, sort_order) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [exerciseLinkId, preset.id, w.day, w.name_ja, w.name_en, exId, sortOrder++]
            );
          }
        }
      }
    });

    console.log('[SQLite] Preset templates seeded successfully!');
    return true;
  } catch (error) {
    console.error('[SQLite] Error seeding preset templates:', error);
    return false;
  }
}
