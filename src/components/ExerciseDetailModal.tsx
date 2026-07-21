import React from 'react';
import { View, Text, Modal, StyleSheet, Image, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon, IconName } from '@/components/Icon';
import { Button } from '@/components/Button';
import { ExerciseDetailInfo } from '@/constants/exerciseDetails';

export interface ExerciseDetailItem {
  id: string;
  name_ja: string;
  name_en: string;
  muscle_group_ja?: string;
  muscle_group_en?: string;
  muscleGroup: string;
  iconName?: IconName;
  details?: ExerciseDetailInfo;
}

interface ExerciseDetailModalProps {
  visible: boolean;
  exercise: ExerciseDetailItem | null;
  onClose: () => void;
  onSelect?: (exercise: ExerciseDetailItem) => void;
  isSelectionMode?: boolean;
}

export function ExerciseDetailModal({
  visible,
  exercise,
  onClose,
  onSelect,
  isSelectionMode = false,
}: ExerciseDetailModalProps) {
  const { t, i18n } = useTranslation();

  if (!exercise) return null;

  const currentLang = i18n.language;
  const isJa = currentLang === 'ja';
  const exerciseName = isJa ? exercise.name_ja : exercise.name_en;
  const muscleGroupText = isJa 
    ? (exercise.muscle_group_ja || exercise.muscleGroup)
    : (exercise.muscle_group_en || exercise.muscleGroup);
  
  const details = exercise.details;
  const description = isJa ? details?.descriptionJa : details?.descriptionEn;
  const benefits = isJa ? details?.benefitsJa : details?.benefitsEn;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {exerciseName}
              </Text>
              <View style={styles.badge}>
                <Icon name={exercise.iconName || "barbell"} size={14} color={colors.dark.accent.primary} />
                <Text style={styles.badgeText}>{muscleGroupText}</Text>
              </View>
            </View>

            <Pressable onPress={onClose} hitSlop={12} style={styles.closeButton}>
              <Icon name="close" size={20} color={colors.dark.text.secondary} />
            </Pressable>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
          >
            {details?.imageUrl ? (
              <View style={styles.mediaContainer}>
                <Image
                  source={{ uri: details.imageUrl }}
                  style={styles.mediaImage}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View style={styles.mediaPlaceholder}>
                <Icon name="barbell-outline" size={48} color={colors.dark.text.tertiary} />
              </View>
            )}

            {description ? (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>{t('exerciseDetail.description')}</Text>
                <Text style={styles.descriptionText}>{description}</Text>
              </View>
            ) : null}

            {benefits && benefits.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>{t('exerciseDetail.benefits')}</Text>
                <View style={styles.benefitsList}>
                  {benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Icon name="checkmark-circle" size={16} color={colors.dark.accent.primary} />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </ScrollView>

          {isSelectionMode && onSelect && (
            <View style={styles.footer}>
              <Button
                label={t('exerciseDetail.selectExercise')}
                fullWidth
                onPress={() => onSelect(exercise)}
              />
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: colors.dark.bg.primary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dark.border.default,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.subtle,
  },
  titleContainer: {
    flex: 1,
    gap: spacing.xs,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.dark.bg.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.dark.accent.primary,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.dark.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.md,
  },
  mediaContainer: {
    width: '100%',
    height: 180,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.dark.bg.secondary,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  mediaPlaceholder: {
    width: '100%',
    height: 140,
    borderRadius: radius.lg,
    backgroundColor: colors.dark.bg.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    gap: spacing.xs,
  },
  sectionHeader: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  descriptionText: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.text.secondary,
    lineHeight: 22,
  },
  benefitsList: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  benefitText: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border.subtle,
    backgroundColor: colors.dark.bg.primary,
  },
});
