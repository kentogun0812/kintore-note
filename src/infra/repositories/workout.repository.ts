import { queryAll, queryOne, runExecute, getSqliteDb } from '../db/sqlite';
import * as Crypto from 'expo-crypto';

export interface WorkoutSetModel {
  id: string;
  workout_exercise_id: string;
  weight: number;
  reps: number;
  completed: number; // 0 or 1
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

    console.log(`[WorkoutRepository] Saved session ${sessionId} locally.`);
    return sessionId;
  },

  /**
   * Fetch all completed session dates for Hanko stamps
   */
  getHankoStampedDates(userId: string): string[] {
    // Return all dates where a session was completed (formatted as YYYY-MM-DD)
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
    
    // Check if there is already a stamp for today
    const todayStamp = queryOne<{ streak_count: number }>(
      `SELECT streak_count FROM hanko_stamps WHERE user_id = ? AND stamp_date = ? AND syncStatus != 'deleted'`,
      [userId, stampDate]
    );

    if (todayStamp) {
      // Just update sessionId
      runExecute(
        `UPDATE hanko_stamps SET session_id = ?, syncStatus = 'pending', updatedAt = ? WHERE user_id = ? AND stamp_date = ?`,
        [sessionId, now, userId, stampDate]
      );
      return todayStamp.streak_count;
    }

    // Calculate streak
    const yesterday = new Date(stampDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const yesterdayStamp = queryOne<{ streak_count: number }>(
      `SELECT streak_count FROM hanko_stamps WHERE user_id = ? AND stamp_date = ? AND syncStatus != 'deleted'`,
      [userId, yesterdayStr]
    );

    const streakCount = yesterdayStamp ? yesterdayStamp.streak_count + 1 : 1;
    
    // UPSERT Hanko stamp
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
  }
};
