import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TimeRange, WorkoutsTrendPoint, VolumeTrendPoint } from '@/store/analytics.store';
import { colors } from '@/constants/colors';

export type MetricType = 'sessions' | 'volume';

export interface UseProgressChartProps {
  workoutsTrend: WorkoutsTrendPoint[];
  volumeTrend: VolumeTrendPoint[];
  timeRange: TimeRange;
}

export interface UseProgressChartReturn {
  activeMetric: MetricType;
  setActiveMetric: (metric: MetricType) => void;
  chartData: any[];
  startDate: string;
  endDate: string;
  maxValue: number;
  accentColor: string;
  yAxisUnit: string;
  tooltipUnit: string;
  noOfSections: number;
  formatYLabel: (val: string) => string;
}

export function useProgressChart({ workoutsTrend, volumeTrend, timeRange }: UseProgressChartProps): UseProgressChartReturn {
  const { t, i18n } = useTranslation();
  const [activeMetric, setActiveMetric] = useState<MetricType>('sessions');
  const chartData = useMemo(() => {
    if (activeMetric === 'sessions') {
      return workoutsTrend.map((d) => ({
        value: d.count,
        date: d.date,
      }));
    } else {
      return volumeTrend.map((d) => ({
        value: d.volume,
        date: d.date,
      }));
    }
  }, [activeMetric, workoutsTrend, volumeTrend]);

  const startDate = chartData.length > 0 ? chartData[0].date : '';
  const endDate = chartData.length > 0 ? chartData[chartData.length - 1].date : '';

  const maxValue = useMemo(() => {
    if (activeMetric === 'sessions') {
      return Math.max(...workoutsTrend.map(d => d.count), 5);
    } else {
      return Math.max(...volumeTrend.map(d => d.volume), 100);
    }
  }, [activeMetric, workoutsTrend, volumeTrend]);

  const accentColor = useMemo(() => {
    return activeMetric === 'sessions' 
      ? colors.dark.accent.primary 
      : colors.dark.accent.info;
  }, [activeMetric]);

  const yAxisUnit = useMemo(() => {
    return activeMetric === 'sessions' 
      ? t('stats.unitWorkouts') 
      : t('stats.unitWeight');
  }, [activeMetric, t]);

  const tooltipUnit = useMemo(() => {
    return activeMetric === 'sessions'
      ? t('stats.tooltipWorkouts')
      : t('stats.tooltipWeight');
  }, [activeMetric, t]);

  const noOfSections = useMemo(() => {
    if (activeMetric === 'sessions') {
      return maxValue <= 10 ? maxValue : 5;
    }
    return 4;
  }, [activeMetric, maxValue]);

  const formatYLabel = useMemo(() => {
    return (val: string) => {
      const num = Number(val);
      if (activeMetric === 'sessions') {
        return Math.round(num).toString();
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1).replace('.0', '') + 'k';
      }
      return Math.round(num).toString();
    };
  }, [activeMetric]);

  return {
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
  };
}
