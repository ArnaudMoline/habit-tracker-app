import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppData, GoalCategory, Habit, Motivation, Screen } from './types';
import { loadData, saveData } from './storage';
import { today } from './utils';
import { ThemeContext, dark, light } from './theme';
import OnboardingScreen from './screens/OnboardingScreen';
import ChallengeScreen from './screens/ChallengeScreen';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [screen, setScreen] = useState<Screen>('onboarding');

  useEffect(() => {
    loadData().then(d => {
      setData(d);
      if (!d.onboardingDone) setScreen('onboarding');
      else if (!d.challengeAccepted) setScreen('challenge');
      else setScreen('home');
    });
  }, []);

  async function update(next: AppData) {
    setData(next);
    await saveData(next);
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

  if (!data) {
    return (
      <View style={[s.loading, { backgroundColor: dark.bg }]}>
        <ActivityIndicator size="large" color={dark.purple} />
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
    </ThemeContext.Provider>
  );
}

const s = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
