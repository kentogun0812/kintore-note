import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { LineChart as GiftedLineChart } from 'react-native-gifted-charts';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface LineChartProps {
  data: { date: string; count: number }[];
  accentColor?: string;
  emptyMessage?: string;
  yAxisUnit?: string;
  xAxisUnit?: string;
}

export function LineChart({
  data,
  accentColor = colors.dark.accent.primary,
  emptyMessage = 'No data available',
  yAxisUnit,
  xAxisUnit
}: LineChartProps) {
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
  
  const chartData = data.map((d, index) => ({
    value: d.count,
    label: (index % labelInterval === 0 || index === data.length - 1) ? d.date : '',
  }));

  const maxValue = Math.max(...data.map(d => d.count), 5);
  
  const yAxisLabelWidth = 30;
  const yAxisUnitWidth = 16;
  const rightPadding = 10;
  const innerChartWidth = chartWidth - yAxisUnitWidth - yAxisLabelWidth - rightPadding;

  const calculatedSpacing = Math.max(innerChartWidth / Math.max(data.length - 1, 1), 10);

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
          <GiftedLineChart
            data={chartData}
            width={innerChartWidth}
            height={120}
            maxValue={maxValue}
            noOfSections={2}
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
            xAxisLabelTextStyle={{ color: colors.dark.text.secondary, fontSize: 9, fontWeight: 'bold' }}
            hideYAxisText={false}
            spacing={calculatedSpacing}
            initialSpacing={10}
            hideDataPoints={data.length > 15}
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
    marginLeft: 30,
  }
});
