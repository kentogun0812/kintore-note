import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/design_tokens.dart';

class RoutineTemplate {
  final String id;
  final String name;
  final List<Map<String, String>> exercises;

  const RoutineTemplate({required this.id, required this.name, required this.exercises});
}

const List<RoutineTemplate> _mockTemplates = [
  RoutineTemplate(
    id: 't1', 
    name: 'Push Day (Chest, Shoulders, Triceps)', 
    exercises: [
      {'id': 'ex4', 'name': 'Bench Press'},
      {'id': 'ex5', 'name': 'Incline Dumbbell Press'},
      {'id': 'ex10', 'name': 'Overhead Press'},
      {'id': 'ex13', 'name': 'Tricep Extension'},
    ]
  ),
  RoutineTemplate(
    id: 't2', 
    name: 'Pull Day (Back, Biceps)', 
    exercises: [
      {'id': 'ex7', 'name': 'Pull-up'},
      {'id': 'ex9', 'name': 'Barbell Row'},
      {'id': 'ex8', 'name': 'Lat Pulldown'},
      {'id': 'ex12', 'name': 'Bicep Curl'},
    ]
  ),
  RoutineTemplate(
    id: 't3', 
    name: 'Leg Day', 
    exercises: [
      {'id': 'ex1', 'name': 'Barbell Squat'},
      {'id': 'ex2', 'name': 'Leg Press'},
      {'id': 'ex3', 'name': 'Bulgarian Split Squat'},
    ]
  ),
];

class TemplatePickerSheet extends StatelessWidget {
  const TemplatePickerSheet({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: const BoxDecoration(
        color: AppColors.bgPrimary,
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.base, AppSpacing.md, AppSpacing.base, AppSpacing.sm),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Saved Templates',
                  style: TextStyle(color: AppColors.textPrimary, fontSize: AppTypography.fontSizeXl, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(CupertinoIcons.xmark_circle_fill, color: AppColors.textTertiary),
                  onPressed: () => Navigator.pop(context),
                )
              ],
            ),
          ),
          const Divider(color: AppColors.borderSubtle),
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.only(bottom: MediaQuery.of(context).padding.bottom + AppSpacing.base),
              itemCount: _mockTemplates.length,
              itemBuilder: (context, index) {
                final template = _mockTemplates[index];
                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.base, vertical: 8),
                  title: Text(template.name, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 4.0),
                    child: Text(
                      template.exercises.map((e) => e['name']).join(', '),
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  trailing: Container(
                    decoration: BoxDecoration(
                      color: AppColors.accentPrimary.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: const Text('Load', style: TextStyle(color: AppColors.accentPrimary, fontWeight: FontWeight.bold)),
                  ),
                  onTap: () {
                    HapticFeedback.mediumImpact();
                    Navigator.pop(context, template.exercises);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
