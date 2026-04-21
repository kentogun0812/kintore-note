import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon, IconName } from '@/components/Icon';
import { Card } from '@/components/Card';
import { useAuthStore } from '@/store/auth.store';
import { useTranslation } from 'react-i18next';

interface MenuItem {
  label: string;
  icon: string;
  value?: string;
  onPress?: () => void;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
}

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const signOut = useAuthStore((s) => s.signOut);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ja' : 'en';
    i18n.changeLanguage(newLang);
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: t('settings.preferences'),
      items: [
        { 
          label: t('settings.language'), 
          value: i18n.language === 'en' ? 'English' : '日本語',
          icon: 'globe-outline', 
          onPress: toggleLanguage 
        },
        { 
          label: t('settings.notifications'), 
          icon: 'notifications-outline', 
          isToggle: true,
          toggleValue: notificationsEnabled,
          onToggle: setNotificationsEnabled
        },
      ],
    },
    {
      title: t('settings.legal'),
      items: [
        { label: t('settings.privacyPolicy'), icon: 'shield-checkmark-outline' },
        { label: t('settings.termsOfUse'), icon: 'document-text-outline' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          onPress={() => router.back()} 
          hitSlop={12}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={20} color={colors.dark.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {t('settings.title')}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Premium Banner */}
        <Pressable onPress={() => router.push('/premium')}>
          <Card style={styles.premiumCard}>
            <View style={styles.premiumContent}>
               <View style={styles.premiumTextContainer}>
                 <Text style={styles.premiumTitle}>{t('settings.upgradePro')}</Text>
                 <Text style={styles.premiumSubtitle}>{t('settings.unlockStats')}</Text>
               </View>
               <Icon name="diamond" size={40} color={colors.white} />
            </View>
          </Card>
        </Pressable>

        {menuSections.map((section) => (
          <View key={section.title} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              {section.title}
            </Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, i) => (
                <Pressable
                  key={item.label}
                  onPress={item.onPress}
                  disabled={item.isToggle}
                  style={({ pressed }) => [
                    styles.menuItem,
                    { 
                      backgroundColor: pressed ? colors.dark.bg.elevated : 'transparent',
                      borderBottomWidth: i < section.items.length - 1 ? 1 : 0,
                    }
                  ]}
                >
                  <View style={styles.menuIconContainer}>
                    <Icon name={item.icon as any} size={18} color={colors.dark.text.secondary} />
                  </View>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  
                  {item.isToggle ? (
                    <Switch 
                      value={item.toggleValue} 
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.dark.bg.elevated, true: colors.dark.accent.primary }}
                      thumbColor={colors.white}
                    />
                  ) : (
                    <View style={styles.menuValueContainer}>
                      {item.value && (
                        <Text style={styles.menuItemValue}>{item.value}</Text>
                      )}
                      <Icon name="chevron-forward" size={16} color={colors.dark.text.tertiary} />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOutButton,
            {
              backgroundColor: pressed ? colors.dark.alpha.accent10 : colors.dark.bg.secondary,
              borderColor: pressed ? colors.dark.accent.primary : 'transparent',
            }
          ]}
        >
          <Icon name="log-out-outline" size={20} color={colors.dark.accent.primary} />
          <Text style={styles.signOutText}>
            {t('settings.signOut')}
          </Text>
        </Pressable>

        <Text style={styles.versionText}>
          {t('settings.version')}
        </Text>
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
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.lg,
  },
  premiumCard: {
    backgroundColor: colors.dark.accent.primary,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  premiumContent: {
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumTextContainer: {
    gap: spacing.xs,
    flex: 1,
  },
  premiumTitle: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: 'heavy',
  },
  premiumSubtitle: {
    color: colors.dark.alpha.white80,
    fontSize: typography.fontSize.sm,
  },
  sectionContainer: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.dark.text.tertiary,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    paddingHorizontal: spacing.xs,
  },
  sectionContent: {
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    borderBottomColor: colors.dark.border.subtle,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.dark.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    flex: 1,
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.base,
  },
  menuValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  menuItemValue: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  signOutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
  },
  signOutText: {
    color: colors.dark.accent.primary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.base,
  },
  versionText: {
    color: colors.dark.text.tertiary,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

