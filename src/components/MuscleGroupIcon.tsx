import React from 'react';
import Svg, { Path, Line, Rect, Circle, G } from 'react-native-svg';
import { colors } from '@/constants/colors';

export interface MuscleGroupIconProps {
  id: string;
  size?: number;
  color?: string;
}

export const MuscleGroupIcon: React.FC<MuscleGroupIconProps> = ({
  id,
  size = 24,
  color = colors.dark.text.primary,
}) => {
  const sw = 2.5; // Thicker lines matching the sample style
  const strokeColor = color;
  const baseColor = '#9ea7ba'; // Slate purple-grey from sample
  const highlightColor = '#ff0044'; // Neon red from sample
  const secondaryColor = '#ff804e'; // Peach orange from sample

  switch (id) {
    case 'mg-shoulders':
    case 'mg-back': {
      const isShoulders = id === 'mg-shoulders';
      const isBack = id === 'mg-back';
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          {/* Arms (Left & Right) */}
          <Path d="M16 45c-4 13-8 27-8 29c4 10 10 10 12 0c2-9 3-20 5-30z" fill={baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M84 45c4 13 8 27 8 29c-4 10-10 10-12 0c-2-9-3-20-5-30z" fill={baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />

          {/* Neck & Head Joint */}
          <Path d="M43 4h14l1 12l-8 8l-8-8z" fill={baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
          
          {/* Traps (Left & Right) */}
          <Path d="M50 16L38 24l-4 20L50 52z" fill={baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M50 16l12 8l4 20L50 52z" fill={baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />

          {/* Deltoids (Shoulders) - Highlighted in Red if mg-shoulders */}
          <Path d="M38 24c-10 0-21 6-22 21c1 3 2 6 2 6l9-7z" fill={isShoulders ? highlightColor : baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M62 24c10 0 21 6 22 21c-1 3-2 6-2 6l-9-7z" fill={isShoulders ? highlightColor : baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />

          {/* Lats (Left & Right) - Highlighted in Red if mg-back */}
          <Path d="M26 50l24 15l-16 15c-7-8-8-20-8-30z" fill={isBack ? highlightColor : baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M74 50L50 65l16 15c7-8 8-20 8-30z" fill={isBack ? highlightColor : baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />

          {/* Lower Back (Erector Spinae) - Highlighted in Red/Orange if mg-back */}
          <Path d="M50 65L34 80l0 12c6 4 11 4 16 4z" fill={isBack ? highlightColor : baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M50 65l16 10v17c-6-4-11-4-16-4z" fill={isBack ? highlightColor : baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />

          {/* Spine Center Line */}
          <Line x1={50} y1={16} x2={50} y2={96} stroke={strokeColor} strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    }

    case 'mg-legs':
    case 'mg-glutes': {
      const isLegs = id === 'mg-legs';
      const isGlutes = id === 'mg-glutes';
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          {/* Hips & Waist Base */}
          <Path d="M20 10h60l2 15c-4 5-14 7-32 7s-28-2-32-7z" fill={baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
          
          {/* Outer Thighs */}
          <Path d="M18 25l2 40c-4-10-3-25-2-40z" fill={isLegs ? secondaryColor : baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M82 25l-2 40c4-10 3-25 2-40z" fill={isLegs ? secondaryColor : baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />

          {/* Quads (Thighs) - Highlighted in Red if mg-legs */}
          <Path d="M20 25c4-3 20-3 25 0l3 40c-8 5-24 5-28 0z" fill={isLegs ? highlightColor : baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M80 25c-4-3-20-3-25 0l-3 40c8 5 24 5 28 0z" fill={isLegs ? highlightColor : baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />

          {/* Inner Thighs / Glutes - Highlighted in Red if mg-glutes */}
          <Path d="M45 25l5-5l3 45z" fill={isGlutes ? highlightColor : baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M55 25l-5-5l-3 45z" fill={isGlutes ? highlightColor : baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    }

    case 'mg-arms':
    case 'mg-forearms': {
      const isArms = id === 'mg-arms';
      const isForearms = id === 'mg-forearms';
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          {/* Base Arm Outline */}
          <Path d="M10 20c5-5 20-5 25 0l-3 25c-7 3-17 0-22-5z" fill={baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
          
          {/* Bicep - Highlighted in Red if mg-arms */}
          <Path d="M35 20c10-5 20 5 23 15l-16 10c-4-10-6-17-7-25z" fill={isArms ? highlightColor : baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
          
          {/* Tricep - Highlighted in Orange if mg-arms */}
          <Path d="M25 45c7 10 20 10 23 0l-6 0z" fill={isArms ? secondaryColor : baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
          
          {/* Forearm - Highlighted in Red if mg-forearms */}
          <Path d="M58 35c10-5 22 5 27 20c-10 10-23 5-33-10z" fill={isForearms ? highlightColor : baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    }

    case 'mg-chest':
    case 'mg-core': {
      const isChest = id === 'mg-chest';
      const isCore = id === 'mg-core';
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          {/* Front Torso Outline */}
          <Path d="M20 20c0-6 10-10 30-10s30 4 30 10l3 30c0 10-10 15-33 15S17 60 17 50z" fill={baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
          
          {/* Pectorals (Chest) - Highlighted in Red if mg-chest */}
          <Path d="M23 22c5-3 12-3 17 0v12c-5 3-12 3-17 0z" fill={isChest ? highlightColor : baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M77 22c-5-3-12-3-17 0v12c5 3 12 3 17 0z" fill={isChest ? highlightColor : baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
          
          {/* Abs (6 Pack) - Highlighted in Red if mg-core */}
          <G fill={isCore ? highlightColor : baseColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round">
            <Rect x={38} y={38} width={10} height={6} rx={1} />
            <Rect x={52} y={38} width={10} height={6} rx={1} />
            <Rect x={38} y={48} width={10} height={6} rx={1} />
            <Rect x={52} y={48} width={10} height={6} rx={1} />
            <Rect x={38} y={58} width={10} height={6} rx={1} />
            <Rect x={52} y={58} width={10} height={6} rx={1} />
          </G>
        </Svg>
      );
    }

    case 'mg-fullbody':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          {/* Stylized Human Figure */}
          <Circle cx={50} cy={15} r={8} fill={highlightColor} stroke={strokeColor} strokeWidth={sw} />
          <Path d="M30 35c0-5 10-5 20-5s20 0 20 5l3 25l-10-3v25H55V62H45v20H37V57l-10 3z" fill={highlightColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );

    case 'mg-cardio':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          {/* Heart Shape */}
          <Path d="M50 82s-30-18-30-36c0-10 8-15 15-15c7 0 12 6 15 12c3-6 8-12 15-12c7 0 15 5 15 15c0 18-30 36-30 36z" fill={highlightColor} stroke={strokeColor} strokeWidth={sw} strokeLinejoin="round" />
          <Path d="M28 46h7l3-10l5 20l3-10h6" stroke={baseColor} strokeWidth={sw + 1} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Path d="M10 50h80 M20 30v40 M30 20v60 M80 30v40 M70 20v60" stroke={strokeColor} strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
  }
};
