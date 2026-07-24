import { Tabs } from 'expo-router';
import { Platform, View, Pressable, StyleSheet, Keyboard } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useEffect, useState, ReactNode } from 'react';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { Icon } from '@/components/Icon';
import { useTranslation } from 'react-i18next';

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
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
    >
      <Animated.View style={[styles.tabButtonContent, animatedStyle]}>
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
    </Pressable>
  );
}

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Filter out tabs that are hidden (e.g. href === null) and the "body" tab completely
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return route.name !== 'body' && (options as any).href !== null;
  });

  const activeRouteName = state.routes[state.index].name;
  const activeRouteIndex = visibleRoutes.findIndex((r) => r.name === activeRouteName);

  const translateY = useSharedValue(0);
  const indicatorPosition = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);

  // Track keyboard state to slide down the tab bar
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Animate keyboard sliding down off-screen
  useEffect(() => {
    translateY.value = withSpring(keyboardVisible ? 120 : 0, {
      damping: 20,
      stiffness: 150,
      mass: 0.8,
    });
  }, [keyboardVisible]);

  const numTabs = visibleRoutes.length;
  const paddingHorizontal = 15;

  // Animate active pill indicator position and opacity
  useEffect(() => {
    if (containerWidth > 0 && activeRouteIndex >= 0 && numTabs > 0) {
      const netWidth = containerWidth - paddingHorizontal * 2;
      const tabWidth = netWidth / numTabs;

      indicatorPosition.value = withSpring(activeRouteIndex * tabWidth, {
        damping: 18,
        stiffness: 120,
        mass: 0.8,
      });
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
    if (containerWidth === 0 || numTabs === 0) {
      return { opacity: 0 };
    }
    const netWidth = containerWidth - paddingHorizontal * 2;
    const tabWidth = netWidth / numTabs;
    return {
      width: tabWidth + 12,
      transform: [{ translateX: indicatorPosition.value - 6 }],
      opacity: indicatorOpacity.value,
    };
  });

  return (
    <View style={styles.tabBarWrapper} pointerEvents="box-none">
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

        {visibleRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const isFocused = activeRouteName === route.name;
          const renderIcon = options.tabBarIcon;

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabBarButton
              key={route.key}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              renderIcon={renderIcon}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();

  const guestGuard = (e: any) => {
    // MOCK: Temporarily bypassed to allow access without login
    // if (isGuest) {
    //   e.preventDefault();
    //   router.push('/auth/login');
    // }
  };

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: colors.dark.bg.primary,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, focused, size }) => (
            <Icon name={focused ? 'home' : 'home-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: t('tabs.training'),
          tabBarIcon: ({ color, focused, size }) => (
            <Icon name={focused ? 'barbell' : 'barbell-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="body"
        options={{
          title: t('tabs.body'),
          tabBarIcon: ({ color, focused, size }) => (
            <Icon name={focused ? 'body' : 'body-outline'} color={color} size={size} />
          ),
          href: null,
        }}
        listeners={{ tabPress: guestGuard }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t('tabs.stats'),
          tabBarIcon: ({ color, focused, size }) => (
            <Icon name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} size={size} />
          ),
        }}
        listeners={{ tabPress: guestGuard }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings', 'Settings'),
          tabBarIcon: ({ color, focused, size }) => (
            <Icon name={focused ? 'settings' : 'settings-outline'} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 88,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
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
    // iOS shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    // Android elevation
    elevation: 8,
    zIndex: 99,
  },
  activeIndicator: {
    position: 'absolute',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(210, 74, 66, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(210, 74, 66, 0.35)',
    top: '50%',
    marginTop: -24,
    left: 15,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
});