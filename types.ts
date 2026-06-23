export type GoalCategory = 'health' | 'fitness' | 'productivity' | 'learning' | 'mindfulness';
export type Motivation = 'streaks' | 'progress' | 'accountability' | 'balance';
export type Screen = 'onboarding' | 'challenge' | 'home';

export interface Habit {
  id: string;
  name: string;
  icon: string;         // emoji
  completedDates: string[]; // YYYY-MM-DD local
  targetDays: number[];     // 0=Sun … 6=Sat, empty = every day
  isChallenge: boolean;
}

export interface AppData {
  onboardingDone: boolean;
  challengeAccepted: boolean;
  challengeStartDate: string | null; // YYYY-MM-DD
  goalCategory: GoalCategory | null;
  motivation: Motivation | null;
  habits: Habit[];
  darkMode: boolean;
}
