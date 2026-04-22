import React from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { Stack, Link, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { useMenuStore } from '@/store/menu.store';
import { useTranslation } from 'react-i18next';

export default function MenuBuilderScreen() {
  const { t } = useTranslation();
  const { menuName, setMenuName, exercises, removeExerciseFromMenu, saveCurrentMenu } = useMenuStore();
  const [isSaving, setIsSaving] = React.useState(false);
  
  const handleSaveMenu = async () => {
    try {
      setIsSaving(true);
      await saveCurrentMenu();
      setIsSaving(false);
      router.replace('/(tabs)/record');
    } catch (err: any) {
      setIsSaving(false);
      if (err.message === 'GUEST_LIMIT_REACHED') {
        Alert.alert(
          'Guest Limit',
          'Guests can only create 1 training menu. Please login or register to create unlimited menus and sync them to the cloud! 🏋️‍♂️',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Login / Register', onPress: () => router.push('/auth/login') }
          ]
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: t('menuBuilder.title'), 
          headerLargeTitle: false,
          headerBackVisible: true,
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              hitSlop={8} 
              style={styles.headerBackButton}
            >
              <Icon name="chevron-back" size={20} color={colors.dark.text.primary} />
            </Pressable>
          ),
        }} 
      />
      
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {t('menuBuilder.menuName')}
          </Text>
          <TextInput 
            value={menuName}
            onChangeText={setMenuName}
            placeholder={t('menuBuilder.placeholder')}
            placeholderTextColor={colors.dark.text.tertiary}
            style={styles.textInput}
          />
        </View>
        
        <View style={styles.exerciseSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('menuBuilder.exercises')}
            </Text>
            <Link href="/training/library" asChild>
              <Button label={t('menuBuilder.add')} iconName="add" size="sm" variant="secondary" />
            </Link>
          </View>
          
          {exercises.length === 0 ? (
            <Card style={styles.emptyCard}>
               <Icon name="barbell-outline" size={32} color={colors.dark.text.tertiary} />
                <Text style={styles.emptyText}>
                  {t('menuBuilder.noExercises')}
                </Text>
            </Card>
          ) : (
            <View style={styles.exerciseList}>
              {exercises.map((ex, index) => (
                <Card key={ex.id} style={styles.exerciseCard}>
                  <Text style={styles.exerciseIndex}>
                    {index + 1}
                  </Text>
                  <Text style={styles.exerciseName}>
                    {ex.name}
                  </Text>
                  <Pressable onPress={() => removeExerciseFromMenu(ex.id)} style={styles.removeButton}>
                    <Icon name="trash-outline" size={18} color={colors.dark.accent.primary} />
                  </Pressable>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button label={isSaving ? t('menuBuilder.saving') : t('menuBuilder.saveMenu')} iconName="save" fullWidth onPress={handleSaveMenu} disabled={exercises.length === 0 || !menuName || isSaving} />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  headerBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  inputLabel: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  textInput: {
    backgroundColor: colors.dark.bg.tertiary,
    color: colors.dark.text.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    fontSize: typography.fontSize.md,
  },
  exerciseSection: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    borderStyle: 'dashed',
  },
  emptyText: {
    color: colors.dark.text.secondary,
  },
  exerciseList: {
    gap: spacing.sm,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIndex: {
    color: colors.dark.text.secondary,
    marginRight: spacing.md,
    fontWeight: 'bold',
  },
  exerciseName: {
    flex: 1,
    color: colors.dark.text.primary,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: spacing.sm,
  },
  footer: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
    backgroundColor: colors.dark.bg.primary,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border.subtle,
  },
});

