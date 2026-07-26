import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { BarChart as GiftedBarChart } from 'react-native-gifted-charts';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface BarChartProps {
  data: { date: string; volume: number }[];
  accentColor?: string;
  emptyMessage?: string;
  yAxisUnit?: string;
  xAxisUnit?: string;
}

export function BarChart({
  data,
  accentColor = colors.dark.accent.info,
  emptyMessage = 'No data available',
  yAxisUnit,
  xAxisUnit
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

  const labelInterval = Math.max(1, Math.floor(data.length / 5));
  
  const formatYValue = (val: number) => {
    if (val >= 1000) {
      return (val / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return val.toString();
  };

  const chartData = data.map((d, index) => ({
    value: d.volume,
    label: (index % labelInterval === 0 || index === data.length - 1) ? d.date : '',
    frontColor: accentColor,
  }));

  const maxValue = Math.max(...data.map(d => d.volume), 100);

  const yAxisLabelWidth = 32;
  const yAxisUnitWidth = 16;
  const rightPadding = 10;
  const innerChartWidth = chartWidth - yAxisUnitWidth - yAxisLabelWidth - rightPadding;

  const barWidth = Math.max(8, innerChartWidth / Math.max(data.length, 1) - 10);
  const calculatedSpacing = Math.max(innerChartWidth / Math.max(data.length, 1) - barWidth, 10);

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        {yAxisUnit && (
          <View style={styles.yAxisUnitContainer}>
            <Text style={styles.yAxisUnit} numberOfLines={1}>
              {yAxisUnit}
            </Text>
          </View>
        )}
        <View style={styles.chartWrapper}>
          <GiftedBarChart
            data={chartData}
            width={innerChartWidth}
            height={120}
            maxValue={maxValue}
            noOfSections={2}
            yAxisLabelWidth={yAxisLabelWidth}
            frontColor={accentColor}
            barBorderRadius={4}
            hideRules
            yAxisColor={colors.dark.border.default}
            xAxisColor={colors.dark.border.default}
            yAxisTextStyle={{ color: colors.dark.text.secondary, fontSize: 10, fontWeight: 'bold' }}
            xAxisLabelTextStyle={{ color: colors.dark.text.secondary, fontSize: 9, fontWeight: 'bold' }}
            formatYLabel={(val: string) => formatYValue(Number(val))}
            spacing={calculatedSpacing}
            initialSpacing={10}
            barWidth={barWidth}
          />
          {xAxisUnit && (
            <Text style={styles.xAxisUnit}>{xAxisUnit}</Text>
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
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  yAxisUnitContainer: {
    width: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 120,
  },
  yAxisUnit: {
    color: colors.dark.text.secondary,
    fontSize: 10,
    fontWeight: 'bold',
    transform: [{ rotate: '-90deg' }],
    width: 120,
    textAlign: 'center',
  },
  chartWrapper: {
    flex: 1,
    marginTop: 10,
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
  xAxisUnit: {
    color: colors.dark.text.secondary,
    fontSize: 10,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginLeft: 32,
  }
});
