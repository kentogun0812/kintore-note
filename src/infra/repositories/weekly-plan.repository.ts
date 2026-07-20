import { queryAll, runExecute, getSqliteDb } from '../db/sqlite';
import * as Crypto from 'expo-crypto';

export interface WeeklyPlanModel {
  id: string;
  name: string;
  description?: string;
  total_weeks: number;
  start_date?: string;
  is_active: boolean;
  created_at: string;
  assigned_templates?: { id: string | null; name: string | null; plan_week: number; day_of_week: number; is_rest_day: boolean }[];
}

export const WeeklyPlanRepository = {
  /**
   * Fetch all weekly plans for a user
   */
  fetchWeeklyPlans(userId: string): WeeklyPlanModel[] {
    const records = queryAll<any>(
      `SELECT * FROM weekly_plans 
       WHERE user_id = ? AND syncStatus != 'deleted'
       ORDER BY createdAt DESC`,
      [userId]
    );

    return records.map(r => {
      const templates = queryAll<{ id: string | null; name: string | null; plan_week: number; day_of_week: number; is_rest_day: number }>(
        `SELECT t.id, t.name, a.plan_week, a.day_of_week, a.is_rest_day 
         FROM weekly_plan_assigned_templates a
         LEFT JOIN workout_templates t ON a.workout_template_id = t.id
         WHERE a.weekly_plan_id = ? AND a.syncStatus != 'deleted' AND (t.syncStatus != 'deleted' OR t.id IS NULL)
         ORDER BY a.plan_week ASC, a.day_of_week ASC`,
        [r.id]
      );

      return {
        id: r.id,
        name: r.name,
        description: r.description || undefined,
        total_weeks: r.total_weeks,
        start_date: r.start_date || undefined,
        is_active: r.is_active === 1,
        created_at: r.createdAt,
        assigned_templates: templates.map(t => ({
          ...t,
          is_rest_day: t.is_rest_day === 1
        }))
      };
    });
  },

  /**
   * Create a weekly plan locally
   */
  createWeeklyPlan(userId: string, name: string, totalWeeks: number, startDate?: string): string {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();

    runExecute(
      `INSERT INTO weekly_plans (id, user_id, name, total_weeks, start_date, is_active, syncStatus, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 0, 'pending', ?, ?)`,
      [id, userId, name, totalWeeks, startDate || null, now, now]
    );

    return id;
  },

  /**
   * Create a weekly plan from a preset template (Full Body, Upper/Lower, PPL)
   */
  createWeeklyPlanFromTemplate(userId: string, templateType: string, name: string): string {
    const db = getSqliteDb();
    const planId = Crypto.randomUUID();
    const now = new Date().toISOString();

    db.withTransactionSync(() => {
      // 1. Fetch the preset info
      const preset = db.getFirstSync<{ weeks: number }>(
        `SELECT weeks FROM preset_weekly_plans WHERE id = ?`,
        [templateType]
      );
      const totalWeeks = preset ? preset.weeks : 4;

      // 2. Insert the weekly plan
      db.runSync(
        `INSERT INTO weekly_plans (id, user_id, name, total_weeks, start_date, is_active, syncStatus, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, 0, 'pending', ?, ?)`,
        [planId, userId, name, totalWeeks, now.split('T')[0], now, now]
      );

      // 3. Fetch configurations from database
      const rows = db.getAllSync<{ day_of_week: number; workout_name_ja: string; workout_name_en: string; exercise_id: string }>(
        `SELECT day_of_week, workout_name_ja, workout_name_en, exercise_id 
         FROM preset_weekly_plan_exercises 
         WHERE preset_plan_id = ? 
         ORDER BY day_of_week ASC, sort_order ASC`,
        [templateType]
      );

      // Group exercises by day and workout name
      const dayConfigs: { day: number; templateNameJa: string; templateNameEn: string; exercises: string[] }[] = [];
      for (const row of rows) {
        let config = dayConfigs.find(c => c.day === row.day_of_week);
        if (!config) {
          config = {
            day: row.day_of_week,
            templateNameJa: row.workout_name_ja,
            templateNameEn: row.workout_name_en,
            exercises: []
          };
          dayConfigs.push(config);
        }
        config.exercises.push(row.exercise_id);
      }

      // Create workout templates and keep track of IDs
      const createdTemplateIds = new Map<string, string>();
      for (const config of dayConfigs) {
        const templateName = config.templateNameEn;
        if (!createdTemplateIds.has(templateName)) {
          const existing = db.getFirstSync<{ id: string }>(
            `SELECT id FROM workout_templates WHERE user_id = ? AND name = ? AND syncStatus != 'deleted' LIMIT 1`,
            [userId, templateName]
          );

          let templateId = '';
          if (existing) {
            templateId = existing.id;
          } else {
            templateId = Crypto.randomUUID();
            db.runSync(
              `INSERT INTO workout_templates (id, user_id, name, syncStatus, createdAt, updatedAt)
               VALUES (?, ?, ?, 'pending', ?, ?)`,
              [templateId, userId, templateName, now, now]
            );

            let sortOrder = 0;
            for (const exId of config.exercises) {
              const linkId = Crypto.randomUUID();
              db.runSync(
                `INSERT INTO workout_template_exercises (id, workout_template_id, exercise_id, sort_order, target_sets, target_reps, syncStatus, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, 3, 10, 'pending', ?, ?)`,
                [linkId, templateId, exId, sortOrder++, now, now]
              );
            }
          }
          createdTemplateIds.set(templateName, templateId);
        }
      }

      // Assign templates to weeks
      for (let week = 1; week <= totalWeeks; week++) {
        for (let day = 1; day <= 7; day++) {
          const config = dayConfigs.find(c => c.day === day);
          const assignId = Crypto.randomUUID();

          if (config) {
            const templateId = createdTemplateIds.get(config.templateNameEn)!;
            db.runSync(
              `INSERT INTO weekly_plan_assigned_templates (id, weekly_plan_id, workout_template_id, plan_week, day_of_week, is_rest_day, syncStatus, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, 0, 'pending', ?, ?)`,
              [assignId, planId, templateId, week, day, now, now]
            );
          } else {
            db.runSync(
              `INSERT INTO weekly_plan_assigned_templates (id, weekly_plan_id, workout_template_id, plan_week, day_of_week, is_rest_day, syncStatus, createdAt, updatedAt)
               VALUES (?, ?, NULL, ?, ?, 1, 'pending', ?, ?)`,
              [assignId, planId, week, day, now, now]
            );
          }
        }
      }
    });

    return planId;
  },

  /**
   * Apply a preset template to an existing weekly plan
   */
  applyPresetTemplate(userId: string, planId: string, templateType: string, name: string): void {
    const db = getSqliteDb();
    const now = new Date().toISOString();

    db.withTransactionSync(() => {
      // 1. Fetch the preset info
      const preset = db.getFirstSync<{ weeks: number }>(
        `SELECT weeks FROM preset_weekly_plans WHERE id = ?`,
        [templateType]
      );
      const totalWeeks = preset ? preset.weeks : 4;

      // 2. Update the plan total weeks
      db.runSync(
        `UPDATE weekly_plans 
         SET total_weeks = ?, syncStatus = 'pending', updatedAt = ? 
         WHERE id = ?`,
        [totalWeeks, now, planId]
      );

      // If the current name is empty, update it
      const currentPlan = db.getFirstSync<{ name: string }>(
        `SELECT name FROM weekly_plans WHERE id = ?`,
        [planId]
      );
      if (currentPlan && (!currentPlan.name || currentPlan.name.trim() === '')) {
        db.runSync(
          `UPDATE weekly_plans SET name = ? WHERE id = ?`,
          [name, planId]
        );
      }

      // 3. Clear existing assignments
      db.runSync(
        `DELETE FROM weekly_plan_assigned_templates WHERE weekly_plan_id = ?`,
        [planId]
      );

      // 4. Fetch configurations from database
      const rows = db.getAllSync<{ day_of_week: number; workout_name_ja: string; workout_name_en: string; exercise_id: string }>(
        `SELECT day_of_week, workout_name_ja, workout_name_en, exercise_id 
         FROM preset_weekly_plan_exercises 
         WHERE preset_plan_id = ? 
         ORDER BY day_of_week ASC, sort_order ASC`,
        [templateType]
      );

      // Group exercises by day and workout name
      const dayConfigs: { day: number; templateNameJa: string; templateNameEn: string; exercises: string[] }[] = [];
      for (const row of rows) {
        let config = dayConfigs.find(c => c.day === row.day_of_week);
        if (!config) {
          config = {
            day: row.day_of_week,
            templateNameJa: row.workout_name_ja,
            templateNameEn: row.workout_name_en,
            exercises: []
          };
          dayConfigs.push(config);
        }
        config.exercises.push(row.exercise_id);
      }

      // Create workout templates and keep track of IDs
      const createdTemplateIds = new Map<string, string>();
      for (const config of dayConfigs) {
        const templateName = config.templateNameEn;
        if (!createdTemplateIds.has(templateName)) {
          const existing = db.getFirstSync<{ id: string }>(
            `SELECT id FROM workout_templates WHERE user_id = ? AND name = ? AND syncStatus != 'deleted' LIMIT 1`,
            [userId, templateName]
          );

          let templateId = '';
          if (existing) {
            templateId = existing.id;
          } else {
            templateId = Crypto.randomUUID();
            db.runSync(
              `INSERT INTO workout_templates (id, user_id, name, syncStatus, createdAt, updatedAt)
               VALUES (?, ?, ?, 'pending', ?, ?)`,
              [templateId, userId, templateName, now, now]
            );

            let sortOrder = 0;
            for (const exId of config.exercises) {
              const linkId = Crypto.randomUUID();
              db.runSync(
                `INSERT INTO workout_template_exercises (id, workout_template_id, exercise_id, sort_order, target_sets, target_reps, syncStatus, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, 3, 10, 'pending', ?, ?)`,
                [linkId, templateId, exId, sortOrder++, now, now]
              );
            }
          }
          createdTemplateIds.set(templateName, templateId);
        }
      }

      // Assign templates to weeks
      for (let week = 1; week <= totalWeeks; week++) {
        for (let day = 1; day <= 7; day++) {
          const config = dayConfigs.find(c => c.day === day);
          const assignId = Crypto.randomUUID();

          if (config) {
            const templateId = createdTemplateIds.get(config.templateNameEn)!;
            db.runSync(
              `INSERT INTO weekly_plan_assigned_templates (id, weekly_plan_id, workout_template_id, plan_week, day_of_week, is_rest_day, syncStatus, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, 0, 'pending', ?, ?)`,
              [assignId, planId, templateId, week, day, now, now]
            );
          } else {
            db.runSync(
              `INSERT INTO weekly_plan_assigned_templates (id, weekly_plan_id, workout_template_id, plan_week, day_of_week, is_rest_day, syncStatus, createdAt, updatedAt)
               VALUES (?, ?, NULL, ?, ?, 1, 'pending', ?, ?)`,
              [assignId, planId, week, day, now, now]
            );
          }
        }
      }
    });
  },

  /**
   * Fetch all preset weekly plan templates from the database
   */
  fetchPresetTemplates(): any[] {
    const plans = queryAll<any>(`SELECT * FROM preset_weekly_plans`);
    const result: any[] = [];

    for (const plan of plans) {
      const exercises = queryAll<any>(
        `SELECT day_of_week, workout_name_ja, workout_name_en, exercise_id 
         FROM preset_weekly_plan_exercises 
         WHERE preset_plan_id = ? 
         ORDER BY day_of_week ASC, sort_order ASC`,
        [plan.id]
      );

      const workouts: { [day: number]: { name_ja: string; name_en: string; exercises: string[] } } = {};
      for (const ex of exercises) {
        if (!workouts[ex.day_of_week]) {
          workouts[ex.day_of_week] = {
            name_ja: ex.workout_name_ja,
            name_en: ex.workout_name_en,
            exercises: []
          };
        }
        workouts[ex.day_of_week].exercises.push(ex.exercise_id);
      }

      result.push({
        id: plan.id,
        name_ja: plan.name_ja,
        name_en: plan.name_en,
        desc_ja: plan.desc_ja,
        desc_en: plan.desc_en,
        days: plan.days,
        weeks: plan.weeks,
        level: plan.level,
        workouts
      });
    }

    return result;
  },

  /**
   * Activate a specific weekly plan and deactivate all others for a user
   */
  activateWeeklyPlan(userId: string, planId: string): void {
    const db = getSqliteDb();
    const now = new Date().toISOString();

    db.withTransactionSync(() => {
      // Deactivate all
      db.runSync(
        `UPDATE weekly_plans 
         SET is_active = 0, syncStatus = 'pending', updatedAt = ? 
         WHERE user_id = ? AND (syncStatus != 'deleted' OR syncStatus IS NULL)`,
        [now, userId]
      );
      // Activate target
      db.runSync(
        `UPDATE weekly_plans 
         SET is_active = 1, syncStatus = 'pending', updatedAt = ? 
         WHERE id = ?`,
        [now, planId]
      );
    });
  },

  /**
   * Deactivate a specific weekly plan
   */
  deactivateWeeklyPlan(planId: string): void {
    const db = getSqliteDb();
    const now = new Date().toISOString();

    db.runSync(
      `UPDATE weekly_plans 
       SET is_active = 0, syncStatus = 'pending', updatedAt = ? 
       WHERE id = ?`,
      [now, planId]
    );
  },

  /**
   * Assign a Workout Template or Rest Day to a specific day in a weekly plan
   */
  assignToDay(planId: string, templateId: string | null, week: number, dayOfWeek: number, isRestDay: boolean = false): void {
    const db = getSqliteDb();
    const now = new Date().toISOString();
    const id = Crypto.randomUUID();

    db.withTransactionSync(() => {
      // 1. Delete old assignment for this day in this plan
      db.runSync(
        `DELETE FROM weekly_plan_assigned_templates 
         WHERE weekly_plan_id = ? AND plan_week = ? AND day_of_week = ?`,
        [planId, week, dayOfWeek]
      );
      // 2. Insert new assignment only if it is a rest day or a workout template is assigned
      if (templateId !== null || isRestDay) {
        db.runSync(
          `INSERT INTO weekly_plan_assigned_templates (id, weekly_plan_id, plan_week, day_of_week, workout_template_id, is_rest_day, syncStatus, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
          [id, planId, week, dayOfWeek, templateId, isRestDay ? 1 : 0, now, now]
        );
      }
    });
  },

  /**
   * Fetch all workout templates assigned to a weekly plan
   */
  fetchPlanTemplates(planId: string): { id: string | null; name: string | null; plan_week: number; day_of_week: number; is_rest_day: boolean }[] {
    const records = queryAll<{ id: string | null; name: string | null; plan_week: number; day_of_week: number; is_rest_day: number }>(
      `SELECT t.id, t.name, a.plan_week, a.day_of_week, a.is_rest_day 
       FROM weekly_plan_assigned_templates a
       LEFT JOIN workout_templates t ON a.workout_template_id = t.id
       WHERE a.weekly_plan_id = ? AND a.syncStatus != 'deleted' AND (t.syncStatus != 'deleted' OR t.id IS NULL)
       ORDER BY a.plan_week ASC, a.day_of_week ASC`,
      [planId]
    );
    return records.map(r => ({
      ...r,
      is_rest_day: r.is_rest_day === 1
    }));
  },

  /**
   * Update a weekly plan locally
   */
  updateWeeklyPlan(planId: string, name: string, totalWeeks: number, startDate?: string): void {
    const db = getSqliteDb();
    const now = new Date().toISOString();

    db.withTransactionSync(() => {
      // 1. Update the plan
      db.runSync(
        `UPDATE weekly_plans 
         SET name = ?, total_weeks = ?, start_date = ?, syncStatus = 'pending', updatedAt = ? 
         WHERE id = ?`,
        [name, totalWeeks, startDate || null, now, planId]
      );
      // 2. Delete assigned templates for weeks greater than the new totalWeeks
      db.runSync(
        `DELETE FROM weekly_plan_assigned_templates 
         WHERE weekly_plan_id = ? AND plan_week > ?`,
        [planId, totalWeeks]
      );
    });
  },

  /**
   * Soft delete a weekly plan and its assignments
   */
  deleteWeeklyPlan(planId: string): void {
    const db = getSqliteDb();
    const now = new Date().toISOString();
    
    db.withTransactionSync(() => {
      db.runSync(
        `UPDATE weekly_plans SET syncStatus = 'deleted', updatedAt = ? WHERE id = ?`,
        [now, planId]
      );
      db.runSync(
        `UPDATE weekly_plan_assigned_templates SET syncStatus = 'deleted', updatedAt = ? WHERE weekly_plan_id = ?`,
        [now, planId]
      );
    });
  }
};
