import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/design_tokens.dart';
import 'equipment_library_screen.dart';
import 'training_menu_notifier.dart';

class MenuBuilderScreen extends ConsumerStatefulWidget {
  const MenuBuilderScreen({super.key});

  @override
  ConsumerState<MenuBuilderScreen> createState() => _MenuBuilderScreenState();
}

class _MenuBuilderScreenState extends ConsumerState<MenuBuilderScreen> {
  final TextEditingController _nameController = TextEditingController();
  final List<Map<String, String>> _exercises = [];

  void _addExercise() async {
    HapticFeedback.mediumImpact();
    final selectedExercise = await showModalBottomSheet<Map<String, String>>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const EquipmentLibraryScreen(),
    );

    if (selectedExercise != null) {
      setState(() {
        _exercises.add(selectedExercise);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgPrimary,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(CupertinoIcons.back, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Create Template', style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold)),
        actions: [
          TextButton(
            onPressed: () async {
              if (_nameController.text.trim().isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please enter a template name.')),
                );
                return;
              }
              if (_exercises.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please add at least one exercise.')),
                );
                return;
              }
              
              await ref.read(trainingMenuNotifierProvider.notifier).createMenu(
                _nameController.text.trim(),
                _exercises,
              );
              
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Template saved successfully!')),
                );
                Navigator.pop(context);
              }
            },
            child: const Text('Save', style: TextStyle(color: AppColors.accentPrimary, fontWeight: FontWeight.bold, fontSize: 16)),
          )
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.base),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CupertinoTextField(
              controller: _nameController,
              placeholder: 'Template Name (e.g. Leg Day)',
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.bgSecondary,
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              style: const TextStyle(color: AppColors.textPrimary),
              placeholderStyle: const TextStyle(color: AppColors.textTertiary),
            ),
            const SizedBox(height: AppSpacing.xl),
            const Text(
              'Exercises',
              style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: AppSpacing.sm),
            
            Expanded(
              child: _exercises.isEmpty
                ? const Center(child: Text('No exercises added.', style: TextStyle(color: AppColors.textTertiary)))
                : ReorderableListView.builder(
                    itemCount: _exercises.length,
                    onReorder: (oldIndex, newIndex) {
                      setState(() {
                        if (newIndex > oldIndex) newIndex -= 1;
                        final item = _exercises.removeAt(oldIndex);
                        _exercises.insert(newIndex, item);
                      });
                    },
                    itemBuilder: (context, index) {
                      final ex = _exercises[index];
                      return ListTile(
                        key: ValueKey('${ex['id']}_$index'),
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(CupertinoIcons.bars, color: AppColors.textTertiary),
                        title: Text(ex['name'] ?? '', style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
                        trailing: IconButton(
                          icon: const Icon(CupertinoIcons.minus_circle_fill, color: AppColors.accentWarning),
                          onPressed: () {
                            HapticFeedback.lightImpact();
                            setState(() => _exercises.removeAt(index));
                          },
                        ),
                      );
                    },
                  ),
            ),
            
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(48),
                side: BorderSide(color: AppColors.accentPrimary.withValues(alpha: 0.5)),
                backgroundColor: AppColors.accentPrimary.withValues(alpha: 0.05),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
              ),
              onPressed: _addExercise,
              icon: const Icon(CupertinoIcons.add, color: AppColors.accentPrimary),
              label: const Text('Add Exercise', style: TextStyle(color: AppColors.accentPrimary, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: AppSpacing.lg),
          ],
        ),
      ),
    );
  }
}
