import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, Habit } from './types';

const KEY = 'habit_tracker_v2';

export const DEFAULT_DATA: AppData = {
  onboardingDone: false,
  challengeAccepted: false,
  challengeStartDate: null,
  goalCategory: null,
  motivation: null,
  habits: [],
  darkMode: true,
};

export async function loadData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_DATA };
    const parsed = JSON.parse(raw);
    // Migrate: ensure every habit has an icon field
    const habits: Habit[] = (parsed.habits ?? []).map((h: Habit) => ({
      ...h,
      icon: h.icon ?? '⭐',
    }));
    return { ...DEFAULT_DATA, ...parsed, habits };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

export async function saveData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}
