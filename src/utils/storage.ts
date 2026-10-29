/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppSettings, SessionHistoryItem, SessionStats } from '../types';
import { STARTER_CONCEPTS } from '../constants/starterConcepts';

const KEYS = {
  WORD_BANK: 'wordrush_word_bank_v1',
  SETTINGS: 'wordrush_settings_v1',
  SESSION_HISTORY: 'wordrush_session_history_v1',
  SESSION_STATS: 'wordrush_session_stats_v1',
  NOTES: 'wordrush_notes_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  spinDuration: 4,
  researchDuration: 600, // 10 minutes
  speakingDuration: 60, // 60 seconds
  soundEnabled: true,
  reducedMotion: false,
  cameraCleanMode: false,
};

export function loadSavedWordBank(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.WORD_BANK);
    if (!raw) return STARTER_CONCEPTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const sanitized = parsed
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((s) => s.trim());
      return sanitized.length > 0 ? sanitized : STARTER_CONCEPTS;
    }
  } catch {
    // Return defaults on error
  }
  return STARTER_CONCEPTS;
}

export function saveWordBank(words: string[]): void {
  try {
    localStorage.setItem(KEYS.WORD_BANK, JSON.stringify(words));
  } catch (e) {
    console.error('Failed to save word bank to localStorage', e);
  }
}

export function loadSavedSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) {
      // Check system reduced motion
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return { ...DEFAULT_SETTINGS, reducedMotion: prefersReduced };
    }
    const parsed = JSON.parse(raw);
    return {
      spinDuration: [2, 4, 6, 8].includes(parsed.spinDuration) ? parsed.spinDuration : 4,
      researchDuration: typeof parsed.researchDuration === 'number' && parsed.researchDuration > 0 ? parsed.researchDuration : 600,
      speakingDuration: typeof parsed.speakingDuration === 'number' && parsed.speakingDuration > 0 ? parsed.speakingDuration : 60,
      soundEnabled: parsed.soundEnabled !== undefined ? Boolean(parsed.soundEnabled) : true,
      reducedMotion: Boolean(parsed.reducedMotion),
      cameraCleanMode: Boolean(parsed.cameraCleanMode),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function loadSessionHistory(): SessionHistoryItem[] {
  try {
    const raw = localStorage.getItem(KEYS.SESSION_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSessionHistory(items: SessionHistoryItem[]): void {
  try {
    localStorage.setItem(KEYS.SESSION_HISTORY, JSON.stringify(items.slice(-50)));
  } catch (e) {
    console.error('Failed to save session history', e);
  }
}

export function loadSessionStats(): SessionStats {
  try {
    const raw = localStorage.getItem(KEYS.SESSION_STATS);
    if (!raw) return { topicsSpun: 0, completedRounds: 0 };
    const parsed = JSON.parse(raw);
    return {
      topicsSpun: typeof parsed.topicsSpun === 'number' ? parsed.topicsSpun : 0,
      completedRounds: typeof parsed.completedRounds === 'number' ? parsed.completedRounds : 0,
    };
  } catch {
    return { topicsSpun: 0, completedRounds: 0 };
  }
}

export function saveSessionStats(stats: SessionStats): void {
  try {
    localStorage.setItem(KEYS.SESSION_STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save session stats', e);
  }
}

export function loadNotes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(KEYS.NOTES);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function saveNotes(notes: Record<string, string>): void {
  try {
    localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes', e);
  }
}
