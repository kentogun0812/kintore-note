import React from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon, IconName } from '@/components/Icon';
import { Button } from '@/components/Button';
import { ExerciseDetailInfo } from '@/constants/exerciseDetails';
import { EXERCISE_MEDIA } from '@/constants/exerciseMedia';

export interface ExerciseDetailItem {
  id: string;
  name_ja: string;
  name_en: string;
  muscle_group_ja?: string;
  muscle_group_en?: string;
  muscleGroup: string;
  iconName?: IconName;
  details?: ExerciseDetailInfo;
  thumbnailUrl?: any;
  instructions?: string[];
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

  const media = EXERCISE_MEDIA[exercise.id];
  const videoSource = media?.video;
  const imageSource = media?.image || (details?.imageUrl ? { uri: details.imageUrl } : null);

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
          <View style={styles.header}>
            <View style={styles.dragHandle} />
            <View style={styles.headerActions}>
              <Pressable onPress={onClose} hitSlop={12} style={styles.closeButton}>
                <Icon name="close" size={20} color={colors.dark.text.secondary} />
              </Pressable>
            </View>
          </View>
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                {exerciseName}
              </Text>
            </View>

            {videoSource || imageSource ? (
              <View style={styles.mediaContainer}>
                <Image
                  source={videoSource || imageSource}
                  style={styles.mediaImage}
                  contentFit="scale-down"
                />
              </View>
            ) : (
              <View style={styles.mediaPlaceholder}>
                <Icon name="body" size={48} color={colors.dark.text.tertiary} />
              </View>
            )}

            {description ? (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>{t('exerciseDetail.description')}</Text>
                <Text style={styles.descriptionText}>{description}</Text>
              </View>
            ) : null}

            {exercise.instructions && exercise.instructions.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>{t('exerciseDetail.instructions')}</Text>
                <View style={styles.instructionsList}>
                  {exercise.instructions.map((step, index) => (
                    <View key={index} style={styles.instructionStep}>
                      <Text style={styles.stepNumber}>{index + 1}.</Text>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
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
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: colors.dark.bg.primary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    minHeight: '70%',
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
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    backgroundColor: colors.dark.bg.secondary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
  },
  titleContainer: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
    lineHeight: 28,
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
    paddingBottom: 110,
    gap: spacing.md,
  },
  mediaContainer: {
    width: '100%',
    height: 220,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
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
  instructionsList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  stepNumber: {
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    color: colors.dark.accent.primary,
    width: 20,
  },
  stepText: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.text.secondary,
    flex: 1,
    lineHeight: 20,
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
    paddingBottom: 100,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border.subtle,
    backgroundColor: colors.dark.bg.primary,
  },
});
