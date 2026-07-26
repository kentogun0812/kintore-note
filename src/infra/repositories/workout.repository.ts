import { queryAll, queryOne, runExecute, getSqliteDb } from '../db/sqlite';
import * as Crypto from 'expo-crypto';

export interface WorkoutSetModel {
  id: string;
  workout_exercise_id: string;
  weight: number;
  reps: number;
  completed: number;
}

export interface WorkoutExerciseModel {
  id: string;
  session_id: string;
  exercise_id: string;
  sort_order: number;
  notes?: string;
  sets: WorkoutSetModel[];
}

export interface WorkoutSessionModel {
  id: string;
  user_id: string;
  workout_template_id?: string;
  started_at: string;
  completed_at: string;
  total_volume: number;
  status: string;
  notes?: string;
  exercises: WorkoutExerciseModel[];
}

export const WorkoutRepository = {
  /**
   * Save a complete workout session, its exercises and sets locally in a single transaction
   */
  saveWorkoutSession(session: {
    userId: string;
    workout_template_id?: string;
    startedAt: Date;
    completedAt: Date;
    totalVolume: number;
    notes?: string;
    exercises: {
      exerciseId: string;
      notes?: string;
      sets: {
        weight: number;
        reps: number;
        completed: boolean;
      }[];
    }[];
  }): string {
    const db = getSqliteDb();
    const sessionId = Crypto.randomUUID();
    const now = new Date().toISOString();
    const startedAtISO = session.startedAt.toISOString();
    const completedAtISO = session.completedAt.toISOString();
    db.withTransactionSync(() => {
      // 1. Insert Workout Session
      db.runSync(
        `INSERT INTO workout_sessions (id, user_id, workout_template_id, started_at, completed_at, total_volume, status, notes, syncStatus, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, 'pending', ?, ?)`,
        [
          sessionId,
          session.userId,
          session.workout_template_id || null,
          startedAtISO,
          completedAtISO,
          session.totalVolume,
          session.notes || null,
          now,
          now
        ]
      );
      // 2. Insert Workout Exercises & Sets
      let exerciseOrder = 0;
      for (const ex of session.exercises) {
        const workoutExerciseId = Crypto.randomUUID();
        db.runSync(
          `INSERT INTO workout_exercises (id, session_id, exercise_id, sort_order, notes, syncStatus, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
          [
            workoutExerciseId,
            sessionId,
            ex.exerciseId,
            exerciseOrder++,
            ex.notes || null,
            now,
            now
          ]
        );

        for (const set of ex.sets) {
          const setId = Crypto.randomUUID();
          db.runSync(
            `INSERT INTO workout_sets (id, workout_exercise_id, weight, reps, completed, syncStatus, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
            [
              setId,
              workoutExerciseId,
              set.weight,
              set.reps,
              set.completed ? 1 : 0,
              now,
              now
            ]
          );
        }
      }
    });
    return sessionId;
  },

  /**
   * Fetch all completed session dates for Hanko stamps
   */
  getHankoStampedDates(userId: string): string[] {
    const records = queryAll<{ stamp_date: string }>(
      `SELECT stamp_date FROM hanko_stamps 
       WHERE user_id = ? AND syncStatus != 'deleted'
       UNION
       SELECT date(completed_at, 'localtime') as stamp_date 
       FROM workout_sessions 
       WHERE user_id = ? AND completed_at IS NOT NULL AND syncStatus != 'deleted'`,
      [userId, userId]
    );
    return records.map(r => r.stamp_date);
  },

  /**
   * Fetch exercises and set counts for a specific date
   */
  getExercisesForDate(userId: string, dateStr: string): { id: string; name_ja: string; name_en: string; setsCount: number; muscle_group_id: string }[] {
    const sql = `
      WITH all_exercises AS (
        SELECT id, name_ja, name_en, muscle_group_id, 'guest' as user_id FROM exercises
        UNION ALL
        SELECT id, name_ja, name_en, muscle_group_id, user_id FROM custom_exercises
      )
      SELECT e.id, e.name_ja, e.name_en, e.muscle_group_id, COUNT(s.id) as setsCount
      FROM workout_sessions ws
      JOIN workout_exercises we ON ws.id = we.session_id
      JOIN workout_sets s ON we.id = s.workout_exercise_id
      JOIN all_exercises e ON we.exercise_id = e.id
      WHERE ws.user_id = ? 
        AND date(ws.completed_at, 'localtime') = ?
        AND ws.syncStatus != 'deleted'
        AND we.syncStatus != 'deleted'
        AND s.syncStatus != 'deleted'
      GROUP BY e.id, e.name_ja, e.name_en, e.muscle_group_id
      ORDER BY MIN(we.sort_order) ASC
    `;
    return queryAll<{ id: string; name_ja: string; name_en: string; setsCount: number; muscle_group_id: string }>(sql, [userId, dateStr]);
  },

  /**
   * Save a Hanko stamp record
   */
  saveHankoStamp(userId: string, sessionId: string | null, stampDate: string): number {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    const todayStamp = queryOne<{ streak_count: number }>(
      `SELECT streak_count FROM hanko_stamps WHERE user_id = ? AND stamp_date = ? AND syncStatus != 'deleted'`,
      [userId, stampDate]
    );
    if (todayStamp) {
      runExecute(
        `UPDATE hanko_stamps SET session_id = ?, syncStatus = 'pending', updatedAt = ? WHERE user_id = ? AND stamp_date = ?`,
        [sessionId, now, userId, stampDate]
      );
      return todayStamp.streak_count;
    }
    const yesterday = new Date(stampDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayStamp = queryOne<{ streak_count: number }>(
      `SELECT streak_count FROM hanko_stamps WHERE user_id = ? AND stamp_date = ? AND syncStatus != 'deleted'`,
      [userId, yesterdayStr]
    );
    const streakCount = yesterdayStamp ? yesterdayStamp.streak_count + 1 : 1;
    runExecute(
      `INSERT INTO hanko_stamps (id, user_id, session_id, stamp_date, hanko_tier, streak_count, syncStatus, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'bronze', ?, 'pending', ?, ?)
       ON CONFLICT(stamp_date) DO UPDATE SET
         session_id = excluded.session_id,
         streak_count = excluded.streak_count,
         syncStatus = 'pending',
         updatedAt = ?`,
      [id, userId, sessionId, stampDate, streakCount, now, now, now]
    );
    return streakCount;
  },

  /**
   * Fetch Volume aggregated by Muscle Group for heatmaps
   */
  getHeatmapVolume(userId: string, rangeDays: number | 'all'): { id: string; name: string; volume: number }[] {
    let sql = `
      SELECT mg.id, mg.name_en as name, SUM(s.weight * s.reps) as volume
      FROM workout_sets s
      JOIN workout_exercises we ON s.workout_exercise_id = we.id
      JOIN exercises e ON we.exercise_id = e.id
      JOIN muscle_groups mg ON e.muscle_group_id = mg.id
      JOIN workout_sessions ws ON we.session_id = ws.id
      WHERE ws.user_id = ? 
        AND ws.syncStatus != 'deleted' 
        AND we.syncStatus != 'deleted' 
        AND s.syncStatus != 'deleted'
    `;
    const params: any[] = [userId];
    if (rangeDays !== 'all') {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - rangeDays);
      sql += ' AND ws.started_at >= ?';
      params.push(pastDate.toISOString());
    }
    sql += ' GROUP BY mg.id, mg.name_en;';
    return queryAll<{ id: string; name: string; volume: number }>(sql, params);
  },

  /**
   * Fetch detailed stats grouped by exercise and muscle group for heatmap calculations
   */
  getDetailedMuscleStats(userId: string, rangeDays: number | 'all'): {
    muscleGroupId: string;
    exerciseId: string;
    exerciseNameEn: string;
    exerciseNameJa: string;
    muscleNameEn: string;
    muscleNameJa: string;
    workoutCount: number;
    setCount: number;
    volume: number;
    lastActiveAt: string | null;
  }[] {
    let sql = `
      WITH all_exercises AS (
        SELECT e.id as ex_id, e.name_ja as ex_name_ja, e.name_en as ex_name_en, mg.id as mg_id, mg.name_ja as mg_name_ja, mg.name_en as mg_name_en
        FROM exercises e
        JOIN muscle_groups mg ON e.muscle_group_id = mg.id
        UNION ALL
        SELECT ce.id as ex_id, ce.name_ja as ex_name_ja, ce.name_en as ex_name_en, mg.id as mg_id, mg.name_ja as mg_name_ja, mg.name_en as mg_name_en
        FROM custom_exercises ce
        JOIN muscle_groups mg ON ce.muscle_group_id = mg.id
      )
      SELECT 
        ae.mg_id as muscleGroupId,
        ae.ex_id as exerciseId,
        ae.ex_name_en as exerciseNameEn,
        ae.ex_name_ja as exerciseNameJa,
        ae.mg_name_en as muscleNameEn,
        ae.mg_name_ja as muscleNameJa,
        COUNT(DISTINCT ws.id) as workoutCount,
        COUNT(s.id) as setCount,
        COALESCE(SUM(s.weight * s.reps), 0) as volume,
        MAX(ws.started_at) as lastActiveAt
      FROM workout_sets s
      JOIN workout_exercises we ON s.workout_exercise_id = we.id
      JOIN all_exercises ae ON we.exercise_id = ae.ex_id
      JOIN workout_sessions ws ON we.session_id = ws.id
      WHERE ws.user_id = ? 
        AND ws.syncStatus != 'deleted' 
        AND we.syncStatus != 'deleted' 
        AND s.syncStatus != 'deleted'
        AND s.completed = 1
    `;
    const params: any[] = [userId];
    if (rangeDays !== 'all') {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - rangeDays);
      sql += ' AND ws.started_at >= ?';
      params.push(pastDate.toISOString());
    }
    sql += ' GROUP BY ae.ex_id, ae.mg_id;';
    return queryAll<any>(sql, params);
  },

  /**
   * Fetch daily Volume Trend for a specific exercise
   */
  getVolumeTrend(userId: string, exerciseId: string, rangeDays: number | 'all'): { date: string; volume: number }[] {
    let sql = `
      SELECT SUBSTR(ws.started_at, 1, 10) as date, SUM(s.weight * s.reps) as volume
      FROM workout_sets s
      JOIN workout_exercises we ON s.workout_exercise_id = we.id
      JOIN workout_sessions ws ON we.session_id = ws.id
      WHERE ws.user_id = ? 
        AND we.exercise_id = ?
        AND ws.syncStatus != 'deleted'
        AND we.syncStatus != 'deleted'
        AND s.syncStatus != 'deleted'
    `;
    const params: any[] = [userId, exerciseId];
    if (rangeDays !== 'all') {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - rangeDays);
      sql += ' AND ws.started_at >= ?';
      params.push(pastDate.toISOString());
    }
    sql += ' GROUP BY SUBSTR(ws.started_at, 1, 10) ORDER BY date ASC;';
    return queryAll<{ date: string; volume: number }>(sql, params);
  },

  /**
   * Fetch all raw workout data (completed sets) in a specific date range
   */
  getRawWorkoutDataInRange(userId: string, startDate: string, endDate: string): {
    sessionId: string;
    workoutDate: string;
    exerciseId: string;
    exerciseNameJa: string;
    exerciseNameEn: string;
    muscleGroupId: string;
    muscleNameJa: string;
    muscleNameEn: string;
    setId: string;
    weight: number;
    reps: number;
    startedAt: string;
    completedAt: string;
    sessionNotes: string | null;
    templateName: string | null;
  }[] {
    const sql = `
      WITH all_exercises AS (
        SELECT id, name_ja, name_en, muscle_group_id FROM exercises
        UNION ALL
        SELECT id, name_ja, name_en, muscle_group_id FROM custom_exercises WHERE user_id = ?
      )
      SELECT 
        ws.id as sessionId,
        date(ws.completed_at, 'localtime') as workoutDate,
        we.exercise_id as exerciseId,
        ae.name_ja as exerciseNameJa,
        ae.name_en as exerciseNameEn,
        ae.muscle_group_id as muscleGroupId,
        mg.name_ja as muscleNameJa,
        mg.name_en as muscleNameEn,
        s.id as setId,
        s.weight,
        s.reps,
        ws.started_at as startedAt,
        ws.completed_at as completedAt,
        ws.notes as sessionNotes,
        wt.name as templateName
      FROM workout_sessions ws
      JOIN workout_exercises we ON ws.id = we.session_id
      JOIN workout_sets s ON we.id = s.workout_exercise_id
      JOIN all_exercises ae ON we.exercise_id = ae.id
      JOIN muscle_groups mg ON ae.muscle_group_id = mg.id
      LEFT JOIN workout_templates wt ON ws.workout_template_id = wt.id
      WHERE ws.user_id = ? 
        AND ws.syncStatus != 'deleted' 
        AND we.syncStatus != 'deleted' 
        AND s.syncStatus != 'deleted'
        AND s.completed = 1
        AND date(ws.completed_at, 'localtime') BETWEEN ? AND ?
      ORDER BY workoutDate ASC, we.sort_order ASC, s.createdAt ASC;
    `;
    return queryAll<any>(sql, [userId, userId, startDate, endDate]);
  },

  /**
   * Get all-time maximum weights for all exercises before a specific date
   */
  getMaxWeightsBeforeDate(userId: string, beforeDate: string): { exerciseId: string; maxWeight: number }[] {
    const sql = `
      SELECT we.exercise_id as exerciseId, MAX(s.weight) as maxWeight
      FROM workout_sets s
      JOIN workout_exercises we ON s.workout_exercise_id = we.id
      JOIN workout_sessions ws ON we.session_id = ws.id
      WHERE ws.user_id = ?
        AND ws.syncStatus != 'deleted'
        AND we.syncStatus != 'deleted'
        AND s.syncStatus != 'deleted'
        AND s.completed = 1
        AND date(ws.completed_at, 'localtime') < ?
      GROUP BY we.exercise_id;
    `;
    return queryAll<any>(sql, [userId, beforeDate]);
  }
};
