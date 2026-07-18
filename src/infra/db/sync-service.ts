import { supabase } from '../api/supabase.client';
import { queryAll, queryOne, runExecute, getSqliteDb } from './sqlite';

export const SyncService = {
  /**
   * Sync all user-related tables between local SQLite and Supabase
   */
  async syncAll(userId: string): Promise<void> {
    if (userId === 'guest') {
      console.log('[SyncService] Guest user, skipping synchronization.');
      return;
    }

    try {
      console.log('[SyncService] Starting synchronization for user:', userId);

      // Order of syncing matters due to foreign key constraints:
      // Weekly Plans -> Workout Routines -> Workout Routine Exercises -> Custom Exercises -> Favorites -> Sessions -> Workout Exercises -> Workout Sets -> Stamps -> Photos

      await this.syncTable({
        tableName: 'weekly_plans',
        userId,
        hasUserId: true,
        sqliteFields: ['id', 'user_id', 'name', 'description', 'total_weeks', 'start_date', 'is_active', 'syncStatus', 'createdAt', 'updatedAt'],
        insertSql: `
          INSERT INTO weekly_plans (id, user_id, name, description, total_weeks, start_date, is_active, syncStatus, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            description = excluded.description,
            total_weeks = excluded.total_weeks,
            start_date = excluded.start_date,
            is_active = excluded.is_active,
            syncStatus = 'synced',
            updatedAt = excluded.updatedAt
        `
      });

      await this.syncTable({
        tableName: 'workout_templates',
        userId,
        hasUserId: true,
        sqliteFields: ['id', 'user_id', 'name', 'weekly_plan_id', 'plan_week', 'syncStatus', 'createdAt', 'updatedAt'],
        insertSql: `
          INSERT INTO workout_templates (id, user_id, name, weekly_plan_id, plan_week, syncStatus, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            weekly_plan_id = excluded.weekly_plan_id,
            plan_week = excluded.plan_week,
            syncStatus = 'synced',
            updatedAt = excluded.updatedAt
        `
      });

      await this.syncTable({
        tableName: 'workout_template_exercises',
        userId,
        hasUserId: false,
        sqliteFields: ['id', 'workout_template_id', 'exercise_id', 'sort_order', 'target_sets', 'target_reps', 'target_weight_kg', 'syncStatus', 'createdAt', 'updatedAt'],
        insertSql: `
          INSERT INTO workout_template_exercises (id, workout_template_id, exercise_id, sort_order, target_sets, target_reps, target_weight_kg, syncStatus, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            workout_template_id = excluded.workout_template_id,
            exercise_id = excluded.exercise_id,
            sort_order = excluded.sort_order,
            target_sets = excluded.target_sets,
            target_reps = excluded.target_reps,
            target_weight_kg = excluded.target_weight_kg,
            syncStatus = 'synced',
            updatedAt = excluded.updatedAt
        `,
        localPendingSql: `
          SELECT me.* FROM workout_template_exercises me
          JOIN workout_templates tm ON me.workout_template_id = tm.id
          WHERE tm.user_id = ? AND me.syncStatus = 'pending'
        `,
        localDeleteSql: `
          SELECT me.id FROM workout_template_exercises me
          JOIN workout_templates tm ON me.workout_template_id = tm.id
          WHERE tm.user_id = ? AND me.syncStatus = 'deleted'
        `
      });

      await this.syncTable({
        tableName: 'custom_muscle_groups',
        userId,
        hasUserId: true,
        sqliteFields: ['id', 'user_id', 'name_ja', 'name_en', 'sort_order', 'syncStatus', 'createdAt', 'updatedAt'],
        insertSql: `
          INSERT INTO custom_muscle_groups (id, user_id, name_ja, name_en, sort_order, syncStatus, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name_ja = excluded.name_ja,
            name_en = excluded.name_en,
            sort_order = excluded.sort_order,
            syncStatus = 'synced',
            updatedAt = excluded.updatedAt
        `
      });

      await this.syncTable({
        tableName: 'custom_exercises',
        userId,
        hasUserId: true,
        sqliteFields: ['id', 'user_id', 'name_ja', 'name_en', 'muscle_group_id', 'syncStatus', 'createdAt', 'updatedAt'],
        insertSql: `
          INSERT INTO custom_exercises (id, user_id, name_ja, name_en, muscle_group_id, syncStatus, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name_ja = excluded.name_ja,
            name_en = excluded.name_en,
            muscle_group_id = excluded.muscle_group_id,
            syncStatus = 'synced',
            updatedAt = excluded.updatedAt
        `
      });

      await this.syncTable({
        tableName: 'favorite_exercises',
        userId,
        hasUserId: true,
        sqliteFields: ['id', 'user_id', 'exercise_id', 'syncStatus', 'createdAt', 'updatedAt'],
        insertSql: `
          INSERT INTO favorite_exercises (id, user_id, exercise_id, syncStatus, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            exercise_id = excluded.exercise_id,
            syncStatus = 'synced',
            updatedAt = excluded.updatedAt
        `
      });

      await this.syncTable({
        tableName: 'workout_sessions',
        userId,
        hasUserId: true,
        sqliteFields: ['id', 'user_id', 'workout_template_id', 'started_at', 'completed_at', 'total_volume', 'status', 'notes', 'syncStatus', 'createdAt', 'updatedAt'],
        insertSql: `
          INSERT INTO workout_sessions (id, user_id, workout_template_id, started_at, completed_at, total_volume, status, notes, syncStatus, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            workout_template_id = excluded.workout_template_id,
            started_at = excluded.started_at,
            completed_at = excluded.completed_at,
            total_volume = excluded.total_volume,
            status = excluded.status,
            notes = excluded.notes,
            syncStatus = 'synced',
            updatedAt = excluded.updatedAt
        `
      });

      await this.syncTable({
        tableName: 'workout_exercises',
        userId,
        hasUserId: false,
        sqliteFields: ['id', 'session_id', 'exercise_id', 'sort_order', 'notes', 'syncStatus', 'createdAt', 'updatedAt'],
        insertSql: `
          INSERT INTO workout_exercises (id, session_id, exercise_id, sort_order, notes, syncStatus, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            session_id = excluded.session_id,
            exercise_id = excluded.exercise_id,
            sort_order = excluded.sort_order,
            notes = excluded.notes,
            syncStatus = 'synced',
            updatedAt = excluded.updatedAt
        `,
        localPendingSql: `
          SELECT we.* FROM workout_exercises we
          JOIN workout_sessions ws ON we.session_id = ws.id
          WHERE ws.user_id = ? AND we.syncStatus = 'pending'
        `,
        localDeleteSql: `
          SELECT we.id FROM workout_exercises we
          JOIN workout_sessions ws ON we.session_id = ws.id
          WHERE ws.user_id = ? AND we.syncStatus = 'deleted'
        `
      });

      await this.syncTable({
        tableName: 'workout_sets',
        userId,
        hasUserId: false,
        sqliteFields: ['id', 'workout_exercise_id', 'weight', 'reps', 'completed', 'syncStatus', 'createdAt', 'updatedAt'],
        insertSql: `
          INSERT INTO workout_sets (id, workout_exercise_id, weight, reps, completed, syncStatus, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            workout_exercise_id = excluded.workout_exercise_id,
            weight = excluded.weight,
            reps = excluded.reps,
            completed = excluded.completed,
            syncStatus = 'synced',
            updatedAt = excluded.updatedAt
        `,
        localPendingSql: `
          SELECT ws.* FROM workout_sets ws
          JOIN workout_exercises we ON ws.workout_exercise_id = we.id
          JOIN workout_sessions wse ON we.session_id = wse.id
          WHERE wse.user_id = ? AND ws.syncStatus = 'pending'
        `,
        localDeleteSql: `
          SELECT ws.id FROM workout_sets ws
          JOIN workout_exercises we ON ws.workout_exercise_id = we.id
          JOIN workout_sessions wse ON we.session_id = wse.id
          WHERE wse.user_id = ? AND ws.syncStatus = 'deleted'
        `
      });

      await this.syncTable({
        tableName: 'hanko_stamps',
        userId,
        hasUserId: true,
        sqliteFields: ['id', 'user_id', 'session_id', 'stamp_date', 'hanko_tier', 'streak_count', 'syncStatus', 'createdAt', 'updatedAt'],
        insertSql: `
          INSERT INTO hanko_stamps (id, user_id, session_id, stamp_date, hanko_tier, streak_count, syncStatus, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(stamp_date) DO UPDATE SET
            session_id = excluded.session_id,
            hanko_tier = excluded.hanko_tier,
            streak_count = excluded.streak_count,
            syncStatus = 'synced',
            updatedAt = excluded.updatedAt
        `
      });

      await this.syncTable({
        tableName: 'body_photos',
        userId,
        hasUserId: true,
        sqliteFields: ['id', 'user_id', 'file_path', 'angle', 'key_id', 'taken_at', 'syncStatus', 'createdAt', 'updatedAt'],
        insertSql: `
          INSERT INTO body_photos (id, user_id, file_path, angle, key_id, taken_at, syncStatus, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            file_path = excluded.file_path,
            angle = excluded.angle,
            key_id = excluded.key_id,
            taken_at = excluded.taken_at,
            syncStatus = 'synced',
            updatedAt = excluded.updatedAt
        `
      });

      console.log('[SyncService] Synchronization finished successfully.');
    } catch (error) {
      console.error('[SyncService] Sync failed with error:', error);
      throw error;
    }
  },

  /**
   * Internal helper to synchronize a single table
   */
  async syncTable(config: {
    tableName: string;
    userId: string;
    hasUserId: boolean;
    sqliteFields: string[];
    insertSql: string;
    localPendingSql?: string;
    localDeleteSql?: string;
  }): Promise<void> {
    const { tableName, userId, hasUserId, sqliteFields, insertSql } = config;

    console.log(`[SyncService] Syncing table "${tableName}"...`);

    // ==========================================
    // PASS 1: PUSH (Local -> Remote)
    // ==========================================

    // 1.1 Deletions
    const deleteQuery = config.localDeleteSql || 
      `SELECT id FROM ${tableName} WHERE user_id = ? AND syncStatus = 'deleted'`;
    const deleteParams = [userId];
    const localDeletes = queryAll<{ id: string }>(deleteQuery, deleteParams);

    if (localDeletes.length > 0) {
      const deleteIds = localDeletes.map(d => d.id);
      console.log(`[SyncService] Pushing ${deleteIds.length} deletions to remote for "${tableName}"`);
      
      const { error: deleteErr } = await supabase
        .from(tableName)
        .delete()
        .in('id', deleteIds);

      if (deleteErr) {
        console.error(`[SyncService] Failed to push deletes for "${tableName}":`, deleteErr);
      } else {
        // Hard-delete locally
        const db = getSqliteDb();
        db.withTransactionSync(() => {
          for (const id of deleteIds) {
            db.runSync(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
          }
        });
        console.log(`[SyncService] Local deletions cleared for "${tableName}"`);
      }
    }

    // 1.2 Updates/Inserts (Upserts)
    const pendingQuery = config.localPendingSql || 
      `SELECT * FROM ${tableName} WHERE user_id = ? AND syncStatus = 'pending'`;
    const pendingParams = [userId];
    const localPendings = queryAll<any>(pendingQuery, pendingParams);

    if (localPendings.length > 0) {
      console.log(`[SyncService] Pushing ${localPendings.length} pending updates to remote for "${tableName}"`);
      
      // Clean pending objects for remote insert
      const cleanRows = localPendings.map(row => {
        const clean: any = {};
        for (const field of sqliteFields) {
          if (field === 'syncStatus') {
            clean[field] = 'synced'; // Mark as synced on Supabase
          } else {
            clean[field] = row[field];
          }
        }
        return clean;
      });

      const { error: upsertErr } = await supabase
        .from(tableName)
        .upsert(cleanRows);

      if (upsertErr) {
        console.error(`[SyncService] Failed to push updates for "${tableName}":`, upsertErr);
      } else {
        // Mark as synced locally
        const now = new Date().toISOString();
        const db = getSqliteDb();
        db.withTransactionSync(() => {
          for (const row of localPendings) {
            db.runSync(
              `UPDATE ${tableName} SET syncStatus = 'synced', updatedAt = ? WHERE id = ?`,
              [now, row.id]
            );
          }
        });
        console.log(`[SyncService] Local status updated to 'synced' for "${tableName}"`);
      }
    }

    // ==========================================
    // PASS 2: PULL (Remote -> Local)
    // ==========================================
    
    // 2.1 Find last local update timestamp
    let maxUpdated = '1970-01-01T00:00:00.000Z';
    const timeQuery = hasUserId 
      ? `SELECT MAX(updatedAt) as max_updated FROM ${tableName} WHERE user_id = ? AND syncStatus = 'synced'`
      : `SELECT MAX(we.updatedAt) as max_updated FROM ${tableName} we
         JOIN ${tableName === 'workout_exercises' ? 'workout_sessions' : tableName === 'workout_sets' ? 'workout_exercises' : 'workout_templates'} parent 
           ON ${tableName === 'workout_exercises' ? 'we.session_id' : tableName === 'workout_sets' ? 'we.workout_exercise_id' : 'we.workout_template_id'} = parent.id
         WHERE ${tableName === 'workout_exercises' ? 'parent.user_id' : tableName === 'workout_sets' ? 'parent.id IN (SELECT id FROM workout_exercises WHERE session_id IN (SELECT id FROM workout_sessions WHERE user_id = ?))' : 'parent.user_id = ?'}
           AND we.syncStatus = 'synced'`;
    
    // Simplification: just query absolute max local updatedAt of synced items for simplicity
    const simpleTimeQuery = `SELECT MAX(updatedAt) as max_updated FROM ${tableName} WHERE syncStatus = 'synced'`;
    const lastUpdateRecord = queryOne<{ max_updated: string | null }>(simpleTimeQuery);
    if (lastUpdateRecord && lastUpdateRecord.max_updated) {
      maxUpdated = lastUpdateRecord.max_updated;
    }

    // 2.2 Fetch remote updates
    let remoteQuery = supabase
      .from(tableName)
      .select('*')
      .gt('updatedAt', maxUpdated);

    if (hasUserId) {
      remoteQuery = remoteQuery.eq('user_id', userId);
    }

    const { data: remoteRows, error: pullErr } = await remoteQuery;

    if (pullErr) {
      console.error(`[SyncService] Failed to pull updates for "${tableName}":`, pullErr);
    } else if (remoteRows && remoteRows.length > 0) {
      console.log(`[SyncService] Pulling ${remoteRows.length} remote updates for "${tableName}"`);
      
      const db = getSqliteDb();
      db.withTransactionSync(() => {
        for (const row of remoteRows) {
          // Prepare parameters matching DDL insert
          const params = sqliteFields.map(field => {
            if (field === 'syncStatus') return 'synced';
            return row[field];
          });
          
          db.runSync(insertSql, params);
        }
      });
      console.log(`[SyncService] Integrated ${remoteRows.length} remote records into local "${tableName}"`);
    }
  }
};
