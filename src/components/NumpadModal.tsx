import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit {type === 'weight' ? 'Weight' : 'Reps'}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Icon name="close-circle" size={32} color={colors.dark.text.tertiary} />
            </Pressable>
          </View>

          <View style={styles.inputRow}>
            <Pressable style={styles.adjustButton} onPress={() => handleIncrement(-1)}>
              <Icon name="remove" size={28} color={colors.dark.text.primary} />
            </Pressable>
            
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={value}
                onChangeText={setValue}
                keyboardType={type === 'weight' ? 'decimal-pad' : 'number-pad'}
                autoFocus
                selectTextOnFocus
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              <Text style={styles.unitText}>{type === 'weight' ? 'kg' : 'reps'}</Text>
            </View>

            <Pressable style={styles.adjustButton} onPress={() => handleIncrement(1)}>
              <Icon name="add" size={28} color={colors.dark.text.primary} />
            </Pressable>
          </View>

          <Button label="Save" iconName="checkmark" fullWidth onPress={handleSave} style={styles.saveButton} />
        </Pressable>
      </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.dark.bg.elevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
    borderTopWidth: 1,
    borderTopColor: colors.dark.border.subtle,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  adjustButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.dark.bg.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.dark.border.focus,
  },
  textInput: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize['4xl'],
    fontWeight: 'heavy',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    minWidth: 80,
    padding: 0,
  },
  unitText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: 6,
    marginLeft: spacing.xs,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
});
