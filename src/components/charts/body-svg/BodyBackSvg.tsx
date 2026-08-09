import React, { useCallback } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import { SvgMuscleKey } from '@/utils/muscleHeatmap';

/**
 * Muscle zone positions extracted from back_fill.jpg + leg_fill.jpg analysis.
 *
 * back_fill.jpg contains a 3x2 grid of body diagrams, each highlighting
 * one back muscle group in orange.
 * Python script detected orange pixels per panel and computed bounding boxes.
 * Coordinates normalized to 0.0–1.0 fractions of a single body panel.
 */

interface MuscleZone {
  key: SvgMuscleKey;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

const BACK_ZONES: MuscleZone[] = [
  //  muscle          cx      cy      rx      ry
  { key: 'traps',      cx: 0.502, cy: 0.219, rx: 0.138, ry: 0.100 },
  { key: 'shoulders',  cx: 0.502, cy: 0.234, rx: 0.215, ry: 0.048 },
  { key: 'lats',       cx: 0.502, cy: 0.330, rx: 0.148, ry: 0.095 },
  { key: 'triceps',    cx: 0.503, cy: 0.312, rx: 0.210, ry: 0.058 },
  { key: 'lower_back', cx: 0.502, cy: 0.398, rx: 0.105, ry: 0.058 },
  { key: 'glutes',     cx: 0.502, cy: 0.465, rx: 0.128, ry: 0.072 },
  { key: 'forearms',   cx: 0.503, cy: 0.432, rx: 0.230, ry: 0.068 },
  { key: 'hamstrings', cx: 0.498, cy: 0.612, rx: 0.128, ry: 0.088 },
  { key: 'calves',     cx: 0.498, cy: 0.793, rx: 0.130, ry: 0.098 },
];

interface BodyBackSvgProps {
  getFillColor: (key: SvgMuscleKey) => string;
  selectedMuscle: SvgMuscleKey | null;
  onSelectMuscle: (key: SvgMuscleKey) => void;
}

// back.jpg aspect ratio ≈ 511 / 869 → 0.588
const IMG_H = 360;
const IMG_W = Math.round(IMG_H * (511 / 869)); // ≈ 212

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function BodyBackSvg({ getFillColor, selectedMuscle, onSelectMuscle }: BodyBackSvgProps) {
  const handlePress = useCallback((key: SvgMuscleKey) => {
    onSelectMuscle(key);
  }, [onSelectMuscle]);

  return (
    <View style={styles.container}>
      {/* Layer 1: Background line-art image */}
      <Image
        source={require('../../../../assets/muscle/back.jpg')}
        style={styles.image}
        resizeMode="stretch"
      />

      {/* Layer 2: SVG overlay with colored muscle zones */}
      <Svg
        style={StyleSheet.absoluteFill}
        width={IMG_W}
        height={IMG_H}
        viewBox={`0 0 ${IMG_W} ${IMG_H}`}
      >
        {BACK_ZONES.map((zone) => {
          const fillHex = getFillColor(zone.key);
          const isActive = fillHex !== '#1E1E1E';
          const isSelected = selectedMuscle === zone.key;

          const cx = zone.cx * IMG_W;
          const cy = zone.cy * IMG_H;
          const rx = zone.rx * IMG_W;
          const ry = zone.ry * IMG_H;

          return (
            <Ellipse
              key={zone.key}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={isActive ? hexToRgba(fillHex, 0.55) : isSelected ? 'rgba(82,214,133,0.15)' : 'transparent'}
              stroke={isSelected ? '#52D685' : isActive ? hexToRgba(fillHex, 0.85) : 'transparent'}
              strokeWidth={isSelected ? 2.5 : 1.5}
              onPress={() => handlePress(zone.key)}
            />
          );
        })}
      </Svg>

      {/* Layer 3: Transparent pressable hit areas for all muscles */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {BACK_ZONES.map((zone) => {
          const cx = zone.cx * IMG_W;
          const cy = zone.cy * IMG_H;
          const rx = zone.rx * IMG_W;
          const ry = zone.ry * IMG_H;

          return (
            <TouchableOpacity
              key={`hit-${zone.key}`}
              onPress={() => handlePress(zone.key)}
              activeOpacity={0.7}
              style={[
                styles.hitArea,
                {
                  left: cx - rx,
                  top: cy - ry,
                  width: rx * 2,
                  height: ry * 2,
                  borderRadius: rx,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: IMG_W,
    height: IMG_H,
    position: 'relative',
  },
  image: {
    width: IMG_W,
    height: IMG_H,
  },
  hitArea: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
});
