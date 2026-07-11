import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_body_heatmap/flutter_body_heatmap.dart';
import '../../infra/db/database.dart';
import 'models/stats_models.dart';
import 'package:drift/drift.dart';

final statsNotifierProvider = StateNotifierProvider<StatsNotifier, StatsState>((ref) {
  return StatsNotifier(ref);
});

class StatsNotifier extends StateNotifier<StatsState> {
  final Ref _ref;

  StatsNotifier(this._ref)
      : super(StatsState(
          startDate: DateTime(DateTime.now().year, DateTime.now().month, 1),
          endDate: DateTime(DateTime.now().year, DateTime.now().month + 1, 0, 23, 59, 59),
          activityStats: ActivityStats(
            startDate: DateTime(DateTime.now().year, DateTime.now().month, 1),
            endDate: DateTime(DateTime.now().year, DateTime.now().month + 1, 0, 23, 59, 59),
          ),
        )) {
    loadStatsForRange(state.startDate, state.endDate);
  }

  Future<void> loadStatsForRange(DateTime startDate, DateTime endDate) async {
    state = state.copyWith(isLoading: true, startDate: startDate, endDate: endDate);

    try {
      final db = _ref.read(databaseProvider);

      // Get completed sessions in the range
      final sessions = await (db.select(db.trainingSessions)
            ..where((t) => t.startTime.isBetweenValues(startDate, endDate) & t.status.equals('completed')))
          .get();

      final activeDays = sessions.map((s) => DateTime(s.startTime.year, s.startTime.month, s.startTime.day)).toSet().toList();

      final sessionIds = sessions.map((s) => s.id).toList();

      List<MuscleAggregatedStats> muscleStatsList = [];

      if (sessionIds.isNotEmpty) {
        // Query SessionSets joined with Exercises and MuscleGroups
        final query = db.select(db.sessionSets).join([
          innerJoin(db.exercises, db.exercises.id.equalsExp(db.sessionSets.exerciseId)),
          innerJoin(db.muscleGroups, db.muscleGroups.id.equalsExp(db.exercises.muscleGroupId)),
        ])..where(db.sessionSets.sessionId.isIn(sessionIds));

        final results = await query.get();

        final Map<String, MuscleAggregatedStats> aggregated = {};

        for (final row in results) {
          final set = row.readTable(db.sessionSets);
          final muscleGroup = row.readTable(db.muscleGroups);

          final mgId = muscleGroup.id;
          if (!aggregated.containsKey(mgId)) {
            aggregated[mgId] = MuscleAggregatedStats(
              muscleGroupId: mgId,
              nameEn: muscleGroup.nameEn,
              heatmapMuscle: _mapToHeatmapMuscle(muscleGroup.nameEn),
            );
          }

          final current = aggregated[mgId]!;
          final volume = set.weightKg * set.reps;

          aggregated[mgId] = current.copyWith(
            totalVolumeKg: current.totalVolumeKg + volume,
            totalSets: current.totalSets + 1,
          );
        }

        muscleStatsList = aggregated.values.toList();
        
        // Imbalance Detection Logic
        muscleStatsList = _detectImbalances(muscleStatsList);
      }

      state = state.copyWith(
        isLoading: false,
        muscleStats: muscleStatsList,
        activityStats: ActivityStats(
          startDate: startDate,
          endDate: endDate,
          totalWorkouts: sessions.length,
          activeDays: activeDays,
        ),
      );
    } catch (e, st) {
      print('Error in loadStatsForRange: $e\n$st');
      state = state.copyWith(isLoading: false);
    }
  }

  void changeRange(DateTime startDate, DateTime endDate) {
    loadStatsForRange(startDate, endDate);
  }

  Muscle? _mapToHeatmapMuscle(String nameEn) {
    final lower = nameEn.toLowerCase();
    if (lower.contains('chest')) return Muscle.chest;
    if (lower.contains('back')) {
      if (lower.contains('lower')) return Muscle.lowerBack;
      return Muscle.upperBack;
    }
    if (lower.contains('shoulder')) return Muscle.deltoids;
    if (lower.contains('bicep')) return Muscle.biceps;
    if (lower.contains('tricep')) return Muscle.triceps;
    if (lower.contains('leg') || lower.contains('quad')) return Muscle.quadriceps;
    if (lower.contains('hamstring')) return Muscle.hamstring;
    if (lower.contains('glute')) return Muscle.gluteal;
    if (lower.contains('calf') || lower.contains('calves')) return Muscle.calves;
    if (lower.contains('ab')) return Muscle.abs;
    if (lower.contains('forearm')) return Muscle.forearm;
    if (lower.contains('trap')) return Muscle.trapezius;
    return null;
  }

  List<MuscleAggregatedStats> _detectImbalances(List<MuscleAggregatedStats> stats) {
    if (stats.isEmpty) return stats;

    double pushSets = 0;
    double pullSets = 0;
    double legsSets = 0;

    for (final stat in stats) {
      final name = stat.nameEn.toLowerCase();
      if (name.contains('chest') || name.contains('shoulder') || name.contains('tricep')) {
        pushSets += stat.totalSets;
      } else if (name.contains('back') || name.contains('bicep') || name.contains('trap')) {
        pullSets += stat.totalSets;
      } else if (name.contains('leg') || name.contains('quad') || name.contains('hamstring') || name.contains('glute') || name.contains('calf')) {
        legsSets += stat.totalSets;
      }
    }

    final totalCoreSets = pushSets + pullSets + legsSets;
    if (totalCoreSets < 10) return stats; // Not enough data to judge

    // Flag muscles if they belong to a category that is severely undertrained
    // For example, if Pull is less than 30% of Push
    final isPullLagging = pushSets > 0 && (pullSets / pushSets) < 0.4;
    final isPushLagging = pullSets > 0 && (pushSets / pullSets) < 0.4;
    final isLegsLagging = (pushSets + pullSets) > 0 && (legsSets / (pushSets + pullSets)) < 0.2;

    return stats.map((stat) {
      final name = stat.nameEn.toLowerCase();
      bool lagging = false;

      if (isPullLagging && (name.contains('back') || name.contains('bicep'))) {
        lagging = true;
      } else if (isPushLagging && (name.contains('chest') || name.contains('shoulder') || name.contains('tricep'))) {
        lagging = true;
      } else if (isLegsLagging && (name.contains('leg') || name.contains('quad') || name.contains('hamstring') || name.contains('glute'))) {
        lagging = true;
      }

      return stat.copyWith(isLagging: lagging);
    }).toList();
  }
}
