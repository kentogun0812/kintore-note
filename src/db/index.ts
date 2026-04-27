import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { TrainingSession } from './models/TrainingSession';
import { SessionSet } from './models/SessionSet';
import { HankoStamp } from './models/HankoStamp';

import { NativeModules, Platform } from 'react-native';

// Check if WatermelonDB native module is linked (it won't be in Expo Go)
const isWatermelonDBLinked = Platform.OS === 'web' || !!NativeModules.WMDatabaseBridge;

const adapter = isWatermelonDBLinked 
  ? new SQLiteAdapter({
      schema,
      jsi: false, /* fast SQLite setup, disabled in Expo Go */
      onSetUpError: error => {
        console.warn('WatermelonDB setup error:', error);
      }
    })
  : ({ // Mock adapter for Expo Go to prevent top-level crashes
      schema,
      batch: () => {},
      query: () => [],
      // add minimal mock functions if necessary
    } as any);

export const database = new Database({
  adapter,
  modelClasses: [
    TrainingSession,
    SessionSet,
    HankoStamp,
  ],
});
