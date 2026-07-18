import React, { useCallback } from 'react';
import { View, Text, Pressable, TextInput, Animated } from 'react-native';
import { colors } from '@/constants/colors';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SCREEN_CONSTANTS } from '@/constants/screens';
import { styles } from '../session.styles';

// Memoized exercise section component to prevent unnecessary re-renders of other cards
export const ExerciseSection = React.memo(({
  ex,
  drag,
  isActive,
  focusedInput,
  setFocusedInput,
  updateSet,
  addSet,
  removeSet,
  handleToggleExercise,
  removeExercise,
  t
}: {
  ex: any;
  drag: () => void;
  isActive: boolean;
  focusedInput: string | null;
  setFocusedInput: (id: string | null) => void;
  updateSet: (exId: string, setId: string, updates: any) => void;
  addSet: (exId: string) => void;
  removeSet: (exId: string, setId: string) => void;
  handleToggleExercise: (ex: any) => void;
  removeExercise: (exId: string) => void;
  t: any;
}) => {
  const unitLabel = ex.unit === SCREEN_CONSTANTS.SESSION.UNITS.KM
    ? SCREEN_CONSTANTS.SESSION.UNITS.KM
    : (ex.unit === SCREEN_CONSTANTS.SESSION.UNITS.MIN ? SCREEN_CONSTANTS.SESSION.UNITS.MIN : t(SCREEN_CONSTANTS.SESSION.I18N_KEYS.WEIGHT_UNIT));

  return (
    <View style={[styles.exerciseSection, isActive && styles.activeItem]}>
      <View style={styles.exerciseSectionHeader}>
        <View style={styles.exerciseSectionHeaderLeft}>
          <View style={styles.exerciseIconWrapper}>
            <Icon name="barbell" size={16} color={colors.white} />
          </View>
          <Text style={styles.exerciseName}>{ex.name}</Text>
        </View>
      </View>

      <Card style={styles.exerciseCard}>
        <Swipeable
          renderRightActions={useCallback((progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
            const scale = dragX.interpolate({
              inputRange: [-70, 0],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            });
            return (
              <Pressable
                onPress={() => removeExercise(ex.id)}
                style={styles.deleteSwipeButton}
              >
                <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
                  <Icon name="trash-outline" size={24} color={colors.white} />
                  <Text style={styles.deleteSwipeText}>{t('common.delete')}</Text>
                </Animated.View>
              </Pressable>
            );
          }, [ex.id, removeExercise, t])}
          rightThreshold={40}
          containerStyle={styles.swipeableContainer}
        >
          <View style={{ backgroundColor: colors.dark.bg.secondary }}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderSet}>{t('session.sets')}</Text>
              <Text style={styles.tableHeaderMain}>{unitLabel}</Text>
              <Text style={styles.tableHeaderMain}>{t('session.reps')}</Text>
              <View style={styles.tableHeaderCheck}>
                <Pressable
                  hitSlop={12}
                  onPress={() => handleToggleExercise(ex)}
                  style={[
                    styles.headerCheckCircle,
                    { backgroundColor: ex.sets.length > 0 && ex.sets.every((s: any) => s.completed) ? colors.dark.accent.success : colors.dark.bg.tertiary }
                  ]}
                >
                  <Icon
                    name="checkmark"
                    size={16}
                    color={ex.sets.length > 0 && ex.sets.every((s: any) => s.completed) ? colors.dark.bg.primary : colors.dark.text.secondary}
                  />
                </Pressable>
              </View>
            </View>

            {ex.sets.map((set: any, index: number) => (
              <View key={set.id} style={[
                styles.setRow,
                { backgroundColor: set.completed ? colors.dark.bg.elevated : colors.transparent }
              ]}>
                <Text style={styles.setNumber}>{index + 1}</Text>
                <View style={styles.setInputContainer}>
                  <View style={[
                    styles.inlineInputWrapper,
                    focusedInput === `${set.id}-weight` && styles.inlineInputWrapperFocused,
                    set.completed && styles.inlineInputWrapperCompleted
                  ]}>
                    <TextInput
                      style={[styles.textInput, set.completed && { color: colors.dark.text.secondary }]}
                      value={set.weight}
                      onChangeText={(val) => updateSet(ex.id, set.id, { weight: val })}
                      onFocus={() => setFocusedInput(`${set.id}-weight`)}
                      onBlur={() => setFocusedInput(null)}
                      keyboardType="decimal-pad"
                      placeholder="--"
                      placeholderTextColor={colors.dark.text.tertiary}
                      editable={!set.completed}
                      selectTextOnFocus
                    />
                  </View>
                </View>
                <View style={styles.setInputContainer}>
                  <View style={[
                    styles.inlineInputWrapper,
                    focusedInput === `${set.id}-reps` && styles.inlineInputWrapperFocused,
                    set.completed && styles.inlineInputWrapperCompleted
                  ]}>
                    <TextInput
                      style={[styles.textInput, set.completed && { color: colors.dark.text.secondary }]}
                      value={set.reps}
                      onChangeText={(val) => updateSet(ex.id, set.id, { reps: val })}
                      onFocus={() => setFocusedInput(`${set.id}-reps`)}
                      onBlur={() => setFocusedInput(null)}
                      keyboardType="number-pad"
                      placeholder="--"
                      placeholderTextColor={colors.dark.text.tertiary}
                      editable={!set.completed}
                      selectTextOnFocus
                    />
                  </View>
                </View>
                <View style={styles.setCheckContainer}>
                  <Pressable
                    onPress={() => removeSet(ex.id, set.id)}
                    hitSlop={8}
                  >
                    <Icon name="trash-outline" size={20} color={colors.dark.text.tertiary} />
                  </Pressable>
                </View>
              </View>
            ))}

            <Pressable onPress={() => addSet(ex.id)} style={styles.addSetButton}>
              <View style={styles.addSetContent}>
                <Icon name="add-circle" size={20} color={colors.dark.accent.primary} />
                <Text style={styles.addSetText}>{t('session.addSet')}</Text>
              </View>
            </Pressable>
          </View>
        </Swipeable>
      </Card>
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.ex === nextProps.ex &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.focusedInput === nextProps.focusedInput;
});


