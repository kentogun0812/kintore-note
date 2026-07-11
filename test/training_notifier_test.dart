import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:kintore_note_flutter/features/training/training_notifier.dart';

void main() {
  test('TrainingNotifier state management flow', () {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    // 1. Initial State should be inactive
    var state = container.read(trainingNotifierProvider);
    expect(state.isActive, false);
    expect(state.exercises.isEmpty, true);

    // 2. Start session with an initial exercise
    container.read(trainingNotifierProvider.notifier).startSession([
      {'id': 'ex_1', 'name': 'Bench Press'}
    ]);

    state = container.read(trainingNotifierProvider);
    expect(state.isActive, true);
    expect(state.exercises.length, 1);
    expect(state.exercises.first.name, 'Bench Press');
    expect(state.exercises.first.sets.length, 1);

    final exerciseId = state.exercises.first.id;
    final setId = state.exercises.first.sets.first.id;

    // 3. Add a set
    container.read(trainingNotifierProvider.notifier).addSet(exerciseId);
    state = container.read(trainingNotifierProvider);
    expect(state.exercises.first.sets.length, 2);

    // 4. Update set data and toggle completion
    container.read(trainingNotifierProvider.notifier).updateSet(
      exerciseId,
      setId,
      weight: '100',
      reps: '5',
    );
    container.read(trainingNotifierProvider.notifier).toggleSetComplete(exerciseId, setId);

    state = container.read(trainingNotifierProvider);
    final targetSet = state.exercises.first.sets.firstWhere((s) => s.id == setId);
    expect(targetSet.weight, '100');
    expect(targetSet.reps, '5');
    expect(targetSet.completed, true);

    // 5. End session
    container.read(trainingNotifierProvider.notifier).endSession();
    state = container.read(trainingNotifierProvider);
    expect(state.isActive, false);
    expect(state.exercises.isEmpty, true);
  });
}
