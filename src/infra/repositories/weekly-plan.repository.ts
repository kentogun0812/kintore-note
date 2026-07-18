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

    return records.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description || undefined,
      total_weeks: r.total_weeks,
      start_date: r.start_date || undefined,
      is_active: r.is_active === 1,
      created_at: r.createdAt
    }));
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
   * Assign a Workout Template to a specific week in a weekly plan
   */
  assignTemplateToWeek(planId: string, templateId: string, week: number): void {
    const now = new Date().toISOString();
    runExecute(
      `UPDATE workout_templates 
       SET weekly_plan_id = ?, plan_week = ?, syncStatus = 'pending', updatedAt = ? 
       WHERE id = ?`,
      [planId, week, now, templateId]
    );
  },

  /**
   * Fetch all workout templates assigned to a weekly plan
   */
  fetchPlanTemplates(planId: string): { id: string; name: string; plan_week: number }[] {
    const records = queryAll<{ id: string; name: string; plan_week: number }>(
      `SELECT id, name, plan_week 
       FROM workout_templates 
       WHERE weekly_plan_id = ? AND plan_week IS NOT NULL AND syncStatus != 'deleted'
       ORDER BY plan_week ASC`,
      [planId]
    );
    return records;
  }
};
