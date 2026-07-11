import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/design_tokens.dart';
import '../../core/widgets/glass/glass_container.dart';
import '../../core/providers/locale_provider.dart';
import '../../l10n/app_localizations.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final LocalAuthentication auth = LocalAuthentication();
  bool _appLockEnabled = false;
  String _language = 'English';
  String _unit = 'Kg';

  Future<void> _toggleAppLock(bool value) async {
    if (value) {
      // Mocking Biometric App Lock for Web/Simulator
      await Future.delayed(const Duration(milliseconds: 500));
      setState(() => _appLockEnabled = true);
    } else {
      setState(() => _appLockEnabled = false);
    }
  }

  void _showActionSheet(String title, List<String> options, String currentValue, Function(String) onSelect) {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: Text(title, style: const TextStyle(fontFamily: AppTypography.fontEn, fontSize: 16)),
        actions: options.map((opt) => CupertinoActionSheetAction(
          onPressed: () {
            onSelect(opt);
            Navigator.pop(context);
          },
          child: Text(
            opt, 
            style: TextStyle(
              color: opt == currentValue ? AppColors.accentPrimary : AppColors.textPrimary,
              fontWeight: opt == currentValue ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        )).toList(),
        cancelButton: CupertinoActionSheetAction(
          isDestructiveAction: true,
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: AppSpacing.sm, bottom: AppSpacing.sm, top: AppSpacing.md),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          color: AppColors.textTertiary, 
          fontSize: 12, 
          fontWeight: FontWeight.bold, 
          letterSpacing: 1.2,
          fontFamily: AppTypography.fontEn,
        ),
      ),
    );
  }

  Widget _buildSettingRow({required String title, required Widget trailing, IconData? icon, VoidCallback? onTap}) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.base, vertical: AppSpacing.md),
        child: Row(
          children: [
            if (icon != null) ...[
              Icon(icon, color: AppColors.textSecondary, size: 22),
              const SizedBox(width: AppSpacing.md),
            ],
            Expanded(child: Text(title, style: const TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w500))),
            trailing,
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(AppSpacing.base),
              child: Text(
                l10n.settingsTitle,
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: AppTypography.fontSize2Xl,
                  fontWeight: AppTypography.fontWeightBold,
                  fontFamily: AppTypography.fontEn,
                ),
              ),
            ),
            
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.base),
                children: [
                  _buildSectionHeader(l10n.settingsSecurity),
                  GlassContainer(
                    borderRadius: AppRadius.lg,
                    child: Column(
                      children: [
                        _buildSettingRow(
                          title: l10n.settingsAppLock,
                          icon: CupertinoIcons.lock_shield_fill,
                          trailing: CupertinoSwitch(
                            value: _appLockEnabled,
                            activeColor: AppColors.accentPrimary,
                            onChanged: _toggleAppLock,
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: AppSpacing.base),
                  
                  _buildSectionHeader(l10n.settingsPreferences),
                  GlassContainer(
                    borderRadius: AppRadius.lg,
                    child: Column(
                      children: [
                        _buildSettingRow(
                          title: l10n.settingsLanguage,
                          icon: CupertinoIcons.globe,
                          trailing: Row(
                            children: [
                              Text(_language, style: const TextStyle(color: AppColors.textSecondary, fontSize: 16)),
                              const SizedBox(width: 4),
                              const Icon(CupertinoIcons.chevron_right, color: AppColors.textTertiary, size: 16),
                            ],
                          ),
                          onTap: () => _showActionSheet('Select Language', ['English', '日本語'], _language, (v) {
                            setState(() => _language = v);
                            ref.read(localeProvider.notifier).state = Locale(v == 'English' ? 'en' : 'ja');
                          }),
                        ),
                        const Divider(color: AppColors.borderSubtle, height: 1, indent: 48),
                        _buildSettingRow(
                          title: l10n.settingsWeightUnit,
                          icon: CupertinoIcons.speedometer,
                          trailing: Row(
                            children: [
                              Text(_unit, style: const TextStyle(color: AppColors.textSecondary, fontSize: 16)),
                              const SizedBox(width: 4),
                              const Icon(CupertinoIcons.chevron_right, color: AppColors.textTertiary, size: 16),
                            ],
                          ),
                          onTap: () => _showActionSheet('Select Unit', ['Kg', 'Lbs'], _unit, (v) => setState(() => _unit = v)),
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: AppSpacing.base),
                  
                  _buildSectionHeader(l10n.settingsAccount),
                  GlassContainer(
                    borderRadius: AppRadius.lg,
                    child: Column(
                      children: [
                        _buildSettingRow(
                          title: l10n.settingsSignOut,
                          icon: CupertinoIcons.arrow_right_square_fill,
                          trailing: const SizedBox.shrink(),
                          onTap: () {
                            HapticFeedback.mediumImpact();
                            // Mock sign out
                          },
                        ),
                        const Divider(color: AppColors.borderSubtle, height: 1, indent: 48),
                        _buildSettingRow(
                          title: l10n.settingsDeleteAccount,
                          icon: CupertinoIcons.trash_fill,
                          trailing: const SizedBox.shrink(),
                          onTap: () {
                            HapticFeedback.heavyImpact();
                            // Mock delete account
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 100), // Bottom padding for shell tab bar
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
