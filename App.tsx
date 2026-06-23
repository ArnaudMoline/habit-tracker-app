import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { AppData, GoalCategory, Habit, Motivation, Screen } from './types';
import { loadData, saveData, DEFAULT_DATA } from './storage';
import { today } from './utils';
import { ThemeContext, dark, light } from './theme';
import { supabase } from './lib/supabase';
import { pullAll, pushProfile, pushHabits, deleteHabitRemote } from './lib/sync';
import OnboardingScreen from './screens/OnboardingScreen';
import ChallengeScreen from './screens/ChallengeScreen';
import HomeScreen from './screens/HomeScreen';
import AuthScreen from './screens/AuthScreen';

// session === undefined  →  still checking (splash)
// session === null       →  not logged in  →  show AuthScreen
// session = Session      →  logged in      →  show app
type SessionState = Session | null | undefined;

export default function App() {
  const [session, setSession] = useState<SessionState>(undefined);
  const [data, setData] = useState<AppData | null>(null);
  const [screen, setScreen] = useState<Screen>('onboarding');
  const prevHabits = useRef<Habit[]>([]);

  useEffect(() => {
    // 1. Restore existing session from AsyncStorage (Supabase handles this)
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) initWithSession(s.user.id);
      else setSession(null);
    });

    // 2. Keep session in sync on login / logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      setSession(s);
      if (event === 'SIGNED_IN' && s) await initWithSession(s.user.id);
      if (event === 'SIGNED_OUT') {
        setData(null);
        prevHabits.current = [];
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function initWithSession(userId: string) {
    // Show local data immediately for instant startup
    const local = await loadData();
    setData(local);
    prevHabits.current = local.habits;
    screenFromData(local);

    // Background: pull remote and reconcile
    try {
      const remote = await pullAll(userId);
      if (remote?.onboardingDone) {
        // Existing account — remote is source of truth
        const merged: AppData = { ...DEFAULT_DATA, ...local, ...remote };
        setData(merged);
        prevHabits.current = merged.habits;
        await saveData(merged);
        screenFromData(merged);
      } else {
        // New account — push local data up so it's not lost
        await pushProfile(local, userId);
        if (local.habits.length > 0) await pushHabits(local.habits, userId);
      }
    } catch {
      // Offline — local data already shown, will sync on next launch
    }
  }

  function screenFromData(d: AppData) {
    if (!d.onboardingDone) setScreen('onboarding');
    else if (!d.challengeAccepted) setScreen('challenge');
    else setScreen('home');
  }

  async function update(next: AppData) {
    const userId = session && 'user' in session ? session.user.id : undefined;

    // Detect deleted habits and remove them from Supabase
    if (userId) {
      const prevIds = new Set(prevHabits.current.map(h => h.id));
      next.habits.forEach(h => prevIds.delete(h.id));
      prevIds.forEach(id => deleteHabitRemote(id).catch(() => {}));
    }

    prevHabits.current = next.habits;
    setData(next);
    await saveData(next); // local write is synchronous from the UI's perspective

    // Best-effort background sync — never blocks the UI
    if (userId) {
      pushProfile(next, userId).catch(() => {});
      pushHabits(next.habits, userId).catch(() => {});
    }
  }

  function toggleTheme() {
    if (!data) return;
    update({ ...data, darkMode: !data.darkMode });
  }

  function handleOnboardingComplete(goal: GoalCategory, motivation: Motivation) {
    update({ ...data!, onboardingDone: true, goalCategory: goal, motivation });
    setScreen('challenge');
  }

  function handleChallengeAccept(newHabits: Omit<Habit, 'id'>[]) {
    const habits: Habit[] = newHabits.map((h, i) => ({ ...h, id: `${Date.now()}-${i}` }));
    update({
      ...data!,
      challengeAccepted: true,
      challengeStartDate: today(),
      habits: [...habits, ...data!.habits],
    });
    setScreen('home');
  }

  function handleChallengeSkip() {
    update({ ...data!, challengeAccepted: true, challengeStartDate: null });
    setScreen('home');
  }

  const theme = data?.darkMode === false ? light : dark;

  // ── Splash (checking session) ────────────────────────────────────────────────
  if (session === undefined) {
    return (
      <View style={[s.center, { backgroundColor: dark.bg }]}>
        <ActivityIndicator size="large" color={dark.purple} />
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {/* Not logged in */}
      {session === null && <AuthScreen />}

      {/* Logged in — loading data */}
      {session !== null && !data && (
        <View style={[s.center, { backgroundColor: theme.bg }]}>
          <ActivityIndicator size="large" color={theme.purple} />
        </View>
      )}

      {/* Logged in — app ready */}
      {session !== null && data && (
        <>
          {screen === 'onboarding' && (
            <OnboardingScreen onComplete={handleOnboardingComplete} />
          )}
          {screen === 'challenge' && (
            <ChallengeScreen
              goalCategory={data.goalCategory!}
              onAccept={handleChallengeAccept}
              onSkip={handleChallengeSkip}
            />
          )}
          {screen === 'home' && (
            <HomeScreen data={data} onUpdate={update} />
          )}
        </>
      )}
    </ThemeContext.Provider>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
