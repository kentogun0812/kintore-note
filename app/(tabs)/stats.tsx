import { View, Text, ScrollView } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';

export default function StatsScreen() {
  return (
    <ScrollView 
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: spacing.base, gap: spacing.md }}
    >
      <Text style={{ fontSize: typography.fontSize['2xl'], fontWeight: 'heavy', color: colors.dark.text.primary, marginBottom: spacing.xs }}>
        Analytics
      </Text>

      <Card style={{ padding: spacing.xl, alignItems: 'center', backgroundColor: colors.dark.bg.tertiary, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.dark.border.subtle, gap: spacing.md, marginTop: spacing.md }}>
        <Icon name="lock-closed" size={32} color={colors.dark.text.tertiary} />
        <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize.lg, fontWeight: 'bold' }}>
          Coming in Phase 2
        </Text>
        <Text style={{ color: colors.dark.text.secondary, textAlign: 'center' }}>
          Detailed muscle heatmaps, volume progression charts, and PR celebrations are currently in development.
        </Text>
      </Card>
      
      <View style={{ opacity: 0.5, gap: spacing.md, marginTop: spacing.xl }}>
         <Card style={{ padding: spacing.md, height: 200, justifyContent: 'center', alignItems: 'center' }}>
            <Icon name="bar-chart-outline" size={48} color={colors.dark.text.tertiary} />
            <Text style={{ color: colors.dark.text.secondary, marginTop: spacing.md }}>Volume Chart Preview</Text>
         </Card>
      </View>
    </ScrollView>
  );
}
