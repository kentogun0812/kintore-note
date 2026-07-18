import { getSqliteDb } from './sqlite';
import { DEFAULT_EXERCISES, DEFAULT_MUSCLE_GROUPS } from '@/constants/defaultExercises';

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
