import 'package:flutter_body_heatmap/flutter_body_heatmap.dart';

class MuscleAggregatedStats {
  final String muscleGroupId;
  final String nameEn;
  final Muscle? heatmapMuscle;
  final double totalVolumeKg;
  final int totalSets;
  final bool isLagging;

  MuscleAggregatedStats({
    required this.muscleGroupId,
    required this.nameEn,
    this.heatmapMuscle,
    this.totalVolumeKg = 0.0,
    this.totalSets = 0,
    this.isLagging = false,
  });

  MuscleAggregatedStats copyWith({
    String? muscleGroupId,
    String? nameEn,
    Muscle? heatmapMuscle,
    double? totalVolumeKg,
    int? totalSets,
    bool? isLagging,
  }) {
    return MuscleAggregatedStats(
      muscleGroupId: muscleGroupId ?? this.muscleGroupId,
      nameEn: nameEn ?? this.nameEn,
      heatmapMuscle: heatmapMuscle ?? this.heatmapMuscle,
      totalVolumeKg: totalVolumeKg ?? this.totalVolumeKg,
      totalSets: totalSets ?? this.totalSets,
      isLagging: isLagging ?? this.isLagging,
    );
  }
}

class ActivityStats {
  final DateTime startDate;
  final DateTime endDate;
  final int totalWorkouts;
  final List<DateTime> activeDays;

  ActivityStats({
    required this.startDate,
    required this.endDate,
    this.totalWorkouts = 0,
    this.activeDays = const [],
  });
}

class StatsState {
  final bool isLoading;
  final DateTime startDate;
  final DateTime endDate;
  final List<MuscleAggregatedStats> muscleStats;
  final ActivityStats activityStats;

  StatsState({
    this.isLoading = true,
    required this.startDate,
    required this.endDate,
    this.muscleStats = const [],
    required this.activityStats,
  });

  StatsState copyWith({
    bool? isLoading,
    DateTime? startDate,
    DateTime? endDate,
    List<MuscleAggregatedStats>? muscleStats,
    ActivityStats? activityStats,
  }) {
    return StatsState(
      isLoading: isLoading ?? this.isLoading,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      muscleStats: muscleStats ?? this.muscleStats,
      activityStats: activityStats ?? this.activityStats,
    );
  }
}
