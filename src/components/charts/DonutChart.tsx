import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { useTranslation } from 'react-i18next';

interface DonutChartData {
  id: string;
  nameEn: string;
  nameJa: string;
  count: number;
  percentage: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  emptyMessage?: string;
}

export function DonutChart({
  data,
  emptyMessage = 'No data available'
}: DonutChartProps) {
  const { i18n } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  // Filter out 0% slices
  const activeSlices = data.filter(d => d.percentage > 0).slice(0, 5); // top 5
  if (activeSlices.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  const chartSize = 140;
  const strokeWidth = 14;
  const radius = (chartSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = chartSize / 2;

  // Calculate cumulative percentages for rotation
  let cumulativePercentage = 0;

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <Svg width={chartSize} height={chartSize}>
          {/* Base Background Circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.dark.border.subtle}
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Stacking Slices */}
          {activeSlices.map((slice, index) => {
            const strokeDashoffset = circumference - (slice.percentage / 100) * circumference;
            const rotationAngle = -90 + (cumulativePercentage * 360) / 100;
            cumulativePercentage += slice.percentage;

            return (
              <Circle
                key={`slice-${slice.id}-${index}`}
                cx={center}
                cy={center}
                r={radius}
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                transform={`rotate(${rotationAngle} ${center} ${center})`}
              />
            );
          })}

          {/* Center Label text */}
          <Circle
            cx={center}
            cy={center}
            r={radius - strokeWidth / 2 - 2}
            fill={colors.dark.bg.tertiary}
          />
          <SvgText
            x={center}
            y={center - 2}
            fill={colors.dark.text.primary}
            fontSize="11"
            fontWeight="heavy"
            textAnchor="middle"
          >
            {i18n.language === 'ja' ? activeSlices[0].nameJa : activeSlices[0].nameEn}
          </SvgText>
          <SvgText
            x={center}
            y={center + 12}
            fill={colors.dark.text.secondary}
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            {activeSlices[0].percentage}%
          </SvgText>
        </Svg>
      </View>

      {/* Legend list on the right */}
      <View style={styles.legendContainer}>
        {activeSlices.map((slice, index) => (
          <View key={`leg-${slice.id}-${index}`} style={styles.legendRow}>
            <View style={[styles.colorIndicator, { backgroundColor: slice.color }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {i18n.language === 'ja' ? slice.nameJa : slice.nameEn}
            </Text>
            <Text style={styles.legendPercent}>
              {slice.percentage}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.xs,
    marginVertical: 4,
  },
  chartWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flex: 1,
    marginLeft: spacing.lg,
    gap: spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  colorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  legendLabel: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  legendPercent: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'heavy',
    color: colors.dark.text.secondary,
    marginLeft: spacing.xs,
  },
  emptyContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  emptyText: {
    color: colors.dark.text.tertiary,
    fontSize: typography.fontSize.sm,
  }
});
