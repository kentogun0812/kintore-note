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
  slug?: string;
  name_ja: string;
  name_en: string;
  description_ja?: string;
  description_en?: string;
  muscle_group_id: string;
  difficulty?: string;
  mechanics?: string;
  force?: string;
  body_region?: string;
  instructions?: string[];
  image?: string;
  gif_url?: string;
  is_default?: number;
  sort_order?: number;
  is_system: number; // 1 = system, 0 = custom
  muscle_groups?: MuscleGroupModel | null;
  details?: ExerciseDetailInfo;
  primary_muscles?: string[];
  secondary_muscles?: string[];
  equipment?: string[];
  categories?: string[];
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
    const rawExercises = queryAll<any>(
      `SELECT id, slug, name_ja, name_en, description_ja, description_en, 
              muscle_group_id, difficulty, mechanics, force, body_region, 
              instructions, image, gif_url, is_default, sort_order, 1 as is_system 
       FROM exercises 
       WHERE muscle_group_id = ?
       UNION ALL
       SELECT id, NULL as slug, name_ja, name_en, '' as description_ja, '' as description_en, 
              muscle_group_id, 'Beginner' as difficulty, 'compound' as mechanics, 'push' as force, 'upper' as body_region, 
              '[]' as instructions, NULL as image, NULL as gif_url, 0 as is_default, 9999 as sort_order, 0 as is_system 
       FROM custom_exercises 
       WHERE muscle_group_id = ? AND (user_id = ? OR user_id = 'guest') AND syncStatus != 'deleted'`,
      [muscleGroupId, muscleGroupId, userId]
    );

    const mgs = this.getMuscleGroups(userId);
    const mg = mgs.find(m => m.id === muscleGroupId) || null;

    return rawExercises.map(ex => {
      let insts: string[] = [];
      try {
        insts = JSON.parse(ex.instructions || '[]');
      } catch (e) {
        insts = ex.instructions ? [ex.instructions] : [];
      }

      return {
        id: ex.id,
        slug: ex.slug || '',
        name_ja: ex.name_ja,
        name_en: ex.name_en,
        description_ja: ex.description_ja || '',
        description_en: ex.description_en || '',
        muscle_group_id: ex.muscle_group_id,
        difficulty: ex.difficulty,
        mechanics: ex.mechanics,
        force: ex.force,
        body_region: ex.body_region,
        instructions: insts,
        image: ex.image || '',
        gif_url: ex.gif_url || '',
        is_default: ex.is_default,
        sort_order: ex.sort_order,
        is_system: ex.is_system,
        muscle_groups: mg,
        details: {
          exerciseId: ex.id,
          descriptionJa: ex.description_ja || '',
          descriptionEn: ex.description_en || '',
          benefitsJa: [],
          benefitsEn: [],
          imageUrl: ex.image || undefined,
          videoUrl: ex.gif_url || undefined
        }
      };
    });
  },

  /**
   * Fetch all exercises with their joined muscle groups and relations
   */
  getAllExercises(userId: string = 'guest', options?: { onlySystem?: boolean }): ExerciseModel[] {
    const onlySystem = options?.onlySystem ?? false;

    const query = onlySystem
      ? `SELECT id, slug, name_ja, name_en, description_ja, description_en, 
                muscle_group_id, difficulty, mechanics, force, body_region, 
                instructions, image, gif_url, is_default, sort_order, is_system, 'guest' as user_id 
         FROM exercises`
      : `SELECT id, slug, name_ja, name_en, description_ja, description_en, 
                muscle_group_id, difficulty, mechanics, force, body_region, 
                instructions, image, gif_url, is_default, sort_order, is_system, 'guest' as user_id 
         FROM exercises
         UNION ALL
         SELECT id, NULL as slug, name_ja, name_en, '' as description_ja, '' as description_en, 
                muscle_group_id, 'Beginner' as difficulty, 'compound' as mechanics, 'push' as force, 'upper' as body_region, 
                '[]' as instructions, NULL as image, NULL as gif_url, 0 as is_default, 9999 as sort_order, 0 as is_system, user_id 
         FROM custom_exercises
         WHERE (user_id = ? OR user_id = 'guest' OR ? = 'guest') AND syncStatus != 'deleted'`;

    const params = onlySystem ? [] : [userId, userId];
    const rawExercises = queryAll<any>(query, params);

    const mgs = this.getMuscleGroups(userId);
    const mgMap = new Map<string, MuscleGroupModel>();
    for (const mg of mgs) {
      mgMap.set(mg.id, mg);
    }

    const musclesList = queryAll<{ exercise_id: string; muscle_group_id: string; is_primary: number }>(
      `SELECT exercise_id, muscle_group_id, is_primary FROM exercise_muscles`
    );
    const equipmentList = queryAll<{ exercise_id: string; name_ja: string; name_en: string }>(
      `SELECT ee.exercise_id, eq.name_ja, eq.name_en 
       FROM exercise_equipment ee 
       JOIN equipment eq ON ee.equipment_id = eq.id`
    );
    const categoriesList = queryAll<{ exercise_id: string; name_ja: string; name_en: string }>(
      `SELECT ec.exercise_id, cat.name_ja, cat.name_en 
       FROM exercise_categories ec 
       JOIN categories cat ON ec.category_id = cat.id`
    );

    const musclesMap = new Map<string, { primary: string[]; secondary: string[] }>();
    for (const item of musclesList) {
      if (!musclesMap.has(item.exercise_id)) {
        musclesMap.set(item.exercise_id, { primary: [], secondary: [] });
      }
      const mgName = mgMap.get(item.muscle_group_id)?.name_ja || item.muscle_group_id;
      if (item.is_primary === 1) {
        musclesMap.get(item.exercise_id)!.primary.push(mgName);
      } else {
        musclesMap.get(item.exercise_id)!.secondary.push(mgName);
      }
    }

    const equipmentMap = new Map<string, string[]>();
    for (const item of equipmentList) {
      if (!equipmentMap.has(item.exercise_id)) {
        equipmentMap.set(item.exercise_id, []);
      }
      equipmentMap.get(item.exercise_id)!.push(item.name_ja);
    }

    const categoriesMap = new Map<string, string[]>();
    for (const item of categoriesList) {
      if (!categoriesMap.has(item.exercise_id)) {
        categoriesMap.set(item.exercise_id, []);
      }
      categoriesMap.get(item.exercise_id)!.push(item.name_ja);
    }

    return rawExercises.map(ex => {
      const mg = mgMap.get(ex.muscle_group_id) || null;
      let insts: string[] = [];
      try {
        insts = JSON.parse(ex.instructions || '[]');
      } catch (e) {
        insts = ex.instructions ? [ex.instructions] : [];
      }

      const mus = musclesMap.get(ex.id) || { primary: [], secondary: [] };
      const eq = equipmentMap.get(ex.id) || [];
      const cat = categoriesMap.get(ex.id) || [];

      return {
        id: ex.id,
        slug: ex.slug || '',
        name_ja: ex.name_ja,
        name_en: ex.name_en,
        description_ja: ex.description_ja || '',
        description_en: ex.description_en || '',
        muscle_group_id: ex.muscle_group_id,
        difficulty: ex.difficulty,
        mechanics: ex.mechanics,
        force: ex.force,
        body_region: ex.body_region,
        instructions: insts,
        image: ex.image || '',
        gif_url: ex.gif_url || '',
        is_default: ex.is_default,
        sort_order: ex.sort_order,
        is_system: ex.is_system,
        muscle_groups: mg,
        primary_muscles: mus.primary,
        secondary_muscles: mus.secondary,
        equipment: eq,
        categories: cat,
        details: {
          exerciseId: ex.id,
          descriptionJa: ex.description_ja || '',
          descriptionEn: ex.description_en || '',
          benefitsJa: mus.secondary,
          benefitsEn: [],
          imageUrl: ex.image || undefined,
          videoUrl: ex.gif_url || undefined
        }
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
      `SELECT id, slug, name_ja, name_en, description_ja, description_en, 
              muscle_group_id, difficulty, mechanics, force, body_region, 
              instructions, image, gif_url, is_default, sort_order, 1 as is_system 
       FROM exercises 
       WHERE id = ?
       UNION ALL
       SELECT id, NULL as slug, name_ja, name_en, '' as description_ja, '' as description_en, 
              muscle_group_id, 'Beginner' as difficulty, 'compound' as mechanics, 'push' as force, 'upper' as body_region, 
              '[]' as instructions, NULL as image, NULL as gif_url, 0 as is_default, 9999 as sort_order, 0 as is_system 
       FROM custom_exercises 
       WHERE id = ? AND (user_id = ? OR user_id = 'guest') AND syncStatus != 'deleted'`,
      [id, id, userId]
    );
    if (!ex) return null;

    const mgs = this.getMuscleGroups(userId);
    const mg = mgs.find(m => m.id === ex.muscle_group_id) || null;

    const muscles = queryAll<{ muscle_group_id: string; is_primary: number }>(
      `SELECT muscle_group_id, is_primary FROM exercise_muscles WHERE exercise_id = ?`,
      [id]
    );
    const equipment = queryAll<{ name_ja: string }>(
      `SELECT eq.name_ja 
       FROM exercise_equipment ee 
       JOIN equipment eq ON ee.equipment_id = eq.id 
       WHERE ee.exercise_id = ?`,
      [id]
    );
    const categories = queryAll<{ name_ja: string }>(
      `SELECT cat.name_ja 
       FROM exercise_categories ec 
       JOIN categories cat ON ec.category_id = cat.id 
       WHERE ec.exercise_id = ?`,
      [id]
    );

    let insts: string[] = [];
    try {
      insts = JSON.parse(ex.instructions || '[]');
    } catch (e) {
      insts = ex.instructions ? [ex.instructions] : [];
    }

    const primary_muscles: string[] = [];
    const secondary_muscles: string[] = [];
    for (const item of muscles) {
      const mgName = mgs.find(m => m.id === item.muscle_group_id)?.name_ja || item.muscle_group_id;
      if (item.is_primary === 1) {
        primary_muscles.push(mgName);
      } else {
        secondary_muscles.push(mgName);
      }
    }

    return {
      id: ex.id,
      slug: ex.slug || '',
      name_ja: ex.name_ja,
      name_en: ex.name_en,
      description_ja: ex.description_ja || '',
      description_en: ex.description_en || '',
      muscle_group_id: ex.muscle_group_id,
      difficulty: ex.difficulty,
      mechanics: ex.mechanics,
      force: ex.force,
      body_region: ex.body_region,
      instructions: insts,
      image: ex.image || '',
      gif_url: ex.gif_url || '',
      is_default: ex.is_default,
      sort_order: ex.sort_order,
      is_system: ex.is_system,
      muscle_groups: mg,
      primary_muscles,
      secondary_muscles,
      equipment: equipment.map(e => e.name_ja),
      categories: categories.map(c => c.name_ja),
      details: {
        exerciseId: ex.id,
        descriptionJa: ex.description_ja || '',
        descriptionEn: ex.description_en || '',
        benefitsJa: secondary_muscles,
        benefitsEn: [],
        imageUrl: ex.image || undefined,
        videoUrl: ex.gif_url || undefined
      }
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
