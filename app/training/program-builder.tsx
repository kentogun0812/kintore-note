import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useProgramStore } from '@/store/program.store';
import { useTranslation } from 'react-i18next';

export default function ProgramBuilderScreen() {
  const { t } = useTranslation();
  const { createProgram } = useProgramStore();
  
  const [name, setName] = useState('');
  const [weeks, setWeeks] = useState('4');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveProgram = async () => {
    const totalWeeks = parseInt(weeks, 10);
    if (isNaN(totalWeeks) || totalWeeks < 1 || totalWeeks > 52) {
      Alert.alert(t('common.error'), t('programBuilder.invalidWeeks'));
      return;
    }

    try {
      setIsSaving(true);
      const programId = await createProgram(name, totalWeeks);
      setIsSaving(false);
      
      if (programId) {
        // Navigate to the program detail/schedule screen
        router.replace(`/training/program/${programId}`);
      } else {
        Alert.alert(t('common.error'), t('programBuilder.createFailed'));
      }
    } catch (err) {
      setIsSaving(false);
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: t('programBuilder.title', 'Create Program'), 
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
            {t('programBuilder.programName', 'Program Name')}
          </Text>
          <TextInput 
            value={name}
            onChangeText={setName}
            placeholder={t('programBuilder.namePlaceholder', 'e.g. 4-Week Strength Block')}
            placeholderTextColor={colors.dark.text.tertiary}
            style={styles.textInput}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {t('programBuilder.totalWeeks', 'Total Weeks (1-52)')}
          </Text>
          <TextInput 
            value={weeks}
            onChangeText={setWeeks}
            placeholder="4"
            keyboardType="number-pad"
            placeholderTextColor={colors.dark.text.tertiary}
            style={styles.textInput}
          />
        </View>
        
        <View style={styles.infoCard}>
          <Icon name="information-circle-outline" size={24} color={colors.dark.text.secondary} />
          <Text style={styles.infoText}>
            {t('programBuilder.info', 'After creating the program, you will be able to assign different training menus to each week.')}
          </Text>
        </View>

      </ScrollView>
      
      <View style={styles.footer}>
        <Button 
          label={isSaving ? t('common.saving', 'Saving...') : t('programBuilder.save', 'Create Program')} 
          iconName="save" 
          fullWidth 
          onPress={handleSaveProgram} 
          disabled={!name || !weeks || isSaving} 
        />
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.dark.bg.tertiary,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  infoText: {
    flex: 1,
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
    backgroundColor: colors.dark.bg.primary,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border.subtle,
  },
});
