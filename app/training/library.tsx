import React, { useState } from 'react';
import { View, Text, SectionList, TextInput, ActivityIndicator, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { ExerciseCard } from '@/components/ExerciseCard';
import { Icon } from '@/components/Icon';
import { supabase } from '@/infra/api/supabase.client';
import { useQuery } from '@tanstack/react-query';
import { useMenuStore } from '@/store/menu.store';

// Interface matching the joined query result
interface ExerciseRow {
  id: string;
  name_en: string;
  name_ja: string;
  muscle_groups: {
    id: string;
    name_en: string;
    name_ja: string;
    sort_order: number;
  };
}

export default function ExerciseLibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { addExerciseToMenu } = useMenuStore();

  const handleSelectExercise = (exerciseId: string, exerciseName: string) => {
    addExerciseToMenu({ id: exerciseId, name: exerciseName });
    router.back();
  };

  // Fetch exercises and their muscle groups from Supabase
  const { data: exercises, isLoading, error } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select(`
          id,
          name_en,
          name_ja,
          muscle_groups (
            id,
            name_en,
            name_ja,
            sort_order
          )
        `);
      
      if (error) {
        console.error('Supabase fetch error (exercises):', error);
        throw error;
      }
      
      console.log('Supabase exercises response info:');
      console.log(`- Data length: ${data ? data.length : 0}`);
      console.log('- First item sample: ', data && data.length > 0 ? JSON.stringify(data[0]) : 'NONE');

      return data as any as ExerciseRow[];
    }
  });

  // Group and format data for SectionList
  const groupedData = React.useMemo(() => {
    if (!exercises) return [];

    // Filter based on search query
    const filtered = exercises.filter(ex => {
      const query = searchQuery.toLowerCase();
      return ex.name_en.toLowerCase().includes(query) || 
             ex.name_ja.includes(query) ||
             ex.muscle_groups?.name_en.toLowerCase().includes(query);
    });

    // Helper to map muscle groups to ionicons
    const getIconForGroup = (groupNameEn: string = '') => {
      const g = groupNameEn.toLowerCase();
      if (g.includes('chest')) return 'body';
      if (g.includes('back')) return 'accessibility';
      if (g.includes('leg')) return 'walk';
      if (g.includes('core') || g.includes('abs')) return 'fitness';
      if (g.includes('shoulder')) return 'barbell';
      if (g.includes('arm') || g.includes('bicep') || g.includes('tricep')) return 'barbell';
      return 'barbell-outline';
    };

    // Group by muscle group
    const groups: Record<string, { title: string, order: number, data: any[] }> = {};
    
    filtered.forEach(ex => {
      const mgId = ex.muscle_groups?.id || 'unknown';
      const mgSort = ex.muscle_groups?.sort_order || 999;
      const mgTitle = ex.muscle_groups ? `${ex.muscle_groups.name_ja} (${ex.muscle_groups.name_en})` : 'Other';
      
      if (!groups[mgId]) {
        groups[mgId] = { title: mgTitle, order: mgSort, data: [] };
      }
      
      groups[mgId].data.push({
        id: ex.id,
        name: `${ex.name_ja} (${ex.name_en})`,
        muscleGroup: ex.muscle_groups?.name_ja || 'Other',
        iconName: getIconForGroup(ex.muscle_groups?.name_en)
      });
    });

    // Convert to array and sort by muscle group order
    return Object.values(groups)
      .sort((a, b) => a.order - b.order)
      .map(group => ({ title: group.title, data: group.data }));

  }, [exercises, searchQuery]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.dark.bg.primary }}>
      <Stack.Screen 
        options={{ 
          title: 'Exercise Library', 
          headerLargeTitle: false,
          headerTitleAlign: 'center',
          headerBackVisible: true, // Ensure back button is active
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
      
      <View style={{ padding: spacing.base, backgroundColor: colors.dark.bg.primary }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          backgroundColor: colors.dark.bg.elevated,
          borderRadius: 10,
          paddingHorizontal: spacing.sm,
          height: 40
        }}>
          <Icon name="search" size={16} color={colors.dark.text.secondary} />
          <TextInput
            style={{ 
              flex: 1, 
              color: colors.dark.text.primary, 
              marginLeft: spacing.sm,
              fontSize: typography.fontSize.base,
            }}
            placeholder="Search exercises..."
            placeholderTextColor={colors.dark.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.dark.accent.primary} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <Text style={{ color: colors.dark.accent.primary, textAlign: 'center' }}>Failed to load exercises.</Text>
          <Text style={{ color: colors.dark.text.secondary, textAlign: 'center', marginTop: spacing.md }}>
            {error instanceof Error ? error.message : JSON.stringify(error)}
          </Text>
        </View>
      ) : (
        <SectionList
          contentInsetAdjustmentBehavior="automatic"
          sections={groupedData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: spacing.base, paddingVertical: spacing.xs }}>
              <ExerciseCard 
                exercise={item} 
                onPress={() => handleSelectExercise(item.id, item.name)} 
              />
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={{ 
              backgroundColor: colors.dark.bg.primary, 
              paddingHorizontal: spacing.base, 
              paddingVertical: spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: colors.dark.border.subtle,
            }}>
              <Text style={{ 
                color: colors.dark.text.primary, 
                fontWeight: 'bold', 
                fontSize: typography.fontSize.md 
              }}>{title}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ padding: spacing.xl, alignItems: 'center' }}>
              <Text style={{ color: colors.dark.text.secondary }}>No exercises found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
