import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/design_tokens.dart';
import '../../l10n/app_localizations.dart';
import '../auth/auth_provider.dart';
import '../analytics/stats_notifier.dart';
import '../training/training_notifier.dart';
import 'package:go_router/go_router.dart';
import 'widgets/hanko_calendar.dart';
import 'widgets/milestone_badge.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final authState = ref.watch(authNotifierProvider);
    final userName = authState.user?.email?.split('@').first ?? 'User';

    final statsState = ref.watch(statsNotifierProvider);
    final activeDates = statsState.activityStats.activeDays;
    
    // Simple logic to compute streak from activeDates
    int currentStreak = 0;
    if (activeDates.isNotEmpty) {
      final sortedDates = activeDates.toList()..sort((a, b) => b.compareTo(a));
      final today = DateTime.now();
      final todayDate = DateTime(today.year, today.month, today.day);
      
      var checkDate = todayDate;
      if (sortedDates.isNotEmpty) {
        final latest = sortedDates.first;
        final latestDate = DateTime(latest.year, latest.month, latest.day);
        
        if (latestDate == todayDate || latestDate == todayDate.subtract(const Duration(days: 1))) {
          currentStreak = 0;
          var curDate = latestDate;
          for (var d in sortedDates) {
            final date = DateTime(d.year, d.month, d.day);
            if (date == curDate) {
              currentStreak++;
              curDate = curDate.subtract(const Duration(days: 1));
            } else if (date.isBefore(curDate)) {
              break;
            }
          }
        }
      }
    }

    int highestMilestone = 1;
    if (currentStreak >= 365) highestMilestone = 365;
    else if (currentStreak >= 180) highestMilestone = 180;
    else if (currentStreak >= 125) highestMilestone = 125;
    else if (currentStreak >= 75) highestMilestone = 75;
    else if (currentStreak >= 50) highestMilestone = 50;
    else if (currentStreak >= 30) highestMilestone = 30;
    else if (currentStreak >= 14) highestMilestone = 14;
    else if (currentStreak >= 7) highestMilestone = 7;
    else if (currentStreak >= 3) highestMilestone = 3;

    final isEn = Localizations.localeOf(context).languageCode == 'en';

    return Scaffold(
      backgroundColor: const Color(0xFF0E0E10),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Top Modern Gradient Banner Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(AppSpacing.base, AppSpacing.lg, AppSpacing.base, AppSpacing.md),
              child: SafeArea(
                bottom: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Welcome Info (No user icon)
                    Text(
                      l10n.homeWelcome,
                      style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 13),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      userName,
                      style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: AppSpacing.lg),

                    // Streak Card with Gradient & Mascot
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF33003A), Color(0xFF1E002B)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF9C005F).withOpacity(0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withOpacity(0.1)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.baseline,
                                  textBaseline: TextBaseline.alphabetic,
                                  children: [
                                    Text(
                                      currentStreak.toString(),
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 52,
                                        fontWeight: FontWeight.w900,
                                        height: 1.0,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      isEn ? 'Day Streak!' : '日連続記録 !',
                                      style: const TextStyle(
                                        color: Colors.white70,
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          // Mascot Illustration
                          SizedBox(
                            width: 80,
                            height: 80,
                            child: CustomPaint(
                              painter: MascotFacePainter(
                                days: highestMilestone,
                                color: getBadgeColor(highestMilestone),
                                isUnlocked: true,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Bottom Dark Theme Body
            Padding(
              padding: const EdgeInsets.all(AppSpacing.base),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Today's Workout Section
                  Text(
                    isEn ? "Today's Workout" : "今日のワークアウト",
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _buildTodaysWorkout(context, ref, isEn),
                  const SizedBox(height: AppSpacing.xl),

                  Text(
                    l10n.homeHankoCalendar,
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  
                  // Hanko Calendar Card
                  HankoCalendar(
                    stampedDates: activeDates,
                    currentStreak: currentStreak,
                  ),

                  const SizedBox(height: AppSpacing.xl),

                  // Streak Milestones Card
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1C1C1E),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withOpacity(0.05)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isEn ? 'Streak Milestones' : '連続記録マイルストーン',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          isEn ? 'Maintain your streak to unlock more mascots!' : '連続記録を維持して、さらに多くのアチーブメントを獲得しよう！',
                          style: const TextStyle(color: Colors.grey, fontSize: 11),
                        ),
                        const SizedBox(height: AppSpacing.lg),

                        // Badges grid
                        GridView.count(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisCount: 3,
                          mainAxisSpacing: 16,
                          crossAxisSpacing: 16,
                          childAspectRatio: 1.0,
                          children: [
                            MilestoneBadge(days: 1, isUnlocked: currentStreak >= 1, isActive: highestMilestone == 1),
                            MilestoneBadge(days: 3, isUnlocked: currentStreak >= 3, isActive: highestMilestone == 3),
                            MilestoneBadge(days: 7, isUnlocked: currentStreak >= 7, isActive: highestMilestone == 7),
                            MilestoneBadge(days: 14, isUnlocked: currentStreak >= 14, isActive: highestMilestone == 14),
                            MilestoneBadge(days: 30, isUnlocked: currentStreak >= 30, isActive: highestMilestone == 30),
                            MilestoneBadge(days: 50, isUnlocked: currentStreak >= 50, isActive: highestMilestone == 50),
                            MilestoneBadge(days: 75, isUnlocked: currentStreak >= 75, isActive: highestMilestone == 75),
                            MilestoneBadge(days: 125, isUnlocked: currentStreak >= 125, isActive: highestMilestone == 125),
                            MilestoneBadge(days: 180, isUnlocked: currentStreak >= 180, isActive: highestMilestone == 180),
                            MilestoneBadge(days: 365, isUnlocked: currentStreak >= 365, isActive: highestMilestone == 365),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTodaysWorkout(BuildContext context, WidgetRef ref, bool isEn) {
    final trainingState = ref.watch(trainingNotifierProvider);

    if (trainingState.isActive) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.accentPrimary.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.accentPrimary.withValues(alpha: 0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(CupertinoIcons.flame_fill, color: AppColors.accentPrimary, size: 20),
                const SizedBox(width: 8),
                Text(
                  isEn ? 'Session in Progress' : 'セッション進行中',
                  style: const TextStyle(color: AppColors.accentPrimary, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              isEn ? 'You have an active workout session.' : '現在アクティブなワークアウトがあります。',
              style: const TextStyle(color: Colors.grey, fontSize: 12),
            ),
            const SizedBox(height: AppSpacing.base),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accentPrimary,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(40),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () {
                context.push('/workout-session');
              },
              child: Text(
                isEn ? 'Resume Session' : 'セッションを再開',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: const Color(0xFF1C1C1E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(CupertinoIcons.calendar_today, color: Colors.grey, size: 20),
              const SizedBox(width: 8),
              Text(
                isEn ? 'No workout scheduled' : 'ワークアウト予定なし',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            isEn ? 'Ready to crush your goals today?' : '今日も目標に向かって頑張りましょう！',
            style: const TextStyle(color: Colors.grey, fontSize: 12),
          ),
          const SizedBox(height: AppSpacing.base),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white.withValues(alpha: 0.1),
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(40),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              // Navigate to the Training/Record tab
              // In StatefulShellRoute, we can jump to the branch using GoRouter.
              // Assuming '/training' works or context.go('/training')
              context.go('/training');
            },
            child: Text(
              isEn ? 'Start Workout' : 'ワークアウトを開始',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}
