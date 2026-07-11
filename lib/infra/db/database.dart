import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'connection/connection.dart';

part 'database.g.dart';

class MuscleGroups extends Table {
  TextColumn get id => text()();
  TextColumn get nameEn => text().named('name_en')();
  TextColumn get nameJa => text().named('name_ja')();
  TextColumn get bodyRegion => text().named('body_region')();
  IntColumn get sortOrder => integer().named('sort_order')();

  @override
  Set<Column> get primaryKey => {id};
}

class Exercises extends Table {
  TextColumn get id => text()();
  TextColumn get nameEn => text().named('name_en')();
  TextColumn get nameJa => text().named('name_ja')();
  TextColumn get muscleGroupId => text().named('muscle_group_id').references(MuscleGroups, #id)();
  BoolColumn get isSystem => boolean().named('is_system').withDefault(const Constant(false))();
  DateTimeColumn get createdAt => dateTime().named('created_at').nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

class TrainingMenus extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  BoolColumn get isTemplate => boolean().named('is_template').withDefault(const Constant(false))();
  TextColumn get userId => text().named('user_id').nullable()();
  DateTimeColumn get createdAt => dateTime().named('created_at')();
  DateTimeColumn get updatedAt => dateTime().named('updated_at')();
  
  // Sync metadata
  BoolColumn get isDirty => boolean().named('is_dirty').withDefault(const Constant(false))();
  BoolColumn get isDeleted => boolean().named('is_deleted').withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {id};
}

class MenuExercises extends Table {
  TextColumn get id => text()();
  TextColumn get menuId => text().named('menu_id').references(TrainingMenus, #id)();
  TextColumn get exerciseId => text().named('exercise_id').references(Exercises, #id)();
  IntColumn get sortOrder => integer().named('sort_order')();
  IntColumn get targetSets => integer().named('target_sets')();
  IntColumn get targetReps => integer().named('target_reps')();

  // Sync metadata
  BoolColumn get isDirty => boolean().named('is_dirty').withDefault(const Constant(false))();
  BoolColumn get isDeleted => boolean().named('is_deleted').withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {id};
}

class TrainingSessions extends Table {
  TextColumn get id => text()();
  TextColumn get userId => text().named('user_id')();
  TextColumn get menuId => text().named('menu_id').nullable().references(TrainingMenus, #id)();
  DateTimeColumn get startTime => dateTime().named('start_time')();
  DateTimeColumn get endTime => dateTime().named('end_time').nullable()();
  TextColumn get status => text().named('status')(); // 'active', 'completed', 'discarded'
  RealColumn get totalVolume => real().named('total_volume').nullable()();
  DateTimeColumn get createdAt => dateTime().named('created_at')();
  DateTimeColumn get updatedAt => dateTime().named('updated_at')();

  // Sync metadata
  BoolColumn get isDirty => boolean().named('is_dirty').withDefault(const Constant(false))();
  BoolColumn get isDeleted => boolean().named('is_deleted').withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {id};
}

class SessionSets extends Table {
  TextColumn get id => text()();
  TextColumn get sessionId => text().named('session_id').references(TrainingSessions, #id)();
  TextColumn get exerciseId => text().named('exercise_id').references(Exercises, #id)();
  RealColumn get weightKg => real().named('weight_kg')();
  IntColumn get reps => integer().named('reps')();
  BoolColumn get isPr => boolean().named('is_pr').withDefault(const Constant(false))();
  DateTimeColumn get createdAt => dateTime().named('created_at')();
  DateTimeColumn get updatedAt => dateTime().named('updated_at')();

  // Sync metadata
  BoolColumn get isDirty => boolean().named('is_dirty').withDefault(const Constant(false))();
  BoolColumn get isDeleted => boolean().named('is_deleted').withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {id};
}

class HankoStamps extends Table {
  TextColumn get id => text()();
  TextColumn get userId => text().named('user_id')();
  TextColumn get sessionId => text().named('session_id').nullable().references(TrainingSessions, #id)();
  DateTimeColumn get earnedAt => dateTime().named('earned_at')();
  IntColumn get streakCount => integer().named('streak_count')();
  DateTimeColumn get createdAt => dateTime().named('created_at')();

  // Sync metadata
  BoolColumn get isDirty => boolean().named('is_dirty').withDefault(const Constant(false))();
  BoolColumn get isDeleted => boolean().named('is_deleted').withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {id};
}

class BodyPhotos extends Table {
  TextColumn get id => text()();
  TextColumn get userId => text().named('user_id')();
  TextColumn get filePath => text().named('file_path')();
  TextColumn get angle => text().named('angle')();
  TextColumn get keyId => text().named('key_id')();
  DateTimeColumn get takenAt => dateTime().named('taken_at')();
  DateTimeColumn get createdAt => dateTime().named('created_at')();

  // Sync metadata
  BoolColumn get isDirty => boolean().named('is_dirty').withDefault(const Constant(false))();
  BoolColumn get isDeleted => boolean().named('is_deleted').withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {id};
}

@DriftDatabase(tables: [
  MuscleGroups,
  Exercises,
  TrainingMenus,
  MenuExercises,
  TrainingSessions,
  SessionSets,
  HankoStamps,
  BodyPhotos,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase(QueryExecutor e) : super(e);

  @override
  int get schemaVersion => 1;
}

QueryExecutor openConnection(String dbName) {
  return createDatabaseConnection(dbName);
}

final databaseProvider = Provider<AppDatabase>((ref) {
  throw UnimplementedError('databaseProvider must be overridden in ProviderScope');
});
