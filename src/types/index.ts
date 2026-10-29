/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppPhase =
  | 'idle'
  | 'spinning'
  | 'selected'
  | 'research'
  | 'speaking'
  | 'completed';

export interface AppSettings {
  spinDuration: 2 | 4 | 6 | 8; // in seconds
  researchDuration: number; // in seconds (e.g. 600 for 10m)
  speakingDuration: number; // in seconds (e.g. 60 for 1m)
  soundEnabled: boolean;
  reducedMotion: boolean;
  cameraCleanMode: boolean; // Screen recording mode hides auxiliary header & tabs
}

export interface SessionHistoryItem {
  id: string;
  concept: string;
  timestamp: number;
  completedSpeaking: boolean;
}

export interface SessionStats {
  topicsSpun: number;
  completedRounds: number;
}

export interface ConceptNote {
  concept: string;
  note: string;
  updatedAt: number;
}
