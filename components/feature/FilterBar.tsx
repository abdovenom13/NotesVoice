import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

interface FilterBarProps {
  activeFilter: 'all' | 'favorites';
  onFilterChange: (filter: 'all' | 'favorites') => void;
  allCount: number;
  favoritesCount: number;
}

export function FilterBar({ activeFilter, onFilterChange, allCount, favoritesCount }: FilterBarProps) {
  const filters = [
    { key: 'all' as const, label: 'الكل', icon: 'description', count: allCount },
    { key: 'favorites' as const, label: 'المفضلة', icon: 'star', count: favoritesCount },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter.key;
        return (
          <Pressable
            key={filter.key}
            onPress={() => onFilterChange(filter.key)}
            style={({ pressed }) => [
              styles.chip,
              isActive && styles.chipActive,
              pressed && styles.chipPressed,
            ]}
          >
            <MaterialIcons
              name={filter.icon as any}
              size={18}
              color={isActive ? theme.colors.background : theme.colors.textSecondary}
            />
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {filter.label}
            </Text>
            <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
              <Text style={[styles.countText, isActive && styles.countTextActive]}>
                {filter.count}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  
  chipPressed: {
    opacity: 0.7,
  },
  
  chipText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  
  chipTextActive: {
    color: theme.colors.background,
  },
  
  countBadge: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    minWidth: 24,
    alignItems: 'center',
  },
  
  countBadgeActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  
  countText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  countTextActive: {
    color: theme.colors.background,
  },
});
