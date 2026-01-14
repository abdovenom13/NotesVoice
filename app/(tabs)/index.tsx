import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { commonStyles } from '@/constants/styles';
import { useNotes } from '@/hooks/useNotes';
import { NoteCard } from '@/components/feature/NoteCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterBar } from '@/components/feature/FilterBar';
import { LinearGradient } from 'expo-linear-gradient';

export default function NotesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    notes,
    loading,
    searchQuery,
    setSearchQuery,
    filterMode,
    setFilterMode,
    toggleFavorite,
    createNote,
  } = useNotes();

  const allNotes = notes.length;
  const favoriteNotes = notes.filter(n => n.isFavorite).length;

  const handleCreateNote = () => {
    const newNote = createNote();
    router.push(`/note/${newNote.id}`);
  };

  return (
    <SafeAreaView style={[commonStyles.container, { paddingTop: insets.top }]} edges={['top']}>
      <LinearGradient
        colors={['#1a1a1a', '#0a0a0a']}
        style={styles.header}
      >
        <View style={styles.titleContainer}>
          <MaterialIcons name="edit-note" size={32} color={theme.colors.primary} />
          <Text style={styles.title}>ملاحظاتي</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ابحث في ملاحظاتك..."
          />
        </View>
      </LinearGradient>

      <FilterBar
        activeFilter={filterMode}
        onFilterChange={setFilterMode}
        allCount={allNotes}
        favoritesCount={favoriteNotes}
      />

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            onPress={() => router.push(`/note/${item.id}`)}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="note-add" size={64} color={theme.colors.textTertiary} />
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'لا توجد ملاحظات تطابق البحث'
                : filterMode === 'favorites'
                ? 'لا توجد ملاحظات مفضلة بعد'
                : 'ابدأ بإنشاء ملاحظتك الأولى'}
            </Text>
          </View>
        }
      />

      <Pressable
        onPress={handleCreateNote}
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.fabGradient}
        >
          <MaterialIcons name="add" size={32} color={theme.colors.background} />
        </LinearGradient>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  searchContainer: {
    marginTop: theme.spacing.sm,
  },
  
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  
  emptyText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    ...theme.shadows.lg,
  },
  
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  fabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
