import { Habit } from './types';

export function today(): string {
  return localDateStr(new Date());
}

export function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const da = new Date(ay, am - 1, ad).getTime();
  const db = new Date(by, bm - 1, bd).getTime();
  return Math.round((db - da) / 86_400_000);
}

export function addDaysToDateStr(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return localDateStr(new Date(y, m - 1, d + n));
}

export function isTargetDay(habit: Habit, dateStr: string): boolean {
  if (habit.targetDays.length === 0) return true;
  const [y, m, d] = dateStr.split('-').map(Number);
  return habit.targetDays.includes(new Date(y, m - 1, d).getDay());
}

export function streak(habit: Habit): number {
  if (habit.completedDates.length === 0) return 0;
  const completedSet = new Set(habit.completedDates);
  const todayStr = today();

  if (habit.targetDays.length === 0) {
    const sorted = [...habit.completedDates].sort().reverse();
    const yst = new Date();
    yst.setDate(yst.getDate() - 1);
    const ystStr = localDateStr(yst);
    if (sorted[0] !== todayStr && sorted[0] !== ystStr) return 0;
    let count = 1;
    for (let i = 1; i < sorted.length; i++) {
      const [py, pm, pd] = sorted[i - 1].split('-').map(Number);
      const [cy, cm, cd] = sorted[i].split('-').map(Number);
      const diff =
        (new Date(py, pm - 1, pd).getTime() - new Date(cy, cm - 1, cd).getTime()) / 86_400_000;
      if (Math.round(diff) === 1) count++;
      else break;
    }
    return count;
  }

  const cursor = new Date();
  let count = 0;
  let passedFirstTarget = false;
  for (let i = 0; i < 400; i++) {
    const ds = localDateStr(cursor);
    if (habit.targetDays.includes(cursor.getDay())) {
      if (completedSet.has(ds)) {
        count++;
        passedFirstTarget = true;
      } else if (ds === todayStr && !passedFirstTarget) {
        // today not yet checked — don't break streak
      } else {
        break;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function targetDaysLabel(targetDays: number[]): string {
  if (targetDays.length === 0 || targetDays.length === 7) return 'Every day';
  const sorted = [...targetDays].sort((a, b) => a - b);
  if (JSON.stringify(sorted) === JSON.stringify([1, 2, 3, 4, 5])) return 'Weekdays';
  if (JSON.stringify(sorted) === JSON.stringify([0, 6])) return 'Weekends';
  return sorted.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ');
}

export const HABIT_ICONS = [
  // Health
  '💧', '🥗', '🍎', '💊', '😴', '🥦', '🍵',
  // Fitness
  '🏃', '💪', '🚴', '🏋️', '🧘', '🚶', '⚽',
  // Mind & learning
  '📚', '✍️', '🎯', '🧠', '💻', '📖', '🎓',
  // Lifestyle
  '☕', '🌅', '🌙', '🌿', '🎨', '🎵', '🧹',
  // General
  '💰', '⏰', '📝', '🗓️', '✅', '🔑', '⭐',
];
