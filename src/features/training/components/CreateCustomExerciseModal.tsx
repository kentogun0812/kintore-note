import React from 'react';
import { Modal, TouchableWithoutFeedback, Keyboard, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface CreateCustomExerciseModalProps {
  visible: boolean;
  onRequestClose: () => void;
  newExNameJa: string;
  setNewExNameJa: (val: string) => void;
  newExNameEn: string;
  setNewExNameEn: (val: string) => void;
  newExMGId: string;
  setNewExMGId: (val: string) => void;
  allMuscleGroups: any[];
  selectedMuscleGroupId: string | null;
  handleCreateCustomExercise: () => void;
  t: any;
  i18n: any;
}

export const CreateCustomExerciseModal = React.memo(({
  visible,
  onRequestClose,
  newExNameJa,
  setNewExNameJa,
  newExNameEn,
  setNewExNameEn,
  newExMGId,
  setNewExMGId,
  allMuscleGroups,
  selectedMuscleGroupId,
  handleCreateCustomExercise,
  t,
  i18n
}: CreateCustomExerciseModalProps) => {
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
              {t('session.createCustomExercise')}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t('session.japaneseName')}
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="例: インкラインダンベルフライ"
                placeholderTextColor={colors.dark.text.tertiary}
                value={newExNameJa}
                onChangeText={setNewExNameJa}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t('session.englishName')}
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: Incline Dumbbell Fly"
                placeholderTextColor={colors.dark.text.tertiary}
                value={newExNameEn}
                onChangeText={setNewExNameEn}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t('session.targetMuscle')}
              </Text>
              <View style={styles.modalPickerGrid}>
                {allMuscleGroups.filter(g => g.id !== 'mg-other').map(g => {
                  const isSelected = newExMGId === g.id || (!newExMGId && selectedMuscleGroupId === g.id);
                  return (
                    <Pressable
                      key={g.id}
                      style={[
                        styles.modalPickerItem,
                        isSelected && styles.modalPickerItemSec
                      ]}
                      onPress={() => setNewExMGId(g.id)}
                    >
                      <Text style={[styles.modalPickerText, isSelected && { color: colors.white }]}>
                        {i18n.language === 'ja' ? g.name_ja : g.name_en}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                label={t('common.cancel')}
                variant="outline"
                style={styles.actionBtn}
                onPress={() => {
                  onRequestClose();
                  setNewExNameJa('');
                  setNewExNameEn('');
                  setNewExMGId('');
                }}
              />
              <Button
                label={t('common.save')}
                style={styles.actionBtn}
                onPress={handleCreateCustomExercise}
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
  modalPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  modalPickerItem: {
    paddingVertical: spacing.xs - 2,
    paddingHorizontal: spacing.xs + 2,
    borderRadius: radius.sm,
    backgroundColor: colors.dark.bg.tertiary,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
  },
  modalPickerItemSec: {
    backgroundColor: colors.dark.accent.primary,
    borderColor: colors.dark.accent.primary,
  },
  modalPickerText: {
    fontSize: typography.fontSize.xs - 1,
    color: colors.dark.text.secondary,
    fontWeight: '600',
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
