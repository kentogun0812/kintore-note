import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_body_heatmap/flutter_body_heatmap.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/design_tokens.dart';
import '../../../core/widgets/glass/glass_container.dart';
import '../stats_notifier.dart';

class BodyHeatmapTab extends ConsumerStatefulWidget {
  const BodyHeatmapTab({super.key});

  @override
  ConsumerState<BodyHeatmapTab> createState() => _BodyHeatmapTabState();
}

class _BodyHeatmapTabState extends ConsumerState<BodyHeatmapTab> {
  BodySide _currentSide = BodySide.front;

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(statsNotifierProvider);

    if (state.isLoading) {
      return const Center(child: CupertinoActivityIndicator());
    }

    // Prepare data for heatmap
    double maxVolume = 1.0;
    for (final s in state.muscleStats) {
      if (s.totalVolumeKg > maxVolume) {
        maxVolume = s.totalVolumeKg;
      }
    }

    final Map<Muscle, MuscleData> heatmapData = {};
    for (final s in state.muscleStats) {
      if (s.heatmapMuscle != null) {
        // Normalize intensity
        final intensity = s.totalVolumeKg / maxVolume;
        heatmapData[s.heatmapMuscle!] = MuscleData(
          intensity: intensity,
          color: s.isLagging ? AppColors.reactionFire : null, // Warning color if lagging
        );
      }
    }

    final laggingMuscles = state.muscleStats.where((m) => m.isLagging).toList();

    return Column(
      children: [
        // Toggle Front / Back
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.base, vertical: AppSpacing.sm),
          child: CupertinoSlidingSegmentedControl<BodySide>(
            backgroundColor: AppColors.bgSecondary,
            thumbColor: AppColors.bgTertiary,
            groupValue: _currentSide,
            children: const {
              BodySide.front: Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Text('Front', style: TextStyle(color: AppColors.textPrimary)),
              ),
              BodySide.back: Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Text('Back', style: TextStyle(color: AppColors.textPrimary)),
              ),
            },
            onValueChanged: (val) {
              if (val != null) setState(() => _currentSide = val);
            },
          ),
        ),

        // Heatmap rendering
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: BodyHeatmap(
              side: _currentSide,
              data: heatmapData,
              colors: const [
                Color(0xFF2C2C2E), // Base/Low
                Color(0xFF4C8CFF), // Medium
                Color(0xFF0055FF), // High (AppColors.accentPrimary)
              ],
              bodyColor: const Color(0xFF1C1C1E),
              borderColor: AppColors.borderSubtle,
            ),
          ),
        ),

        // Imbalance Warning Callout
        if (laggingMuscles.isNotEmpty)
          Padding(
            padding: const EdgeInsets.all(AppSpacing.base),
            child: GlassContainer(
              borderRadius: AppRadius.lg,
              border: Border.all(color: AppColors.reactionFire.withValues(alpha: 0.5), width: 1),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(CupertinoIcons.exclamationmark_triangle_fill, color: AppColors.reactionFire, size: 24),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Imbalance Detected',
                            style: TextStyle(
                              color: AppColors.reactionFire,
                              fontWeight: AppTypography.fontWeightBold,
                              fontSize: AppTypography.fontSizeMd,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Your ${laggingMuscles.map((m) => m.nameEn).join(', ')} seem to be undertrained compared to the rest of your body. Consider adding isolation exercises to your next sessions.',
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: AppTypography.fontSizeSm,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}
