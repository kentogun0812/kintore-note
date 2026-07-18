import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { spacing, radius } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { PRESET_TIMES, ITEM_HEIGHT } from '../hooks/use-active-session';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ActiveTimerOverlayProps {
  restLeft: number;
  restTotal: number;
  showTimerPresets: boolean;
  setShowTimerPresets: (show: boolean) => void;
  selectedRestIndex: number;
  setSelectedRestIndex: (index: number) => void;
  startRest: (seconds: number) => void;
  cancelRest: () => void;
  formatRest: (seconds: number) => string;
  scrollY: Animated.Value;
  timerAnimation: Animated.Value;
  t: any;
}

export const ActiveTimerOverlay = React.memo(({
  restLeft,
  restTotal,
  showTimerPresets,
  setShowTimerPresets,
  selectedRestIndex,
  setSelectedRestIndex,
  startRest,
  cancelRest,
  formatRest,
  scrollY,
  timerAnimation,
  t
}: ActiveTimerOverlayProps) => {
  if (restLeft === 0 && !showTimerPresets) return null;

  return (
    <View style={styles.activeTimerOverlay}>
      {showTimerPresets && restLeft === 0 && (
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={() => setShowTimerPresets(false)}
        />
      )}
      <View style={styles.activeTimerBubble}>
        {showTimerPresets ? (
          <>
            <Text style={styles.presetTitleText}>{t('session.restTimer', 'Rest Timer')}</Text>

            <View style={styles.pickerContainer}>
              <Animated.FlatList
                data={PRESET_TIMES}
                keyExtractor={(item) => item.toString()}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.pickerContent}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                  { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
                  setSelectedRestIndex(Math.min(Math.max(index, 0), PRESET_TIMES.length - 1));
                }}
                onScrollEndDrag={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
                  setSelectedRestIndex(Math.min(Math.max(index, 0), PRESET_TIMES.length - 1));
                }}
                initialScrollIndex={selectedRestIndex}
                getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                renderItem={({ item, index }) => {
                  const inputRange = [
                    (index - 1) * ITEM_HEIGHT,
                    index * ITEM_HEIGHT,
                    (index + 1) * ITEM_HEIGHT,
                  ];

                  const opacity = scrollY.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                  });

                  const scale = scrollY.interpolate({
                    inputRange,
                    outputRange: [0.8, 1.25, 0.8],
                    extrapolate: 'clamp',
                  });

                  const color = scrollY.interpolate({
                    inputRange,
                    outputRange: [colors.dark.text.secondary, colors.dark.accent.primary, colors.dark.text.secondary],
                    extrapolate: 'clamp',
                  });

                  return (
                    <View style={styles.pickerItemWrapper}>
                      <Animated.Text style={[
                        styles.pickerItemText,
                        {
                          color: color as any,
                          opacity: opacity,
                          transform: [{ scale }]
                        }
                      ]}>
                        {formatRest(item)}
                      </Animated.Text>
                    </View>
                  );
                }}
              />
              {/* Selection Indicator overlay */}
              <View style={styles.selectionIndicator} />
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                onPress={() => {
                  startRest(PRESET_TIMES[selectedRestIndex]);
                  setShowTimerPresets(false);
                }}
                style={styles.largePresetBtn}
              >
                <Text style={styles.largePresetText}>{t('common.start', 'Start')}</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Pressable onPress={cancelRest} style={styles.timerPressable}>
            <Svg width={320} height={320} style={styles.svgRing}>
              {/* Background ring */}
              <Circle
                cx="160"
                cy="160"
                r="156"
                stroke={colors.dark.border.default}
                strokeWidth="8"
                fill="none"
              />
              {/* Sweeping pie fill */}
              <AnimatedCircle
                cx="160"
                cy="160"
                r="80"
                stroke={colors.dark.accent.primary}
                strokeWidth="160"
                fill="none"
                strokeDasharray={Math.PI * 160}
                strokeDashoffset={timerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [Math.PI * 160, 0]
                })}
                transform="rotate(-90 160 160)"
              />
            </Svg>
            <Text style={styles.activeTimerText}>{formatRest(restLeft)}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  activeTimerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  activeTimerBubble: {
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.dark.bg.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.dark.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  presetTitleText: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
    marginBottom: spacing.md,
  },
  pickerContainer: {
    height: ITEM_HEIGHT * 3,
    width: '100%',
    marginVertical: spacing.md
  },
  pickerContent: {
    paddingVertical: ITEM_HEIGHT
  },
  pickerItemWrapper: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pickerItemText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    width: '100%',
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.dark.border.default,
    pointerEvents: 'none'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
    width: '100%'
  },
  largePresetBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    width: 120,
    borderRadius: radius.md,
    backgroundColor: colors.dark.accent.primary,
    alignItems: 'center',
  },
  largePresetText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: typography.fontSize.lg,
  },
  timerPressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  svgRing: {
    position: 'absolute',
    borderRadius: 160,
    overflow: 'hidden'
  },
  activeTimerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
    marginTop: spacing.sm,
  }
});
