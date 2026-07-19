import * as SQLite from 'expo-sqlite';
import { SQLITE_SCHEMA } from './schema-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getSqliteDb(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('kintore.db');
  }
  return dbInstance;
}

/**
 * Wipes the entire local database for a clean slate.
 */
export function clearLocalDatabase(): void {
  try {
    if (dbInstance) {
      dbInstance.closeSync();
      dbInstance = null;
    }
    SQLite.deleteDatabaseSync('kintore.db');
  } catch (error) {
    console.error('[SQLite] Error wiping database:', error);
  }
}

/**
 * Run DDL to initialize all SQLite tables if they do not exist
 */
export function initSqliteDb(): void {
  const db = getSqliteDb();
  
  db.withTransactionSync(() => {
    // Enable foreign keys
    db.execSync('PRAGMA foreign_keys = ON;');
    // Create tables sequentially
    for (const [tableName, createTableSql] of Object.entries(SQLITE_SCHEMA.tables)) {
      try {
        db.execSync(createTableSql);
      } catch (error) {
        console.error(`[SQLite] Error creating table "${tableName}":`, error);
      }
    }

    // Migrate old weekly plan assignments from workout_templates to weekly_plan_assigned_templates
    try {
      const oldAssignments = db.getAllSync<any>(
        `SELECT id, weekly_plan_id, plan_week, createdAt, updatedAt 
         FROM workout_templates 
         WHERE weekly_plan_id IS NOT NULL AND plan_week IS NOT NULL`
      );
      
      for (const row of oldAssignments) {
        const exists = db.getFirstSync<any>(
          `SELECT 1 FROM weekly_plan_assigned_templates 
           WHERE weekly_plan_id = ? AND plan_week = ? AND workout_template_id = ?`,
          [row.weekly_plan_id, row.plan_week, row.id]
        );
        
        if (!exists) {
          const migrationId = `${row.weekly_plan_id}_${row.plan_week}_${row.id}`;
          db.runSync(
            `INSERT INTO weekly_plan_assigned_templates (id, weekly_plan_id, plan_week, day_of_week, workout_template_id, syncStatus, createdAt, updatedAt)
             VALUES (?, ?, ?, 1, ?, 'pending', ?, ?)`,
            [migrationId, row.weekly_plan_id, row.plan_week, row.id, row.createdAt, row.updatedAt]
          );
        }
      }

      // Add columns day_of_week and is_rest_day to weekly_plan_assigned_templates if they don't exist
      try {
        db.execSync(`ALTER TABLE weekly_plan_assigned_templates ADD COLUMN day_of_week INTEGER NOT NULL DEFAULT 1`);
      } catch (e) {
        // Column might already exist
      }
      try {
        db.execSync(`ALTER TABLE weekly_plan_assigned_templates ADD COLUMN is_rest_day INTEGER DEFAULT 0`);
      } catch (e) {
        // Column might already exist
      }
      
    } catch (e) {
      console.warn('[SQLite] Migration warning (this is normal if table schemas are still initializing):', e);
    }

    // Migrate weekly_plan_assigned_templates to remove NOT NULL constraint on workout_template_id
    try {
      const tableInfo = db.getAllSync<any>('PRAGMA table_info(weekly_plan_assigned_templates)');
      const workoutTemplateIdCol = tableInfo.find(col => col.name === 'workout_template_id');
      if (workoutTemplateIdCol && workoutTemplateIdCol.notnull === 1) {
        db.execSync(`
          CREATE TABLE weekly_plan_assigned_templates_new (
            id TEXT PRIMARY KEY,
            weekly_plan_id TEXT NOT NULL,
            plan_week INTEGER NOT NULL,
            day_of_week INTEGER NOT NULL,
            workout_template_id TEXT,
            is_rest_day INTEGER DEFAULT 0,
            syncStatus TEXT DEFAULT 'pending',
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(weekly_plan_id) REFERENCES weekly_plans(id) ON DELETE CASCADE,
            FOREIGN KEY(workout_template_id) REFERENCES workout_templates(id) ON DELETE SET NULL
          );
          INSERT INTO weekly_plan_assigned_templates_new 
          SELECT * FROM weekly_plan_assigned_templates;
          DROP TABLE weekly_plan_assigned_templates;
          ALTER TABLE weekly_plan_assigned_templates_new RENAME TO weekly_plan_assigned_templates;
        `);
      }
    } catch (e) {
      console.warn('[SQLite] Migration warning for removing NOT NULL constraint:', e);
    }
  });
}

/**
 * Helper to fetch all rows for a query
 */
export function queryAll<T = any>(sql: string, params: any[] = []): T[] {
  const db = getSqliteDb();
  try {
    return db.getAllSync<T>(sql, params);
  } catch (error) {
    console.error(`[SQLite] Query error: ${sql}`, error);
    return [];
  }
}

/**
 * Helper to fetch a single row (first match)
 */
export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const db = getSqliteDb();
  try {
    return db.getFirstSync<T>(sql, params);
  } catch (error) {
    console.error(`[SQLite] Query One error: ${sql}`, error);
    return null;
  }
}

/**
 * Helper to execute INSERT, UPDATE, DELETE statements
 */
export function runExecute(sql: string, params: any[] = []): SQLite.SQLiteRunResult {
  const db = getSqliteDb();
  try {
    return db.runSync(sql, params);
  } catch (error) {
    console.error(`[SQLite] Execute error: ${sql}`, error);
    throw error;
  }
}

/**
 * Helper to run multiple statements in a transaction
 */
export function runTransaction(callback: () => void): void {
  const db = getSqliteDb();
  db.withTransactionSync(callback);
}
