import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { useTranslation } from 'react-i18next';

export default function StatsScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
      <Text style={styles.screenTitle}>
        {t('stats.title')}
      </Text>

      <Card style={styles.comingSoonCard}>
        <Icon name="lock-closed" size={32} color={colors.dark.text.tertiary} />
        <Text style={styles.comingSoonTitle}>
          {t('stats.comingSoon')}
        </Text>
        <Text style={styles.comingSoonSubtitle}>
          {t('stats.comingSoonDesc')}
        </Text>
      </Card>
      
      <View style={styles.previewContainer}>
         <Card style={styles.previewCard}>
            <Icon name="bar-chart-outline" size={48} color={colors.dark.text.tertiary} />
            <Text style={styles.previewText}>{t('stats.preview')}</Text>
         </Card>
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
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl * 2,
    gap: spacing.md,
  },
  screenTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'heavy',
    color: colors.dark.text.primary,
    marginBottom: spacing.xs,
  },
  comingSoonCard: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.dark.bg.tertiary,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  comingSoonTitle: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
  comingSoonSubtitle: {
    color: colors.dark.text.secondary,
    textAlign: 'center',
  },
  previewContainer: {
    opacity: 0.5,
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  previewCard: {
    padding: spacing.md,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    color: colors.dark.text.secondary,
    marginTop: spacing.md,
  },
});
