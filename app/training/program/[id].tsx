import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, FlatList } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { useProgramStore, TrainingProgram } from '@/store/program.store';
import { useMenuStore } from '@/store/menu.store';
import { useTranslation } from 'react-i18next';

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { programs, activateProgram, assignMenuToWeek, fetchProgramMenus } = useProgramStore();
  const { savedMenus, fetchSavedMenus } = useMenuStore();

  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [assignedMenus, setAssignedMenus] = useState<any[]>([]);
  const [isMenuModalVisible, setMenuModalVisible] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  useEffect(() => {
    const p = programs.find((prog) => prog.id === id);
    if (p) setProgram(p);
  }, [id, programs]);

  useEffect(() => {
    if (id) {
      loadAssignedMenus();
      fetchSavedMenus(); // Make sure we have menus to pick from
    }
  }, [id]);

  const loadAssignedMenus = async () => {
    const menus = await fetchProgramMenus(id);
    setAssignedMenus(menus);
  };

  const handleOpenMenuPicker = (week: number) => {
    setSelectedWeek(week);
    setMenuModalVisible(true);
  };

  const handleSelectMenu = async (menuId: string) => {
    if (selectedWeek !== null && id) {
      await assignMenuToWeek(id, menuId, selectedWeek);
      await loadAssignedMenus();
    }
    setMenuModalVisible(false);
  };

  const handleActivate = async () => {
    if (id) {
      await activateProgram(id);
    }
  };

  if (!program) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('common.loading', 'Loading...')}</Text>
      </View>
    );
  }

  // Generate weeks array
  const weeks = Array.from({ length: program.total_weeks }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: program.name,
          headerLargeTitle: false,
          headerBackVisible: true,
        }} 
      />
      
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Text style={styles.programName}>{program.name}</Text>
            {program.is_active && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>{t('program.active', 'Active')}</Text>
              </View>
            )}
          </View>
          <Text style={styles.programDetails}>
            {program.total_weeks} {t('program.weeks', 'Weeks')}
            {program.start_date ? ` • Starts: ${program.start_date}` : ''}
          </Text>
          
          {!program.is_active && (
            <Button 
              label={t('program.setAsActive', 'Set as Active Program')} 
              variant="secondary" 
              size="sm"
              onPress={handleActivate}
              style={styles.activateButton}
            />
          )}
        </Card>

        <Text style={styles.sectionTitle}>{t('program.timeline', 'Schedule Timeline')}</Text>

        <View style={styles.timeline}>
          {weeks.map((week) => {
            // Find if a menu is assigned to this week
            const menuForWeek = assignedMenus.find(m => m.program_week === week);

            return (
              <View key={week} style={styles.weekRow}>
                <View style={styles.weekIndicator}>
                  <View style={styles.weekCircle}>
                    <Text style={styles.weekNumber}>{week}</Text>
                  </View>
                  {week !== program.total_weeks && <View style={styles.weekLine} />}
                </View>
                
                <Card style={styles.weekCard}>
                  <Text style={styles.weekTitle}>{t('program.weekN', { n: week, defaultValue: `Week ${week}` })}</Text>
                  
                  {menuForWeek ? (
                    <View style={styles.assignedMenu}>
                      <Icon name="document-text-outline" size={20} color={colors.dark.accent.primary} />
                      <Text style={styles.menuName}>{menuForWeek.name}</Text>
                      <Pressable onPress={() => handleOpenMenuPicker(week)} hitSlop={8}>
                        <Icon name="swap-horizontal" size={20} color={colors.dark.text.tertiary} />
                      </Pressable>
                    </View>
                  ) : (
                    <Button 
                      label={t('program.assignMenu', 'Assign Menu')} 
                      variant="outline" 
                      size="sm"
                      iconName="add"
                      onPress={() => handleOpenMenuPicker(week)}
                    />
                  )}
                </Card>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Menu Picker Modal */}
      <Modal visible={isMenuModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setMenuModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('program.pickMenu', 'Select Menu')}</Text>
            <Pressable onPress={() => setMenuModalVisible(false)}>
              <Icon name="close" size={28} color={colors.dark.text.primary} />
            </Pressable>
          </View>
          
          <FlatList 
            data={savedMenus}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.menuList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>{t('program.noSavedMenus', 'You have no saved menus yet.')}</Text>
            }
            renderItem={({ item }) => (
              <Pressable style={styles.menuItem} onPress={() => handleSelectMenu(item.id)}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Icon name="chevron-forward" size={20} color={colors.dark.text.tertiary} />
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  loadingText: {
    color: colors.dark.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xl * 2,
  },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  headerCard: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  programName: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: colors.dark.accent.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.dark.accent.primary,
  },
  activeBadgeText: {
    color: colors.dark.accent.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
  },
  programDetails: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  activateButton: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  timeline: {
    gap: 0,
  },
  weekRow: {
    flexDirection: 'row',
    minHeight: 80,
  },
  weekIndicator: {
    width: 40,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  weekCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.dark.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.dark.border.default,
    zIndex: 2,
  },
  weekNumber: {
    color: colors.dark.text.primary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.sm,
  },
  weekLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.dark.border.default,
    marginVertical: -2, // slight overlap
    zIndex: 1,
  },
  weekCard: {
    flex: 1,
    marginBottom: spacing.lg,
    padding: spacing.md,
    justifyContent: 'center',
  },
  weekTitle: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.xs,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  assignedMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.bg.tertiary,
    padding: spacing.sm,
    borderRadius: radius.sm,
    gap: spacing.sm,
  },
  menuName: {
    flex: 1,
    color: colors.dark.text.primary,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.dark.bg.secondary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.subtle,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  menuList: {
    padding: spacing.base,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.subtle,
  },
  menuItemName: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.md,
  },
  emptyText: {
    color: colors.dark.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
