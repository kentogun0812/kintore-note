import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Polyline, Line, Text as SvgText, Circle } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { ChartDataPoint } from '@/store/analytics.store';

interface VolumeChartProps {
  data: ChartDataPoint[];
}

export function VolumeChart({ data }: VolumeChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available for this period.</Text>
      </View>
    );
  }

  const chartWidth = 300;
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Find min/max
  const maxVolume = Math.max(...data.map(d => d.volume), 10); // Ensure at least 10 to avoid division by zero
  const minVolume = 0; // Start Y at 0

  // Points calculation
  const points = data.map((d, index) => {
    const x = padding.left + (index / Math.max(data.length - 1, 1)) * innerWidth;
    const y = padding.top + innerHeight - ((d.volume - minVolume) / (maxVolume - minVolume)) * innerHeight;
    return { x, y, volume: d.volume, date: d.date };
  });

  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Y Axis Grid Lines & Labels */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding.top + innerHeight - (ratio * innerHeight);
          const val = Math.round(minVolume + ratio * (maxVolume - minVolume));
          return (
            <React.Fragment key={`grid-y-${i}`}>
              <Line 
                x1={padding.left} 
                y1={y} 
                x2={chartWidth - padding.right} 
                y2={y} 
                stroke={colors.dark.border.subtle} 
                strokeDasharray="4, 4" 
              />
              <SvgText 
                x={padding.left - 10} 
                y={y + 4} 
                fill={colors.dark.text.secondary} 
                fontSize="10" 
                textAnchor="end"
              >
                {val}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* X Axis Line */}
        <Line 
          x1={padding.left} 
          y1={chartHeight - padding.bottom} 
          x2={chartWidth - padding.right} 
          y2={chartHeight - padding.bottom} 
          stroke={colors.dark.border.default} 
        />

        {/* X Axis Labels (First and Last only to avoid clutter) */}
        {points.length > 0 && (
          <SvgText 
            x={points[0].x} 
            y={chartHeight - 10} 
            fill={colors.dark.text.secondary} 
            fontSize="10" 
            textAnchor="middle"
          >
            {points[0].date.substring(5)} {/* MM-DD */}
          </SvgText>
        )}
        {points.length > 1 && (
          <SvgText 
            x={points[points.length - 1].x} 
            y={chartHeight - 10} 
            fill={colors.dark.text.secondary} 
            fontSize="10" 
            textAnchor="middle"
          >
            {points[points.length - 1].date.substring(5)}
          </SvgText>
        )}

        {/* Data Line */}
        <Polyline 
          points={pointsString} 
          fill="none" 
          stroke={colors.dark.accent.primary} 
          strokeWidth="3" 
        />

        {/* Data Points */}
        {points.map((p, i) => (
          <Circle 
            key={`point-${i}`} 
            cx={p.x} 
            cy={p.y} 
            r="4" 
            fill={colors.dark.bg.primary} 
            stroke={colors.dark.accent.primary} 
            strokeWidth="2" 
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.dark.text.tertiary,
    fontSize: typography.fontSize.sm,
  }
});
