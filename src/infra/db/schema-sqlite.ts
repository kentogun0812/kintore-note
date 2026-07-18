export const SQLITE_SCHEMA = {
  version: 1,
  tables: {
    muscle_groups: `
      CREATE TABLE IF NOT EXISTS muscle_groups (
        id TEXT PRIMARY KEY,
        name_ja TEXT NOT NULL,
        name_en TEXT NOT NULL,
        body_region TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
      );
    `,
    exercises: `
      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        name_ja TEXT NOT NULL,
        name_en TEXT NOT NULL,
        muscle_group_id TEXT,
        is_system INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(muscle_group_id) REFERENCES muscle_groups(id)
      );
    `,
    workout_sessions: `
      CREATE TABLE IF NOT EXISTS workout_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        workout_template_id TEXT,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        total_volume REAL DEFAULT 0,
        status TEXT DEFAULT 'completed',
        notes TEXT,
        syncStatus TEXT DEFAULT 'pending',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `,
    workout_exercises: `
      CREATE TABLE IF NOT EXISTS workout_exercises (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        notes TEXT,
        syncStatus TEXT DEFAULT 'pending',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE
      );
    `,
    workout_sets: `
      CREATE TABLE IF NOT EXISTS workout_sets (
        id TEXT PRIMARY KEY,
        workout_exercise_id TEXT NOT NULL,
        weight REAL NOT NULL,
        reps INTEGER NOT NULL,
        completed INTEGER DEFAULT 0,
        syncStatus TEXT DEFAULT 'pending',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE
      );
    `,
    favorite_exercises: `
      CREATE TABLE IF NOT EXISTS favorite_exercises (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        syncStatus TEXT DEFAULT 'pending',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `,
    custom_muscle_groups: `
      CREATE TABLE IF NOT EXISTS custom_muscle_groups (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name_ja TEXT NOT NULL,
        name_en TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        syncStatus TEXT DEFAULT 'pending',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `,
    custom_exercises: `
      CREATE TABLE IF NOT EXISTS custom_exercises (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name_ja TEXT NOT NULL,
        name_en TEXT NOT NULL,
        muscle_group_id TEXT NOT NULL,
        syncStatus TEXT DEFAULT 'pending',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(muscle_group_id) REFERENCES muscle_groups(id)
      );
    `,
    hanko_stamps: `
      CREATE TABLE IF NOT EXISTS hanko_stamps (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_id TEXT,
        stamp_date TEXT NOT NULL UNIQUE,
        hanko_tier TEXT DEFAULT 'bronze',
        streak_count INTEGER DEFAULT 1,
        syncStatus TEXT DEFAULT 'pending',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(session_id) REFERENCES workout_sessions(id)
      );
    `,
    body_photos: `
      CREATE TABLE IF NOT EXISTS body_photos (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        angle TEXT NOT NULL,
        key_id TEXT NOT NULL,
        taken_at INTEGER NOT NULL,
        syncStatus TEXT DEFAULT 'pending',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `,
    weekly_plans: `
      CREATE TABLE IF NOT EXISTS weekly_plans (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        total_weeks INTEGER NOT NULL,
        start_date TEXT,
        is_active INTEGER DEFAULT 0,
        syncStatus TEXT DEFAULT 'pending',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `,
    workout_templates: `
      CREATE TABLE IF NOT EXISTS workout_templates (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        weekly_plan_id TEXT,
        plan_week INTEGER,
        syncStatus TEXT DEFAULT 'pending',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(weekly_plan_id) REFERENCES weekly_plans(id) ON DELETE SET NULL
      );
    `,
    workout_template_exercises: `
      CREATE TABLE IF NOT EXISTS workout_template_exercises (
        id TEXT PRIMARY KEY,
        workout_template_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        target_sets INTEGER DEFAULT 3,
        target_reps INTEGER DEFAULT 10,
        target_weight_kg REAL,
        syncStatus TEXT DEFAULT 'pending',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(workout_template_id) REFERENCES workout_templates(id) ON DELETE CASCADE
      );
    `,
    weekly_plan_assigned_templates: `
      CREATE TABLE IF NOT EXISTS weekly_plan_assigned_templates (
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
    `
  }
};
