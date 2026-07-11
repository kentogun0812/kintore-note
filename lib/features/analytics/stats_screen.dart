import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../core/theme/design_tokens.dart';
import 'stats_notifier.dart';
import 'widgets/body_heatmap_tab.dart';
import 'widgets/charts_tab.dart';

class StatsScreen extends ConsumerStatefulWidget {
  const StatsScreen({super.key});

  @override
  ConsumerState<StatsScreen> createState() => _StatsScreenState();
}

class _StatsScreenState extends ConsumerState<StatsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() {});
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _showFilterPicker(BuildContext context) async {
    final state = ref.read(statsNotifierProvider);
    final notifier = ref.read(statsNotifierProvider.notifier);

    if (_tabController.index == 0) {
      // Heatmap: Show Month Picker
      DateTime tempDate = state.startDate;
      showModalBottomSheet(
        context: context,
        useRootNavigator: true,
        backgroundColor: AppColors.bgSecondary,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
        ),
        builder: (context) {
          return SizedBox(
            height: 300,
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    CupertinoButton(
                      child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary)),
                      onPressed: () => Navigator.pop(context),
                    ),
                    CupertinoButton(
                      child: const Text('Done', style: TextStyle(color: AppColors.accentPrimary)),
                      onPressed: () {
                        final start = DateTime(tempDate.year, tempDate.month, 1);
                        final end = DateTime(tempDate.year, tempDate.month + 1, 0, 23, 59, 59);
                        notifier.changeRange(start, end);
                        Navigator.pop(context);
                      },
                    ),
                  ],
                ),
                Expanded(
                  child: CupertinoDatePicker(
                    mode: CupertinoDatePickerMode.monthYear,
                    initialDateTime: tempDate,
                    onDateTimeChanged: (DateTime newDateTime) {
                      tempDate = newDateTime;
                    },
                  ),
                ),
              ],
            ),
          );
        },
      );
    } else {
      // Chart: Show custom Date Range Bottom Sheet
      showModalBottomSheet(
        context: context,
        useRootNavigator: true,
        backgroundColor: AppColors.bgSecondary,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
        ),
        builder: (context) {
          return _DateRangePickerSheet(
            initialStart: state.startDate,
            initialEnd: state.endDate,
            onDone: (start, end) {
              notifier.changeRange(
                DateTime(start.year, start.month, start.day),
                DateTime(end.year, end.month, end.day, 23, 59, 59),
              );
              Navigator.pop(context);
            },
          );
        },
      );
    }
  }

  String _getRangeLabel(DateTime start, DateTime end) {
    if (_tabController.index == 0) {
      return DateFormat('MMM yyyy').format(start);
    } else {
      final startStr = DateFormat('dd/MM/yyyy').format(start);
      final endStr = DateFormat('dd/MM/yyyy').format(end);
      if (startStr == endStr) return startStr;
      
      // If it's exactly one month
      if (start.day == 1 && end.day == DateTime(end.year, end.month + 1, 0).day && start.month == end.month && start.year == end.year) {
        return DateFormat('MMM yyyy').format(start);
      }
      return '$startStr - $endStr';
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(statsNotifierProvider);
    final rangeLabel = _getRangeLabel(state.startDate, state.endDate);

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: SafeArea(
        child: Column(
          children: [
            // Header with Month Picker
            Padding(
              padding: const EdgeInsets.fromLTRB(AppSpacing.base, AppSpacing.base, AppSpacing.base, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Analytics',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: AppTypography.fontSize2Xl,
                      fontWeight: AppTypography.fontWeightBold,
                      fontFamily: AppTypography.fontEn,
                    ),
                  ),
                  GestureDetector(
                    onTap: () => _showFilterPicker(context),
                    child: Row(
                      children: [
                        Text(
                          rangeLabel,
                          style: const TextStyle(
                            color: AppColors.accentPrimary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(CupertinoIcons.chevron_down, color: AppColors.accentPrimary, size: 16),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: AppSpacing.md),
            
            // TabBar replacement with CupertinoSlidingSegmentedControl
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.base),
              child: SizedBox(
                width: double.infinity,
                child: CupertinoSlidingSegmentedControl<int>(
                  backgroundColor: AppColors.bgSecondary,
                  thumbColor: AppColors.bgTertiary,
                  groupValue: _tabController.index,
                  children: const {
                    0: Padding(
                      padding: EdgeInsets.symmetric(vertical: 10),
                      child: Text('Body Heatmap', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600)),
                    ),
                    1: Padding(
                      padding: EdgeInsets.symmetric(vertical: 10),
                      child: Text('Statistics', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600)),
                    ),
                  },
                  onValueChanged: (val) {
                    if (val != null) {
                      setState(() {
                        _tabController.index = val;
                      });
                    }
                  },
                ),
              ),
            ),
            
            const SizedBox(height: AppSpacing.md),

            // Tab Views
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: const [
                  BodyHeatmapTab(),
                  ChartsTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DateRangePickerSheet extends StatefulWidget {
  final DateTime initialStart;
  final DateTime initialEnd;
  final Function(DateTime, DateTime) onDone;

  const _DateRangePickerSheet({
    required this.initialStart,
    required this.initialEnd,
    required this.onDone,
  });

  @override
  State<_DateRangePickerSheet> createState() => _DateRangePickerSheetState();
}

class _DateRangePickerSheetState extends State<_DateRangePickerSheet> {
  late DateTime _startDate;
  late DateTime _endDate;
  int _activeTab = 0;

  @override
  void initState() {
    super.initState();
    _startDate = widget.initialStart;
    _endDate = widget.initialEnd;
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 350,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              CupertinoButton(
                child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary)),
                onPressed: () => Navigator.pop(context),
              ),
              CupertinoButton(
                child: const Text('Done', style: TextStyle(color: AppColors.accentPrimary)),
                onPressed: () {
                  if (_startDate.isAfter(_endDate)) {
                    widget.onDone(_endDate, _startDate);
                  } else {
                    widget.onDone(_startDate, _endDate);
                  }
                },
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.base, vertical: AppSpacing.sm),
            child: SizedBox(
              width: double.infinity,
              child: CupertinoSlidingSegmentedControl<int>(
                backgroundColor: AppColors.bgTertiary,
                thumbColor: AppColors.bgPrimary,
                groupValue: _activeTab,
                children: {
                  0: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Text('Start: ${DateFormat('dd/MM/yyyy').format(_startDate)}', style: const TextStyle(color: AppColors.textPrimary, fontSize: 13)),
                  ),
                  1: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Text('End: ${DateFormat('dd/MM/yyyy').format(_endDate)}', style: const TextStyle(color: AppColors.textPrimary, fontSize: 13)),
                  ),
                },
                onValueChanged: (val) {
                  if (val != null) setState(() => _activeTab = val);
                },
              ),
            ),
          ),
          Expanded(
            child: CupertinoDatePicker(
              key: ValueKey(_activeTab),
              mode: CupertinoDatePickerMode.date,
              initialDateTime: _activeTab == 0 ? _startDate : _endDate,
              onDateTimeChanged: (DateTime newDateTime) {
                setState(() {
                  if (_activeTab == 0) {
                    _startDate = newDateTime;
                  } else {
                    _endDate = newDateTime;
                  }
                });
              },
            ),
          ),
        ],
      ),
    );
  }
}
