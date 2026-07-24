import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Svg, { Path, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface BarChartProps {
  data: { date: string; volume: number }[];
  accentColor?: string;
  gradientId?: string;
  emptyMessage?: string;
}

export function BarChart({
  data,
  accentColor = colors.dark.accent.info, // default to blue for volume
  gradientId = 'barGrad',
  emptyMessage = 'No data available'
}: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - spacing.md * 4;
  const chartHeight = 160;
  const padding = { top: 15, right: 15, bottom: 25, left: 40 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const values = data.map(d => d.volume);
  const maxValue = Math.max(...values, 100); // Default to at least 100 for scale
  const minValue = 0;

  const barCount = data.length;
  const spacingBetween = 10;
  const totalSpacing = spacingBetween * (barCount - 1);
  const barWidth = Math.max(8, (innerWidth - totalSpacing) / barCount);

  // Helper to generate a SVG path for a bar with rounded top corners
  const getBarPath = (x: number, y: number, w: number, h: number, r: number) => {
    if (h <= 0) return '';
    const radius = Math.min(r, w / 2, h);
    return `
      M ${x} ${y + h}
      L ${x} ${y + radius}
      A ${radius} ${radius} 0 0 1 ${x + radius} ${y}
      L ${x + w - radius} ${y}
      A ${radius} ${radius} 0 0 1 ${x + w} ${y + radius}
      L ${x + w} ${y + h}
      Z
    `;
  };

  // Group labels formatting (e.g. 1000 -> 1k)
  const formatYValue = (val: number) => {
    if (val >= 1000) {
      return (val / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return val.toString();
  };

  const labelInterval = Math.max(1, Math.floor(data.length / 5));

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={accentColor} stopOpacity="1.0" />
            <Stop offset="100%" stopColor={accentColor} stopOpacity="0.4" />
          </LinearGradient>
        </Defs>

        {/* Y Axis Grid Lines & Labels */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding.top + innerHeight - ratio * innerHeight;
          const val = Math.round(minValue + ratio * (maxValue - minValue));
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
                x={padding.left - 8}
                y={y + 4}
                fill={colors.dark.text.secondary}
                fontSize="9"
                fontWeight="bold"
                textAnchor="end"
              >
                {formatYValue(val)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* X Axis Line */}
        <Line
          x1={padding.left}
          y1={padding.top + innerHeight}
          x2={chartWidth - padding.right}
          y2={padding.top + innerHeight}
          stroke={colors.dark.border.default}
        />

        {/* Bars and X Labels */}
        {data.map((d, index) => {
          const barHeightValue = ((d.volume - minValue) / (maxValue - minValue)) * innerHeight;
          const x = padding.left + index * (barWidth + spacingBetween);
          const y = padding.top + innerHeight - barHeightValue;

          const showLabel = index % labelInterval === 0 || index === data.length - 1;

          return (
            <React.Fragment key={`bar-${index}`}>
              {barHeightValue > 0 && (
                <Path
                  d={getBarPath(x, y, barWidth, barHeightValue, 4)}
                  fill={`url(#${gradientId})`}
                />
              )}

              {showLabel && (
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight - 8}
                  fill={colors.dark.text.secondary}
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {d.date}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  emptyContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.dark.text.tertiary,
    fontSize: typography.fontSize.sm,
  }
});
