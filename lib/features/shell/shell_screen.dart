import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/design_tokens.dart';
import '../../core/widgets/glass/glass_container.dart';
import '../../l10n/app_localizations.dart';

class ShellScreen extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const ShellScreen({
    super.key,
    required this.navigationShell,
  });

  void _onTap(BuildContext context, int index) {
    HapticFeedback.selectionClick();
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  Widget _buildNavItem(BuildContext context, int index, IconData icon, IconData activeIcon, String label) {
    final isActive = navigationShell.currentIndex == index;
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => _onTap(context, index),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            isActive ? activeIcon : icon,
            color: isActive ? AppColors.accentPrimary : AppColors.textTertiary,
            size: 24,
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontFamily: AppTypography.fontEn,
              fontSize: 10,
              fontWeight: isActive ? AppTypography.fontWeightSemibold : AppTypography.fontWeightRegular,
              color: isActive ? AppColors.accentPrimary : AppColors.textTertiary,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      extendBody: true, // Let screens flow under the translucent nav bar
      body: navigationShell,
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.only(
          bottom: AppSpacing.base,
          left: AppSpacing.base,
          right: AppSpacing.base,
        ),
        child: GlassContainer(
          borderRadius: AppRadius.xl,
          border: Border.all(
            color: AppColors.borderDefault,
            width: 1.0,
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(context, 0, CupertinoIcons.house, CupertinoIcons.house_fill, l10n.tabsHome),
                _buildNavItem(context, 1, CupertinoIcons.stopwatch, CupertinoIcons.stopwatch_fill, l10n.tabsTraining),
                _buildNavItem(context, 2, CupertinoIcons.chart_bar, CupertinoIcons.chart_bar_fill, l10n.tabsStats),
                _buildNavItem(context, 3, CupertinoIcons.photo, CupertinoIcons.photo_fill, l10n.tabsBody),
                _buildNavItem(context, 4, CupertinoIcons.settings, CupertinoIcons.settings_solid, l10n.settingsTitle),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
