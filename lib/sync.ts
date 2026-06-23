import { supabase } from './supabase';
import { AppData, Habit } from '../types';

// ── Push ──────────────────────────────────────────────────────────────────────

export async function pushProfile(data: AppData, userId: string): Promise<void> {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    goal_category: data.goalCategory,
    motivation: data.motivation,
    dark_mode: data.darkMode,
    onboarding_done: data.onboardingDone,
    challenge_accepted: data.challengeAccepted,
    challenge_start_date: data.challengeStartDate,
  });
  if (error) throw error;
}

export async function pushHabits(habits: Habit[], userId: string): Promise<void> {
  if (habits.length === 0) return;
  const { error } = await supabase.from('habits').upsert(
    habits.map(h => ({
      id: h.id,
      user_id: userId,
      name: h.name,
      icon: h.icon,
      target_days: h.targetDays,
      completed_dates: h.completedDates,
      is_challenge: h.isChallenge,
      updated_at: new Date().toISOString(),
    })),
  );
  if (error) throw error;
}

export async function deleteHabitRemote(id: string): Promise<void> {
  await supabase.from('habits').delete().eq('id', id);
}

// ── Pull ──────────────────────────────────────────────────────────────────────

export async function pullAll(userId: string): Promise<Partial<AppData> | null> {
  const [{ data: profile, error: pe }, { data: rows, error: he }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('habits').select('*').eq('user_id', userId),
  ]);

  if (pe || he || !profile) return null;

  const habits: Habit[] = (rows ?? []).map((h: Record<string, unknown>) => ({
    id: h.id as string,
    name: h.name as string,
    icon: (h.icon as string) ?? '⭐',
    targetDays: (h.target_days as number[]) ?? [],
    completedDates: (h.completed_dates as string[]) ?? [],
    isChallenge: (h.is_challenge as boolean) ?? false,
  }));

  return {
    goalCategory: (profile.goal_category as AppData['goalCategory']) ?? null,
    motivation: (profile.motivation as AppData['motivation']) ?? null,
    darkMode: (profile.dark_mode as boolean) ?? true,
    onboardingDone: (profile.onboarding_done as boolean) ?? false,
    challengeAccepted: (profile.challenge_accepted as boolean) ?? false,
    challengeStartDate: (profile.challenge_start_date as string) ?? null,
    habits,
  };
}
