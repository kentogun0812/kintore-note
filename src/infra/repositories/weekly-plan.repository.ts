import { queryAll, queryOne, runExecute, getSqliteDb } from '../db/sqlite';
import * as Crypto from 'expo-crypto';

export interface WeeklyPlanModel {
  id: string;
  name: string;
  description?: string;
  total_weeks: number;
  start_date?: string;
  is_active: boolean; // converted from 0 or 1
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
         WHERE user_id = ?`,
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
      
      // 2. Insert new assignment
      db.runSync(
        `INSERT INTO weekly_plan_assigned_templates (id, weekly_plan_id, plan_week, day_of_week, workout_template_id, is_rest_day, syncStatus, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
        [id, planId, week, dayOfWeek, templateId, isRestDay ? 1 : 0, now, now]
      );
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
