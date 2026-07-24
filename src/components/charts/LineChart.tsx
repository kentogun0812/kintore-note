import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Svg, { Path, Line, Text as SvgText, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface LineChartProps {
  data: { date: string; count: number }[];
  accentColor?: string;
  gradientId?: string;
  emptyMessage?: string;
}

export function LineChart({
  data,
  accentColor = colors.dark.accent.primary,
  gradientId = 'lineGrad',
  emptyMessage = 'No data available'
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - spacing.md * 4; // Screen width minus page padding and card padding
  const chartHeight = 160;
  const padding = { top: 15, right: 15, bottom: 25, left: 35 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const values = data.map(d => d.count);
  const maxValue = Math.max(...values, 5); // Default to at least 5 for scale
  const minValue = 0;

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x = padding.left + (index / Math.max(data.length - 1, 1)) * innerWidth;
    const y = padding.top + innerHeight - ((d.count - minValue) / (maxValue - minValue)) * innerHeight;
    return { x, y, value: d.count, label: d.date };
  });

  // Construct path string for the line
  let linePath = '';
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  }

  // Construct path string for the gradient fill area
  let areaPath = '';
  if (points.length > 0) {
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    areaPath = `${linePath} L ${lastPoint.x} ${padding.top + innerHeight} L ${firstPoint.x} ${padding.top + innerHeight} Z`;
  }

  // Choose which x-labels to show to prevent overlapping (max 6 labels)
  const labelInterval = Math.max(1, Math.floor(data.length / 5));
  const visibleXLabels = points.filter((_, idx) => idx % labelInterval === 0 || idx === points.length - 1);

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={accentColor} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
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
                fontSize="10"
                fontWeight="bold"
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
          y1={padding.top + innerHeight}
          x2={chartWidth - padding.right}
          y2={padding.top + innerHeight}
          stroke={colors.dark.border.default}
        />

        {/* X Axis Labels */}
        {visibleXLabels.map((p, i) => (
          <SvgText
            key={`lbl-x-${i}`}
            x={p.x}
            y={chartHeight - 8}
            fill={colors.dark.text.secondary}
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
          >
            {p.label}
          </SvgText>
        ))}

        {/* Gradient Area under the line */}
        {areaPath !== '' && (
          <Path d={areaPath} fill={`url(#${gradientId})`} />
        )}

        {/* The line itself */}
        {linePath !== '' && (
          <Path d={linePath} fill="none" stroke={accentColor} strokeWidth="3" />
        )}

        {/* Data Point Circles */}
        {points.length <= 15 && points.map((p, i) => (
          <Circle
            key={`point-${i}`}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={colors.dark.bg.secondary}
            stroke={accentColor}
            strokeWidth="2.5"
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
