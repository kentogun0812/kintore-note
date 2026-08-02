import { Tabs, usePathname, useRouter } from 'expo-router';
import { View, StyleSheet, Keyboard, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useEffect, useState, ReactNode, useRef } from 'react';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { Icon } from '@/components/Icon';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FullWindowOverlay } from 'react-native-screens';
import { Platform } from 'react-native';

interface TabBarButtonProps {
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  renderIcon?: (props: { focused: boolean; color: string; size: number }) => ReactNode;
}

function TabBarButton({ isFocused, onPress, onLongPress, renderIcon }: TabBarButtonProps) {
  const scale = useSharedValue(isFocused ? 1.08 : 1);
  const opacity = useSharedValue(isFocused ? 1 : 0.65);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.08 : 1, { damping: 15, stiffness: 150 });
    opacity.value = withSpring(isFocused ? 1 : 0.65, { damping: 15, stiffness: 150 });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const activeColor = colors.dark.accent.primary;
  const inactiveColor = colors.dark.text.secondary;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    >
      <View style={styles.tabButtonInner}>
        <Animated.View style={[styles.tabButtonContent, animatedStyle]} pointerEvents="none">
          {renderIcon ? (
            renderIcon({
              focused: isFocused,
              color: isFocused ? activeColor : inactiveColor,
              size: 24,
            })
          ) : (
            <Icon
              name="help-circle-outline"
              size={24}
              color={isFocused ? activeColor : inactiveColor}
            />
          )}
        </Animated.View>
      </View>
    </Pressable>
  );
}

const Overlay = Platform.OS === 'ios' ? FullWindowOverlay : View;

const TAB_ROUTES = [
  { name: 'home', route: '/home', icon: 'home', outlineIcon: 'home-outline' },
  { name: 'training', route: '/training', icon: 'barbell', outlineIcon: 'barbell-outline' },
  { name: 'stats', route: '/stats', icon: 'bar-chart', outlineIcon: 'bar-chart-outline' },
  { name: 'settings', route: '/settings', icon: 'settings', outlineIcon: 'settings-outline' },
] as const;

function StandaloneFloatingTabBar({ paddingBottom }: { paddingBottom: number }) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const indicatorPosition = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);
  const indicatorScale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const isFirstRender = useRef(true);

  const pathname = usePathname();
  const router = useRouter();

  // Determine active route — only match exact tab roots, not sub-screens
  const activeRouteIndex = TAB_ROUTES.findIndex(r => {
    const tabRoot = r.route; // e.g. '/home', '/training'
    return pathname === tabRoot || pathname === tabRoot + '/index';
  });
  const activeRoute = TAB_ROUTES[activeRouteIndex];

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardWillShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => setKeyboardVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    translateY.value = withSpring(keyboardVisible ? 120 : 0, {
      damping: 20,
      stiffness: 150,
      mass: 0.8,
    });
  }, [keyboardVisible]);

  const numTabs = TAB_ROUTES.length;
  const paddingHorizontal = 15;
  const borderWidth = 1;

  useEffect(() => {
    if (containerWidth > 0 && activeRouteIndex >= 0 && numTabs > 0) {
      const netWidth = containerWidth - (paddingHorizontal * 2) - (borderWidth * 2);
      const tabWidth = netWidth / numTabs;
      indicatorPosition.value = withSpring(activeRouteIndex * tabWidth, {
        damping: 18,
        stiffness: 120,
        mass: 0.8,
      });

      if (!isFirstRender.current) {
        indicatorScale.value = withSequence(
          withTiming(1.15, { duration: 150 }),
          withTiming(1, { duration: 150 })
        );
      } else {
        isFirstRender.current = false;
      }
    }
  }, [activeRouteIndex, containerWidth, numTabs]);

  useEffect(() => {
    indicatorOpacity.value = withSpring(activeRouteIndex >= 0 ? 1 : 0, {
      damping: 15,
      stiffness: 120,
    });
  }, [activeRouteIndex]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    if (containerWidth === 0) {
      return { opacity: 0 };
    }
    const netWidth = containerWidth - (paddingHorizontal * 2) - (borderWidth * 2);
    const tabWidth = netWidth / numTabs;
    return {
      width: tabWidth + 12,
      transform: [
        { translateX: indicatorPosition.value - 6 },
        { scale: indicatorScale.value }
      ],
      opacity: indicatorOpacity.value,
    };
  });

  if (keyboardVisible) return null;
  if (activeRouteIndex === -1) return null;

  return (
    <Overlay style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <View style={[styles.tabBarWrapper, { paddingBottom }]} pointerEvents="box-none">
        <Animated.View
          style={[styles.tabBarContainer, animatedContainerStyle]}
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
          {containerWidth > 0 && numTabs > 0 && (
            <Animated.View
              style={[styles.activeIndicator, animatedIndicatorStyle]}
              pointerEvents="none"
            />
          )}
          {TAB_ROUTES.map((route) => {
            const isFocused = route.name === activeRoute?.name;
            const onPress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
              if (!isFocused) {
                router.navigate(route.route as any);
              }
            };
            return (
              <TabBarButton
                key={route.name}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={() => { }}
                renderIcon={({ color, size, focused }) => (
                  <Icon name={focused ? route.icon as any : route.outlineIcon as any} size={size} color={color} />
                )}
              />
            );
          })}
        </Animated.View>
      </View>
    </Overlay>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const dynamicPaddingBottom = Math.max(12, insets.bottom + 2);
  return (
    <View style={{ flex: 1, backgroundColor: colors.dark.bg.primary }}>
      <Tabs
        tabBar={() => null}
        screenOptions={{
          headerShown: false,
          sceneStyle: {
            backgroundColor: colors.dark.bg.primary,
          },
        }}
      >
        <Tabs.Screen name="home" options={{ title: t('tabs.home') }} />
        <Tabs.Screen name="training" options={{ title: t('tabs.training') }} />
        <Tabs.Screen name="stats" options={{ title: t('tabs.stats') }} />
        <Tabs.Screen name="settings" options={{ title: t('tabs.settings', 'Settings') }} />
      </Tabs>

      <StandaloneFloatingTabBar paddingBottom={dynamicPaddingBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
  },
  tabBarContainer: {
    width: '100%',
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(12, 12, 12, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
  },
  activeIndicator: {
    position: 'absolute',
    height: 48,
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    left: 15,
    top: '50%',
    marginTop: -24,
    zIndex: 0,
  },
  tabButton: {
    flex: 1,
    height: '100%',
  },
  tabButtonInner: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    zIndex: 1,
  },
});