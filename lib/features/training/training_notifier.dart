import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'dart:math';

part 'training_notifier.g.dart';

class SetRecord {
  final String id;
  final String weight;
  final String reps;
  final bool completed;

  SetRecord({
    required this.id,
    this.weight = '',
    this.reps = '',
    this.completed = false,
  });

  SetRecord copyWith({
    String? id,
    String? weight,
    String? reps,
    bool? completed,
  }) {
    return SetRecord(
      id: id ?? this.id,
      weight: weight ?? this.weight,
      reps: reps ?? this.reps,
      completed: completed ?? this.completed,
    );
  }
}

class ExerciseRecord {
  final String id;
  final String exerciseId;
  final String name;
  final String? notes;
  final List<SetRecord> sets;

  ExerciseRecord({
    required this.id,
    required this.exerciseId,
    required this.name,
    this.notes,
    required this.sets,
  });

  ExerciseRecord copyWith({
    String? id,
    String? exerciseId,
    String? name,
    String? notes,
    List<SetRecord>? sets,
  }) {
    return ExerciseRecord(
      id: id ?? this.id,
      exerciseId: exerciseId ?? this.exerciseId,
      name: name ?? this.name,
      notes: notes ?? this.notes,
      sets: sets ?? this.sets,
    );
  }
}

class ActiveSessionState {
  final bool isActive;
  final DateTime? startTime;
  final List<ExerciseRecord> exercises;

  ActiveSessionState({
    this.isActive = false,
    this.startTime,
    this.exercises = const [],
  });

  ActiveSessionState copyWith({
    bool? isActive,
    DateTime? startTime,
    List<ExerciseRecord>? exercises,
  }) {
    return ActiveSessionState(
      isActive: isActive ?? this.isActive,
      startTime: startTime ?? this.startTime,
      exercises: exercises ?? this.exercises,
    );
  }
}

@riverpod
class TrainingNotifier extends _$TrainingNotifier {
  @override
  ActiveSessionState build() {
    return ActiveSessionState();
  }

  String _generateRandomId() {
    return Random().nextDouble().toString();
  }

  void startSession(List<dynamic> initialExercises) {
    state = ActiveSessionState(
      isActive: true,
      startTime: DateTime.now(),
      exercises: initialExercises.map((ex) {
        final exerciseName = ex['name'] as String? ?? 'Exercise';
        final exerciseId = ex['id'] as String? ?? '';
        return ExerciseRecord(
          id: _generateRandomId(),
          exerciseId: exerciseId,
          name: exerciseName,
          sets: [
            SetRecord(id: _generateRandomId()),
          ],
        );
      }).toList(),
    );
  }

  void endSession() {
    state = ActiveSessionState();
  }

  void updateSet(String exerciseRecordId, String setId, {String? weight, String? reps, bool? completed}) {
    state = state.copyWith(
      exercises: state.exercises.map((ex) {
        if (ex.id != exerciseRecordId) return ex;
        return ex.copyWith(
          sets: ex.sets.map((s) {
            if (s.id != setId) return s;
            return s.copyWith(
              weight: weight ?? s.weight,
              reps: reps ?? s.reps,
              completed: completed ?? s.completed,
            );
          }).toList(),
        );
      }).toList(),
    );
  }

  void addSet(String exerciseRecordId) {
    state = state.copyWith(
      exercises: state.exercises.map((ex) {
        if (ex.id != exerciseRecordId) return ex;
        final lastSet = ex.sets.isNotEmpty ? ex.sets.last : null;
        return ex.copyWith(
          sets: [
            ...ex.sets,
            SetRecord(
              id: _generateRandomId(),
              weight: lastSet?.weight ?? '',
              reps: lastSet?.reps ?? '',
            ),
          ],
        );
      }).toList(),
    );
  }

  void toggleSetComplete(String exerciseRecordId, String setId) {
    state = state.copyWith(
      exercises: state.exercises.map((ex) {
        if (ex.id != exerciseRecordId) return ex;
        return ex.copyWith(
          sets: ex.sets.map((s) {
            if (s.id != setId) return s;
            return s.copyWith(completed: !s.completed);
          }).toList(),
        );
      }).toList(),
    );
  }

  void removeSet(String exerciseRecordId, String setId) {
    state = state.copyWith(
      exercises: state.exercises.map((ex) {
        if (ex.id != exerciseRecordId) return ex;
        return ex.copyWith(
          sets: ex.sets.where((s) => s.id != setId).toList(),
        );
      }).toList(),
    );
  }

  void updateExerciseNote(String exerciseRecordId, String note) {
    state = state.copyWith(
      exercises: state.exercises.map((ex) {
        if (ex.id != exerciseRecordId) return ex;
        return ex.copyWith(notes: note);
      }).toList(),
    );
  }

  void removeExercise(String exerciseRecordId) {
    state = state.copyWith(
      exercises: state.exercises.where((ex) => ex.id != exerciseRecordId).toList(),
    );
  }

  void reorderSessionExercises(int fromIndex, int toIndex) {
    final list = List<ExerciseRecord>.from(state.exercises);
    if (fromIndex < toIndex) {
      toIndex -= 1;
    }
    final item = list.removeAt(fromIndex);
    list.insert(toIndex, item);
    state = state.copyWith(exercises: list);
  }
}

@riverpod
class RestTimerState extends _$RestTimerState {
  @override
  int? build() => null;

  void start(int seconds) => state = seconds;
  void dismiss() => state = null;
}
