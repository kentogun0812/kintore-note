import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/Button';
import { useTranslation } from 'react-i18next';

export default function PremiumScreen() {
  const { t } = useTranslation();
  const features = [
    { icon: 'infinite', title: t('premium.features.unlimited.title'), description: t('premium.features.unlimited.desc') },
    { icon: 'stats-chart', title: t('premium.features.stats.title'), description: t('premium.features.stats.desc') },
    { icon: 'cloud-upload', title: t('premium.features.cloud.title'), description: t('premium.features.cloud.desc') },
    { icon: 'star', title: t('premium.features.programs.title'), description: t('premium.features.programs.desc') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Pressable 
          onPress={() => router.back()} 
          hitSlop={12}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={24} color={colors.dark.text.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroContainer}>
          <View style={styles.heroIconContainer}>
            <Icon name="diamond" size={40} color={colors.white} />
          </View>
          <Text style={styles.heroTitle}>
            {t('premium.title')}
          </Text>
          <Text style={styles.heroSubtitle}>
            {t('premium.subtitle')}
          </Text>
        </View>

        <View style={styles.featuresList}>
          {features.map((f) => (
            <View key={f.title} style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Icon name={f.icon as any} size={24} color={colors.dark.accent.primary} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDescription}>{f.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.plansContainer}>
          <Pressable style={styles.planCard}>
            <View>
              <Text style={styles.planTitle}>{t('premium.plans.annual')}</Text>
              <Text style={styles.planSubtitle}>{t('premium.plans.price')}</Text>
            </View>
            <View style={styles.saveBadge}>
               <Text style={styles.saveBadgeText}>{t('premium.plans.save')}</Text>
            </View>
          </Pressable>

          <Button label={t('premium.startTrial')} fullWidth variant="primary" />
          <Text style={styles.footerText}>
            {t('premium.terms')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.xxl,
  },
  heroContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.dark.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.dark.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  heroTitle: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize['3xl'],
    fontWeight: 'heavy',
    textAlign: 'center',
  },
  heroSubtitle: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
  },
  featuresList: {
    gap: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.dark.bg.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: 'bold',
  },
  featureDescription: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  plansContainer: {
    gap: spacing.md,
  },
  planCard: {
    padding: spacing.lg,
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.dark.accent.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
  planSubtitle: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  saveBadge: {
    backgroundColor: colors.dark.accent.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  saveBadgeText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  footerText: {
    color: colors.dark.text.tertiary,
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
  },
});

