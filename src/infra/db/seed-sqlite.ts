import { getSqliteDb } from './sqlite';
import * as Crypto from 'expo-crypto';

export function seedPresetTemplatesSqlite(): boolean {
  const db = getSqliteDb();
  try {
    const count = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM preset_weekly_plans;');
    if (count && count.count > 0) {
      return false;
    }

    console.log('[SQLite] Seeding preset templates with new exercise IDs...');

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
          { day: 1, name_ja: '全身 A', name_en: 'Full Body A', exercises: ['0043', '0025', '0818', '0091', '0274'] },
          { day: 3, name_ja: '全身 B', name_en: 'Full Body B', exercises: ['0032', '0047', '0652', '0334', '0865'] },
          { day: 5, name_ja: '全身 A', name_en: 'Full Body A', exercises: ['0043', '0025', '0818', '0091', '0274'] },
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
          { day: 1, name_ja: '上半身 A', name_en: 'Upper Body A', exercises: ['0025', '0818', '0091'] },
          { day: 3, name_ja: '下半身 A', name_en: 'Lower Body A', exercises: ['0043', '0739', '0274'] },
          { day: 5, name_ja: '上半身 B', name_en: 'Upper Body B', exercises: ['0289', '0027', '0294'] },
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
          { day: 1, name_ja: '脂肪燃焼 A', name_en: 'Fat Burn A', exercises: ['0685', '0662', '0274', '0464'] },
          { day: 3, name_ja: '脂肪燃焼 B', name_en: 'Fat Burn B', exercises: ['0043', '0652', '0865'] },
          { day: 5, name_ja: '脂肪燃焼 A', name_en: 'Fat Burn A', exercises: ['0685', '0662', '0274', '0464'] },
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
          { day: 1, name_ja: 'プッシュの日', name_en: 'Push Day', exercises: ['0025', '0047', '0405', '0334', '0201'] },
          { day: 2, name_ja: 'プルの日', name_en: 'Pull Day', exercises: ['0032', '0818', '0027', '0294', '0203'] },
          { day: 3, name_ja: '脚の日', name_en: 'Legs Day', exercises: ['0043', '0739', '0410', '0274', '0464'] },
          { day: 4, name_ja: 'プッシュの日', name_en: 'Push Day', exercises: ['0025', '0047', '0405', '0334', '0201'] },
          { day: 5, name_ja: 'プルの日', name_en: 'Pull Day', exercises: ['0032', '0818', '0027', '0294', '0203'] },
          { day: 6, name_ja: '脚の日', name_en: 'Legs Day', exercises: ['0043', '0739', '0410', '0274', '0464'] },
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
          { day: 1, name_ja: '胸 & 背中', name_en: 'Chest & Back', exercises: ['0025', '0047', '0818', '0027'] },
          { day: 2, name_ja: '肩 & 腕', name_en: 'Shoulders & Arms', exercises: ['0091', '0334', '0031', '0201'] },
          { day: 3, name_ja: '脚 & 腹筋', name_en: 'Legs & Core', exercises: ['0043', '0739', '0274', '0464'] },
          { day: 4, name_ja: '胸 & 背中', name_en: 'Chest & Back', exercises: ['0025', '0047', '0818', '0027'] },
          { day: 5, name_ja: '肩 & 腕', name_en: 'Shoulders & Arms', exercises: ['0091', '0334', '0031', '0201'] },
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
          { day: 1, name_ja: 'スクワット重視', name_en: 'Squat Focus', exercises: ['0043', '0739', '0464'] },
          { day: 2, name_ja: 'ベンチプレス重視', name_en: 'Bench Focus', exercises: ['0025', '0047', '0334', '0201'] },
          { day: 4, name_ja: 'デッドリフト重視', name_en: 'Deadlift Focus', exercises: ['0032', '0027', '0865'] },
          { day: 5, name_ja: 'プレス重視', name_en: 'Press Focus', exercises: ['0091', '0091', '0652', '0294'] },
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
