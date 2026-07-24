import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { useTranslation } from 'react-i18next';
import { useAnalyticsStore, TimeRange } from '@/store/analytics.store';
import { MuscleHeatmap } from '@/components/charts/MuscleHeatmap';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { useState, useEffect, useRef } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

type ActiveTab = 'heatmap' | 'charts';

const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export default function StatsScreen() {
  const { t, i18n } = useTranslation();
  const {
    startDate,
    endDate,
    timeRange,
    heatmapData,
    workoutsTrend,
    volumeTrend,
    muscleSplit,
    setsRepsTrend,
    topExercises,
    streak,
    prs,
    isLoading,
    fetchAnalyticsData,
    setDateRange
  } = useAnalyticsStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('heatmap');

  // Custom picker modal states
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [showEndDateModal, setShowEndDateModal] = useState(false);

  const [selectedMonthYear, setSelectedMonthYear] = useState(() => {
    const today = new Date();
    try {
      const storeState = useAnalyticsStore.getState();
      if (storeState.timeRange === 'month' && storeState.startDate) {
        const parts = storeState.startDate.split('-');
        if (parts.length === 3) {
          return { year: parseInt(parts[0]), month: parseInt(parts[1]) - 1 };
        }
      }
    } catch (e) { }
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    try {
      const storeState = useAnalyticsStore.getState();
      if (storeState.timeRange === 'year' && storeState.startDate) {
        const parts = storeState.startDate.split('-');
        if (parts.length === 3) {
          return parseInt(parts[0]);
        }
      }
    } catch (e) { }
    return new Date().getFullYear();
  });
  // Refs for scroll pickers
  const monthScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);
  const yearOnlyScrollRef = useRef<ScrollView>(null);

  // Temporary selection states for the scroll wheel picker
  const [tempMonth, setTempMonth] = useState(selectedMonthYear.month);
  const [tempYear, setTempYear] = useState(selectedMonthYear.year);
  const [tempYearOnly, setTempYearOnly] = useState(selectedYear);

  // Dynamic list of years (current year ± 10 years, sorted oldest to newest)
  const currentYear = new Date().getFullYear();
  const yearsList: number[] = [];
  for (let y = currentYear - 10; y <= currentYear + 10; y++) {
    yearsList.push(y);
  }
  const sortedYears = yearsList;


  // Sync and scroll Month Modal when shown
  useEffect(() => {
    if (showMonthModal) {
      setTempMonth(selectedMonthYear.month);
      setTempYear(selectedMonthYear.year);
      setTimeout(() => {
        monthScrollRef.current?.scrollTo({
          y: selectedMonthYear.month * 44,
          animated: false,
        });
        const yearIndex = sortedYears.indexOf(selectedMonthYear.year);
        if (yearIndex !== -1) {
          yearScrollRef.current?.scrollTo({
            y: yearIndex * 44,
            animated: false,
          });
        }
      }, 100);
    }
  }, [showMonthModal, selectedMonthYear]);

  // Sync and scroll Year Modal when shown
  useEffect(() => {
    if (showYearModal) {
      setTempYearOnly(selectedYear);
      setTimeout(() => {
        const yearIndex = sortedYears.indexOf(selectedYear);
        if (yearIndex !== -1) {
          yearOnlyScrollRef.current?.scrollTo({
            y: yearIndex * 44,
            animated: false,
          });
        }
      }, 100);
    }
  }, [showYearModal, selectedYear]);

  const handleMonthScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const idx = Math.round(y / 44);
    if (idx >= 0 && idx < 12 && idx !== tempMonth) {
      setTempMonth(idx);
    }
  };

  const handleYearScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const idx = Math.round(y / 44);
    if (idx >= 0 && idx < sortedYears.length && sortedYears[idx] !== tempYear) {
      setTempYear(sortedYears[idx]);
    }
  };

  const handleYearOnlyScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const idx = Math.round(y / 44);
    if (idx >= 0 && idx < sortedYears.length && sortedYears[idx] !== tempYearOnly) {
      setTempYearOnly(sortedYears[idx]);
    }
  };

  const getLocalizedMonthYearString = (monthIdx: number, yearVal: number) => {
    const mKey = monthKeys[monthIdx];
    const monthName = t(`stats.months.${mKey}`);
    if (i18n.language === 'ja') {
      return `${yearVal}年 ${monthName}`;
    }
    return `${monthName} ${yearVal}`;
  };

  const getLocalizedDateString = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    if (i18n.language === 'ja') {
      return `${year}年${month}月${day}日`;
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mName = months[parseInt(month) - 1];
    return `${mName} ${day}, ${year}`;
  };

  const confirmMonthSelection = () => {
    setSelectedMonthYear({ year: tempYear, month: tempMonth });
    setShowMonthModal(false);
    const firstDay = `${tempYear}-${String(tempMonth + 1).padStart(2, '0')}-01`;
    const lastDayVal = new Date(tempYear, tempMonth + 1, 0).getDate();
    const lastDay = `${tempYear}-${String(tempMonth + 1).padStart(2, '0')}-${String(lastDayVal).padStart(2, '0')}`;
    setDateRange(firstDay, lastDay, 'month');
  };

  const confirmYearSelection = () => {
    setSelectedYear(tempYearOnly);
    setShowYearModal(false);
    const firstDay = `${tempYearOnly}-01-01`;
    const lastDay = `${tempYearOnly}-12-31`;
    setDateRange(firstDay, lastDay, 'year');
  };

  // Initial load
  useEffect(() => {
    fetchAnalyticsData(startDate, endDate, timeRange);
  }, []);

  const handleTimeRangeChange = (range: TimeRange) => {
    const today = new Date();
    if (range === 'day') {
      const start = new Date();
      start.setDate(today.getDate() - 30);
      setDateRange(
        start.toISOString().split('T')[0],
        today.toISOString().split('T')[0],
        'day'
      );
    } else if (range === 'month') {
      const year = today.getFullYear();
      const month = today.getMonth();
      const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDayVal = new Date(year, month + 1, 0).getDate();
      const lastDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayVal).padStart(2, '0')}`;
      setSelectedMonthYear({ year, month });
      setDateRange(firstDay, lastDay, 'month');
    } else if (range === 'year') {
      const year = today.getFullYear();
      const firstDay = `${year}-01-01`;
      const lastDay = `${year}-12-31`;
      setSelectedYear(year);
      setDateRange(firstDay, lastDay, 'year');
    }
  };

  // Helper to format volume nicely
  const formatVolume = (val: number) => {
    const total = Math.round(val);
    if (total >= 1000) {
      return (total / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return total.toString();
  };

  const totalVolume = volumeTrend.reduce((sum, item) => sum + item.volume, 0);
  const totalWorkoutsCount = workoutsTrend.reduce((sum, item) => sum + item.count, 0);
  const maxExerciseSets = topExercises.length > 0 ? topExercises[0].sets : 1;

  // yearsList is defined above at the top level

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Date Range Selector */}
      <View style={styles.filterSection}>
        <View style={styles.rangeSelector}>
          {(['day', 'month', 'year'] as TimeRange[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.rangeOption, timeRange === r && styles.rangeOptionActive]}
              onPress={() => handleTimeRangeChange(r)}
              activeOpacity={0.7}
            >
              <Text style={[styles.rangeOptionText, timeRange === r && styles.rangeOptionTextActive]}>
                {t(`stats.timeRanges.${r}`, r.toUpperCase())}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Day Picker Interface */}
        {timeRange === 'day' && (
          <View style={styles.customDateRow}>
            <View style={styles.iosPickerRow}>
              <TouchableOpacity
                style={styles.pickerTriggerButton}
                onPress={() => setShowStartDateModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.pickerTriggerButtonText}>
                  {getLocalizedDateString(startDate)}
                </Text>
              </TouchableOpacity>
              <Text style={styles.dateSeparator}>~</Text>
              <TouchableOpacity
                style={styles.pickerTriggerButton}
                onPress={() => setShowEndDateModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.pickerTriggerButtonText}>
                  {getLocalizedDateString(endDate)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Month Picker Interface */}
        {timeRange === 'month' && (
          <View style={styles.customDateRow}>
            <View style={styles.iosPickerRow}>
              <TouchableOpacity
                style={styles.pickerTriggerButton}
                onPress={() => setShowMonthModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.pickerTriggerButtonText}>
                  {getLocalizedMonthYearString(selectedMonthYear.month, selectedMonthYear.year)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Year Picker Interface */}
        {timeRange === 'year' && (
          <View style={styles.customDateRow}>
            <View style={styles.iosPickerRow}>
              <TouchableOpacity
                style={styles.pickerTriggerButton}
                onPress={() => setShowYearModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.pickerTriggerButtonText}>
                  {i18n.language === 'ja' ? `${selectedYear}年` : selectedYear}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Main Tab Menu */}
      <View style={styles.tabMenu}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'heatmap' && styles.tabButtonActive]}
          onPress={() => setActiveTab('heatmap')}
          activeOpacity={0.7}
        >
          <Icon
            name="body"
            size={18}
            color={activeTab === 'heatmap' ? colors.dark.accent.primary : colors.dark.text.secondary}
          />
          <Text style={[styles.tabText, activeTab === 'heatmap' && styles.tabTextActive]}>
            {t('stats.heatmap', 'Heatmap')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'charts' && styles.tabButtonActive]}
          onPress={() => setActiveTab('charts')}
          activeOpacity={0.7}
        >
          <Icon
            name="stats-chart"
            size={18}
            color={activeTab === 'charts' ? colors.dark.accent.primary : colors.dark.text.secondary}
          />
          <Text style={[styles.tabText, activeTab === 'charts' && styles.tabTextActive]}>
            {t('stats.charts', 'Charts')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contents based on Tab */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t('common.loading', 'Loading...')}</Text>
          </View>
        ) : activeTab === 'heatmap' ? (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('stats.muscleHeatmap', 'Muscle Heatmap')}</Text>
            <MuscleHeatmap data={heatmapData} />
          </Card>
        ) : (
          <View style={styles.chartsWrapper}>
            {/* 1. Summary Cards Row */}
            <View style={styles.summaryRow}>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryIcon}>🔥</Text>
                <Text style={styles.summaryLabel}>{t('stats.currentStreak', 'Streak')}</Text>
                <Text style={styles.summaryValue}>{streak.current}</Text>
                <Text style={styles.summarySubText}>
                  {t('stats.bestStreak', 'Best')}: {streak.best}
                </Text>
              </Card>

              <Card style={styles.summaryCard}>
                <Text style={styles.summaryIcon}>🏋️</Text>
                <Text style={styles.summaryLabel}>{t('stats.totalWorkouts', 'Workouts')}</Text>
                <Text style={styles.summaryValue}>{totalWorkoutsCount}</Text>
                <Text style={styles.summarySubText}>{t('stats.workouts', 'Sessions')}</Text>
              </Card>

              <Card style={styles.summaryCard}>
                <Text style={styles.summaryIcon}>⚖️</Text>
                <Text style={styles.summaryLabel}>{t('stats.volume', 'Volume')}</Text>
                <Text style={styles.summaryValue}>{formatVolume(totalVolume)}</Text>
                <Text style={styles.summarySubText}>kg</Text>
              </Card>
            </View>

            {/* 2. Workouts Line Chart */}
            <Card style={styles.chartCard}>
              <Text style={styles.chartCardTitle}>{t('stats.workouts', 'Workouts over Time')}</Text>
              <LineChart
                data={workoutsTrend}
                accentColor={colors.dark.accent.primary}
                gradientId="workoutsGrad"
                emptyMessage={t('common.noData', 'No sessions recorded')}
              />
            </Card>

            {/* 3. Volume Bar Chart */}
            <Card style={styles.chartCard}>
              <Text style={styles.chartCardTitle}>{t('stats.volumeTrend', 'Volume Progression')}</Text>
              <BarChart
                data={volumeTrend}
                accentColor={colors.dark.accent.info}
                gradientId="volumeGrad"
                emptyMessage={t('common.noData', 'No sessions recorded')}
              />
            </Card>

            {/* 4. Muscle Split Donut Chart */}
            <Card style={styles.chartCard}>
              <Text style={styles.chartCardTitle}>{t('stats.muscleSplit', 'Muscle Distribution')}</Text>
              <DonutChart
                data={muscleSplit}
                emptyMessage={t('common.noData', 'No training sets recorded')}
              />
            </Card>

            {/* 5. Top Exercises Progress List */}
            <Card style={styles.chartCard}>
              <Text style={styles.chartCardTitle}>{t('stats.topExercises', 'Top Exercises')}</Text>
              {topExercises.length > 0 ? (
                <View style={styles.topExercisesList}>
                  {topExercises.map((ex, index) => {
                    const percentage = Math.round((ex.sets / maxExerciseSets) * 100);
                    return (
                      <View key={ex.id} style={styles.exerciseRow}>
                        <View style={styles.exerciseHeader}>
                          <Text style={styles.exerciseName} numberOfLines={1}>
                            {i18n.language === 'ja' ? ex.nameJa : ex.nameEn}
                          </Text>
                          <Text style={styles.exerciseSets}>
                            {ex.sets} {t('stats.topExercisesSets', 'sets')}
                          </Text>
                        </View>
                        <View style={styles.progressBg}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${percentage}%`,
                                backgroundColor:
                                  index === 0
                                    ? colors.dark.accent.primary
                                    : index === 1
                                      ? colors.dark.accent.info
                                      : colors.dark.text.secondary
                              }
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.emptyText}>{t('common.noData', 'No exercises logged')}</Text>
              )}
            </Card>

            {/* 6. Personal Records Card */}
            <Card style={styles.chartCard}>
              <Text style={styles.chartCardTitle}>{t('stats.prs', 'Personal Records (PRs)')}</Text>
              {prs.length > 0 ? (
                <View style={styles.prsList}>
                  {prs.slice(0, 5).map((pr) => (
                    <View key={pr.exerciseId} style={styles.prRow}>
                      <View style={styles.prBadge}>
                        <Text style={styles.prBadgeText}>🏆</Text>
                      </View>
                      <View style={styles.prDetails}>
                        <Text style={styles.prName} numberOfLines={1}>
                          {i18n.language === 'ja' ? pr.exerciseNameJa : pr.exerciseNameEn}
                        </Text>
                        <Text style={styles.prDate}>{pr.date}</Text>
                      </View>
                      <Text style={styles.prWeight}>
                        {pr.weight} <Text style={styles.prWeightUnit}>kg</Text>
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>{t('stats.noPrs', 'No new PRs achieved')}</Text>
              )}
            </Card>
          </View>
        )}
      </ScrollView>

      {/* MONTH PICKER MODAL */}
      <Modal
        visible={showMonthModal}
        transparent={true}
        animationType="fade"
        onRequestClose={confirmMonthSelection}
      >
        <TouchableWithoutFeedback onPress={confirmMonthSelection}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>

                {/* Double Column Scroll Pickers */}
                <View style={styles.scrollPickerContainer}>
                  {/* Highlight Bar Overlay */}
                  <View style={styles.highlightBar} pointerEvents="none" />

                  {/* Month Scroll */}
                  <ScrollView
                    ref={monthScrollRef}
                    style={styles.wheelColumn}
                    snapToInterval={44}
                    decelerationRate="fast"
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={handleMonthScroll}
                    onLayout={() => {
                      monthScrollRef.current?.scrollTo({
                        y: selectedMonthYear.month * 44,
                        animated: false,
                      });
                    }}
                  >
                    <View style={{ height: 88 }} />
                    {monthKeys.map((mKey, idx) => {
                      const isSelected = tempMonth === idx;
                      return (
                        <TouchableOpacity
                          key={mKey}
                          style={styles.wheelItem}
                          activeOpacity={0.7}
                          onPress={() => {
                            monthScrollRef.current?.scrollTo({ y: idx * 44, animated: true });
                            setTempMonth(idx);
                          }}
                        >
                          <Text style={[styles.wheelItemText, isSelected && styles.wheelItemTextActive]}>
                            {t(`stats.months.${mKey}`)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    <View style={{ height: 88 }} />
                  </ScrollView>

                  {/* Year Scroll */}
                  <ScrollView
                    ref={yearScrollRef}
                    style={styles.wheelColumn}
                    snapToInterval={44}
                    decelerationRate="fast"
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={handleYearScroll}
                    onLayout={() => {
                      const idx = sortedYears.indexOf(selectedMonthYear.year);
                      if (idx !== -1) {
                        yearScrollRef.current?.scrollTo({
                          y: idx * 44,
                          animated: false,
                        });
                      }
                    }}
                  >
                    <View style={{ height: 88 }} />
                    {sortedYears.map((yr, idx) => {
                      const isSelected = tempYear === yr;
                      return (
                        <TouchableOpacity
                          key={yr}
                          style={styles.wheelItem}
                          activeOpacity={0.7}
                          onPress={() => {
                            yearScrollRef.current?.scrollTo({ y: idx * 44, animated: true });
                            setTempYear(yr);
                          }}
                        >
                          <Text style={[styles.wheelItemText, isSelected && styles.wheelItemTextActive]}>
                            {yr}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    <View style={{ height: 88 }} />
                  </ScrollView>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* YEAR PICKER MODAL */}
      <Modal
        visible={showYearModal}
        transparent={true}
        animationType="fade"
        onRequestClose={confirmYearSelection}
      >
        <TouchableWithoutFeedback onPress={confirmYearSelection}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>

                {/* Single Column Year Scroll Picker */}
                <View style={styles.scrollPickerContainer}>
                  {/* Highlight Bar Overlay */}
                  <View style={styles.highlightBar} pointerEvents="none" />

                  {/* Year Scroll */}
                  <ScrollView
                    ref={yearOnlyScrollRef}
                    style={styles.wheelColumn}
                    snapToInterval={44}
                    decelerationRate="fast"
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={handleYearOnlyScroll}
                    onLayout={() => {
                      const idx = sortedYears.indexOf(selectedYear);
                      if (idx !== -1) {
                        yearOnlyScrollRef.current?.scrollTo({
                          y: idx * 44,
                          animated: false,
                        });
                      }
                    }}
                  >
                    <View style={{ height: 88 }} />
                    {sortedYears.map((yr, idx) => {
                      const isSelected = tempYearOnly === yr;
                      return (
                        <TouchableOpacity
                          key={yr}
                          style={styles.wheelItem}
                          activeOpacity={0.7}
                          onPress={() => {
                            yearOnlyScrollRef.current?.scrollTo({ y: idx * 44, animated: true });
                            setTempYearOnly(yr);
                          }}
                        >
                          <Text style={[styles.wheelItemText, isSelected && styles.wheelItemTextActive]}>
                            {yr}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    <View style={{ height: 88 }} />
                  </ScrollView>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* START DATE PICKER MODAL */}
      <Modal
        visible={showStartDateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStartDateModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowStartDateModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.calendarModalContent}>
                <DateTimePicker
                  value={new Date(startDate)}
                  mode="date"
                  display="inline"
                  themeVariant="dark"
                  style={styles.iosInlineDatePicker}
                  onChange={(event, date) => {
                    if (date) {
                      setDateRange(date.toISOString().split('T')[0], endDate, 'day');
                    }
                    if (event.type === 'set' || event.type === 'dismissed') {
                      setShowStartDateModal(false);
                    }
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* END DATE PICKER MODAL */}
      <Modal
        visible={showEndDateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEndDateModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowEndDateModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.calendarModalContent}>
                <DateTimePicker
                  value={new Date(endDate)}
                  mode="date"
                  display="inline"
                  themeVariant="dark"
                  style={styles.iosInlineDatePicker}
                  onChange={(event, date) => {
                    if (date) {
                      setDateRange(startDate, date.toISOString().split('T')[0], 'day');
                    }
                    if (event.type === 'set' || event.type === 'dismissed') {
                      setShowEndDateModal(false);
                    }
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  filterSection: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.subtle,
  },
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.dark.bg.tertiary,
    borderRadius: 12,
    padding: 3,
    width: '100%',
  },
  rangeOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  rangeOptionActive: {
    backgroundColor: colors.dark.bg.secondary,
  },
  rangeOptionText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  },
  rangeOptionTextActive: {
    color: colors.dark.accent.primary,
  },
  customDateRow: {
    marginTop: spacing.base,
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iosPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  iosDatePicker: {
    width: 140,
    transform: [{ scale: 1.0 }],
  },
  dateSeparator: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  tabMenu: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.subtle,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.dark.bg.tertiary,
  },
  tabText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: colors.dark.text.primary,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl * 2,
  },
  loadingContainer: {
    flex: 1,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  sectionCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
    marginBottom: spacing.xs,
  },
  chartsWrapper: {
    gap: spacing.base,
    width: '100%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    width: '100%',
  },
  summaryCard: {
    flex: 1,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: 100,
  },
  summaryIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 9,
    color: colors.dark.text.secondary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'heavy',
    color: colors.dark.text.primary,
  },
  summarySubText: {
    fontSize: 9,
    color: colors.dark.text.tertiary,
    fontWeight: 'bold',
  },
  chartCard: {
    padding: spacing.md,
    gap: spacing.sm,
    width: '100%',
  },
  chartCardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
    marginBottom: spacing.xs,
  },
  topExercisesList: {
    gap: spacing.sm,
  },
  exerciseRow: {
    gap: 6,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  exerciseSets: {
    fontSize: typography.fontSize.xs,
    color: colors.dark.text.secondary,
    fontWeight: 'bold',
  },
  progressBg: {
    height: 8,
    backgroundColor: colors.dark.bg.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  prsList: {
    gap: spacing.xs,
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.bg.tertiary,
    borderRadius: 10,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
  },
  prBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.dark.bg.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  prBadgeText: {
    fontSize: 16,
  },
  prDetails: {
    flex: 1,
    marginRight: spacing.sm,
    gap: 2,
  },
  prName: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  prDate: {
    fontSize: 9,
    color: colors.dark.text.tertiary,
    fontWeight: 'bold',
  },
  prWeight: {
    fontSize: typography.fontSize.sm,
    fontWeight: 'heavy',
    color: colors.dark.accent.primary,
  },
  prWeightUnit: {
    fontSize: 10,
    fontWeight: 'normal',
    color: colors.dark.text.secondary,
  },
  emptyText: {
    color: colors.dark.text.tertiary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.md,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    backgroundColor: colors.dark.bg.tertiary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
    padding: spacing.md,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  modalYearText: {
    fontSize: typography.fontSize.base,
    fontWeight: 'heavy',
    color: colors.dark.text.primary,
  },
  scrollPickerContainer: {
    flexDirection: 'row',
    height: 220,
    width: '100%',
    position: 'relative',
    marginVertical: spacing.md,
  },
  highlightBar: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    top: 88, // middle row (2 * 44)
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 22,
  },
  wheelColumn: {
    flex: 1,
    height: '100%',
  },
  wheelItem: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.md,
    fontWeight: 'normal',
    opacity: 0.5,
  },
  wheelItemTextActive: {
    color: colors.dark.text.primary,
    fontWeight: 'bold',
    opacity: 1,
    fontSize: typography.fontSize.lg,
  },
  modalHeaderPopover: {
    width: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  modalHeaderTitleActive: {
    color: colors.dark.accent.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.dark.border.default,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.dark.accent.primary,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  },
  monthYearSelectorRow: {
    marginTop: spacing.xs,
    width: '100%',
    alignItems: 'center',
  },
  pickerTriggerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(116, 116, 128, 0.18)',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    minWidth: 140,
    transform: [{ scale: 1.0 }],
  },
  pickerTriggerButtonText: {
    color: colors.dark.text.primary,
    fontSize: 16,
    fontWeight: 'normal',
  },
  calendarModalContent: {
    width: 330,
    backgroundColor: colors.dark.bg.tertiary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iosInlineDatePicker: {
    transform: [{ scale: 0.88 }],
    marginTop: -10,
    marginBottom: -10,
  },
});
