import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:drift/drift.dart';
import 'database.dart';

class SyncService {
  final AppDatabase db;
  final SupabaseClient supabase;

  SyncService({required this.db, required this.supabase});

  static const String _lastSyncKey = 'kintore_last_sync_timestamp';

  /// Performs a full bidirectional sync for the current user
  Future<void> sync(String userId) async {
    if (userId.isEmpty) return;

    final prefs = await SharedPreferences.getInstance();
    final lastSyncStr = prefs.getString('${_lastSyncKey}_$userId') ?? '';
    final lastSyncTime = lastSyncStr.isNotEmpty 
        ? DateTime.parse(lastSyncStr) 
        : DateTime.fromMillisecondsSinceEpoch(0);

    // 1. Push local dirty changes to Supabase
    await _pushLocalChanges(userId);

    // 2. Pull remote changes from Supabase since last sync
    final newSyncTime = DateTime.now();
    await _pullRemoteChanges(userId, lastSyncTime);

    // 3. Save new sync timestamp
    await prefs.setString('${_lastSyncKey}_$userId', newSyncTime.toIso8601String());
  }

  /// Pushes all dirty/deleted local records to Supabase and wipes deleted items from local DB
  Future<void> _pushLocalChanges(String userId) async {
    // 1. Sync TrainingMenus
    final dirtyMenus = await (db.select(db.trainingMenus)
      ..where((t) => t.isDirty.equals(true) | t.isDeleted.equals(true)))
      .get();

    for (final menu in dirtyMenus) {
      if (menu.isDeleted) {
        await supabase.from('training_menus').delete().eq('id', menu.id);
        await (db.delete(db.trainingMenus)..where((t) => t.id.equals(menu.id))).go();
      } else {
        await supabase.from('training_menus').upsert({
          'id': menu.id,
          'user_id': menu.userId,
          'name': menu.name,
          'is_template': menu.isTemplate,
          'created_at': menu.createdAt.toIso8601String(),
          'updated_at': menu.updatedAt.toIso8601String(),
        });
        await (db.update(db.trainingMenus)
          ..where((t) => t.id.equals(menu.id)))
          .write(const TrainingMenusCompanion(isDirty: Value(false)));
      }
    }

    // 2. Sync MenuExercises
    final dirtyMenuEx = await (db.select(db.menuExercises)
      ..where((t) => t.isDirty.equals(true) | t.isDeleted.equals(true)))
      .get();

    for (final me in dirtyMenuEx) {
      if (me.isDeleted) {
        await supabase.from('menu_exercises').delete().eq('id', me.id);
        await (db.delete(db.menuExercises)..where((t) => t.id.equals(me.id))).go();
      } else {
        await supabase.from('menu_exercises').upsert({
          'id': me.id,
          'menu_id': me.menuId,
          'exercise_id': me.exerciseId,
          'sort_order': me.sortOrder,
          'target_sets': me.targetSets,
          'target_reps': me.targetReps,
        });
        await (db.update(db.menuExercises)
          ..where((t) => t.id.equals(me.id)))
          .write(const MenuExercisesCompanion(isDirty: Value(false)));
      }
    }

    // 3. Sync TrainingSessions
    final dirtySessions = await (db.select(db.trainingSessions)
      ..where((t) => t.isDirty.equals(true) | t.isDeleted.equals(true)))
      .get();

    for (final session in dirtySessions) {
      if (session.isDeleted) {
        await supabase.from('training_sessions').delete().eq('id', session.id);
        await (db.delete(db.trainingSessions)..where((t) => t.id.equals(session.id))).go();
      } else {
        await supabase.from('training_sessions').upsert({
          'id': session.id,
          'user_id': session.userId,
          'menu_id': session.menuId,
          'start_time': session.startTime.millisecondsSinceEpoch,
          'end_time': session.endTime?.millisecondsSinceEpoch,
          'status': session.status,
          'total_volume': session.totalVolume,
          'created_at': session.createdAt.toIso8601String(),
          'updated_at': session.updatedAt.toIso8601String(),
        });
        await (db.update(db.trainingSessions)
          ..where((t) => t.id.equals(session.id)))
          .write(const TrainingSessionsCompanion(isDirty: Value(false)));
      }
    }

    // 4. Sync SessionSets
    final dirtySets = await (db.select(db.sessionSets)
      ..where((t) => t.isDirty.equals(true) | t.isDeleted.equals(true)))
      .get();

    for (final set in dirtySets) {
      if (set.isDeleted) {
        await supabase.from('session_sets').delete().eq('id', set.id);
        await (db.delete(db.sessionSets)..where((t) => t.id.equals(set.id))).go();
      } else {
        await supabase.from('session_sets').upsert({
          'id': set.id,
          'session_id': set.sessionId,
          'exercise_id': set.exerciseId,
          'weight_kg': set.weightKg,
          'reps': set.reps,
          'is_pr': set.isPr,
          'created_at': set.createdAt.toIso8601String(),
          'updated_at': set.updatedAt.toIso8601String(),
        });
        await (db.update(db.sessionSets)
          ..where((t) => t.id.equals(set.id)))
          .write(const SessionSetsCompanion(isDirty: Value(false)));
      }
    }

    // 5. Sync HankoStamps
    final dirtyStamps = await (db.select(db.hankoStamps)
      ..where((t) => t.isDirty.equals(true) | t.isDeleted.equals(true)))
      .get();

    for (final stamp in dirtyStamps) {
      if (stamp.isDeleted) {
        await supabase.from('hanko_stamps').delete().eq('id', stamp.id);
        await (db.delete(db.hankoStamps)..where((t) => t.id.equals(stamp.id))).go();
      } else {
        await supabase.from('hanko_stamps').upsert({
          'id': stamp.id,
          'user_id': stamp.userId,
          'session_id': stamp.sessionId,
          'earned_at': stamp.earnedAt.toIso8601String(),
          'streak_count': stamp.streakCount,
          'created_at': stamp.createdAt.toIso8601String(),
        });
        await (db.update(db.hankoStamps)
          ..where((t) => t.id.equals(stamp.id)))
          .write(const HankoStampsCompanion(isDirty: Value(false)));
      }
    }

    // 6. Sync BodyPhotos
    final dirtyPhotos = await (db.select(db.bodyPhotos)
      ..where((t) => t.isDirty.equals(true) | t.isDeleted.equals(true)))
      .get();

    for (final photo in dirtyPhotos) {
      if (photo.isDeleted) {
        await supabase.from('body_photos').delete().eq('id', photo.id);
        await (db.delete(db.bodyPhotos)..where((t) => t.id.equals(photo.id))).go();
      } else {
        await supabase.from('body_photos').upsert({
          'id': photo.id,
          'user_id': photo.userId,
          'file_path': photo.filePath,
          'angle': photo.angle,
          'key_id': photo.keyId,
          'taken_at': photo.takenAt.toIso8601String(),
          'created_at': photo.createdAt.toIso8601String(),
        });
        await (db.update(db.bodyPhotos)
          ..where((t) => t.id.equals(photo.id)))
          .write(const BodyPhotosCompanion(isDirty: Value(false)));
      }
    }
  }

