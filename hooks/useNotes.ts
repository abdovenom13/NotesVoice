import { useState, useEffect, useCallback } from 'react';
import { noteService, Note } from '@/services/noteService';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites'>('all');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    const data = await noteService.getNotes();
    setNotes(data);
    setLoading(false);
  }, []);

  const saveNote = useCallback(async (note: Note) => {
    await noteService.saveNote(note);
    await loadNotes();
  }, [loadNotes]);

  const deleteNote = useCallback(async (id: string) => {
    await noteService.deleteNote(id);
    await loadNotes();
  }, [loadNotes]);

  const toggleFavorite = useCallback(async (id: string) => {
    await noteService.toggleFavorite(id);
    await loadNotes();
  }, [loadNotes]);

  const createNote = useCallback(() => {
    return noteService.createNote();
  }, []);

  const filteredNotes = notes
    .filter(note => {
      if (filterMode === 'favorites' && !note.isFavorite) return false;
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      // Favorites first, then by update time
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return b.updatedAt - a.updatedAt;
    });

  return {
    notes: filteredNotes,
    loading,
    searchQuery,
    setSearchQuery,
    filterMode,
    setFilterMode,
    saveNote,
    deleteNote,
    toggleFavorite,
    createNote,
    loadNotes,
  };
}
