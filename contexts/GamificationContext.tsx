import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: number;
}

export interface GamificationStats {
  totalPoints: number;
  totalWords: number;
  stickersUnlocked: string[];
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

interface GamificationContextType {
  stats: GamificationStats;
  stickers: Sticker[];
  addPoints: (words: number) => Promise<Sticker | null>;
  getAvailableStickers: () => Sticker[];
  resetStats: () => void;
}

export const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const STICKERS_POOL: Omit<Sticker, 'id' | 'unlockedAt'>[] = [
  // Common (50%)
  { name: 'سعيد', emoji: '😊', rarity: 'common' },
  { name: 'رائع', emoji: '👍', rarity: 'common' },
  { name: 'قلب', emoji: '❤️', rarity: 'common' },
  { name: 'نجمة', emoji: '⭐', rarity: 'common' },
  { name: 'نار', emoji: '🔥', rarity: 'common' },
  { name: 'مرح', emoji: '😄', rarity: 'common' },
  { name: 'بارد', emoji: '😎', rarity: 'common' },
  { name: 'تفكير', emoji: '🤔', rarity: 'common' },
  { name: 'احتفال', emoji: '🎉', rarity: 'common' },
  { name: 'كتاب', emoji: '📚', rarity: 'common' },
  
  // Rare (30%)
  { name: 'عبقري', emoji: '🧠', rarity: 'rare' },
  { name: 'صاروخ', emoji: '🚀', rarity: 'rare' },
  { name: 'جوهرة', emoji: '💎', rarity: 'rare' },
  { name: 'تاج', emoji: '👑', rarity: 'rare' },
  { name: 'كأس', emoji: '🏆', rarity: 'rare' },
  { name: 'ساحر', emoji: '🧙', rarity: 'rare' },
  { name: 'وحش لطيف', emoji: '👾', rarity: 'rare' },
  
  // Epic (15%)
  { name: 'يونيكورن', emoji: '🦄', rarity: 'epic' },
  { name: 'تنين', emoji: '🐉', rarity: 'epic' },
  { name: 'طائر النار', emoji: '🔥🦅', rarity: 'epic' },
  { name: 'قمر', emoji: '🌙', rarity: 'epic' },
  { name: 'نيزك', emoji: '☄️', rarity: 'epic' },
  
  // Legendary (5%)
  { name: 'ملك الكتابة', emoji: '✍️👑', rarity: 'legendary' },
  { name: 'سيد الكلمات', emoji: '📝✨', rarity: 'legendary' },
  { name: 'أسطورة', emoji: '⚡🏆', rarity: 'legendary' },
];

const DEFAULT_STATS: GamificationStats = {
  totalPoints: 0,
  totalWords: 0,
  stickersUnlocked: [],
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: new Date().toDateString(),
};

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<GamificationStats>(DEFAULT_STATS);
  const [stickers, setStickers] = useState<Sticker[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const stored = await AsyncStorage.getItem('gamification-stats');
      if (stored) {
        const parsed = JSON.parse(stored);
        setStats(parsed);
        loadStickers(parsed.stickersUnlocked);
      }
      updateStreak();
    } catch (error) {
      console.error('Error loading gamification stats:', error);
    }
  };

  const saveStats = async (newStats: GamificationStats) => {
    setStats(newStats);
    try {
      await AsyncStorage.setItem('gamification-stats', JSON.stringify(newStats));
    } catch (error) {
      console.error('Error saving gamification stats:', error);
    }
  };

  const loadStickers = (unlockedIds: string[]) => {
    const unlocked = STICKERS_POOL
      .filter((_, index) => unlockedIds.includes(index.toString()))
      .map((sticker, index) => ({
        ...sticker,
        id: index.toString(),
        unlockedAt: Date.now(),
      }));
    setStickers(unlocked);
  };

  const updateStreak = async () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (stats.lastActiveDate === today) {
      return;
    }

    const newStreak = stats.lastActiveDate === yesterday ? stats.currentStreak + 1 : 1;
    const newLongestStreak = Math.max(newStreak, stats.longestStreak);

    const updated = {
      ...stats,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActiveDate: today,
    };

    await saveStats(updated);
  };

  const getRandomSticker = (): Omit<Sticker, 'id' | 'unlockedAt'> => {
    const rand = Math.random();
    let pool: typeof STICKERS_POOL = [];

    if (rand < 0.05) {
      // 5% legendary
      pool = STICKERS_POOL.filter(s => s.rarity === 'legendary');
    } else if (rand < 0.20) {
      // 15% epic
      pool = STICKERS_POOL.filter(s => s.rarity === 'epic');
    } else if (rand < 0.50) {
      // 30% rare
      pool = STICKERS_POOL.filter(s => s.rarity === 'rare');
    } else {
      // 50% common
      pool = STICKERS_POOL.filter(s => s.rarity === 'common');
    }

    return pool[Math.floor(Math.random() * pool.length)];
  };

  const addPoints = async (words: number): Promise<Sticker | null> => {
    const newTotalWords = stats.totalWords + words;
    const newTotalPoints = stats.totalPoints + words;

    // Check if earned new sticker (every 100 points)
    const oldStickers = Math.floor(stats.totalPoints / 100);
    const newStickers = Math.floor(newTotalPoints / 100);

    let unlockedSticker: Sticker | null = null;

    if (newStickers > oldStickers) {
      const stickerTemplate = getRandomSticker();
      const stickerIndex = STICKERS_POOL.findIndex(
        s => s.name === stickerTemplate.name && s.emoji === stickerTemplate.emoji
      );

      if (!stats.stickersUnlocked.includes(stickerIndex.toString())) {
        unlockedSticker = {
          ...stickerTemplate,
          id: stickerIndex.toString(),
          unlockedAt: Date.now(),
        };

        const updated = {
          ...stats,
          totalPoints: newTotalPoints,
          totalWords: newTotalWords,
          stickersUnlocked: [...stats.stickersUnlocked, stickerIndex.toString()],
        };

        await saveStats(updated);
        setStickers(prev => [...prev, unlockedSticker!]);
        return unlockedSticker;
      }
    }

    const updated = {
      ...stats,
      totalPoints: newTotalPoints,
      totalWords: newTotalWords,
    };

    await saveStats(updated);
    return null;
  };

  const getAvailableStickers = (): Sticker[] => {
    return stickers;
  };

  const resetStats = async () => {
    setStats(DEFAULT_STATS);
    setStickers([]);
    try {
      await AsyncStorage.removeItem('gamification-stats');
    } catch (error) {
      console.error('Error resetting stats:', error);
    }
  };

  return (
    <GamificationContext.Provider
      value={{ stats, stickers, addPoints, getAvailableStickers, resetStats }}
    >
      {children}
    </GamificationContext.Provider>
  );
}
