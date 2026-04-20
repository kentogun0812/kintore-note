import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { TrainingSession } from './models/TrainingSession';
import { SessionSet } from './models/SessionSet';
import { HankoStamp } from './models/HankoStamp';

const adapter = new SQLiteAdapter({
  schema,
  jsi: true, /* fast SQLite setup */
  onSetUpError: error => {
    // Database failed to load -- offer the user to reload the app or log out
  }
});

export const database = new Database({
  adapter,
  modelClasses: [
    TrainingSession,
    SessionSet,
    HankoStamp,
  ],
});