  /// Pulls remote updates from Supabase and applies them to the local Drift database
  Future<void> _pullRemoteChanges(String userId, DateTime lastSync) async {
    final lastSyncISO = lastSync.toIso8601String();

    // 1. Pull MuscleGroups (Global Read-Only Data)
    final remoteGroups = await supabase.from('muscle_groups').select('*').gt('updated_at', lastSyncISO);
    for (final item in remoteGroups) {
      await db.into(db.muscleGroups).insertOnConflictUpdate(
        MuscleGroup(
          id: item['id'],
          nameEn: item['name_en'],
          nameJa: item['name_ja'],
          bodyRegion: item['body_region'],
          sortOrder: item['sort_order'],
        )
      );
    }

    // 2. Pull Exercises (Global Read-Only Data)
    final remoteExercises = await supabase.from('exercises').select('*').gt('updated_at', lastSyncISO);
    for (final item in remoteExercises) {
      await db.into(db.exercises).insertOnConflictUpdate(
        Exercise(
          id: item['id'],
          nameEn: item['name_en'],
          nameJa: item['name_ja'],
          muscleGroupId: item['muscle_group_id'],
          isSystem: item['is_system'] ?? false,
          createdAt: item['created_at'] != null ? DateTime.parse(item['created_at']) : null,
        )
      );
    }

    // 3. Pull TrainingMenus (User's custom menus + public templates)
    final remoteMenus = await supabase.from('training_menus')
        .select('*')
        .or('user_id.eq.$userId,user_id.is.null')
        .gt('updated_at', lastSyncISO);
    for (final item in remoteMenus) {
      await db.into(db.trainingMenus).insertOnConflictUpdate(
        TrainingMenusData(
          id: item['id'],
          name: item['name'],
          isTemplate: item['is_template'] ?? false,
          userId: item['user_id'],
          createdAt: DateTime.parse(item['created_at']),
          updatedAt: DateTime.parse(item['updated_at']),
          isDirty: false,
          isDeleted: false,
        )
      );
    }

    // 4. Pull MenuExercises
    final remoteMenuEx = await supabase.from('menu_exercises').select('*').gt('updated_at', lastSyncISO);
    for (final item in remoteMenuEx) {
      await db.into(db.menuExercises).insertOnConflictUpdate(
        MenuExercise(
          id: item['id'],
          menuId: item['menu_id'],
          exerciseId: item['exercise_id'],
          sortOrder: item['sort_order'],
          targetSets: item['target_sets'],
          targetReps: item['target_reps'],
          isDirty: false,
          isDeleted: false,
        )
      );
    }

    // 5. Pull TrainingSessions (User workout records)
    final remoteSessions = await supabase.from('training_sessions')
        .select('*')
        .eq('user_id', userId)
        .gt('updated_at', lastSyncISO);
    for (final item in remoteSessions) {
      await db.into(db.trainingSessions).insertOnConflictUpdate(
        TrainingSession(
          id: item['id'],
          userId: item['user_id'],
          menuId: item['menu_id'],
          startTime: DateTime.fromMillisecondsSinceEpoch(item['start_time']),
          endTime: item['end_time'] != null ? DateTime.fromMillisecondsSinceEpoch(item['end_time']) : null,
          status: item['status'],
          totalVolume: item['total_volume'] != null ? (item['total_volume'] as num).toDouble() : null,
          createdAt: DateTime.parse(item['created_at']),
          updatedAt: DateTime.parse(item['updated_at']),
          isDirty: false,
          isDeleted: false,
        )
      );
    }

    // 6. Pull SessionSets
    final remoteSets = await supabase.from('session_sets').select('*').gt('updated_at', lastSyncISO);
    for (final item in remoteSets) {
      await db.into(db.sessionSets).insertOnConflictUpdate(
        SessionSet(
          id: item['id'],
          sessionId: item['session_id'],
          exerciseId: item['exercise_id'],
          weightKg: (item['weight_kg'] as num).toDouble(),
          reps: item['reps'],
          isPr: item['is_pr'] ?? false,
          createdAt: DateTime.parse(item['created_at']),
          updatedAt: DateTime.parse(item['updated_at']),
          isDirty: false,
          isDeleted: false,
        )
      );
    }

    // 7. Pull HankoStamps
    final remoteStamps = await supabase.from('hanko_stamps')
        .select('*')
        .eq('user_id', userId)
        .gt('created_at', lastSyncISO);
    for (final item in remoteStamps) {
      await db.into(db.hankoStamps).insertOnConflictUpdate(
        HankoStamp(
          id: item['id'],
          userId: item['user_id'],
          sessionId: item['session_id'],
          earnedAt: DateTime.parse(item['earned_at']),
          streakCount: item['streak_count'],
          createdAt: DateTime.parse(item['created_at']),
          isDirty: false,
          isDeleted: false,
        )
      );
    }

    // 8. Pull BodyPhotos
    final remotePhotos = await supabase.from('body_photos')
        .select('*')
        .eq('user_id', userId)
        .gt('created_at', lastSyncISO);
    for (final item in remotePhotos) {
      await db.into(db.bodyPhotos).insertOnConflictUpdate(
        BodyPhoto(
          id: item['id'],
          userId: item['user_id'],
          filePath: item['file_path'],
          angle: item['angle'],
          keyId: item['key_id'],
          takenAt: DateTime.parse(item['taken_at']),
          createdAt: DateTime.parse(item['created_at']),
          isDirty: false,
          isDeleted: false,
        )
      );
    }
  }
}
