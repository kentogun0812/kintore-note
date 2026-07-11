import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:drift/drift.dart';
import '../../infra/db/database.dart';

part 'analytics_notifier.g.dart';

class HeatmapRegionData {
  final String id;
  final String name;
  final double volume;

  HeatmapRegionData({required this.id, required this.name, required this.volume});
}

class ChartDataPoint {
  final String date;
  final double volume;

  ChartDataPoint({required this.date, required this.volume});
}

class AnalyticsState {
  final List<HeatmapRegionData> heatmapData;
  final List<ChartDataPoint> chartData;
  final bool isLoadingHeatmap;
  final bool isLoadingChart;

  AnalyticsState({
    this.heatmapData = const [],
    this.chartData = const [],
    this.isLoadingHeatmap = false,
    this.isLoadingChart = false,
  });

  AnalyticsState copyWith({
    List<HeatmapRegionData>? heatmapData,
    List<ChartDataPoint>? chartData,
    bool? isLoadingHeatmap,
    bool? isLoadingChart,
  }) {
    return AnalyticsState(
      heatmapData: heatmapData ?? this.heatmapData,
      chartData: chartData ?? this.chartData,
      isLoadingHeatmap: isLoadingHeatmap ?? this.isLoadingHeatmap,
      isLoadingChart: isLoadingChart ?? this.isLoadingChart,
    );
  }
}

@riverpod
class AnalyticsNotifier extends _$AnalyticsNotifier {
  @override
  AnalyticsState build() {
    return AnalyticsState();
  }

  AppDatabase get _db => ref.read(databaseProvider);

  /// Fetches volume aggregated by muscle group for the heatmap
  Future<void> fetchHeatmapData(String userId, String range) async {
    state = state.copyWith(isLoadingHeatmap: true);
    try {
      DateTime pastDate = DateTime.fromMillisecondsSinceEpoch(0);
      if (range != 'all') {
        final days = range == '7d' ? 7 : 30;
        pastDate = DateTime.now().subtract(Duration(days: days));
      }

      final selectQuery = _db.customSelect(
        '''
        SELECT mg.id, mg.name_en, SUM(ss.weight_kg * ss.reps) as volume
        FROM session_sets ss
        INNER JOIN exercises e ON ss.exercise_id = e.id
        INNER JOIN muscle_groups mg ON e.muscle_group_id = mg.id
        INNER JOIN training_sessions ts ON ss.session_id = ts.id
        WHERE ts.user_id = ? 
          AND (? IS NULL OR ts.start_time >= ?)
        GROUP BY mg.id, mg.name_en
        ''',
        variables: [
          Variable.withString(userId),
          Variable.withDateTime(pastDate),
          Variable.withDateTime(pastDate),
        ],
      );

      final rows = await selectQuery.get();
      final list = rows.map((row) {
        return HeatmapRegionData(
          id: row.read<String>('id'),
          name: row.read<String>('name_en'),
          volume: (row.read<num>('volume')).toDouble(),
        );
      }).toList();

      state = state.copyWith(heatmapData: list, isLoadingHeatmap: false);
    } catch (e) {
      state = state.copyWith(isLoadingHeatmap: false);
    }
  }

  /// Fetches daily volume progression for a specific exercise
  Future<void> fetchVolumeChartData(String userId, String exerciseId, String range) async {
    state = state.copyWith(isLoadingChart: true);
    try {
      DateTime pastDate = DateTime.fromMillisecondsSinceEpoch(0);
      if (range != 'all') {
        final days = range == '7d' ? 7 : 30;
        pastDate = DateTime.now().subtract(Duration(days: days));
      }

      // Convert Milliseconds timestamp in SQLite to Date string 'YYYY-MM-DD'
      final selectQuery = _db.customSelect(
        '''
        SELECT date(ts.start_time / 1000, 'unixepoch') as date_str, SUM(ss.weight_kg * ss.reps) as volume
        FROM session_sets ss
        INNER JOIN training_sessions ts ON ss.session_id = ts.id
        WHERE ts.user_id = ? 
          AND ss.exercise_id = ?
          AND (? IS NULL OR ts.start_time >= ?)
        GROUP BY date_str
        ORDER BY date_str ASC
        ''',
        variables: [
          Variable.withString(userId),
          Variable.withString(exerciseId),
          Variable.withDateTime(pastDate),
          Variable.withDateTime(pastDate),
        ],
      );

      final rows = await selectQuery.get();
      final list = rows.map((row) {
        return ChartDataPoint(
          date: row.read<String>('date_str'),
          volume: (row.read<num>('volume')).toDouble(),
        );
      }).toList();

      state = state.copyWith(chartData: list, isLoadingChart: false);
    } catch (e) {
      state = state.copyWith(isLoadingChart: false);
    }
  }
}
