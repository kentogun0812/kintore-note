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
