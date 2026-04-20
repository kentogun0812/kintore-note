import React from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { Stack, Link, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { useMenuStore } from '@/store/menu.store';

export default function MenuBuilderScreen() {
  const { menuName, setMenuName, exercises, removeExerciseFromMenu, saveCurrentMenu } = useMenuStore();
  const [isSaving, setIsSaving] = React.useState(false);
  
  const handleSaveMenu = async () => {
    setIsSaving(true);
    await saveCurrentMenu();
    setIsSaving(false);
    router.replace('/(tabs)/record');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.dark.bg.primary }}>
      <Stack.Screen 
        options={{ 
          title: 'Menu Builder', 
          headerLargeTitle: false,
          headerBackVisible: true,
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              hitSlop={8} 
              style={{ 
                width: 36, 
                height: 36, 
                borderRadius: 18, 
                borderWidth: 1, 
                borderColor: colors.dark.border.default, 
                justifyContent: 'center', 
                alignItems: 'center',
                marginLeft: spacing.xs
              }}
            >
              <Icon name="chevron-back" size={20} color={colors.dark.text.primary} />
            </Pressable>
          ),
        }} 
      />
      
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.base, gap: spacing.lg }}
      >
        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.sm }}>
            Menu Name
          </Text>
          <TextInput 
            value={menuName}
            onChangeText={setMenuName}
            placeholder="Ex: Chest Day"
            placeholderTextColor={colors.dark.text.tertiary}
            style={{
              backgroundColor: colors.dark.bg.tertiary,
              color: colors.dark.text.primary,
              padding: spacing.md,
              borderRadius: radius.md,
              fontSize: typography.fontSize.md,
            }}
          />
        </View>
        
        <View style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize.md, fontWeight: 'bold' }}>
              Exercises
            </Text>
            <Link href="/training/library" asChild>
              <Button label="Add" iconName="add" size="sm" variant="secondary" />
            </Link>
          </View>
          
          {exercises.length === 0 ? (
            <Card style={{ padding: spacing.xl, alignItems: 'center', gap: spacing.sm, borderStyle: 'dashed' }}>
               <Icon name="barbell-outline" size={32} color={colors.dark.text.tertiary} />
                <Text style={{ color: colors.dark.text.secondary }}>
                  No exercises added yet.
                </Text>
            </Card>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {exercises.map((ex, index) => (
                <Card key={ex.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: colors.dark.text.secondary, marginRight: spacing.md, fontWeight: 'bold' }}>
                    {index + 1}
                  </Text>
                  <Text style={{ flex: 1, color: colors.dark.text.primary, fontWeight: 'bold' }}>
                    {ex.name}
                  </Text>
                  <Pressable onPress={() => removeExerciseFromMenu(ex.id)} style={{ padding: spacing.sm }}>
                    <Icon name="trash-outline" size={18} color={colors.dark.accent.primary} />
                  </Pressable>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={{ padding: spacing.base, paddingBottom: spacing.xl, backgroundColor: colors.dark.bg.primary, borderTopWidth: 1, borderTopColor: colors.dark.border.subtle }}>
        <Button label={isSaving ? "Saving..." : "Save Menu"} iconName="save" fullWidth onPress={handleSaveMenu} disabled={exercises.length === 0 || !menuName || isSaving} />
      </View>
    </View>
  );
}
