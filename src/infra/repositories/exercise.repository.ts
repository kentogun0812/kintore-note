import { queryAll, queryOne, runExecute } from '../db/sqlite';
import * as Crypto from 'expo-crypto';
import { getExerciseDetailFallback, ExerciseDetailInfo } from '@/constants/exerciseDetails';

export interface MuscleGroupModel {
  id: string;
  name_ja: string;
  name_en: string;
  body_region: string;
  sort_order: number;
}

export interface ExerciseModel {
  id: string;
  name_ja: string;
  name_en: string;
  muscle_group_id: string;
  is_system: number; // 1 = system, 0 = custom
  muscle_groups?: MuscleGroupModel | null;
  details?: ExerciseDetailInfo;
}

export const ExerciseRepository = {
  /**
   * Fetch all muscle groups ordered by sort_order
   */
  getMuscleGroups(userId: string = 'guest'): MuscleGroupModel[] {
    return queryAll<MuscleGroupModel>(
      `SELECT id, name_ja, name_en, body_region, sort_order 
       FROM muscle_groups
       UNION ALL
       SELECT id, name_ja, name_en, 'custom' as body_region, sort_order 
       FROM custom_muscle_groups 
       WHERE (user_id = ? OR user_id = 'guest') AND syncStatus != 'deleted'
       ORDER BY sort_order ASC;`,
      [userId]
    );
  },

  /**
   * Fetch exercises (both system and custom) for a specific muscle group
   */
  getExercisesByMuscleGroup(muscleGroupId: string, userId: string = 'guest'): ExerciseModel[] {
    return queryAll<ExerciseModel>(
      `SELECT id, name_ja, name_en, muscle_group_id, 1 as is_system 
       FROM exercises 
       WHERE muscle_group_id = ?
       UNION ALL
       SELECT id, name_ja, name_en, muscle_group_id, 0 as is_system 
       FROM custom_exercises 
       WHERE muscle_group_id = ? AND (user_id = ? OR user_id = 'guest')`,
      [muscleGroupId, muscleGroupId, userId]
    );
  },

  /**
   * Fetch all exercises with their joined muscle groups
   */
  getAllExercises(userId: string = 'guest'): ExerciseModel[] {
    const rawExercises = queryAll<any>(
      `SELECT id, name_ja, name_en, muscle_group_id, is_system, user_id FROM (
        SELECT id, name_ja, name_en, muscle_group_id, 1 as is_system, 'guest' as user_id FROM exercises
        UNION ALL
        SELECT id, name_ja, name_en, muscle_group_id, 0 as is_system, user_id FROM custom_exercises
      ) WHERE user_id = ? OR user_id = 'guest' OR ? = 'guest'`,
      [userId, userId]
    );

    const mgs = this.getMuscleGroups(userId);
    const mgMap = new Map<string, MuscleGroupModel>();
    for (const mg of mgs) {
      mgMap.set(mg.id, mg);
    }

    return rawExercises.map(ex => {
      const mg = mgMap.get(ex.muscle_group_id) || null;
      return {
        id: ex.id,
        name_ja: ex.name_ja,
        name_en: ex.name_en,
        muscle_group_id: ex.muscle_group_id,
        is_system: ex.is_system,
        muscle_groups: mg,
        details: getExerciseDetailFallback(ex.id, ex.name_ja, ex.name_en, mg?.name_ja, mg?.name_en)
      };
    });
  },

  /**
   * Create a custom exercise locally
   */
  createCustomExercise(nameJa: string, nameEn: string, muscleGroupId: string, userId: string): string {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    
    runExecute(
      `INSERT INTO custom_exercises (id, user_id, name_ja, name_en, muscle_group_id, syncStatus, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [id, userId, nameJa, nameEn, muscleGroupId, now, now]
    );
    
    return id;
  },

  /**
   * Create a custom muscle group locally
   */
  createCustomMuscleGroup(nameJa: string, nameEn: string, sortOrder: number, userId: string): string {
    const id = `mg-custom-${Crypto.randomUUID()}`;
    const now = new Date().toISOString();
    
    runExecute(
      `INSERT INTO custom_muscle_groups (id, user_id, name_ja, name_en, sort_order, syncStatus, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [id, userId, nameJa, nameEn, sortOrder, now, now]
    );
    
    return id;
  },

  /**
   * Delete a custom muscle group locally
   */
  deleteCustomMuscleGroup(id: string, userId: string): void {
    const now = new Date().toISOString();
    
    if (userId === 'guest') {
      runExecute('DELETE FROM custom_muscle_groups WHERE id = ?', [id]);
    } else {
      runExecute(
        `UPDATE custom_muscle_groups 
         SET syncStatus = 'deleted', updatedAt = ? 
         WHERE id = ? AND user_id = ?`,
        [now, id, userId]
      );
    }
  },

  /**
   * Delete a custom exercise locally
   */
  deleteCustomExercise(id: string, userId: string): void {
    const now = new Date().toISOString();
    if (userId === 'guest') {
      runExecute('DELETE FROM custom_exercises WHERE id = ?', [id]);
    } else {
      runExecute(
        `UPDATE custom_exercises 
         SET syncStatus = 'deleted', updatedAt = ? 
         WHERE id = ? AND user_id = ?`,
        [now, id, userId]
      );
    }
  },

  /**
   * Toggle favorite status of an exercise
   */
  toggleFavoriteExercise(userId: string, exerciseId: string): boolean {
    const now = new Date().toISOString();
    const existing = queryOne(
      'SELECT id FROM favorite_exercises WHERE user_id = ? AND exercise_id = ?',
      [userId, exerciseId]
    );

    if (existing) {
      if (userId === 'guest') {
        runExecute('DELETE FROM favorite_exercises WHERE user_id = ? AND exercise_id = ?', [userId, exerciseId]);
      } else {
        runExecute(
          `UPDATE favorite_exercises 
           SET syncStatus = 'deleted', updatedAt = ? 
           WHERE user_id = ? AND exercise_id = ?`,
          [now, userId, exerciseId]
        );
      }
      return false;
    } else {
      const id = Crypto.randomUUID();
      runExecute(
        `INSERT INTO favorite_exercises (id, user_id, exercise_id, syncStatus, createdAt, updatedAt)
         VALUES (?, ?, ?, 'pending', ?, ?)`,
        [id, userId, exerciseId, now, now]
      );
      return true;
    }
  },

  /**
   * Get all favorite exercise IDs for a user
   */
  getFavoriteExerciseIds(userId: string): string[] {
    const favs = queryAll<{ exercise_id: string }>(
      `SELECT exercise_id FROM favorite_exercises 
       WHERE user_id = ? AND syncStatus != 'deleted'`,
      [userId]
    );
    return favs.map(f => f.exercise_id);
  },

  /**
   * Fetch a single exercise by ID
   */
  getExerciseById(id: string, userId: string = 'guest'): ExerciseModel | null {
    const ex = queryOne<any>(
      `SELECT id, name_ja, name_en, muscle_group_id, 1 as is_system 
       FROM exercises 
       WHERE id = ?
       UNION ALL
       SELECT id, name_ja, name_en, muscle_group_id, 0 as is_system 
       FROM custom_exercises 
       WHERE id = ? AND (user_id = ? OR user_id = 'guest')`,
      [id, id, userId, userId]
    );
    if (!ex) return null;

    const mgs = this.getMuscleGroups(userId);
    const mg = mgs.find(m => m.id === ex.muscle_group_id) || null;

    return {
      id: ex.id,
      name_ja: ex.name_ja,
      name_en: ex.name_en,
      muscle_group_id: ex.muscle_group_id,
      is_system: ex.is_system,
      muscle_groups: mg,
      details: getExerciseDetailFallback(ex.id, ex.name_ja, ex.name_en, mg?.name_ja, mg?.name_en)
    };
  },

  /**
   * Fetch exercise detail for an exercise ID
   */
  getExerciseDetails(id: string, userId: string = 'guest'): ExerciseDetailInfo {
    const ex = this.getExerciseById(id, userId);
    if (ex && ex.details) return ex.details;
    return getExerciseDetailFallback(id);
  }
};

