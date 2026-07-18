import React from 'react';
import { Modal, TouchableWithoutFeedback, Keyboard, View, Text, TextInput, StyleSheet } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface SaveWorkoutTemplateModalProps {
  visible: boolean;
  onRequestClose: () => void;
  templateName: string;
  setTemplateName: (val: string) => void;
  onSave: () => void;
  t: any;
}

export const SaveWorkoutTemplateModal = React.memo(({
  visible,
  onRequestClose,
  templateName,
  setTemplateName,
  onSave,
  t
}: SaveWorkoutTemplateModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {t('session.saveAsTemplateTitle', 'Save as Template')}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t('todayWorkout.workoutName', 'Workout Name')}
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder={t('todayWorkout.placeholder', 'e.g. Chest & Shoulders')}
                placeholderTextColor={colors.dark.text.tertiary}
                value={templateName}
                onChangeText={setTemplateName}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                label={t('common.cancel')}
                variant="outline"
                style={styles.actionBtn}
                onPress={onRequestClose}
              />
              <Button
                label={t('common.save')}
                style={styles.actionBtn}
                onPress={onSave}
              />
            </View>
          </Card>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  modalCard: {
    width: '100%',
    maxWidth: 345,
    padding: spacing.lg,
    backgroundColor: colors.dark.bg.elevated,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.dark.text.secondary,
  },
  modalInput: {
    height: 40,
    backgroundColor: colors.dark.bg.tertiary,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    color: colors.white,
    fontSize: typography.fontSize.base,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1
  }
});
