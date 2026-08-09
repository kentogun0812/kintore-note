import React, { useCallback } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import { SvgMuscleKey } from '@/utils/muscleHeatmap';

/**
 * Muscle zone positions extracted from front_fill.jpg + leg_fill.jpg analysis.
 *
 * Methodology:
 * - front_fill.jpg contains a 3x2 grid of body diagrams, each highlighting
 *   one muscle group in orange
 * - Python script detected orange pixels per panel and computed bounding boxes
 * - Coordinates are normalized (0.0–1.0) relative to a single body panel
 *   so they work at any display size
 *
 * cx/cy = center of muscle zone (fraction of IMG_W / IMG_H)
 * rx/ry = half-width / half-height radius (fraction of IMG_W / IMG_H)
 */

interface MuscleZone {
  key: SvgMuscleKey;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

const FRONT_ZONES: MuscleZone[] = [
  //  muscle         cx      cy      rx      ry    (all fractions of image)
  { key: 'traps',     cx: 0.502, cy: 0.179, rx: 0.138, ry: 0.038 },
  { key: 'shoulders', cx: 0.502, cy: 0.243, rx: 0.220, ry: 0.055 },
  { key: 'chest',     cx: 0.497, cy: 0.282, rx: 0.155, ry: 0.082 },
  { key: 'biceps',    cx: 0.498, cy: 0.320, rx: 0.200, ry: 0.060 },
  { key: 'abs',       cx: 0.493, cy: 0.380, rx: 0.110, ry: 0.098 },
  { key: 'forearms',  cx: 0.503, cy: 0.425, rx: 0.220, ry: 0.062 },
  { key: 'quads',     cx: 0.500, cy: 0.566, rx: 0.138, ry: 0.118 },
  { key: 'calves',    cx: 0.500, cy: 0.778, rx: 0.130, ry: 0.095 },
  { key: 'obliques',  cx: 0.493, cy: 0.395, rx: 0.165, ry: 0.065 },
];

interface BodyFrontSvgProps {
  getFillColor: (key: SvgMuscleKey) => string;
  selectedMuscle: SvgMuscleKey | null;
  onSelectMuscle: (key: SvgMuscleKey) => void;
}

// front.jpg aspect ratio ≈ 511 / 869 → 0.588
// We display at a fixed height and let width scale proportionally
const IMG_H = 360;
const IMG_W = Math.round(IMG_H * (511 / 869)); // ≈ 212

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function BodyFrontSvg({ getFillColor, selectedMuscle, onSelectMuscle }: BodyFrontSvgProps) {
  const handlePress = useCallback((key: SvgMuscleKey) => {
    onSelectMuscle(key);
  }, [onSelectMuscle]);

  return (
    <View style={styles.container}>
      {/* Layer 1: Background line-art image */}
      <Image
        source={require('../../../../assets/muscle/front.jpg')}
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
        {FRONT_ZONES.map((zone) => {
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

      {/* Layer 3: Transparent pressable hit areas for all muscles (including unactivated) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {FRONT_ZONES.map((zone) => {
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
