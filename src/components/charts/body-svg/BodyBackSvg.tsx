import React from 'react';
import Svg, { G, Circle, Path } from 'react-native-svg';
import Animated, { useAnimatedProps, withTiming } from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { SvgMuscleKey } from '@/utils/muscleHeatmap';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface BodyBackSvgProps {
  getFillColor: (key: SvgMuscleKey) => string;
  selectedMuscle: SvgMuscleKey | null;
  onSelectMuscle: (key: SvgMuscleKey) => void;
}

interface MuscleSegmentProps {
  muscleKey: SvgMuscleKey;
  d: string;
  fillColor: string;
  isSelected: boolean;
  onSelect: (key: SvgMuscleKey) => void;
}

function MuscleSegment({ muscleKey, d, fillColor, isSelected, onSelect }: MuscleSegmentProps) {
  const animatedProps = useAnimatedProps(() => ({
    fill: withTiming(fillColor, { duration: 300 }),
  }), [fillColor]);

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      d={d}
      stroke={isSelected ? '#52D685' : colors.dark.border.default}
      strokeWidth={isSelected ? 2 : 0.8}
      strokeLinejoin="round"
      onPress={() => onSelect(muscleKey)}
    />
  );
}

export function BodyBackSvg({ getFillColor, selectedMuscle, onSelectMuscle }: BodyBackSvgProps) {
  return (
    <Svg width="220" height="380" viewBox="0 0 200 380">
      {/* Body Silhouette Base Background */}
      <G opacity={0.15}>
        <Circle cx="100" cy="35" r="18" fill={colors.white} />
        <Path d="M 80 50 L 120 50 L 140 80 L 148 150 L 142 200 L 130 220 L 130 360 L 110 360 L 100 240 L 90 360 L 70 360 L 70 220 L 58 200 L 52 150 L 60 80 Z" fill={colors.white} />
      </G>

      {/* Head Base */}
      <Circle cx="100" cy="35" r="18" fill="#1A1A1A" stroke={colors.dark.border.default} strokeWidth="1" />

      {/* Traps (Back - Large Diamond) */}
      <MuscleSegment
        muscleKey="traps"
        d="M 100 52 L 76 75 L 100 135 L 124 75 Z"
        fillColor={getFillColor('traps')}
        isSelected={selectedMuscle === 'traps'}
        onSelect={onSelectMuscle}
      />

      {/* Shoulders (Deltoids Back) */}
      <MuscleSegment
        muscleKey="shoulders"
        d="M 72 75 C 60 78 50 90 52 108 C 55 118 64 120 70 108 C 74 100 76 88 72 75 Z"
        fillColor={getFillColor('shoulders')}
        isSelected={selectedMuscle === 'shoulders'}
        onSelect={onSelectMuscle}
      />
      <MuscleSegment
        muscleKey="shoulders"
        d="M 128 75 C 140 78 150 90 148 108 C 145 118 136 120 130 108 C 126 100 124 88 128 75 Z"
        fillColor={getFillColor('shoulders')}
        isSelected={selectedMuscle === 'shoulders'}
        onSelect={onSelectMuscle}
      />

      {/* Triceps (Back of arms) */}
      <MuscleSegment
        muscleKey="triceps"
        d="M 52 110 C 46 122 46 142 54 152 C 60 145 64 130 68 110 Z"
        fillColor={getFillColor('triceps')}
        isSelected={selectedMuscle === 'triceps'}
        onSelect={onSelectMuscle}
      />
      <MuscleSegment
        muscleKey="triceps"
        d="M 148 110 C 154 122 154 142 146 152 C 140 145 136 130 132 110 Z"
        fillColor={getFillColor('triceps')}
        isSelected={selectedMuscle === 'triceps'}
        onSelect={onSelectMuscle}
      />

      {/* Forearms (Back) */}
      <MuscleSegment
        muscleKey="forearms"
        d="M 53 155 C 44 172 40 198 47 218 C 53 218 57 200 60 178 C 61 168 59 160 53 155 Z"
        fillColor={getFillColor('forearms')}
        isSelected={selectedMuscle === 'forearms'}
        onSelect={onSelectMuscle}
      />
      <MuscleSegment
        muscleKey="forearms"
        d="M 147 155 C 156 172 160 198 153 218 C 147 218 143 200 140 178 C 139 168 141 160 147 155 Z"
        fillColor={getFillColor('forearms')}
        isSelected={selectedMuscle === 'forearms'}
        onSelect={onSelectMuscle}
      />

      {/* Lats (Latissimus Dorsi) */}
      <MuscleSegment
        muscleKey="lats"
        d="M 75 105 L 100 132 L 100 170 L 80 170 Q 72 140 75 105 Z"
        fillColor={getFillColor('lats')}
        isSelected={selectedMuscle === 'lats'}
        onSelect={onSelectMuscle}
      />
      <MuscleSegment
        muscleKey="lats"
        d="M 125 105 L 100 132 L 100 170 L 120 170 Q 128 140 125 105 Z"
        fillColor={getFillColor('lats')}
        isSelected={selectedMuscle === 'lats'}
        onSelect={onSelectMuscle}
      />

      {/* Lower Back */}
      <MuscleSegment
        muscleKey="lower_back"
        d="M 80 172 H 120 V 190 H 80 Z"
        fillColor={getFillColor('lower_back')}
        isSelected={selectedMuscle === 'lower_back'}
        onSelect={onSelectMuscle}
      />

      {/* Glutes */}
      <MuscleSegment
        muscleKey="glutes"
        d="M 72 192 Q 85 188 100 196 L 98 232 Q 82 232 72 222 C 70 212 70 202 72 192 Z"
        fillColor={getFillColor('glutes')}
        isSelected={selectedMuscle === 'glutes'}
        onSelect={onSelectMuscle}
      />
      <MuscleSegment
        muscleKey="glutes"
        d="M 128 192 Q 115 188 100 196 L 102 232 Q 118 232 128 222 C 130 212 130 202 128 192 Z"
        fillColor={getFillColor('glutes')}
        isSelected={selectedMuscle === 'glutes'}
        onSelect={onSelectMuscle}
      />

      {/* Hamstrings */}
      <MuscleSegment
        muscleKey="hamstrings"
        d="M 72 234 L 98 234 L 95 286 L 75 286 Z"
        fillColor={getFillColor('hamstrings')}
        isSelected={selectedMuscle === 'hamstrings'}
        onSelect={onSelectMuscle}
      />
      <MuscleSegment
        muscleKey="hamstrings"
        d="M 128 234 L 102 234 L 105 286 L 125 286 Z"
        fillColor={getFillColor('hamstrings')}
        isSelected={selectedMuscle === 'hamstrings'}
        onSelect={onSelectMuscle}
      />

      {/* Calves (Back) */}
      <MuscleSegment
        muscleKey="calves"
        d="M 75 288 L 93 288 L 88 355 L 78 355 Z"
        fillColor={getFillColor('calves')}
        isSelected={selectedMuscle === 'calves'}
        onSelect={onSelectMuscle}
      />
      <MuscleSegment
        muscleKey="calves"
        d="M 125 288 L 107 288 L 112 355 L 122 355 Z"
        fillColor={getFillColor('calves')}
        isSelected={selectedMuscle === 'calves'}
        onSelect={onSelectMuscle}
      />
    </Svg>
  );
}
