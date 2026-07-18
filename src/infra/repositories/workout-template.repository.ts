import { queryAll, queryOne, runExecute, getSqliteDb } from '../db/sqlite';
import * as Crypto from 'expo-crypto';

export interface SavedWorkoutTemplateModel {
  id: string;
  name: string;
  createdAt: string;
  exercises: {
    id: string;
    name_ja: string;
    name_en: string;
  }[];
}

export const WorkoutTemplateRepository = {
  /**
   * Fetch all saved Workouts and their corresponding exercises for a user
   */
  fetchSavedWorkoutTemplates(userId: string): SavedWorkoutTemplateModel[] {
    const templates = queryAll<{ id: string; name: string; createdAt: string }>(
      `SELECT id, name, createdAt 
       FROM workout_templates 
       WHERE user_id = ? AND syncStatus != 'deleted'
       ORDER BY createdAt DESC`,
      [userId]
    );

    const mgs = queryAll<any>('SELECT id, name_ja, name_en FROM muscle_groups;');
    const exercisesList = queryAll<any>(
      `SELECT id, name_ja, name_en FROM (
        SELECT id, name_ja, name_en, 'guest' as user_id FROM exercises
        UNION ALL
        SELECT id, name_ja, name_en, user_id FROM custom_exercises
      ) WHERE user_id = ? OR user_id = 'guest'`,
      [userId]
    );
    const exerciseMapJa = new Map<string, string>();
    const exerciseMapEn = new Map<string, string>();
    for (const ex of exercisesList) {
      exerciseMapJa.set(ex.id, ex.name_ja);
      exerciseMapEn.set(ex.id, ex.name_en);
    }

    const result: SavedWorkoutTemplateModel[] = [];

    for (const template of templates) {
      const templateExs = queryAll<{ exercise_id: string; sort_order: number }>(
        `SELECT exercise_id, sort_order 
         FROM workout_template_exercises 
         WHERE workout_template_id = ? AND syncStatus != 'deleted'
         ORDER BY sort_order ASC`,
        [template.id]
      );

      result.push({
        id: template.id,
        name: template.name,
        createdAt: template.createdAt,
        exercises: templateExs.map(me => ({
          id: me.exercise_id,
          name_ja: exerciseMapJa.get(me.exercise_id) || '不明なエクササイズ',
          name_en: exerciseMapEn.get(me.exercise_id) || 'Unknown Exercise'
        }))
      });
    }

    return result;
  },

  /**
   * Save a training Workout locally
   */
  saveWorkoutTemplate(userId: string, name: string, exercises: { id: string }[]): string {
    const db = getSqliteDb();
    const templateId = Crypto.randomUUID();
    const now = new Date().toISOString();

    db.withTransactionSync(() => {
      // 1. Insert Workout Template
      db.runSync(
        `INSERT INTO workout_templates (id, user_id, name, syncStatus, createdAt, updatedAt)
         VALUES (?, ?, ?, 'pending', ?, ?)`,
        [templateId, userId, name, now, now]
      );

      // 2. Insert Workout Template Exercises
      let sortOrder = 0;
      for (const ex of exercises) {
        const id = Crypto.randomUUID();
        db.runSync(
          `INSERT INTO workout_template_exercises (id, workout_template_id, exercise_id, sort_order, target_sets, target_reps, syncStatus, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, 3, 10, 'pending', ?, ?)`,
          [id, templateId, ex.id, sortOrder++, now, now]
        );
      }
    });

    console.log(`[WorkoutTemplateRepository] Saved template ${templateId} locally.`);
    return templateId;
  }
};
