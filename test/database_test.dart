import 'package:flutter_test/flutter_test.dart';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:kintore_note_flutter/infra/db/database.dart';

void main() {
  late AppDatabase db;

  setUp(() {
    db = AppDatabase(DatabaseConnection(NativeDatabase.memory()));
  });

  tearDown(() async {
    await db.close();
  });

  test('can insert and query muscle groups', () async {
    await db.into(db.muscleGroups).insert(
      MuscleGroupsCompanion.insert(
        id: 'chest',
        nameEn: 'Chest',
        nameJa: '胸',
        bodyRegion: 'Upper Body',
        sortOrder: 1,
      ),
    );

    final list = await db.select(db.muscleGroups).get();
    expect(list.length, 1);
    expect(list.first.nameEn, 'Chest');
  });

  test('can insert and query session sets', () async {
    // Insert prerequisite muscle group & exercise
    await db.into(db.muscleGroups).insert(
      MuscleGroupsCompanion.insert(
        id: 'chest',
        nameEn: 'Chest',
        nameJa: '胸',
        bodyRegion: 'Upper Body',
        sortOrder: 1,
      ),
    );

    await db.into(db.exercises).insert(
      ExercisesCompanion.insert(
        id: 'bench_press',
        nameEn: 'Bench Press',
        nameJa: 'ベンチプレス',
        muscleGroupId: 'chest',
        isSystem: const Value(true),
        createdAt: Value(DateTime.now()),
      ),
    );

    await db.into(db.trainingSessions).insert(
      TrainingSessionsCompanion.insert(
        id: 'session_1',
        userId: 'user_123',
        menuId: const Value('menu_123'),
        startTime: DateTime.now(),
        endTime: const Value(null),
        totalVolume: const Value(0.0),
        status: 'active',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        isDirty: const Value(false),
        isDeleted: const Value(false),
      ),
    );

    await db.into(db.sessionSets).insert(
      SessionSetsCompanion.insert(
        id: 'set_1',
        sessionId: 'session_1',
        exerciseId: 'bench_press',
        weightKg: 100.0,
        reps: 5,
        isPr: const Value(false),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        isDirty: const Value(false),
        isDeleted: const Value(false),
      ),
    );

    final list = await db.select(db.sessionSets).get();
    expect(list.length, 1);
    expect(list.first.weightKg, 100.0);
    expect(list.first.reps, 5);
  });
}
