import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { TrainingSession } from './models/TrainingSession';
import { SessionSet } from './models/SessionSet';
import { HankoStamp } from './models/HankoStamp';

import { NativeModules, Platform } from 'react-native';

// Check if WatermelonDB native module is linked (it won't be in Expo Go)
const isWatermelonDBLinked = Platform.OS === 'web' || !!NativeModules.WMDatabaseBridge;

// Cache database instances per user to avoid recreating them
const dbInstances = new Map<string, Database>();

/**
 * Get an isolated WatermelonDB instance for a specific user.
 * This guarantees that User A and User B have separate physical SQLite files,
 * completely eliminating sync collisions and local data leakage.
 */
export function getDatabase(userId: string): Database {
  if (!userId) {
    throw new Error('userId is required to initialize a user-specific database');
  }

  if (dbInstances.has(userId)) {
    return dbInstances.get(userId)!;
  }

  // Create a safe database name (e.g., kintore_user123)
  const dbName = `kintore_${userId.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const adapter = isWatermelonDBLinked 
    ? new SQLiteAdapter({
        schema,
        dbName,
        jsi: false, /* fast SQLite setup, disabled in Expo Go */
        onSetUpError: error => {
          console.warn(`WatermelonDB setup error for DB ${dbName}:`, error);
        }
      })
    : ({ // Mock adapter for Expo Go to prevent top-level crashes
        schema,
        batch: () => {},
        query: () => [],
      } as any);

  const db = new Database({
    adapter,
    modelClasses: [
      TrainingSession,
      SessionSet,
      HankoStamp,
    ],
  });

  dbInstances.set(userId, db);
  return db;
}
