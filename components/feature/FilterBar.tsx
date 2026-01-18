import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useFolders } from '@/hooks/useFolders';
import type { Folder } from '@/contexts/FoldersContext';

interface FilterBarProps {
  activeFilter: 'all' | 'favorites';
  onFilterChange: (filter: 'all' | 'favorites') => void;
  allCount: number;
  favoritesCount: number;
  selectedFolderId?: string;
  onFolderChange: (folderId: string | undefined) => void;
  folderCounts: Record<string, number>;
}

export function FilterBar({ activeFilter, onFilterChange, allCount, favoritesCount, selectedFolderId, onFolderChange, folderCounts }: FilterBarProps) {
  const { folders } = useFolders();
  
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
            onPress={() => {
              onFilterChange(filter.key);
              onFolderChange(undefined);
            }}
            style={({ pressed }) => [
              styles.chip,
              isActive && !selectedFolderId && styles.chipActive,
              pressed && styles.chipPressed,
            ]}
          >
            <MaterialIcons
              name={filter.icon as any}
              size={18}
              color={isActive && !selectedFolderId ? theme.colors.background : theme.colors.textSecondary}
            />
            <Text style={[styles.chipText, isActive && !selectedFolderId && styles.chipTextActive]}>
              {filter.label}
            </Text>
            <View style={[styles.countBadge, isActive && !selectedFolderId && styles.countBadgeActive]}>
              <Text style={[styles.countText, isActive && !selectedFolderId && styles.countTextActive]}>
                {filter.count}
              </Text>
            </View>
          </Pressable>
        );
      })}
      
      {folders.map((folder) => {
        const isActive = selectedFolderId === folder.id;
        const count = folderCounts[folder.id] || 0;
        return (
          <Pressable
            key={folder.id}
            onPress={() => onFolderChange(isActive ? undefined : folder.id)}
            style={({ pressed }) => [
              styles.chip,
              isActive && styles.chipActive,
              pressed && styles.chipPressed,
            ]}
          >
            <MaterialIcons
              name={folder.icon as any}
              size={18}
              color={isActive ? theme.colors.background : folder.color}
            />
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {folder.name}
            </Text>
            <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
              <Text style={[styles.countText, isActive && styles.countTextActive]}>
                {count}
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
