import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/design_tokens.dart';
import 'training_notifier.dart';
import 'training_menu_notifier.dart';
import 'menu_builder_screen.dart' as kintore_menu;

class TrainingScreen extends ConsumerWidget {
  const TrainingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trainingState = ref.watch(trainingNotifierProvider);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.base),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Training',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: AppTypography.fontSize3Xl,
                  fontWeight: AppTypography.fontWeightBold,
                  fontFamily: AppTypography.fontEn,
                ),
              ),
              const SizedBox(height: AppSpacing.xl),

              // Active Session Bar if already active
              if (trainingState.isActive)
                GestureDetector(
                  onTap: () => context.push('/workout-session'),
                  child: Container(
                    width: double.infinity,
                    margin: const EdgeInsets.only(bottom: AppSpacing.base),
                    padding: const EdgeInsets.all(AppSpacing.base),
                    decoration: BoxDecoration(
                      color: AppColors.accentPrimary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      border: Border.all(color: AppColors.accentPrimary, width: 1),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Text(
                          'Active Workout in Progress 🔥',
                          style: TextStyle(
                            color: AppColors.accentPrimary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Icon(CupertinoIcons.chevron_right, color: AppColors.accentPrimary),
                      ],
                    ),
                  ),
                ),

              // Quick Start CTA Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.base),
                decoration: BoxDecoration(
                  color: AppColors.bgSecondary,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(color: AppColors.borderDefault, width: 1),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Quick Start',
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: AppTypography.fontSizeMd,
                        fontWeight: AppTypography.fontWeightBold,
                        fontFamily: AppTypography.fontEn,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    const Text(
                      'Start an empty session and log exercises as you go.',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: AppTypography.fontSizeSm,
                        fontFamily: AppTypography.fontEn,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.base),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.accentPrimary,
                        foregroundColor: AppColors.textInverse,
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppRadius.md),
                        ),
                        elevation: 0,
                      ),
                      onPressed: () {
                        // Start an empty session and push to active session
                        ref.read(trainingNotifierProvider.notifier).startSession([
                          {'id': 'custom', 'name': 'Bench Press'}
                        ]);
                        context.push('/workout-session');
                      },
                      child: const Text(
                        'Start Empty Session',
                        style: TextStyle(
                          fontWeight: AppTypography.fontWeightBold,
                          fontFamily: AppTypography.fontEn,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xl),



              // Saved Menus Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Saved Menus',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: AppTypography.fontSizeMd,
                      fontWeight: AppTypography.fontWeightBold,
                      fontFamily: AppTypography.fontEn,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      // Navigate to menu builder
                      // Note: We need a GoRoute for /menu-builder, I will push it directly if not defined or check router.
                      // Currently using context.push('/menu-builder') assuming it's added. Let's use Navigator for now to be safe if GoRoute is missing.
                      // Wait, I will use context.push('/menu-builder') and make sure to add it to router.
                      // But the prompt says "menu_builder_screen.dart" is in lib/features/training. 
                      // Actually, let's use Navigator.push:
                      Navigator.of(context, rootNavigator: true).push(
                        MaterialPageRoute(builder: (context) => const kintore_menu.MenuBuilderScreen()),
                      );
                    },
                    child: const Text('Create', style: TextStyle(color: AppColors.accentPrimary)),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              _buildSavedMenus(context, ref),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSavedMenus(BuildContext context, WidgetRef ref) {
    final menusAsync = ref.watch(trainingMenuNotifierProvider);

    return menusAsync.when(
      data: (menus) {
        if (menus.isEmpty) {
          return Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.xl),
            decoration: BoxDecoration(
              color: AppColors.bgSecondary,
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(color: AppColors.borderDefault, width: 1),
            ),
            child: Column(
              children: [
                const Icon(CupertinoIcons.doc_text, color: AppColors.textTertiary, size: 48),
                const SizedBox(height: AppSpacing.base),
                const Text(
                  'No saved menus yet',
                  style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: AppSpacing.xs),
                const Text(
                  'Create your first training template.',
                  style: TextStyle(color: AppColors.textTertiary, fontSize: 12),
                ),
              ],
            ),
          );
        }

        return Column(
          children: menus.map((m) => _buildMenuItem(
            title: m.menu.name,
            subtitle: '${m.exercises.length} exercises',
            onTap: () {
              ref.read(trainingNotifierProvider.notifier).startSession(
                m.exercises.map((e) => {'id': e.id, 'name': e.nameEn}).toList(),
              );
              context.push('/workout-session');
            },
          )).toList(),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, stack) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.red))),
    );
  }

  Widget _buildMenuItem({required String title, required String subtitle, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      padding: const EdgeInsets.all(AppSpacing.base),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.borderDefault, width: 1),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontWeight: AppTypography.fontWeightSemibold,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: const TextStyle(
                  color: AppColors.textTertiary,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const Icon(CupertinoIcons.play_fill, color: AppColors.accentPrimary, size: 16),
        ],
      ),
    ),
  );
}
}
