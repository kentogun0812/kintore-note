import { View, Text, ScrollView, Pressable, Switch, StyleSheet, Modal, ImageBackground } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon } from '@/components/Icon';
import { Card } from '@/components/Card';
import { useAuthStore } from '@/store/auth.store';
import { useTranslation } from 'react-i18next';
import { useSettingsStore, WeightUnit, AppLanguage } from '@/store/settings.store';
import { useAppLock } from '@/hooks/use-app-lock';
import { DeleteAccountModal } from '@/components/DeleteAccountModal';
import { deleteAccount } from '@/lib/delete-account';
import * as Haptics from 'expo-haptics';
import React from 'react';

interface MenuItem {
  label: string;
  icon: string;
  value?: string;
  onPress?: () => void;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
  isDestructive?: boolean;
}

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { signOut, isGuest } = useAuthStore();
  const { 
    notificationsEnabled, 
    setNotificationsEnabled,
    language,
    setLanguage,
    weightUnit,
    setWeightUnit
  } = useSettingsStore();
  const { appLockEnabled, toggleAppLock } = useAppLock();

  const handleAppLockToggle = async (value: boolean) => {
    const success = await toggleAppLock(value);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleAuthAction = async () => {
    if (isGuest) {
      router.push('/auth/login');
    } else {
      await signOut();
      router.replace('/auth/login');
    }
  };

  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [modalType, setModalType] = React.useState<'language' | 'weightUnit' | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = React.useState(false);

  const handleDeleteAccount = async () => {
    const result = await deleteAccount();
    if (result.success) {
      // After deletion, the auth state is already cleared
      // Navigate to intro/login screen
      router.replace('/auth/intro');
    } else {
      throw new Error(result.error || 'Failed to delete account');
    }
  };

  const languageOptions = [
    { label: 'English', value: 'en' },
    { label: '日本語', value: 'ja' },
  ];

  const weightOptions = [
    { label: 'Kg (Kilograms)', value: 'kg' },
    { label: 'Lbs (Pounds)', value: 'lbs' },
  ];

  const openModal = (type: 'language' | 'weightUnit') => {
    setModalType(type);
    setIsModalVisible(true);
  };

  const toggleLanguage = () => openModal('language');
  const toggleWeightUnit = () => openModal('weightUnit');

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: t('settings.preferences'),
      items: [
        { 
          label: t('settings.language'), 
          value: language === 'en' ? 'English' : '日本語',
          icon: 'globe-outline', 
          onPress: toggleLanguage 
        },
        { 
          label: t('settings.weightUnit'), 
          value: weightUnit.toUpperCase(),
          icon: 'barbell-outline', 
          onPress: toggleWeightUnit 
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
    ...(!isGuest ? [{
      title: t('settings.security'),
      items: [
        { 
          label: t('settings.appLock'), 
          icon: 'lock-closed-outline', 
          isToggle: true,
          toggleValue: appLockEnabled,
          onToggle: handleAppLockToggle
        },
      ],
    }] : []),
    {
      title: t('settings.legal'),
      items: [
        { label: t('settings.privacyPolicy'), icon: 'shield-checkmark-outline' },
        { label: t('settings.termsOfUse'), icon: 'document-text-outline' },
      ],
    },
    ...(!isGuest ? [{
      title: t('settings.account'),
      items: [
        { 
          label: t('settings.deleteAccount'), 
          icon: 'trash-outline', 
          onPress: () => setIsDeleteModalVisible(true),
          isDestructive: true
        },
      ],
    }] : []),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable onPress={() => router.push('/premium')}>
          <ImageBackground 
            source={require('../../assets/images/premium_banner.png')}
            style={styles.premiumCard}
            imageStyle={styles.premiumCardImage}
          >
            <View style={styles.premiumContent}>
               <View style={styles.premiumIconContainer}>
                 <Icon name="diamond" size={28} color={colors.white} />
               </View>
               <View style={styles.premiumTextContainer}>
                 <Text style={styles.premiumTitle}>{t('settings.upgradePro')}</Text>
                 <Text style={styles.premiumSubtitle}>{t('settings.unlockStats')}</Text>
               </View>
            </View>
          </ImageBackground>
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
                  <View style={[styles.menuIconContainer, item.isDestructive && { backgroundColor: colors.dark.alpha.accent10 }]}>
                    <Icon name={item.icon as any} size={18} color={item.isDestructive ? colors.dark.accent.primary : colors.dark.text.secondary} />
                  </View>
                  <Text style={[styles.menuItemLabel, item.isDestructive && { color: colors.dark.accent.primary }]}>{item.label}</Text>
                  
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
          onPress={handleAuthAction}
          style={({ pressed }) => [
            styles.signOutButton,
            {
              backgroundColor: pressed ? colors.dark.alpha.accent10 : colors.dark.bg.secondary,
              borderColor: pressed ? colors.dark.accent.primary : 'transparent',
            }
          ]}
        >
          <Icon 
            name={isGuest ? "log-in-outline" : "log-out-outline"} 
            size={20} 
            color={colors.dark.accent.primary} 
          />
          <Text style={styles.signOutText}>
            {isGuest ? t('settings.signIn') : t('settings.signOut')}
          </Text>
        </Pressable>

      </ScrollView>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Animated.View 
          entering={FadeIn} 
          exiting={FadeOut}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalOverlayClose} onPress={() => setIsModalVisible(false)} />
        </Animated.View>
        
        <Animated.View 
          entering={SlideInDown} 
          exiting={SlideOutDown} 
          style={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderIndicator} />
            <Text style={styles.modalTitle}>
              {modalType === 'language' ? t('settings.language') : t('settings.weightUnit')}
            </Text>
            <Pressable 
              onPress={() => setIsModalVisible(false)} 
              style={styles.modalCloseButton}
              hitSlop={12}
            >
              <Icon name="close" size={24} color={colors.dark.text.secondary} />
            </Pressable>
          </View>
          
          <View style={styles.modalOptions}>
            {(modalType === 'language' ? languageOptions : weightOptions).map((option) => {
              const isSelected = modalType === 'language' ? language === option.value : weightUnit === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    if (modalType === 'language') {
                      setLanguage(option.value as AppLanguage);
                      i18n.changeLanguage(option.value);
                    } else {
                      setWeightUnit(option.value as WeightUnit);
                    }
                    setIsModalVisible(false);
                  }}
                  style={({ pressed }) => [
                    styles.optionItem,
                    { backgroundColor: pressed ? colors.dark.bg.elevated : 'transparent' }
                  ]}
                >
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Icon name="checkmark-circle" size={24} color={colors.dark.accent.primary} />
                  )}
                </Pressable>
              );
            })}
          </View>
          

        </Animated.View>
      </Modal>

      <View style={styles.footer}>
        <Text style={styles.versionText}>
          {t('settings.version')}
        </Text>
      </View>

      <DeleteAccountModal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleDeleteAccount}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.lg,
  },
  premiumCard: {
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    overflow: 'hidden',
    shadowColor: colors.dark.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  premiumCardImage: {
    resizeMode: 'cover',
  },
  premiumContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  premiumIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumTextContainer: {
    flex: 1,
    gap: 4,
  },
  premiumTitle: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
  premiumSubtitle: {
    color: colors.dark.alpha.white80,
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
  },
  sectionContainer: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.dark.text.tertiary,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
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
  footer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  versionText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.xs,
    opacity: 0.7,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.dark.alpha.black70,
  },
  modalOverlayClose: {
    flex: 1,
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.dark.bg.secondary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.base,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  modalHeaderIndicator: {
    width: 40,
    height: 4,
    backgroundColor: colors.dark.border.default,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  modalTitle: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
  modalOptions: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  optionText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.md,
  },
  optionTextSelected: {
    color: colors.dark.text.primary,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    position: 'absolute',
    right: 0,
    top: spacing.md,
    padding: spacing.sm,
  },
});

