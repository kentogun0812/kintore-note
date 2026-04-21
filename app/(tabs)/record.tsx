import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback } from 'react';
import { Link, router, useFocusEffect } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { useMenuStore } from '@/store/menu.store';
import { useTrainingStore } from '@/store/training.store';

export default function RecordScreen() {
  const { savedMenus, fetchSavedMenus } = useMenuStore();
  const { startSession } = useTrainingStore();

  useFocusEffect(
    useCallback(() => {
      fetchSavedMenus();
    }, [])
  );

  const handleStartMenu = (menu: any) => {
    startSession(menu.exercises);
    router.push('/training/session');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
      <Text style={{ fontSize: typography.fontSize['2xl'], fontWeight: 'heavy', color: colors.dark.text.primary, marginBottom: spacing.xs }}>
        Training
      </Text>
      
      <Card style={{ padding: spacing.md, gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Icon name="flash" size={20} color={colors.dark.accent.warning} />
          <Text style={{ fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.dark.text.primary }}>
             Quick Start
          </Text>
        </View>
        <Text style={{ fontSize: typography.fontSize.sm, color: colors.dark.text.secondary, marginBottom: spacing.sm }}>
           Start an empty session and log exercises as you go.
        </Text>
        <Link href="/training/session" asChild>
          <Button label="Start Empty Session" iconName="play" fullWidth />
        </Link>
      </Card>
      
      <View style={{ flexDirection: 'row', gap: spacing.base, marginTop: spacing.xs }}>
        <Link href="/training/menu-builder" asChild>
          <Pressable style={{ flex: 1 }}>
            <Card style={{ padding: spacing.md, height: 120, justifyContent: 'center', alignItems: 'center', gap: spacing.sm }}>
              <Icon name="clipboard" size={32} color={colors.dark.accent.primary} />
              <Text style={{ color: colors.dark.text.primary, fontWeight: 'bold' }}>Menu Builder</Text>
            </Card>
          </Pressable>
        </Link>
        <Link href="/training/library" asChild>
          <Pressable style={{ flex: 1 }}>
            <Card style={{ padding: spacing.md, height: 120, justifyContent: 'center', alignItems: 'center', gap: spacing.sm }}>
              <Icon name="library" size={32} color={colors.dark.text.secondary} />
              <Text style={{ color: colors.dark.text.primary, fontWeight: 'bold' }}>Exercise Library</Text>
            </Card>
          </Pressable>
        </Link>
      </View>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md }}>
        <Icon name="bookmarks-outline" size={20} color={colors.dark.text.primary} />
        <Text style={{ fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.dark.text.primary }}>
           Saved Menus
        </Text>
      </View>

      {savedMenus.length === 0 ? (
        <Card style={{ padding: spacing.md, alignItems: 'center', backgroundColor: colors.dark.bg.tertiary, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.dark.border.subtle }}>
          <Icon name="document-text-outline" size={28} color={colors.dark.text.tertiary} />
          <Text style={{ color: colors.dark.text.secondary, paddingVertical: spacing.sm }}>
            No saved menus yet.
          </Text>
        </Card>
      ) : (
        savedMenus.map(menu => (
          <Card key={menu.id} style={{ padding: spacing.md, gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize.md, fontWeight: 'bold' }}>{menu.name}</Text>
              <Text style={{ color: colors.dark.text.tertiary, fontSize: typography.fontSize.xs }}>{menu.exercises.length} exercises</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: spacing.xs }}>
              {menu.exercises.slice(0, 3).map((ex, i) => (
                <View key={ex.id} style={{ backgroundColor: colors.dark.bg.tertiary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                  <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.xs }}>{ex.name}</Text>
                </View>
              ))}
              {menu.exercises.length > 3 && (
                <View style={{ backgroundColor: colors.dark.bg.tertiary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                  <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.xs }}>+{menu.exercises.length - 3} more</Text>
                </View>
              )}
            </View>
            <Button 
              label="Start Menu" 
              iconName="play-circle" 
              variant="secondary" 
              size="sm" 
              onPress={() => handleStartMenu(menu)} 
            />
          </Card>
        ))
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl * 2,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.dark.text.primary,
    marginBottom: spacing.xs,
  },
});
