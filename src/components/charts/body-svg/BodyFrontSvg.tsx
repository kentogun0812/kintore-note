import React from 'react';
import Svg, { G, Circle, Path } from 'react-native-svg';
import Animated, { useAnimatedProps, withTiming } from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { SvgMuscleKey } from '@/utils/muscleHeatmap';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface BodyFrontSvgProps {
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

export function BodyFrontSvg({ getFillColor, selectedMuscle, onSelectMuscle }: BodyFrontSvgProps) {
  return (
    <Svg width="220" height="380" viewBox="0 0 200 380">
      {/* Body Silhouette Base Background */}
      <G opacity={0.15}>
        <Circle cx="100" cy="35" r="18" fill={colors.white} />
        {/* Torso Base */}
        <Path d="M 80 50 L 120 50 L 140 80 L 148 150 L 142 200 L 130 220 L 130 360 L 110 360 L 100 240 L 90 360 L 70 360 L 70 220 L 58 200 L 52 150 L 60 80 Z" fill={colors.white} />
      </G>

      {/* Head & Neck Base */}
      <Circle cx="100" cy="35" r="18" fill="#1A1A1A" stroke={colors.dark.border.default} strokeWidth="1" />

      {/* Traps (Front / Neck) */}
      <MuscleSegment
        muscleKey="traps"
        d="M 88 50 Q 92 65 75 75 C 78 68 82 58 88 50 Z"
        fillColor={getFillColor('traps')}
        isSelected={selectedMuscle === 'traps'}
        onSelect={onSelectMuscle}
      />
      <MuscleSegment
        muscleKey="traps"
        d="M 112 50 Q 108 65 125 75 C 122 68 118 58 112 50 Z"
        fillColor={getFillColor('traps')}
        isSelected={selectedMuscle === 'traps'}
        onSelect={onSelectMuscle}
      />

      {/* Shoulders (Deltoids) */}
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

      {/* Chest (Pectoralis) */}
      <MuscleSegment
        muscleKey="chest"
        d="M 73 80 Q 86 78 99 85 L 99 116 Q 81 116 73 108 Z"
        fillColor={getFillColor('chest')}
        isSelected={selectedMuscle === 'chest'}
        onSelect={onSelectMuscle}
      />
      <MuscleSegment
        muscleKey="chest"
        d="M 127 80 Q 114 78 101 85 L 101 116 Q 119 116 127 108 Z"
        fillColor={getFillColor('chest')}
        isSelected={selectedMuscle === 'chest'}
        onSelect={onSelectMuscle}
      />

      {/* Biceps */}
      <MuscleSegment
        muscleKey="biceps"
        d="M 52 110 C 46 122 46 142 54 152 C 60 145 64 130 68 110 Z"
        fillColor={getFillColor('biceps')}
        isSelected={selectedMuscle === 'biceps'}
        onSelect={onSelectMuscle}
      />
      <MuscleSegment
        muscleKey="biceps"
        d="M 148 110 C 154 122 154 142 146 152 C 140 145 136 130 132 110 Z"
        fillColor={getFillColor('biceps')}
        isSelected={selectedMuscle === 'biceps'}
        onSelect={onSelectMuscle}
      />

      {/* Forearms */}
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

      {/* Abs (Rectus Abdominis) */}
      <MuscleSegment
        muscleKey="abs"
        d="M 80 120 L 98 120 L 98 178 L 80 178 Z M 102 120 L 120 120 L 120 178 L 102 178 Z"
        fillColor={getFillColor('abs')}
        isSelected={selectedMuscle === 'abs'}
        onSelect={onSelectMuscle}
      />

      {/* Obliques */}
      <MuscleSegment
        muscleKey="obliques"
        d="M 70 120 H 78 V 178 H 68 C 66 160 66 140 70 120 Z"
        fillColor={getFillColor('obliques')}
        isSelected={selectedMuscle === 'obliques'}
        onSelect={onSelectMuscle}
      />
      <MuscleSegment
        muscleKey="obliques"
        d="M 130 120 H 122 V 178 H 132 C 134 160 134 140 130 120 Z"
        fillColor={getFillColor('obliques')}
        isSelected={selectedMuscle === 'obliques'}
        onSelect={onSelectMuscle}
      />

      {/* Quads (Quadriceps) */}
      <MuscleSegment
        muscleKey="quads"
        d="M 72 190 Q 85 185 98 190 L 96 278 Q 80 273 72 260 C 68 245 68 205 72 190 Z"
        fillColor={getFillColor('quads')}
        isSelected={selectedMuscle === 'quads'}
        onSelect={onSelectMuscle}
      />
      <MuscleSegment
        muscleKey="quads"
        d="M 128 190 Q 115 185 102 190 L 104 278 Q 120 273 128 260 C 132 245 132 205 128 190 Z"
        fillColor={getFillColor('quads')}
        isSelected={selectedMuscle === 'quads'}
        onSelect={onSelectMuscle}
      />

      {/* Calves (Front / Shins) */}
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
