import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { useOnboardingStore } from '@/store/onboarding.store';
import { Icon } from '@/components/Icon';
import Animated, { FadeIn, FadeInRight, FadeOutLeft, useSharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const INTRO_DATA = [
  { id: 1, icon: 'barbell-outline' as const, color: colors.dark.accent.primary },
  { id: 2, icon: 'stats-chart-outline' as const, color: colors.dark.accent.success },
  { id: 3, icon: 'flame-outline' as const, color: colors.dark.accent.warning },
];

export default function IntroScreen() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { setHasSeenIntro } = useOnboardingStore();
  const scrollX = useSharedValue(0);

  const handleNext = () => {
    if (currentStep < INTRO_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentStep + 1, animated: true });
    } else {
      finishIntro();
    }
  };

  const finishIntro = () => {
    setHasSeenIntro(true);
    router.replace('/(tabs)/home');
  };

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentStep(roundIndex);
    scrollX.value = event.nativeEvent.contentOffset.x;
  }, []);

  const renderItem = ({ item, index }: { item: typeof INTRO_DATA[0], index: number }) => {
    const isActive = currentStep === index;
    
    return (
      <View style={styles.slide}>
        <View style={[styles.imageContainer, { backgroundColor: item.color + '15' }]}>
          <Icon name={item.icon} size={80} color={item.color} />
        </View>
        <View style={styles.textContainer}>
          {isActive ? (
            <>
              <Animated.Text 
                key={`title-${index}-${currentStep}`}
                entering={FadeInRight.delay(100).duration(400)}
                style={styles.title}
              >
                {t(`intro.slides.${index}.title`)}
              </Animated.Text>
              <Animated.Text 
                key={`desc-${index}-${currentStep}`}
                entering={FadeInRight.delay(250).duration(400)}
                style={styles.description}
              >
                {t(`intro.slides.${index}.description`)}
              </Animated.Text>
            </>
          ) : (
            <>
              <Text style={[styles.title, { opacity: 0 }]}>{t(`intro.slides.${index}.title`)}</Text>
              <Text style={[styles.description, { opacity: 0 }]}>{t(`intro.slides.${index}.description`)}</Text>
            </>
          )}
        </View>
      </View>
    );
  };

  const currentStepColor = INTRO_DATA[currentStep].color;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header đồng bộ */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('auth.login.title')}</Text>
        <Pressable onPress={finishIntro} hitSlop={12}>
          <Text style={styles.skipText}>{t('intro.skip')}</Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={INTRO_DATA}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id.toString()}
        style={styles.flatList}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {INTRO_DATA.map((_, index) => (
            <View 
              key={index}
              style={[
                styles.dot, 
                index === currentStep && styles.activeDot,
                { backgroundColor: index === currentStep ? currentStepColor : colors.dark.bg.tertiary }
              ]}
            />
          ))}
        </View>

        <Pressable 
          style={[styles.button, { backgroundColor: currentStepColor }]} 
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentStep === INTRO_DATA.length - 1 ? t('intro.getStarted') : t('intro.next')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.base,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.dark.bg.secondary,
    position: 'absolute',
    left: spacing.base,
    zIndex: 1,
  },
  headerTitle: {
    color: colors.dark.text.logo,
    fontSize: typography.fontSize.xl,
    fontWeight: '900',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  skipText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing['2xl'],
  },
  imageContainer: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: (width * 0.6) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  textContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize['3xl'],
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.lg,
    textAlign: 'center',
    lineHeight: 28,
  },
  footer: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.dark.bg.tertiary,
  },
  activeDot: {
    width: 24,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
});
