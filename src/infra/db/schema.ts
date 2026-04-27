import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'muscle_groups',
      columns: [
        { name: 'name_ja', type: 'string' },
        { name: 'name_en', type: 'string' },
        { name: 'body_region', type: 'string' },
        { name: 'sort_order', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'exercises',
      columns: [
        { name: 'name_ja', type: 'string' },
        { name: 'name_en', type: 'string' },
        { name: 'muscle_group_id', type: 'string', isIndexed: true },
        { name: 'is_system', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'training_menus',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'is_template', type: 'boolean' },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'menu_exercises',
      columns: [
        { name: 'menu_id', type: 'string', isIndexed: true },
        { name: 'exercise_id', type: 'string', isIndexed: true },
        { name: 'sort_order', type: 'number' },
        { name: 'target_sets', type: 'number' },
        { name: 'target_reps', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'training_sessions',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'menu_id', type: 'string', isIndexed: true },
        { name: 'started_at', type: 'number' },
        { name: 'completed_at', type: 'number', isOptional: true },
        { name: 'total_volume', type: 'number' },
        { name: 'status', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'session_sets',
      columns: [
        { name: 'session_id', type: 'string', isIndexed: true },
        { name: 'exercise_id', type: 'string', isIndexed: true },
        { name: 'set_order', type: 'number' },
        { name: 'weight_kg', type: 'number' },
        { name: 'reps', type: 'number' },
        { name: 'is_pr', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'hanko_stamps',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'stamp_date', type: 'string', isIndexed: true },
        { name: 'streak_count', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'body_photos',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'file_path', type: 'string' },
        { name: 'angle', type: 'string' },
        { name: 'key_id', type: 'string' },
        { name: 'taken_at', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});
