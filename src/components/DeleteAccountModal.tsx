import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, Pressable, 
  Modal, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon } from './Icon';
import { useTranslation } from 'react-i18next';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const CONFIRMATION_TEXT = 'DELETE';

export function DeleteAccountModal({ visible, onClose, onConfirm }: DeleteAccountModalProps) {
  const { t } = useTranslation();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const isConfirmed = confirmText.toUpperCase() === CONFIRMATION_TEXT;

  const handleDelete = async () => {
    if (!isConfirmed || isDeleting) return;
    
    setIsDeleting(true);
    setError('');
    
    try {
      await onConfirm();
    } catch (e) {
      setError(t('deleteAccount.error'));
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return; // Prevent closing during deletion
    setConfirmText('');
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View 
          entering={FadeIn.duration(200)} 
          exiting={FadeOut.duration(200)}
          style={styles.overlay}
        >
          <Pressable style={styles.overlayClose} onPress={handleClose} />
        </Animated.View>

        <Animated.View 
          entering={SlideInDown.springify().damping(18)} 
          exiting={SlideOutDown.duration(200)} 
          style={styles.modal}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIndicator} />
          </View>

          {/* Warning Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Icon name="warning" size={32} color={colors.dark.accent.primary} />
            </View>
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>{t('deleteAccount.title')}</Text>
          <Text style={styles.description}>{t('deleteAccount.description')}</Text>

          {/* What will be deleted */}
          <View style={styles.deletionList}>
            <Text style={styles.deletionListTitle}>{t('deleteAccount.willDelete')}</Text>
            {[
              t('deleteAccount.item1'),
              t('deleteAccount.item2'),
              t('deleteAccount.item3'),
              t('deleteAccount.item4'),
            ].map((item, i) => (
              <View key={i} style={styles.deletionItem}>
                <Icon name="close-circle" size={16} color={colors.dark.accent.primary} />
                <Text style={styles.deletionItemText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Confirmation Input */}
          <View style={styles.confirmSection}>
            <Text style={styles.confirmLabel}>
              {t('deleteAccount.confirmLabel', { text: CONFIRMATION_TEXT })}
            </Text>
            <TextInput
              style={[
                styles.confirmInput,
                isConfirmed && styles.confirmInputValid,
              ]}
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder={CONFIRMATION_TEXT}
              placeholderTextColor={colors.dark.text.tertiary}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isDeleting}
            />
          </View>

          {/* Error */}
          {error ? (
            <Animated.View entering={FadeIn} style={styles.errorContainer}>
              <Icon name="alert-circle" size={14} color={colors.dark.accent.primary} />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          {/* Buttons */}
          <View style={styles.buttons}>
            <Pressable
              onPress={handleClose}
              disabled={isDeleting}
              style={({ pressed }) => [
                styles.cancelButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </Pressable>

            <Pressable
              onPress={handleDelete}
              disabled={!isConfirmed || isDeleting}
              style={({ pressed }) => [
                styles.deleteButton,
                !isConfirmed && styles.deleteButtonDisabled,
                { opacity: pressed && isConfirmed ? 0.8 : 1 },
              ]}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Icon name="trash" size={16} color={colors.white} />
                  <Text style={styles.deleteText}>{t('deleteAccount.confirm')}</Text>
                </>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  overlayClose: {
    flex: 1,
  },
  modal: {
    backgroundColor: colors.dark.bg.secondary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  headerIndicator: {
    width: 40,
    height: 4,
    backgroundColor: colors.dark.border.default,
    borderRadius: 2,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 69, 58, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.2)',
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  deletionList: {
    backgroundColor: 'rgba(255, 69, 58, 0.06)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.12)',
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  deletionListTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: colors.dark.accent.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  deletionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deletionItemText: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.text.secondary,
    flex: 1,
  },
  confirmSection: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  confirmLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.text.secondary,
    textAlign: 'center',
  },
  confirmInput: {
    backgroundColor: colors.dark.bg.tertiary,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 4,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
  },
  confirmInputValid: {
    borderColor: colors.dark.accent.primary,
    backgroundColor: 'rgba(255, 69, 58, 0.06)',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.accent.primary,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.dark.bg.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.dark.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  deleteButtonDisabled: {
    opacity: 0.4,
  },
  deleteText: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.white,
  },
});
