import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';

export default function BodyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>
          Body Records
        </Text>

        <Card style={styles.promoCard}>
          <Icon name="shield-checkmark" size={48} color={colors.dark.accent.success} />
          <Text style={styles.cardTitle}>
            Encrypted Camera
          </Text>
          <Text style={styles.cardDescription}>
            Photos are encrypted locally using AES-256 and never saved to your Camera Roll.
          </Text>
          <Link href="/camera" asChild>
            <Button label="Open Secured Camera" iconName="camera" fullWidth />
          </Link>
        </Card>

        <View style={styles.sectionHeader}>
          <Icon name="images-outline" size={20} color={colors.dark.text.primary} />
          <Text style={styles.sectionTitle}>
             Gallery Timeline
          </Text>
        </View>
        
        <View style={styles.galleryGrid}>
           <Card style={styles.placeholderCard}>
               <Icon name="person-outline" size={24} color={colors.dark.text.secondary} />
               <Text style={styles.placeholderText}>Front</Text>
           </Card>
           <Card style={styles.placeholderCard}>
               <Icon name="body-outline" size={24} color={colors.dark.text.secondary} />
               <Text style={styles.placeholderText}>Side</Text>
           </Card>
        </View>
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
  promoCard: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.dark.bg.elevated,
    gap: spacing.md,
  },
  cardTitle: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
  cardDescription: {
    color: colors.dark.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  galleryGrid: {
    flexDirection: 'row',
    gap: spacing.base,
  },
  placeholderCard: {
    flex: 1,
    padding: spacing.sm,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  placeholderText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
});
