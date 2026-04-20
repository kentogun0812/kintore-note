import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'training_sessions',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'start_time', type: 'number' },
        { name: 'end_time', type: 'number', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'session_sets',
      columns: [
        { name: 'session_id', type: 'string', isIndexed: true },
        { name: 'exercise_id', type: 'string' },
        { name: 'weight_kg', type: 'number' },
        { name: 'reps', type: 'number' },
        { name: 'is_pr', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'hanko_stamps',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'session_id', type: 'string' },
        { name: 'earned_at', type: 'number' },
        { name: 'streak_count', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});
