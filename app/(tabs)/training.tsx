import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback } from 'react';
import { Link, router, useFocusEffect } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { useMenuStore } from '@/store/menu.store';
import { useTrainingStore } from '@/store/training.store';
import { useTranslation } from 'react-i18next';

export default function TrainingScreen() {
  const { t } = useTranslation();
  const { savedMenus, fetchSavedMenus } = useMenuStore();
  const { startSession } = useTrainingStore();

  useFocusEffect(
    useCallback(() => {
      fetchSavedMenus();
    }, [])
  );

  const handleStartMenu = (menu: any) => {
    startSession(menu.exercises);
    router.push('/training/session');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
      <Text style={styles.screenTitle}>
        {t('record.title')}
      </Text>
      
      <Card style={styles.quickStartCard}>
        <View style={styles.cardHeader}>
          <Icon name="flash" size={20} color={colors.dark.accent.warning} />
          <Text style={styles.cardTitle}>
             {t('record.quickStart')}
          </Text>
        </View>
        <Text style={styles.cardSubtitle}>
           {t('record.quickStartDesc')}
        </Text>
        <Link href="/training/session" asChild>
          <Button label={t('record.startEmpty')} iconName="play" fullWidth />
        </Link>
      </Card>
      
      <View style={styles.toolsRow}>
        <Link href="/training/menu-builder" asChild>
          <Pressable style={styles.toolItem}>
            <Card style={styles.toolCard}>
              <Icon name="clipboard" size={32} color={colors.dark.accent.primary} />
              <Text style={styles.toolText}>{t('record.menuBuilder')}</Text>
            </Card>
          </Pressable>
        </Link>
        <Link href="/training/program-builder" asChild>
          <Pressable style={styles.toolItem}>
            <Card style={styles.toolCard}>
              <Icon name="calendar-outline" size={32} color={colors.dark.accent.secondary} />
              <Text style={styles.toolText} numberOfLines={1} adjustsFontSizeToFit>{t('program.builder', 'Program')}</Text>
            </Card>
          </Pressable>
        </Link>
        <Link href="/training/library" asChild>
          <Pressable style={styles.toolItem}>
            <Card style={styles.toolCard}>
              <Icon name="library" size={32} color={colors.dark.text.secondary} />
              <Text style={styles.toolText}>{t('record.exerciseLibrary')}</Text>
            </Card>
          </Pressable>
        </Link>
      </View>
      
      <View style={styles.sectionHeader}>
        <Icon name="bookmarks-outline" size={20} color={colors.dark.text.primary} />
        <Text style={styles.sectionTitle}>
           {t('record.savedMenus')}
        </Text>
      </View>

      {savedMenus.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Icon name="document-text-outline" size={28} color={colors.dark.text.tertiary} />
          <Text style={styles.emptyText}>
            {t('record.noMenus')}
          </Text>
        </Card>
      ) : (
        savedMenus.map(menu => (
          <Card key={menu.id} style={styles.menuCard}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuName}>{menu.name}</Text>
              <Text style={styles.menuExerciseCount}>{menu.exercises.length} {t('common.exercises')}</Text>
            </View>
            <View style={styles.exercisePreview}>
              {menu.exercises.slice(0, 3).map((ex, i) => (
                <View key={ex.id} style={styles.exerciseTag}>
                  <Text style={styles.exerciseTagText}>{ex.name}</Text>
                </View>
              ))}
              {menu.exercises.length > 3 && (
                <View style={styles.exerciseTag}>
                  <Text style={styles.exerciseTagText}>+{menu.exercises.length - 3} {t('common.more')}</Text>
                </View>
              )}
            </View>
            <Button 
              label={t('home.startSession')} 
              iconName="play-circle" 
              variant="secondary" 
              size="sm" 
              onPress={() => handleStartMenu(menu)} 
            />
          </Card>
        ))
      )}
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
  quickStartCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.text.secondary,
    marginBottom: spacing.sm,
  },
  toolsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  toolItem: {
    flex: 1,
  },
  toolCard: {
    padding: spacing.md,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toolText: {
    color: colors.dark.text.primary,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  emptyCard: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.dark.bg.tertiary,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  emptyText: {
    color: colors.dark.text.secondary,
    paddingVertical: spacing.sm,
  },
  menuCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuName: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
  menuExerciseCount: {
    color: colors.dark.text.tertiary,
    fontSize: typography.fontSize.xs,
  },
  exercisePreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: spacing.xs,
  },
  exerciseTag: {
    backgroundColor: colors.dark.bg.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  exerciseTagText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.xs,
  },
});
