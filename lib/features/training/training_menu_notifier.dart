import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:drift/drift.dart';
import '../../infra/db/database.dart';
import 'dart:math';

part 'training_menu_notifier.g.dart';

class TrainingMenuWithExercises {
  final TrainingMenusData menu;
  final List<Exercise> exercises;

  TrainingMenuWithExercises({
    required this.menu,
    required this.exercises,
  });
}

@riverpod
class TrainingMenuNotifier extends _$TrainingMenuNotifier {
  @override
  Future<List<TrainingMenuWithExercises>> build() async {
    return _loadMenus();
  }

  Future<List<TrainingMenuWithExercises>> _loadMenus() async {
    final db = ref.read(databaseProvider);

    // Get all templates (for now we fetch all menus where isTemplate is true, or just all menus since user_id is null)
    final menus = await (db.select(db.trainingMenus)..where((t) => t.isTemplate.equals(true))).get();
    
    // If no templates exist, fetch all menus (just in case)
    final actualMenus = menus.isEmpty ? await db.select(db.trainingMenus).get() : menus;

    List<TrainingMenuWithExercises> result = [];

    for (final menu in actualMenus) {
      final query = db.select(db.menuExercises).join([
        innerJoin(db.exercises, db.exercises.id.equalsExp(db.menuExercises.exerciseId))
      ])..where(db.menuExercises.menuId.equals(menu.id));

      final rows = await query.get();
      final exercises = rows.map((row) => row.readTable(db.exercises)).toList();

      result.add(TrainingMenuWithExercises(menu: menu, exercises: exercises));
    }

    return result;
  }

  String _generateId() {
    return '${DateTime.now().millisecondsSinceEpoch}_${Random().nextInt(10000)}';
  }

  Future<void> createMenu(String name, List<Map<String, String>> selectedExercises) async {
    state = const AsyncValue.loading();
    try {
      final db = ref.read(databaseProvider);
      
      final menuId = _generateId();
      final now = DateTime.now();

      await db.transaction(() async {
        await db.into(db.trainingMenus).insert(
          TrainingMenusCompanion.insert(
            id: menuId,
            name: name,
            isTemplate: const Value(true), // Save as template
            createdAt: now,
            updatedAt: now,
            isDirty: const Value(true),
          ),
        );

        for (var i = 0; i < selectedExercises.length; i++) {
          final exId = selectedExercises[i]['id']!;
          await db.into(db.menuExercises).insert(
            MenuExercisesCompanion.insert(
              id: _generateId(),
              menuId: menuId,
              exerciseId: exId,
              sortOrder: i,
              targetSets: 3, // Default values
              targetReps: 10,
              isDirty: const Value(true),
            ),
          );
        }
      });

      // Reload
      state = AsyncValue.data(await _loadMenus());
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> deleteMenu(String id) async {
    state = const AsyncValue.loading();
    try {
      final db = ref.read(databaseProvider);
      await db.transaction(() async {
        await (db.delete(db.menuExercises)..where((t) => t.menuId.equals(id))).go();
        await (db.delete(db.trainingMenus)..where((t) => t.id.equals(id))).go();
      });
      state = AsyncValue.data(await _loadMenus());
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}
