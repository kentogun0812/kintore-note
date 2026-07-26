import React from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart as GiftedLineChart } from 'react-native-gifted-charts';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { useTranslation } from 'react-i18next';
import { useProgressChart, MetricType } from '@/hooks/use-progress-chart';
import { TimeRange, WorkoutsTrendPoint, VolumeTrendPoint } from '@/store/analytics.store';

interface ProgressChartProps {
  workoutsTrend: WorkoutsTrendPoint[];
  volumeTrend: VolumeTrendPoint[];
  timeRange: TimeRange;
  emptyMessage?: string;
}

export function ProgressChart({
  workoutsTrend,
  volumeTrend,
  timeRange,
  emptyMessage = 'No data available',
}: ProgressChartProps) {
  const { t } = useTranslation();
  const {
    activeMetric,
    setActiveMetric,
    chartData,
    startDate,
    endDate,
    maxValue,
    accentColor,
    yAxisUnit,
    tooltipUnit,
    noOfSections,
    formatYLabel,
  } = useProgressChart({ workoutsTrend, volumeTrend, timeRange });

  if (!chartData || chartData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - spacing.md * 4;

  const yAxisLabelWidth = 32;
  const yAxisUnitWidth = 20;
  const rightPadding = 10;
  const innerChartWidth = chartWidth - yAxisUnitWidth - yAxisLabelWidth - rightPadding;

  const calculatedSpacing = Math.max(innerChartWidth / Math.max(chartData.length - 1, 1), 10);

  return (
    <View style={styles.container}>
      {/* Metric Selector Legend */}
      <View style={styles.legendContainer}>
        {(['sessions', 'volume'] as MetricType[]).map((metric) => {
          const isActive = activeMetric === metric;
          const metricColor = metric === 'sessions' ? colors.dark.accent.primary : colors.dark.accent.info;
          return (
            <TouchableOpacity
              key={metric}
              style={[
                styles.legendItem,
                !isActive && styles.legendItemInactive,
              ]}
              onPress={() => setActiveMetric(metric)}
              activeOpacity={0.8}
            >
              <View style={[styles.legendColorBox, { backgroundColor: metricColor }]} />
              <Text style={styles.legendText}>
                {t(`stats.metrics.${metric}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Line Chart */}
      <View style={styles.rowContainer}>
        {yAxisUnit && (
          <View style={styles.yAxisUnitContainer}>
            <Text style={styles.yAxisUnit} numberOfLines={1}>
              {yAxisUnit}
            </Text>
          </View>
        )}
        <View style={styles.chartWrapper}>
          <GiftedLineChart
            data={chartData}
            width={innerChartWidth}
            height={120}
            maxValue={maxValue}
            noOfSections={noOfSections}
            formatYLabel={formatYLabel}
            yAxisLabelWidth={yAxisLabelWidth}
            color={accentColor}
            thickness={3}
            dataPointsRadius={4}
            dataPointsColor={colors.dark.bg.secondary}
            customDataPoint={() => {
              return (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: colors.dark.bg.secondary,
                    borderWidth: 2,
                    borderColor: accentColor,
                    borderRadius: 4,
                  }}
                />
              );
            }}
            startFillColor={accentColor}
            endFillColor={accentColor}
            startOpacity={0.4}
            endOpacity={0.0}
            areaChart
            hideRules
            yAxisColor={colors.dark.border.default}
            xAxisColor={colors.dark.border.default}
            yAxisTextStyle={{ color: colors.dark.text.secondary, fontSize: 10, fontWeight: 'bold' }}
            xAxisLabelTextStyle={{ 
              color: colors.dark.text.secondary, 
              fontSize: 9, 
              fontWeight: 'bold',
              textAlign: 'center'
            }}
            hideYAxisText={false}
            spacing={calculatedSpacing}
            initialSpacing={0}
            endSpacing={0}
            hideDataPoints={chartData.length > 15}
            isAnimated
            animateOnDataChange
            animationDuration={400}
            pointerConfig={{
              pointerStripUptoDataPoint: true,
              pointerStripColor: accentColor,
              pointerStripWidth: 2,
              strokeDashArray: [2, 5],
              pointerColor: colors.dark.bg.secondary,
              radius: 5,
              pointerLabelWidth: 100,
              pointerLabelHeight: 50,
              activatePointersOnLongPress: false,
              pointerVanishDelay: 200,
              pointerLabelComponent: (items: any) => {
                if (!items || items.length === 0) return null;
                const item = items[0];
                return (
                  <View style={styles.tooltipContainer}>
                    <Text style={styles.tooltipDate}>{item.date}</Text>
                    <Text style={[styles.tooltipValue, { color: accentColor }]}>
                      {item.value.toLocaleString()} {tooltipUnit}
                    </Text>
                  </View>
                );
              },
            }}
          />
          {/* Custom X-Axis Labels aligned perfectly to the display range */}
          {chartData.length > 0 && (
            <View style={{
              position: 'absolute',
              bottom: 0,
              left: yAxisLabelWidth,
              width: innerChartWidth,
              flexDirection: 'row',
              justifyContent: 'space-between',
              pointerEvents: 'none',
            }}>
              <Text style={{ color: colors.dark.text.secondary, fontSize: 10, fontWeight: 'bold' }}>
                {startDate}
              </Text>
              <Text style={{ color: colors.dark.text.secondary, fontSize: 10, fontWeight: 'bold' }}>
                {endDate}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    width: '100%',
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
    marginBottom: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  legendItemInactive: {
    opacity: 0.4,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  yAxisUnitContainer: {
    width: 10,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  yAxisUnit: {
    color: colors.dark.text.secondary,
    fontSize: 10,
    fontWeight: 'bold',
    width: 100,
    textAlign: 'center',
  },
  chartWrapper: {
    flex: 1,
    marginTop: 10,
    overflow: 'visible',
  },
  emptyContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.dark.text.tertiary,
    fontSize: typography.fontSize.sm,
  },
  tooltipContainer: {
    padding: 6,
    backgroundColor: 'rgba(23, 23, 28, 0.95)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    marginLeft: -50,
    marginTop: -25,
  },
  tooltipDate: {
    color: colors.dark.text.secondary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  tooltipValue: {
    fontSize: 11,
    fontWeight: 'heavy',
    marginTop: 2,
  },
});
