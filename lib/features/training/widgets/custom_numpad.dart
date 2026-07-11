import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/design_tokens.dart';
import '../../../core/widgets/glass/glass_container.dart';

enum NumpadMode { weight, reps }

class CustomNumpad extends StatelessWidget {
  final String currentValue;
  final NumpadMode mode;
  final ValueChanged<String> onChanged;
  final VoidCallback onDone;

  const CustomNumpad({
    super.key,
    required this.currentValue,
    required this.mode,
    required this.onChanged,
    required this.onDone,
  });

  void _handleNumberPress(String number) {
    HapticFeedback.lightImpact();
    if (number == '.' && currentValue.contains('.')) return;
    
    // If current is '0' and we type a number, replace the 0 (unless we type '.')
    if (currentValue == '0' && number != '.') {
      onChanged(number);
    } else {
      onChanged(currentValue + number);
    }
  }

  void _handleDelete() {
    HapticFeedback.lightImpact();
    if (currentValue.isNotEmpty) {
      onChanged(currentValue.substring(0, currentValue.length - 1));
    }
  }

  void _handleQuickAdd(double amount) {
    HapticFeedback.mediumImpact();
    double current = double.tryParse(currentValue) ?? 0.0;
    double newValue = current + amount;
    
    // Format to remove trailing .0
    String formatted = newValue.toStringAsFixed(2).replaceAll(RegExp(r'([.]*0+)(?!.*\d)'), '');
    if (formatted.endsWith('.')) {
      formatted = formatted.substring(0, formatted.length - 1);
    }
    onChanged(formatted);
  }

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      borderRadius: AppRadius.xl,
      border: const Border(top: BorderSide(color: AppColors.borderSubtle)),
      padding: const EdgeInsets.fromLTRB(AppSpacing.base, AppSpacing.sm, AppSpacing.base, 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Quick Add Row for Weight
          if (mode == NumpadMode.weight)
            Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildQuickAddBtn('+1.25', 1.25),
                  _buildQuickAddBtn('+2.5', 2.5),
                  _buildQuickAddBtn('+5.0', 5.0),
                  _buildQuickAddBtn('+10', 10.0),
                ],
              ),
            ),
          
          // Numpad Grid
          Row(
            children: [
              Expanded(
                flex: 3,
                child: Column(
                  children: [
                    Row(children: [_buildNumBtn('1'), _buildNumBtn('2'), _buildNumBtn('3')]),
                    Row(children: [_buildNumBtn('4'), _buildNumBtn('5'), _buildNumBtn('6')]),
                    Row(children: [_buildNumBtn('7'), _buildNumBtn('8'), _buildNumBtn('9')]),
                    Row(
                      children: [
                        mode == NumpadMode.weight ? _buildNumBtn('.') : _buildEmptyBtn(),
                        _buildNumBtn('0'),
                        _buildActionBtn(CupertinoIcons.delete_left, _handleDelete),
                      ],
                    ),
                  ],
                ),
              ),
              // Done Button (Vertical)
              Expanded(
                flex: 1,
                child: Padding(
                  padding: const EdgeInsets.all(4.0),
                  child: SizedBox(
                    height: 220, // Approx height of 4 rows
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.accentPrimary.withValues(alpha: 0.9),
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
                      ),
                      onPressed: () {
                        HapticFeedback.heavyImpact();
                        onDone();
                      },
                      child: const Icon(CupertinoIcons.checkmark, color: AppColors.textInverse, size: 32),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickAddBtn(String label, double amount) {
    return GlassContainer(
      borderRadius: AppRadius.full,
      child: InkWell(
        onTap: () => _handleQuickAdd(amount),
        borderRadius: BorderRadius.circular(AppRadius.full),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text(
            label,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
              fontSize: 13,
              fontFamily: AppTypography.fontMono,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNumBtn(String value) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.all(4.0),
        child: GlassContainer(
          borderRadius: AppRadius.md,
          child: InkWell(
            onTap: () => _handleNumberPress(value),
            borderRadius: BorderRadius.circular(AppRadius.md),
            child: Container(
              height: 40,
              alignment: Alignment.center,
              child: Text(
                value,
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 20,
                  fontWeight: FontWeight.w500,
                  fontFamily: AppTypography.fontEn,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildActionBtn(IconData icon, VoidCallback onTap) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.all(4.0),
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.bgTertiary.withValues(alpha: 0.3),
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(AppRadius.md),
            child: Container(
              height: 40,
              alignment: Alignment.center,
              child: Icon(icon, color: AppColors.textPrimary, size: 20),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyBtn() {
    return const Expanded(child: SizedBox(height: 58));
  }
}
