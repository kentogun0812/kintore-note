import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/design_tokens.dart';
import '../../core/widgets/glass/glass_button.dart';
import '../../core/widgets/glass/glass_modal.dart';
import '../home/widgets/hanko_stamp_modal.dart';
import 'equipment_library_screen.dart';
import 'template_picker_sheet.dart';
import 'training_notifier.dart';
import 'widgets/custom_numpad.dart';
import 'widgets/rest_timer_widget.dart';

class WorkoutSessionScreen extends ConsumerWidget {
  const WorkoutSessionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessionState = ref.watch(trainingNotifierProvider);
    final restTimerSeconds = ref.watch(restTimerStateProvider);

    if (!sessionState.isActive) {
      return const Scaffold(
        body: Center(child: Text('No active session')),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: GlassButton(
            borderRadius: AppRadius.full,
            padding: EdgeInsets.zero,
            onPressed: () {
              HapticFeedback.lightImpact();
              context.pop();
            },
            child: const Icon(
              CupertinoIcons.chevron_left,
              color: AppColors.textPrimary,
              size: 16,
            ),
          ),
        ),
        title: const Text(
          'Active Session',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: AppTypography.fontWeightBold,
            fontSize: AppTypography.fontSizeLg,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              HapticFeedback.mediumImpact();
              GlassModal.show(
                context: context,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(CupertinoIcons.checkmark_seal_fill, color: AppColors.accentSuccess, size: 48),
                    const SizedBox(height: AppSpacing.sm),
                    const Text(
                      'Finish Workout?',
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: AppTypography.fontSizeLg,
                        fontWeight: AppTypography.fontWeightBold,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    const Text(
                      'All completed sets will be saved to your training history.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: AppColors.textSecondary, fontSize: AppTypography.fontSizeSm),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: AppColors.borderDefault),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
                            ),
                            onPressed: () => context.pop(), // Dismiss modal
                            child: const Text('Cancel', style: TextStyle(color: AppColors.textPrimary)),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.accentPrimary,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
                            ),
                            onPressed: () {
                              ref.read(trainingNotifierProvider.notifier).endSession();
                              context.pop(); // Pop "Finish Workout?" modal
                              HankoStampModal.show(context); // Show stamp animation, which pops the screen when done
                            },
                            child: const Text('Save', style: TextStyle(color: AppColors.textInverse, fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
            child: const Text(
              'Finish',
              style: TextStyle(
                color: AppColors.accentPrimary,
                fontWeight: FontWeight.bold,
                fontSize: AppTypography.fontSizeBase,
              ),
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          ListView.builder(
            padding: const EdgeInsets.all(AppSpacing.base),
            itemCount: sessionState.exercises.length + 1,
            itemBuilder: (context, index) {
              if (index == sessionState.exercises.length) {
                // Add Exercise & Load Template Buttons at bottom
                return Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.base, bottom: 100), // increased bottom padding for timer
                  child: Column(
                    children: [
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size.fromHeight(48),
                          side: const BorderSide(color: AppColors.borderDefault),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppRadius.md),
                          ),
                        ),
                        onPressed: () async {
                          HapticFeedback.mediumImpact();
                          final selectedExercise = await showModalBottomSheet<Map<String, String>>(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (context) => const EquipmentLibraryScreen(),
                          );
                          
                          if (selectedExercise != null) {
                            ref.read(trainingNotifierProvider.notifier).startSession([
                              ...sessionState.exercises.map((e) => {'id': e.exerciseId, 'name': e.name}),
                              selectedExercise
                            ]);
                          }
                        },
                        icon: const Icon(CupertinoIcons.add, color: AppColors.textPrimary),
                        label: const Text(
                          'Add Exercise',
                          style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size.fromHeight(48),
                          side: BorderSide(color: AppColors.accentPrimary.withValues(alpha: 0.5)),
                          backgroundColor: AppColors.accentPrimary.withValues(alpha: 0.05),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppRadius.md),
                          ),
                        ),
                        onPressed: () async {
                          HapticFeedback.mediumImpact();
                          final templateExercises = await showModalBottomSheet<List<Map<String, String>>>(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (context) => const TemplatePickerSheet(),
                          );
                          
                          if (templateExercises != null && templateExercises.isNotEmpty) {
                            ref.read(trainingNotifierProvider.notifier).startSession([
                              ...sessionState.exercises.map((e) => {'id': e.exerciseId, 'name': e.name}),
                              ...templateExercises
                            ]);
                          }
                        },
                        icon: const Icon(CupertinoIcons.doc_text_fill, color: AppColors.accentPrimary),
                        label: const Text(
                          'Load Template',
                          style: TextStyle(color: AppColors.accentPrimary, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                );
              }

              final exercise = sessionState.exercises[index];
              return _buildExerciseCard(context, ref, exercise)
                  .animate()
                  .fade(duration: 300.ms)
                  .slideY(begin: 0.1, end: 0, curve: Curves.easeOutBack);
            },
          ),
          
          if (restTimerSeconds != null)
            Positioned(
              bottom: 40,
              left: 0,
              right: 0,
              child: Center(
                child: RestTimerWidget(
                  initialSeconds: restTimerSeconds,
                  onDismiss: () => ref.read(restTimerStateProvider.notifier).dismiss(),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildExerciseCard(BuildContext context, WidgetRef ref, ExerciseRecord ex) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.base),
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.borderDefault, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                ex.name,
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: AppTypography.fontSizeMd,
                  fontWeight: AppTypography.fontWeightBold,
                ),
              ),
              IconButton(
                icon: const Icon(CupertinoIcons.ellipsis_vertical, color: AppColors.textTertiary),
                onPressed: () {
                  HapticFeedback.lightImpact();
                  ref.read(trainingNotifierProvider.notifier).removeExercise(ex.id);
                },
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),

          Row(
            children: const [
              SizedBox(width: 24, child: Text('SET', style: TextStyle(color: AppColors.textTertiary, fontSize: 11))),
              Expanded(child: Text('KG', style: TextStyle(color: AppColors.textTertiary, fontSize: 11))),
              Expanded(child: Text('REPS', style: TextStyle(color: AppColors.textTertiary, fontSize: 11))),
              SizedBox(width: 40, child: Center(child: Icon(CupertinoIcons.checkmark, color: AppColors.textTertiary, size: 14))),
            ],
          ),
          const Divider(color: AppColors.borderSubtle),

          // Sets List
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: ex.sets.length,
            itemBuilder: (context, sIndex) {
              final set = ex.sets[sIndex];
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
                child: Row(
                  children: [
                    // Set Number
                    // Set Number
                    SizedBox(
                      width: 24,
                      child: Text(
                        '${sIndex + 1}',
                        style: const TextStyle(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.bold,
                          fontFamily: AppTypography.fontMono,
                        ),
                      ),
                    ),

                    // Weight Input
                    Expanded(
                      child: GestureDetector(
                        onTap: () => _showNumpad(context, ref, ex.id, set.id, set.weight, NumpadMode.weight),
                        child: Container(
                          height: 32,
                          margin: const EdgeInsets.only(right: AppSpacing.xs),
                          decoration: BoxDecoration(
                            color: AppColors.bgTertiary,
                            borderRadius: BorderRadius.circular(AppRadius.sm),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            set.weight.isEmpty ? '-' : set.weight,
                            style: const TextStyle(fontFamily: AppTypography.fontMono, fontSize: 14, color: AppColors.textPrimary),
                          ),
                        ),
                      ),
                    ),

                    // Reps Input
                    Expanded(
                      child: GestureDetector(
                        onTap: () => _showNumpad(context, ref, ex.id, set.id, set.reps, NumpadMode.reps),
                        child: Container(
                          height: 32,
                          margin: const EdgeInsets.only(right: AppSpacing.xs),
                          decoration: BoxDecoration(
                            color: AppColors.bgTertiary,
                            borderRadius: BorderRadius.circular(AppRadius.sm),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            set.reps.isEmpty ? '-' : set.reps,
                            style: const TextStyle(fontFamily: AppTypography.fontMono, fontSize: 14, color: AppColors.textPrimary),
                          ),
                        ),
                      ),
                    ),

                    // Completion Checkbox (Apple Haptic Trigger)
                    SizedBox(
                      width: 40,
                      child: Center(
                        child: GestureDetector(
                          onTap: () {
                            ref.read(trainingNotifierProvider.notifier).toggleSetComplete(ex.id, set.id);
                            if (!set.completed) {
                              HapticFeedback.lightImpact(); // Apple haptic vibration
                              ref.read(restTimerStateProvider.notifier).start(60); // 60s default
                            } else {
                              ref.read(restTimerStateProvider.notifier).dismiss();
                            }
                          },
                          child: AnimatedContainer(
                            duration: 200.ms,
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              color: set.completed ? AppColors.accentSuccess : AppColors.bgTertiary,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(
                                color: set.completed ? AppColors.accentSuccess : AppColors.borderDefault,
                                width: 1,
                              ),
                            ),
                            child: set.completed
                                ? const Icon(CupertinoIcons.checkmark, color: AppColors.white, size: 14)
                                : null,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),

          const SizedBox(height: AppSpacing.sm),

          // Add Set Button
          TextButton.icon(
            style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
              minimumSize: const Size(100, 32),
              alignment: Alignment.centerLeft,
            ),
            onPressed: () {
              HapticFeedback.lightImpact();
              ref.read(trainingNotifierProvider.notifier).addSet(ex.id);
            },
            icon: const Icon(CupertinoIcons.add, size: 14, color: AppColors.accentPrimary),
            label: const Text(
              'Add Set',
              style: TextStyle(color: AppColors.accentPrimary, fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  void _showNumpad(BuildContext context, WidgetRef ref, String exerciseId, String setId, String currentValue, NumpadMode mode) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CustomNumpad(
        currentValue: currentValue,
        mode: mode,
        onChanged: (val) {
          if (mode == NumpadMode.weight) {
            ref.read(trainingNotifierProvider.notifier).updateSet(exerciseId, setId, weight: val);
          } else {
            ref.read(trainingNotifierProvider.notifier).updateSet(exerciseId, setId, reps: val);
          }
        },
        onDone: () => Navigator.pop(context),
      ),
    );
  }
}
