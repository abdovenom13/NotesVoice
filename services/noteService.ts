export interface MediaAttachment {
  id: string;
  uri: string;
  type: 'image' | 'video' | 'audio';
  name: string;
  size: number;
  duration?: number; // for audio/video
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  isFavorite: boolean;
  folderId?: string;
  tagIds?: string[];
  timeSpent?: number; // seconds spent on note
  lastOpenedAt?: number;
  createdAt: number;
  updatedAt: number;
  formatting?: TextFormatting[];
  attachments?: MediaAttachment[];
}

export interface TextFormatting {
  start: number;
  end: number;
  type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'color';
  value?: string; // for color type
}

export const noteService = {
  async getNotes(): Promise<Note[]> {
    const stored = localStorage.getItem('notes');
    if (!stored) return [];
    return JSON.parse(stored);
  },

  async saveNote(note: Note): Promise<void> {
    const notes = await this.getNotes();
    const index = notes.findIndex(n => n.id === note.id);
    
    if (index >= 0) {
      notes[index] = note;
    } else {
      notes.unshift(note);
    }
    
    localStorage.setItem('notes', JSON.stringify(notes));
  },

  async deleteNote(id: string): Promise<void> {
    const notes = await this.getNotes();
    const filtered = notes.filter(n => n.id !== id);
    localStorage.setItem('notes', JSON.stringify(filtered));
  },

  async toggleFavorite(id: string): Promise<void> {
    const notes = await this.getNotes();
    const note = notes.find(n => n.id === id);
    if (note) {
      note.isFavorite = !note.isFavorite;
      note.updatedAt = Date.now();
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  },

  createNote(title: string = '', content: string = ''): Note {
    return {
      id: Date.now().toString() + Math.random(),
      title,
      content,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      formatting: [],
    };
  },
};
