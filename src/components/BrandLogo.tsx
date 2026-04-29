import React from 'react';
import Svg, { G, Rect, Polygon, Text } from 'react-native-svg';

interface BrandLogoProps {
  width?: number;
  height?: number;
}

export function BrandLogo({ width = 120, height = 120 }: BrandLogoProps) {
  return (
    <Svg viewBox="0 0 240 240" width={width} height={height}>
      <G x={120} y={95}>
        <Rect x={-62} y={-6} width={124} height={12} rx={2} fill="#E54D42" />
        
        <Polygon points="0,-34 29,-17 29,17 0,34 -29,17 -29,-17" fill="#E54D42" stroke="#E54D42" strokeWidth={4} strokeLinejoin="round" />
        
        {/* Left Weights */}
        <Rect x={-48} y={-26} width={10} height={52} rx={4} fill="#E54D42" />
        <Rect x={-58} y={-20} width={8} height={40} rx={3} fill="#E54D42" />
        
        {/* Right Weights */}
        <Rect x={38} y={-26} width={10} height={52} rx={4} fill="#E54D42" />
        <Rect x={50} y={-20} width={8} height={40} rx={3} fill="#E54D42" />
        
        <Text x={0} y={12} fill="#F5F5F5" fontSize={34} textAnchor="middle" fontWeight="900" fontFamily="System">筋</Text>
      </G>
      <Text x={120} y={160} fill="#F5F5F5" fontSize={28} letterSpacing={3} textAnchor="middle" fontWeight="900" fontFamily="System">筋トレノート</Text>
    </Svg>
  );
}
