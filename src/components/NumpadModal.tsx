import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/Button';
import * as Haptics from 'expo-haptics';

interface NumpadModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'weight' | 'reps';
  initialValue: string;
  onSave: (val: string) => void;
}

export function NumpadModal({ visible, onClose, type, initialValue, onSave }: NumpadModalProps) {
  const [value, setValue] = useState(initialValue || '0');

  const handleIncrement = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let current = parseFloat(value) || 0;
    current += amount;
    // ensure no crazy decimals
    current = Math.round(current * 100) / 100;
    if (current < 0) current = 0;
    setValue(current.toString());
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave(value);
    onClose();
  };

  const increments = type === 'weight' ? [-5, -2.5, -1.25, 1.25, 2.5, 5] : [-5, -1, 1, 5];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit {type === 'weight' ? 'Weight' : 'Reps'}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Icon name="close-circle" size={24} color={colors.dark.text.tertiary} />
            </Pressable>
          </View>

          <View style={styles.displayContainer}>
            <Text style={styles.displayValue}>
              {value} {type === 'weight' ? 'kg' : ''}
            </Text>
          </View>

          <View style={styles.buttonsContainer}>
            <View style={styles.buttonRow}>
              {increments.filter(i => i < 0).map(inc => (
                <Pressable key={inc} style={styles.incButton} onPress={() => handleIncrement(inc)}>
                  <Text style={styles.incText}>{inc}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.buttonRow}>
              {increments.filter(i => i > 0).map(inc => (
                <Pressable key={inc} style={styles.incButton} onPress={() => handleIncrement(inc)}>
                  <Text style={styles.incText}>+{inc}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Button label="Save" iconName="checkmark" fullWidth onPress={handleSave} style={styles.saveButton} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.dark.alpha.black60,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.dark.bg.elevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
  displayContainer: {
    backgroundColor: colors.dark.bg.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  displayValue: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize['3xl'],
    fontWeight: 'heavy',
    fontVariant: ['tabular-nums'],
  },
  buttonsContainer: {
    gap: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  incButton: {
    flex: 1,
    backgroundColor: colors.dark.bg.secondary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  incText: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
  saveButton: {
    marginTop: spacing.xl,
  },
});
