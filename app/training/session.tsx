import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { NumpadModal } from '@/components/NumpadModal';
import { useTrainingStore } from '@/store/training.store';
import * as Haptics from 'expo-haptics';

export default function ActiveSessionScreen() {
  const { exercises, startSession, addSet, updateSet, toggleSetComplete } = useTrainingStore();

  const [numpad, setNumpad] = useState<{
    visible: boolean;
    type: 'weight' | 'reps';
    value: string;
    exId: string;
    setId: string;
  }>({ visible: false, type: 'weight', value: '', exId: '', setId: '' });

  // Rest Timer State
  const [restLeft, setRestLeft] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restLeft > 0) {
      interval = setInterval(() => {
        setRestLeft(prev => {
          if (prev <= 1) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restLeft]);

  const startRest = (seconds: number) => {
    setRestLeft(seconds);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const formatRest = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleComplete = (exId: string, setId: string, currentlyCompleted: boolean) => {
    toggleSetComplete(exId, setId);
    if (!currentlyCompleted && restLeft === 0) {
      // Auto-start default rest of 60s when a set is completed
      startRest(60);
    }
  };

  useEffect(() => {
    // Scaffold dummy data if empty just to show the UI
    if (exercises.length === 0) {
      startSession([{ id: '1', name: 'ベンチプレス (Bench Press)' }]);
    }
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.dark.bg.primary }}>
      <Stack.Screen 
        options={{ 
          title: 'Active Session', 
          headerLargeTitle: false,
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
                alignItems: 'center'
              }}
            >
              <Icon name="chevron-back" size={20} color={colors.dark.text.primary} />
            </Pressable>
          )
        }} 
      />
      
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.base, gap: spacing.lg }}
      >
        {exercises.map((ex) => (
          <View key={ex.id} style={{ gap: spacing.md }}>
            <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize.xl, fontWeight: 'bold' }}>
              {ex.name}
            </Text>
            
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', padding: spacing.md, backgroundColor: colors.dark.bg.elevated, borderBottomWidth: 1, borderBottomColor: colors.dark.border.subtle }}>
                <Text style={{ flex: 1, color: colors.dark.text.secondary, textAlign: 'center' }}>Set</Text>
                <Text style={{ flex: 3, color: colors.dark.text.secondary, textAlign: 'center' }}>kg</Text>
                <Text style={{ flex: 3, color: colors.dark.text.secondary, textAlign: 'center' }}>Reps</Text>
                <Text style={{ flex: 1, color: colors.dark.text.secondary, textAlign: 'center' }}>✓</Text>
              </View>
              
              {ex.sets.map((set, index) => (
                <View key={set.id} style={{ flexDirection: 'row', padding: spacing.md, alignItems: 'center', backgroundColor: set.completed ? colors.dark.bg.elevated : 'transparent' }}>
                  <Text style={{ flex: 1, color: colors.dark.text.primary, textAlign: 'center', fontWeight: 'bold' }}>{index + 1}</Text>
                  <View style={{ flex: 3, alignItems: 'center' }}>
                    <Pressable 
                      onPress={() => !set.completed && setNumpad({ visible: true, type: 'weight', value: set.weight, exId: ex.id, setId: set.id })}
                      style={{ backgroundColor: colors.dark.bg.tertiary, padding: spacing.sm, borderRadius: radius.md, width: '80%', alignItems: 'center' }}
                    >
                      <Text style={{ color: set.completed ? colors.dark.text.secondary : colors.dark.text.primary, fontVariant: ['tabular-nums'] }}>{set.weight || '--'} kg</Text>
                    </Pressable>
                  </View>
                  <View style={{ flex: 3, alignItems: 'center' }}>
                    <Pressable 
                      onPress={() => !set.completed && setNumpad({ visible: true, type: 'reps', value: set.reps, exId: ex.id, setId: set.id })}
                      style={{ backgroundColor: colors.dark.bg.tertiary, padding: spacing.sm, borderRadius: radius.md, width: '80%', alignItems: 'center' }}
                    >
                      <Text style={{ color: set.completed ? colors.dark.text.secondary : colors.dark.text.primary, fontVariant: ['tabular-nums'] }}>{set.reps || '--'}</Text>
                    </Pressable>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Pressable 
                      onPress={() => handleToggleComplete(ex.id, set.id, set.completed)}
                      style={{ 
                        width: 32, height: 32, borderRadius: 16, 
                        backgroundColor: set.completed ? colors.dark.accent.success : colors.dark.bg.tertiary, 
                        justifyContent: 'center', alignItems: 'center' 
                      }}>
                       <Icon name={set.completed ? 'checkmark' : 'checkmark'} size={18} color={set.completed ? colors.dark.bg.primary : colors.dark.text.secondary} />
                    </Pressable>
                  </View>
                </View>
              ))}
              
              <Pressable onPress={() => addSet(ex.id)} style={{ padding: spacing.md, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.dark.border.subtle }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Icon name="add-circle-outline" size={18} color={colors.dark.accent.info} />
                  <Text style={{ color: colors.dark.accent.info, fontWeight: 'bold' }}>Add Set</Text>
                </View>
              </Pressable>
            </Card>
          </View>
        ))}
      </ScrollView>

      <View style={{ padding: spacing.base, paddingBottom: spacing.xl, backgroundColor: colors.dark.bg.elevated, borderTopWidth: 1, borderTopColor: colors.dark.border.subtle, gap: spacing.md }}>
        {/* Rest Timer Block */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.dark.bg.secondary, padding: spacing.md, borderRadius: radius.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Icon name="timer-outline" size={24} color={restLeft > 0 ? colors.dark.accent.info : colors.dark.text.secondary} />
            <Text style={{ color: restLeft > 0 ? colors.dark.accent.info : colors.dark.text.secondary, fontSize: typography.fontSize.lg, fontWeight: 'bold' }}>
              {restLeft > 0 ? formatRest(restLeft) : 'Rest Timer'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
             <Pressable onPress={() => startRest(60)} style={{ padding: spacing.xs, backgroundColor: colors.dark.bg.tertiary, borderRadius: radius.sm }}>
               <Text style={{ color: colors.dark.text.primary }}>1:00</Text>
             </Pressable>
             <Pressable onPress={() => startRest(90)} style={{ padding: spacing.xs, backgroundColor: colors.dark.bg.tertiary, borderRadius: radius.sm }}>
               <Text style={{ color: colors.dark.text.primary }}>1:30</Text>
             </Pressable>
             <Pressable onPress={() => startRest(120)} style={{ padding: spacing.xs, backgroundColor: colors.dark.bg.tertiary, borderRadius: radius.sm }}>
               <Text style={{ color: colors.dark.text.primary }}>2:00</Text>
             </Pressable>
          </View>
        </View>

        <Button 
          label="Complete Session" 
          iconName="checkmark-done"
          fullWidth
          onPress={() => router.push('/modals/session-summary')}
        />
      </View>

      <NumpadModal 
        visible={numpad.visible}
        type={numpad.type}
        initialValue={numpad.value}
        onClose={() => setNumpad({ ...numpad, visible: false })}
        onSave={(val) => updateSet(numpad.exId, numpad.setId, { [numpad.type]: val })}
      />
    </View>
  );
}
