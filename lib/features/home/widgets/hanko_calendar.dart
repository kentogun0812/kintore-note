import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/design_tokens.dart';
import 'milestone_badge.dart';

class HankoCalendar extends StatefulWidget {
  final List<DateTime> stampedDates;
  final int currentStreak;

  const HankoCalendar({
    super.key,
    required this.stampedDates,
    required this.currentStreak,
  });

  @override
  State<HankoCalendar> createState() => _HankoCalendarState();
}

class _HankoCalendarState extends State<HankoCalendar> {
  late DateTime _currentMonth;
  final Set<DateTime> _manuallyStamped = {};

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _currentMonth = DateTime(now.year, now.month, 1);
  }

  void _previousMonth() {
    setState(() {
      _currentMonth = DateTime(_currentMonth.year, _currentMonth.month - 1, 1);
    });
  }

  void _nextMonth() {
    setState(() {
      _currentMonth = DateTime(_currentMonth.year, _currentMonth.month + 1, 1);
    });
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final daysInMonth = DateTime(_currentMonth.year, _currentMonth.month + 1, 0).day;
    
    // 1 = Monday, 7 = Sunday.
    final startingWeekday = _currentMonth.weekday;
    final leadingEmptyDays = startingWeekday == 7 ? 0 : startingWeekday; 

    bool isDayStamped(int day) {
      final date = DateTime(_currentMonth.year, _currentMonth.month, day);
      return widget.stampedDates.any((d) => 
          d.year == date.year && 
          d.month == date.month && 
          d.day == date.day) || _manuallyStamped.contains(date);
    }

    bool isToday(int day) {
      return now.year == _currentMonth.year && now.month == _currentMonth.month && now.day == day;
    }
    
    // Count check-ins in the current displayed month
    final currentMonthCheckins = widget.stampedDates.where((d) => 
          d.year == _currentMonth.year && d.month == _currentMonth.month).length;

    // Use Intl for localized month name
    final locale = Localizations.localeOf(context).languageCode;
    final monthFormat = DateFormat.yMMMM(locale);
    final isEn = locale == 'en';
    final weekdays = isEn ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['日', '月', '火', '水', '木', '金', '土'];

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: const Color(0xFF1C1C1E),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Month Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                monthFormat.format(_currentMonth),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(CupertinoIcons.chevron_left, color: Colors.grey, size: 20),
                    onPressed: _previousMonth,
                  ),
                  IconButton(
                    icon: const Icon(CupertinoIcons.chevron_right, color: Colors.grey, size: 20),
                    onPressed: _nextMonth,
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),

          // Statistics rows
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF262629),
                    border: Border.all(color: const Color(0xFFD97706).withOpacity(0.3)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(CupertinoIcons.flame_fill, color: Color(0xFFF97316), size: 24),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isEn ? '$currentMonthCheckins Days' : '$currentMonthCheckins日間',
                            style: const TextStyle(color: Color(0xFFF97316), fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          Text(
                            isEn ? 'Check-ins' : 'チェックイン日数',
                            style: const TextStyle(color: Colors.grey, fontSize: 10),
                          ),
                        ],
                      )
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF262629),
                    border: Border.all(color: const Color(0xFF2563EB).withOpacity(0.3)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.ac_unit, color: Color(0xFF3B82F6), size: 24),
                          const SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isEn ? '0 Days' : '0日間',
                                style: const TextStyle(color: Color(0xFF3B82F6), fontWeight: FontWeight.bold, fontSize: 15),
                              ),
                              Text(
                                isEn ? 'Freezes' : '凍結日数',
                                style: const TextStyle(color: Colors.grey, fontSize: 10),
                              ),
                            ],
                          )
                        ],
                      ),
                      const Icon(CupertinoIcons.chevron_right, color: Colors.grey, size: 14),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),

          // Weekdays
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: weekdays
                .map((day) => Expanded(
                      child: Center(
                        child: Text(
                          day,
                          style: const TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ))
                .toList(),
          ),
          const SizedBox(height: AppSpacing.sm),

          // Calendar Grid
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              mainAxisSpacing: 10,
              crossAxisSpacing: 0, 
              childAspectRatio: 1,
            ),
            itemCount: daysInMonth + leadingEmptyDays,
            itemBuilder: (context, index) {
              if (index < leadingEmptyDays) return const SizedBox.shrink();

              final day = index - leadingEmptyDays + 1;
              final colIndex = index % 7; 

              final isStamped = isDayStamped(day);
              final isPrevStamped = day > 1 && isDayStamped(day - 1) && colIndex > 0;
              final isNextStamped = day < daysInMonth && isDayStamped(day + 1) && colIndex < 6;

              Widget cellContent;
              if (isStamped) {
                // Determine the current milestone to show the evolving Mascot Face
                int m = 1;
                if (widget.currentStreak >= 365) m = 365;
                else if (widget.currentStreak >= 180) m = 180;
                else if (widget.currentStreak >= 125) m = 125;
                else if (widget.currentStreak >= 75) m = 75;
                else if (widget.currentStreak >= 50) m = 50;
                else if (widget.currentStreak >= 30) m = 30;
                else if (widget.currentStreak >= 14) m = 14;
                else if (widget.currentStreak >= 7) m = 7;
                else if (widget.currentStreak >= 3) m = 3;

                final bColor = getBadgeColor(m);

                cellContent = Center(
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: bColor, width: 1.5),
                      color: bColor.withOpacity(0.15),
                    ),
                    child: Center(
                      child: CustomPaint(
                        size: const Size(18, 18),
                        painter: MascotFacePainter(
                          days: m,
                          color: bColor,
                          isUnlocked: true,
                        ),
                      ),
                    ),
                  ),
                );

                // Animate stamp whenever it appears
                cellContent = cellContent.animate()
                    .scale(begin: const Offset(1.8, 1.8), end: const Offset(1.0, 1.0), duration: 500.ms, curve: Curves.easeOutBack)
                    .fade(duration: 300.ms);
              } else {
                // Normal un-stamped date
                cellContent = Center(
                  child: Text(
                    day.toString(),
                    style: TextStyle(
                      color: isToday(day) ? const Color(0xFFF97316) : Colors.grey[400],
                      fontSize: 14,
                      fontWeight: isToday(day) ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                );

                if (isToday(day)) {
                  cellContent = cellContent.animate(onPlay: (c) => c.repeat(reverse: true))
                      .fade(begin: 0.4, end: 1.0, duration: 800.ms)
                      .scale(begin: const Offset(1.0, 1.0), end: const Offset(1.1, 1.1), duration: 800.ms);
                }
              }

              // Background decorations for connected streak
              Decoration? boxDecoration;
              if (isStamped) {
                if (isPrevStamped && isNextStamped) {
                  boxDecoration = BoxDecoration(
                    color: const Color(0xFFF97316).withOpacity(0.15), 
                  );
                } else if (isPrevStamped) {
                  boxDecoration = BoxDecoration(
                    color: const Color(0xFFF97316).withOpacity(0.15),
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(99),
                      bottomRight: Radius.circular(99),
                    ),
                  );
                } else if (isNextStamped) {
                  boxDecoration = BoxDecoration(
                    color: const Color(0xFFF97316).withOpacity(0.15),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(99),
                      bottomLeft: Radius.circular(99),
                    ),
                  );
                } else {
                  boxDecoration = BoxDecoration(
                    color: const Color(0xFFF97316).withOpacity(0.15),
                    shape: BoxShape.circle,
                  );
                }
              } else {
                final dateToCheck = DateTime(_currentMonth.year, _currentMonth.month, day);
                final todayDate = DateTime(now.year, now.month, now.day);
                if (dateToCheck.isBefore(todayDate)) {
                  // Passed days that are not checked in
                  boxDecoration = const BoxDecoration(
                    color: Color(0xFF262629),
                    shape: BoxShape.circle,
                  );
                } else if (isToday(day)) {
                  boxDecoration = BoxDecoration(
                    border: Border.all(color: const Color(0xFFF97316), width: 1.5),
                    shape: BoxShape.circle,
                  );
                }
              }

              return Container(
                margin: const EdgeInsets.symmetric(vertical: 2),
                decoration: boxDecoration,
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(99),
                    onTap: () {
                      final date = DateTime(_currentMonth.year, _currentMonth.month, day);
                      final todayDate = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);

                      if (date == todayDate) {
                        // Stamp today
                        setState(() {
                          if (_manuallyStamped.contains(date)) {
                            _manuallyStamped.remove(date);
                          } else {
                            _manuallyStamped.add(date);
                          }
                        });
                      } else if (date.isBefore(todayDate)) {
                        // Show history for past dates
                        _showDailyHistory(context, date);
                      }
                    },
                    child: cellContent,
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  void _showDailyHistory(BuildContext context, DateTime date) {
    final isEn = Localizations.localeOf(context).languageCode == 'en';
    final formattedDate = DateFormat.yMMMMd().format(date);

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1C1C1E),
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(AppSpacing.xl),
          height: MediaQuery.of(context).size.height * 0.4,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isEn ? 'Training Record' : 'トレーニング記録',
                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                formattedDate,
                style: const TextStyle(color: Colors.grey, fontSize: 14),
              ),
              const SizedBox(height: AppSpacing.xxl),
              Expanded(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(CupertinoIcons.doc_text_search, color: Colors.white24, size: 64),
                      const SizedBox(height: 16),
                      Text(
                        isEn ? 'History data will be displayed here.' : 'ここに履歴データが表示されます。',
                        style: const TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
