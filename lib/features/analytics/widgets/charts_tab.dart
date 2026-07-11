import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/design_tokens.dart';
import '../../../core/widgets/glass/glass_container.dart';
import '../models/stats_models.dart';
import '../stats_notifier.dart';

enum ChartMode { volume, sets, days }

class ChartsTab extends ConsumerStatefulWidget {
  const ChartsTab({super.key});

  @override
  ConsumerState<ChartsTab> createState() => _ChartsTabState();
}

class _ChartsTabState extends ConsumerState<ChartsTab> {
  ChartMode _currentMode = ChartMode.volume;

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(statsNotifierProvider);

    if (state.isLoading) {
      return const Center(child: CupertinoActivityIndicator());
    }

    return Column(
      children: [
        // Mode Selector
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.base, vertical: AppSpacing.sm),
          child: CupertinoSlidingSegmentedControl<ChartMode>(
            backgroundColor: AppColors.bgSecondary,
            thumbColor: AppColors.bgTertiary,
            groupValue: _currentMode,
            children: const {
              ChartMode.volume: Padding(
                padding: EdgeInsets.symmetric(horizontal: 12),
                child: Text('Volume', style: TextStyle(color: AppColors.textPrimary, fontSize: 13)),
              ),
              ChartMode.sets: Padding(
                padding: EdgeInsets.symmetric(horizontal: 12),
                child: Text('Sets', style: TextStyle(color: AppColors.textPrimary, fontSize: 13)),
              ),
              ChartMode.days: Padding(
                padding: EdgeInsets.symmetric(horizontal: 12),
                child: Text('Days', style: TextStyle(color: AppColors.textPrimary, fontSize: 13)),
              ),
            },
            onValueChanged: (val) {
              if (val != null) setState(() => _currentMode = val);
            },
          ),
        ),

        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.base),
            child: GlassContainer(
              borderRadius: AppRadius.lg,
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: _buildChart(state),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildChart(StatsState state) {
    if (_currentMode == ChartMode.days) {
      return _buildDaysChart(state);
    }
    
    final isVolume = _currentMode == ChartMode.volume;
    
    List<MuscleAggregatedStats> displayStats = [];
    if (state.muscleStats.isEmpty) {
      displayStats = List.generate(7, (i) => MuscleAggregatedStats(muscleGroupId: '', nameEn: '-'));
    } else {
      // Sort muscles by metric descending
      final sortedStats = List.of(state.muscleStats);
      sortedStats.sort((a, b) {
        if (isVolume) return b.totalVolumeKg.compareTo(a.totalVolumeKg);
        return b.totalSets.compareTo(a.totalSets);
      });

      // Take top 7 for readability
      displayStats = sortedStats.take(7).toList();
    }
    
    double maxY = 0;
    for (final s in displayStats) {
      final val = isVolume ? s.totalVolumeKg : s.totalSets.toDouble();
      if (val > maxY) maxY = val;
    }

    // Add 10% headroom
    maxY = maxY * 1.1;
    if (maxY == 0) maxY = 100; // fallback

    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: maxY,
        minY: 0,
        titlesData: FlTitlesData(
          show: true,
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                if (value >= 0 && value < displayStats.length) {
                  final name = displayStats[value.toInt()].nameEn;
                  return Padding(
                    padding: const EdgeInsets.only(top: 8.0),
                    child: Text(
                      name.length > 5 ? name.substring(0, 5) : name,
                      style: const TextStyle(color: AppColors.textTertiary, fontSize: 10),
                    ),
                  );
                }
                return const Text('');
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              getTitlesWidget: (value, meta) {
                if (value == 0) return const Text('');
                if (isVolume) {
                  return Text('${(value / 1000).toStringAsFixed(1)}k', style: const TextStyle(color: AppColors.textTertiary, fontSize: 10));
                } else {
                  return Text(value.toInt().toString(), style: const TextStyle(color: AppColors.textTertiary, fontSize: 10));
                }
              },
            ),
          ),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          getDrawingHorizontalLine: (value) => FlLine(color: AppColors.borderSubtle, strokeWidth: 1, dashArray: [5, 5]),
        ),
        borderData: FlBorderData(show: false),
        barGroups: List.generate(displayStats.length, (i) {
          final s = displayStats[i];
          final val = isVolume ? s.totalVolumeKg : s.totalSets.toDouble();
          return BarChartGroupData(
            x: i,
            barRods: [
              BarChartRodData(
                toY: val,
                color: AppColors.accentPrimary,
                width: 16,
                borderRadius: BorderRadius.circular(4),
              ),
            ],
          );
        }),
      ),
    );
  }

  Widget _buildDaysChart(StatsState state) {
    int maxDays = state.endDate.difference(state.startDate).inDays + 1;
    if (maxDays <= 0) maxDays = 1;
    
    // Convert active dates to relative day index (1 to maxDays)
    final Map<int, int> workoutsPerDay = {};
    for (final date in state.activityStats.activeDays) {
      int index = date.difference(state.startDate).inDays + 1;
      if (index >= 1 && index <= maxDays) {
        workoutsPerDay[index] = (workoutsPerDay[index] ?? 0) + 1;
      }
    }

    // Continue rendering even if empty

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Total Workouts: ${state.activityStats.totalWorkouts}',
          style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: AppTypography.fontSizeLg),
        ),
        const SizedBox(height: AppSpacing.lg),
        Expanded(
          child: BarChart(
            BarChartData(
              alignment: BarChartAlignment.spaceAround,
              maxY: 2, // Usually max 1-2 workouts a day
              minY: 0,
              titlesData: FlTitlesData(
                show: true,
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    getTitlesWidget: (value, meta) {
                      if (value % 5 == 0 && value > 0) {
                        return Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Text('${value.toInt()}', style: const TextStyle(color: AppColors.textTertiary, fontSize: 10)),
                        );
                      }
                      return const Text('');
                    },
                  ),
                ),
                leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              ),
              gridData: const FlGridData(show: false),
              borderData: FlBorderData(show: false),
              barGroups: List.generate(maxDays, (i) {
                final day = i + 1;
                final val = (workoutsPerDay[day] ?? 0).toDouble();
                return BarChartGroupData(
                  x: day,
                  barRods: [
                    BarChartRodData(
                      toY: val,
                      color: val > 0 ? AppColors.accentSuccess : AppColors.borderSubtle,
                      width: 6,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ],
                );
              }),
            ),
          ),
        ),
      ],
    );
  }
}
