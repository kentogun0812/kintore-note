import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/Button';

export default function CircleScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
      <Text style={{ fontSize: typography.fontSize['2xl'], fontWeight: 'heavy', color: colors.dark.text.primary, marginBottom: spacing.xs }}>
        Private Circle
      </Text>

      <Card style={{ padding: spacing.xl, alignItems: 'center', backgroundColor: colors.dark.bg.tertiary, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.dark.border.subtle, gap: spacing.md, marginTop: spacing.md }}>
        <Icon name="people" size={48} color={colors.dark.text.tertiary} />
        <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize.lg, fontWeight: 'bold' }}>
          Coming in Phase 2
        </Text>
        <Text style={{ color: colors.dark.text.secondary, textAlign: 'center' }}>
          Connect with friends, share your training menus, and react to their daily hanko stamps in a private, supportive feed.
        </Text>
        <View style={{ marginTop: spacing.sm, opacity: 0.5 }}>
           <Button label="Add Friend" iconName="person-add" />
        </View>
      </Card>
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
});
