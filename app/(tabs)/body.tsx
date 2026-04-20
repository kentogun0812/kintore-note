import { View, Text, ScrollView, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';

export default function BodyScreen() {
  return (
    <ScrollView 
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: spacing.base, gap: spacing.md }}
    >
      <Text style={{ fontSize: typography.fontSize['2xl'], fontWeight: 'heavy', color: colors.dark.text.primary, marginBottom: spacing.xs }}>
        Body Records
      </Text>

      <Card style={{ padding: spacing.md, alignItems: 'center', backgroundColor: colors.dark.bg.elevated, gap: spacing.md }}>
        <Icon name="shield-checkmark" size={48} color={colors.dark.accent.success} />
        <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize.lg, fontWeight: 'bold' }}>
          Encrypted Camera
        </Text>
        <Text style={{ color: colors.dark.text.secondary, textAlign: 'center', marginBottom: spacing.sm }}>
          Photos are encrypted locally using AES-256 and never saved to your Camera Roll.
        </Text>
        <Link href="/camera" asChild>
          <Button label="Open Secured Camera" iconName="camera" fullWidth />
        </Link>
      </Card>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md }}>
        <Icon name="images-outline" size={20} color={colors.dark.text.primary} />
        <Text style={{ fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.dark.text.primary }}>
           Gallery Timeline
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', gap: spacing.base }}>
         <Card style={{ flex: 1, padding: spacing.sm, height: 160, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: colors.dark.border.subtle }}>
             <Icon name="person-outline" size={24} color={colors.dark.text.secondary} />
             <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.sm, marginTop: spacing.xs }}>Front</Text>
         </Card>
         <Card style={{ flex: 1, padding: spacing.sm, height: 160, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: colors.dark.border.subtle }}>
             <Icon name="body-outline" size={24} color={colors.dark.text.secondary} />
             <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.sm, marginTop: spacing.xs }}>Side</Text>
         </Card>
      </View>
    </ScrollView>
  );
}
