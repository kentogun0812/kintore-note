import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';
import { MuscleGroup, Exercise, TrainingMenu, MenuExercise, BodyPhoto } from './models';

let adapter;
try {
  adapter = new SQLiteAdapter({
    schema,
    jsi: false, 
    onSetUpError: error => {
      console.warn('WatermelonDB: Setup error', error);
    }
  });
} catch (error) {
  console.warn('WatermelonDB: Failed to initialize SQLiteAdapter (Likely running in Expo Go)', error);
}

// Initialize database with models if adapter is available, otherwise mock it
export const database = adapter ? new Database({
  adapter,
  modelClasses: [
    MuscleGroup,
    Exercise,
    TrainingMenu,
    MenuExercise,
    BodyPhoto,
  ],
}) : null;

