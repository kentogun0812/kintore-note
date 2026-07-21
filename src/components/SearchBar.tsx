import React from 'react';
import { View, TextInput, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon } from '@/components/Icon';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChangeText, placeholder, style, autoFocus }: SearchBarProps) {
  return (
    <View style={[styles.searchBar, style]}>
      <Icon name="search" size={20} color={colors.dark.text.secondary} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={colors.dark.text.tertiary}
        value={value}
        onChangeText={onChangeText}
        clearButtonMode="while-editing"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8} style={styles.clearButton}>
          <Icon name="close-circle" size={18} color={colors.dark.text.secondary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    height: 48,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  searchInput: {
    flex: 1,
    color: colors.dark.text.primary,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.md,
  },
  clearButton: {
    padding: spacing.xs,
  },
});
