import React from 'react';
import { Modal, TouchableWithoutFeedback, Keyboard, View, Text, TextInput, StyleSheet } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface CreateCustomMGModalProps {
  visible: boolean;
  onRequestClose: () => void;
  newMGNameJa: string;
  setNewMGNameJa: (val: string) => void;
  newMGNameEn: string;
  setNewMGNameEn: (val: string) => void;
  handleCreateCustomMuscleGroup: () => void;
  t: any;
}

export const CreateCustomMGModal = React.memo(({
  visible,
  onRequestClose,
  newMGNameJa,
  setNewMGNameJa,
  newMGNameEn,
  setNewMGNameEn,
  handleCreateCustomMuscleGroup,
  t
}: CreateCustomMGModalProps) => {
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
              {t('session.createCustomMuscle')}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t('session.japaneseName')}
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="例: 上部大胸筋"
                placeholderTextColor={colors.dark.text.tertiary}
                value={newMGNameJa}
                onChangeText={setNewMGNameJa}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t('session.englishName')}
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: Upper Chest"
                placeholderTextColor={colors.dark.text.tertiary}
                value={newMGNameEn}
                onChangeText={setNewMGNameEn}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                label={t('common.cancel')}
                variant="outline"
                style={styles.actionBtn}
                onPress={() => {
                  onRequestClose();
                  setNewMGNameJa('');
                  setNewMGNameEn('');
                }}
              />
              <Button
                label={t('common.save')}
                style={styles.actionBtn}
                onPress={handleCreateCustomMuscleGroup}
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
