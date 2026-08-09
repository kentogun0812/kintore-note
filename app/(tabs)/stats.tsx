import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Card } from '@/components/Card';
import { Icon, IconName } from '@/components/Icon';
import { useTranslation } from 'react-i18next';
import { useAnalyticsStore, TimeRange } from '@/store/analytics.store';
import { MuscleHeatmap } from '@/components/charts/MuscleHeatmap';
import { ProgressChart } from '@/components/charts/ProgressChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { useState, useEffect, useRef } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

type ActiveTab = 'heatmap' | 'analytics' | 'history';

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
    streak,
    prs,
    history,
    avgDuration,
    totalSetsCount,
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
      <View style={styles.tabMenuContainer}>
        <View style={styles.tabMenu}>
          {(['heatmap', 'analytics', 'history'] as ActiveTab[]).map((tab, index) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  isActive ? styles.tabButtonActive : styles.tabButtonInactive,
                  index > 0 && { marginLeft: -1 }
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
              >
                <Text style={isActive ? styles.tabTextActive : styles.tabTextInactive}>
                  {t(`stats.${tab}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
          <View style={styles.chartsWrapper}>
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{t('stats.muscleHeatmap')}</Text>
              <MuscleHeatmap data={[
                { muscleGroupId: 'mg-chest', exerciseId: 'ex-chest-01', exerciseNameEn: 'Bench Press', exerciseNameJa: 'ベンチプレス', muscleNameEn: 'Chest', muscleNameJa: '大胸筋', workoutCount: 10, setCount: 30, volume: 15000, lastActiveAt: new Date().toISOString() },
                { muscleGroupId: 'mg-shoulders', exerciseId: 'ex-shoulders-01', exerciseNameEn: 'Overhead Press', exerciseNameJa: 'オーバーヘッドプレス', muscleNameEn: 'Shoulders', muscleNameJa: '三角筋', workoutCount: 5, setCount: 15, volume: 5000, lastActiveAt: new Date().toISOString() },
                { muscleGroupId: 'mg-arms', exerciseId: 'ex-arms-01', exerciseNameEn: 'Bicep Curl', exerciseNameJa: 'バイセップスカール', muscleNameEn: 'Biceps', muscleNameJa: '上腕二頭筋', workoutCount: 8, setCount: 24, volume: 8000, lastActiveAt: new Date().toISOString() },
                { muscleGroupId: 'mg-arms', exerciseId: 'ex-arms-07', exerciseNameEn: 'Tricep Extension', exerciseNameJa: 'トライセプスエクステンション', muscleNameEn: 'Triceps', muscleNameJa: '上腕三頭筋', workoutCount: 6, setCount: 18, volume: 6000, lastActiveAt: new Date().toISOString() },
                { muscleGroupId: 'mg-legs', exerciseId: 'ex-legs-01', exerciseNameEn: 'Squat', exerciseNameJa: 'スクワット', muscleNameEn: 'Quads', muscleNameJa: '大腿四頭筋', workoutCount: 12, setCount: 36, volume: 20000, lastActiveAt: new Date().toISOString() },
                { muscleGroupId: 'mg-back', exerciseId: 'ex-back-01', exerciseNameEn: 'Deadlift', exerciseNameJa: 'デッドリフト', muscleNameEn: 'Lower Back', muscleNameJa: '下背部', workoutCount: 6, setCount: 18, volume: 12000, lastActiveAt: new Date().toISOString() },
                { muscleGroupId: 'mg-core', exerciseId: 'ex-core-01', exerciseNameEn: 'Crunch', exerciseNameJa: 'クランチ', muscleNameEn: 'Abs', muscleNameJa: '腹筋', workoutCount: 15, setCount: 45, volume: 2000, lastActiveAt: new Date().toISOString() },
                { muscleGroupId: 'mg-back', exerciseId: 'ex-back-02', exerciseNameEn: 'Lat Pulldown', exerciseNameJa: 'ラットプルダウン', muscleNameEn: 'Lats', muscleNameJa: '広背筋', workoutCount: 10, setCount: 30, volume: 10000, lastActiveAt: new Date().toISOString() },
                { muscleGroupId: 'mg-back', exerciseId: 'ex-back-09', exerciseNameEn: 'Shrugs', exerciseNameJa: 'シュラッグ', muscleNameEn: 'Traps', muscleNameJa: '僧帽筋', workoutCount: 4, setCount: 12, volume: 4000, lastActiveAt: new Date().toISOString() },
                { muscleGroupId: 'mg-glutes', exerciseId: 'ex-glutes-01', exerciseNameEn: 'Hip Thrust', exerciseNameJa: 'ヒップスラスト', muscleNameEn: 'Glutes', muscleNameJa: '大臀筋', workoutCount: 7, setCount: 21, volume: 7000, lastActiveAt: new Date().toISOString() }
              ]} />
            </Card>

            {/* Muscle Split (Donut Chart) */}
            <Card style={styles.chartCard}>
              <Text style={styles.chartCardTitle}>{t('stats.muscleSplitTitle')}</Text>
              <DonutChart
                data={muscleSplit}
                emptyMessage={t('common.noData')}
              />
            </Card>


          </View>
        ) : activeTab === 'analytics' ? (
          <View style={styles.chartsWrapper}>
            {/* 1. KPIs Grid */}
            <View style={styles.summaryRow}>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryIcon}>🏋️</Text>
                <Text style={styles.summaryLabel}>{t('stats.totalWorkouts')}</Text>
                <Text style={styles.summaryValue}>{totalWorkoutsCount}</Text>
              </Card>

              <Card style={styles.summaryCard}>
                <Text style={styles.summaryIcon}>⚖️</Text>
                <Text style={styles.summaryLabel}>{t('stats.volume')}</Text>
                <Text style={styles.summaryValue}>{formatVolume(totalVolume)}</Text>
              </Card>

              <Card style={styles.summaryCard}>
                <Text style={styles.summaryIcon}>🔢</Text>
                <Text style={styles.summaryLabel}>{t('stats.totalSets')}</Text>
                <Text style={styles.summaryValue}>{totalSetsCount}</Text>
              </Card>
            </View>

            <View style={styles.summaryRow}>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryIcon}>⏱️</Text>
                <Text style={styles.summaryLabel}>{t('stats.avgDuration')}</Text>
                <Text style={styles.summaryValue}>{avgDuration}</Text>
              </Card>

              <Card style={styles.summaryCard}>
                <Text style={styles.summaryIcon}>🔥</Text>
                <Text style={styles.summaryLabel}>{t('stats.currentStreak')}</Text>
                <Text style={styles.summaryValue}>{streak.current}</Text>
              </Card>
            </View>

            {/* 2. Progress Chart */}
            <Card style={styles.chartCard}>
              <Text style={styles.chartCardTitle}>{t('stats.progressChartTitle', 'Progress')}</Text>
              <ProgressChart
                workoutsTrend={workoutsTrend}
                volumeTrend={volumeTrend}
                timeRange={timeRange}
                emptyMessage={t('common.noData', 'No sessions recorded')}
              />
            </Card>



            <Card style={styles.chartCard}>
              <Text style={styles.chartCardTitle}>{t('stats.prs', 'Personal Records (PRs)')}</Text>
              {prs.length > 0 ? (
                <View style={styles.prsList}>
                  {prs.map((pr) => (
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
        ) : (
          <View style={styles.chartsWrapper}>
            {history.length > 0 ? (
              <View style={styles.historyList}>
                {history.map((session) => {
                  const start = new Date(session.startedAt).getTime();
                  const end = new Date(session.completedAt).getTime();
                  const durMin = Math.round((end - start) / (1000 * 60));
                  
                  return (
                    <Card key={session.id} style={styles.historyCard}>
                      <View style={styles.historyCardHeader}>
                        <View style={styles.historyCardTitleCol}>
                          <Text style={styles.historyCardTitle}>
                            {session.templateName || t('session.title')}
                          </Text>
                          <Text style={styles.historyCardDate}>
                            {getLocalizedDateString(session.completedAt.split('T')[0])}
                          </Text>
                        </View>
                        {session.notes && (
                          <View style={styles.notesIndicator}>
                            <Icon name="document-text" size={16} color={colors.dark.text.secondary} />
                          </View>
                        )}
                      </View>

                      {session.notes ? (
                        <Text style={styles.historyNotesText}>
                          "{session.notes}"
                        </Text>
                      ) : null}

                      <View style={styles.historyCardStatsRow}>
                        <View style={styles.historyCardStatItem}>
                          <Icon name="time-outline" size={14} color={colors.dark.text.secondary} />
                          <Text style={styles.historyCardStatText}>
                            {t('stats.durationMin', { minutes: durMin })}
                          </Text>
                        </View>
                        <View style={styles.historyCardStatItem}>
                          <Icon name="barbell-outline" size={14} color={colors.dark.text.secondary} />
                          <Text style={styles.historyCardStatText}>
                            {formatVolume(session.totalVolume)} kg
                          </Text>
                        </View>
                      </View>

                      <View style={styles.historyExercisesPreview}>
                        {session.exercises.map((ex) => (
                          <View key={ex.id} style={styles.historyExerciseRow}>
                            <Text style={styles.historyExerciseBullet}>•</Text>
                            <Text style={styles.historyExerciseName} numberOfLines={1}>
                              {ex.setsCount}x {i18n.language === 'ja' ? ex.nameJa : ex.nameEn}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </Card>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.emptyText}>{t('stats.noWorkoutsHistory')}</Text>
            )}
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
  dateSeparator: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  tabButtonActive: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.dark.bg.primary,
    borderWidth: 1,
    borderColor: colors.dark.accent.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.bg.primary,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginBottom: -1,
    zIndex: 10,
  },
  tabButtonInactive: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.dark.bg.tertiary,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginBottom: 0,
    opacity: 0.8,
  },
  tabTextActive: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabTextInactive: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: 100,
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
  tabMenuContainer: {
    backgroundColor: colors.dark.bg.primary,
  },
  tabMenu: {
    flexDirection: 'row',
    marginHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: 0,
    gap: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.accent.primary,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  historyList: {
    gap: spacing.base,
  },
  historyCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyCardTitleCol: {
    flex: 1,
    gap: 2,
  },
  historyCardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  historyCardDate: {
    fontSize: typography.fontSize.xs,
    color: colors.dark.text.tertiary,
    fontWeight: '500',
  },
  notesIndicator: {
    padding: 2,
  },
  historyNotesText: {
    fontSize: typography.fontSize.xs,
    color: colors.dark.text.secondary,
    fontStyle: 'italic',
    backgroundColor: colors.dark.bg.tertiary,
    padding: spacing.xs,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  historyCardStatsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.dark.border.subtle,
    paddingVertical: spacing.xs,
    marginVertical: 2,
  },
  historyCardStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyCardStatText: {
    fontSize: typography.fontSize.xs,
    color: colors.dark.text.secondary,
    fontWeight: '600',
  },
  historyExercisesPreview: {
    gap: 4,
  },
  historyExerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyExerciseBullet: {
    color: colors.dark.accent.primary,
    fontSize: 14,
  },
  historyExerciseName: {
    fontSize: typography.fontSize.xs,
    color: colors.dark.text.primary,
    fontWeight: '500',
  },
});
