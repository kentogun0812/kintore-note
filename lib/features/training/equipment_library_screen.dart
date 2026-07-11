import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/design_tokens.dart';

class ExerciseItem {
  final String id;
  final String name;
  final String category;
  final String equipment;

  const ExerciseItem({required this.id, required this.name, required this.category, required this.equipment});
}

const List<ExerciseItem> _mockLibrary = [
  ExerciseItem(id: 'ex1', name: 'Barbell Squat', category: 'Legs', equipment: 'Barbell'),
  ExerciseItem(id: 'ex2', name: 'Leg Press', category: 'Legs', equipment: 'Machine'),
  ExerciseItem(id: 'ex3', name: 'Bulgarian Split Squat', category: 'Legs', equipment: 'Dumbbell'),
  ExerciseItem(id: 'ex4', name: 'Bench Press', category: 'Chest', equipment: 'Barbell'),
  ExerciseItem(id: 'ex5', name: 'Incline Dumbbell Press', category: 'Chest', equipment: 'Dumbbell'),
  ExerciseItem(id: 'ex6', name: 'Cable Crossover', category: 'Chest', equipment: 'Cable'),
  ExerciseItem(id: 'ex7', name: 'Pull-up', category: 'Back', equipment: 'Bodyweight'),
  ExerciseItem(id: 'ex8', name: 'Lat Pulldown', category: 'Back', equipment: 'Cable'),
  ExerciseItem(id: 'ex9', name: 'Barbell Row', category: 'Back', equipment: 'Barbell'),
  ExerciseItem(id: 'ex10', name: 'Overhead Press', category: 'Shoulders', equipment: 'Barbell'),
  ExerciseItem(id: 'ex11', name: 'Lateral Raise', category: 'Shoulders', equipment: 'Dumbbell'),
  ExerciseItem(id: 'ex12', name: 'Bicep Curl', category: 'Arms', equipment: 'Dumbbell'),
  ExerciseItem(id: 'ex13', name: 'Tricep Extension', category: 'Arms', equipment: 'Cable'),
  ExerciseItem(id: 'ex14', name: 'Crunches', category: 'Core', equipment: 'Bodyweight'),
  ExerciseItem(id: 'ex15', name: 'Plank', category: 'Core', equipment: 'Bodyweight'),
];

class EquipmentLibraryScreen extends StatefulWidget {
  const EquipmentLibraryScreen({super.key});

  @override
  State<EquipmentLibraryScreen> createState() => _EquipmentLibraryScreenState();
}

class _EquipmentLibraryScreenState extends State<EquipmentLibraryScreen> {
  String _searchQuery = '';
  String _selectedCategory = 'All';

  final List<String> _categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

  @override
  Widget build(BuildContext context) {
    final filteredList = _mockLibrary.where((ex) {
      final matchesCategory = _selectedCategory == 'All' || ex.category == _selectedCategory;
      final matchesSearch = ex.name.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();

    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: const BoxDecoration(
        color: AppColors.bgPrimary,
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.base, AppSpacing.md, AppSpacing.base, AppSpacing.sm),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Exercise Library',
                  style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: AppTypography.fontSizeXl,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(CupertinoIcons.xmark_circle_fill, color: AppColors.textTertiary),
                  onPressed: () => Navigator.pop(context),
                )
              ],
            ),
          ),
          
          // Search Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.base),
            child: CupertinoSearchTextField(
              backgroundColor: AppColors.bgSecondary,
              itemColor: AppColors.textSecondary,
              style: const TextStyle(color: AppColors.textPrimary),
              placeholder: 'Search exercises...',
              onChanged: (val) => setState(() => _searchQuery = val),
            ),
          ),
          
          const SizedBox(height: AppSpacing.md),
          
          // Category Filters
          SizedBox(
            height: 36,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.base),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final category = _categories[index];
                final isSelected = _selectedCategory == category;
                return Padding(
                  padding: const EdgeInsets.only(right: AppSpacing.sm),
                  child: ChoiceChip(
                    label: Text(category),
                    selected: isSelected,
                    onSelected: (val) {
                      HapticFeedback.selectionClick();
                      setState(() => _selectedCategory = category);
                    },
                    backgroundColor: AppColors.bgSecondary,
                    selectedColor: AppColors.accentPrimary.withValues(alpha: 0.15),
                    labelStyle: TextStyle(
                      color: isSelected ? AppColors.accentPrimary : AppColors.textSecondary,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      fontSize: 13,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadius.full),
                      side: BorderSide(
                        color: isSelected ? AppColors.accentPrimary : Colors.transparent,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          
          const SizedBox(height: AppSpacing.sm),
          const Divider(color: AppColors.borderSubtle),
          
          // List
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.only(bottom: MediaQuery.of(context).padding.bottom + AppSpacing.base),
              itemCount: filteredList.length,
              itemBuilder: (context, index) {
                final ex = filteredList[index];
                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.base, vertical: 4),
                  title: Text(
                    ex.name, 
                    style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  subtitle: Text(
                    '${ex.category} • ${ex.equipment}', 
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                  ),
                  trailing: Container(
                    decoration: BoxDecoration(
                      color: AppColors.bgSecondary,
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                    padding: const EdgeInsets.all(8),
                    child: const Icon(CupertinoIcons.add, color: AppColors.accentPrimary, size: 20),
                  ),
                  onTap: () {
                    HapticFeedback.mediumImpact();
                    Navigator.pop(context, {'id': ex.id, 'name': ex.name});
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
