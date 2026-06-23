import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GoalCategory, Habit } from '../types';
import { useTheme } from '../theme';
import { HABIT_ICONS } from '../utils';
import IconPicker from '../components/IconPicker';

const CHALLENGE_HABITS: Record<GoalCategory, Array<{ name: string; icon: string }>> = {
  health:       [{ name: 'Drink 8 glasses of water',           icon: '💧' }, { name: 'Eat a vegetable with every meal', icon: '🥦' }, { name: 'Sleep by 10:30 PM',              icon: '😴' }],
  fitness:      [{ name: '30 minute workout',                  icon: '🏋️' }, { name: '10,000 steps',                    icon: '🚶' }, { name: '10 min stretching',              icon: '🧘' }],
  productivity: [{ name: 'Plan your day (15 min)',             icon: '📝' }, { name: 'No phone for the first hour',     icon: '⏰' }, { name: 'Review tasks before bed',        icon: '✅' }],
  learning:     [{ name: 'Read 20 pages',                      icon: '📚' }, { name: 'Study for 30 minutes',            icon: '🎓' }, { name: 'Watch one educational video',    icon: '💻' }],
  mindfulness:  [{ name: '10 min meditation',                  icon: '🧘' }, { name: 'Write 3 gratitudes',              icon: '✍️' }, { name: '5 min breathing exercise',      icon: '🌿' }],
};

interface CustomHabit { name: string; icon: string }

interface Props {
  goalCategory: GoalCategory;
  onAccept: (habits: Omit<Habit, 'id'>[]) => void;
  onSkip: () => void;
}

export default function ChallengeScreen({ goalCategory, onAccept, onSkip }: Props) {
  const { theme: t } = useTheme();
  const [mode, setMode] = useState<'suggested' | 'custom'>('suggested');
  const [customHabits, setCustomHabits] = useState<CustomHabit[]>([
    { name: '', icon: HABIT_ICONS[0] },
    { name: '', icon: HABIT_ICONS[1] },
    { name: '', icon: HABIT_ICONS[2] },
  ]);
  const [iconPickerIdx, setIconPickerIdx] = useState<number | null>(null);

  const suggested = CHALLENGE_HABITS[goalCategory];

  function updateCustom(idx: number, field: keyof CustomHabit, value: string) {
    setCustomHabits(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  }

  function addCustomHabit() {
    if (customHabits.length >= 5) return;
    setCustomHabits(prev => [...prev, { name: '', icon: HABIT_ICONS[prev.length % HABIT_ICONS.length] }]);
  }

  function removeCustomHabit(idx: number) {
    if (customHabits.length <= 1) return;
    setCustomHabits(prev => prev.filter((_, i) => i !== idx));
  }

  function handleAccept() {
    if (mode === 'suggested') {
      onAccept(suggested.map(h => ({ ...h, completedDates: [], targetDays: [], isChallenge: true })));
    } else {
      const valid = customHabits.filter(h => h.name.trim());
      if (!valid.length) return;
      onAccept(valid.map(h => ({ name: h.name.trim(), icon: h.icon, completedDates: [], targetDays: [], isChallenge: true })));
    }
  }

  const canAccept =
    mode === 'suggested' || customHabits.some(h => h.name.trim());

  return (
    <View style={[s.root, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Badge */}
        <View style={[s.badge, { backgroundColor: t.amber + '22' }]}>
          <Text style={[s.badgeText, { color: t.amber }]}>3-DAY CHALLENGE</Text>
        </View>

        <Text style={[s.heading, { color: t.text }]}>Your starter challenge</Text>
        <Text style={[s.sub, { color: t.subtext }]}>
          Complete these habits every day for 3 days to build your first streak.
        </Text>

        {/* Mode toggle */}
        <View style={[s.toggle, { backgroundColor: t.surface, borderColor: t.border }]}>
          {(['suggested', 'custom'] as const).map(m => (
            <TouchableOpacity
              key={m}
              style={[s.toggleBtn, mode === m && { backgroundColor: t.purple }]}
              onPress={() => setMode(m)}
            >
              <Text style={[s.toggleText, { color: mode === m ? '#fff' : t.subtext }]}>
                {m === 'suggested' ? 'Suggested' : 'Custom'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Suggested habits */}
        {mode === 'suggested' && (
          <View style={s.list}>
            {suggested.map((h, i) => (
              <View key={i} style={[s.habitCard, { backgroundColor: t.card, borderColor: t.border }]}>
                <View style={[s.num, { backgroundColor: t.purple }]}>
                  <Text style={s.numText}>{i + 1}</Text>
                </View>
                <Text style={s.habitIcon}>{h.icon}</Text>
                <Text style={[s.habitName, { color: t.text }]}>{h.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Custom habits */}
        {mode === 'custom' && (
          <View style={s.list}>
            {customHabits.map((h, i) => (
              <View key={i} style={[s.customRow, { backgroundColor: t.card, borderColor: t.border }]}>
                <TouchableOpacity
                  style={[s.customIcon, { backgroundColor: t.purpleLight }]}
                  onPress={() => setIconPickerIdx(i)}
                >
                  <Text style={{ fontSize: 22 }}>{h.icon}</Text>
                </TouchableOpacity>
                <TextInput
                  style={[s.customInput, { color: t.text, borderColor: t.border }]}
                  placeholder={`Habit ${i + 1}…`}
                  placeholderTextColor={t.muted}
                  value={h.name}
                  onChangeText={v => updateCustom(i, 'name', v)}
                  maxLength={60}
                  returnKeyType="next"
                />
                {customHabits.length > 1 && (
                  <TouchableOpacity onPress={() => removeCustomHabit(i)} style={s.removeBtn}>
                    <Text style={[s.removeBtnText, { color: t.muted }]}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {customHabits.length < 5 && (
              <TouchableOpacity
                style={[s.addHabitBtn, { borderColor: t.border }]}
                onPress={addCustomHabit}
              >
                <Text style={[s.addHabitText, { color: t.purple }]}>+ Add another habit</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Reward */}
        <View style={[s.reward, { backgroundColor: t.purpleLight }]}>
          <Text style={s.rewardIcon}>🏆</Text>
          <Text style={[s.rewardText, { color: t.purple }]}>
            Finish all 3 days to unlock your first achievement
          </Text>
        </View>

        <TouchableOpacity
          style={[s.primaryBtn, { backgroundColor: canAccept ? t.purple : t.muted }]}
          onPress={handleAccept}
          disabled={!canAccept}
        >
          <Text style={s.primaryBtnText}>Accept Challenge</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.skipBtn} onPress={onSkip}>
          <Text style={[s.skipText, { color: t.muted }]}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>

      <IconPicker
        visible={iconPickerIdx !== null}
        selected={iconPickerIdx !== null ? customHabits[iconPickerIdx].icon : ''}
        onSelect={ic => {
          if (iconPickerIdx !== null) updateCustom(iconPickerIdx, 'icon', ic);
        }}
        onClose={() => setIconPickerIdx(null)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, paddingTop: 56 },
  scroll: { padding: 24, paddingBottom: 60 },
  badge: {
    alignSelf: 'center',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
  },
  badgeText: { fontWeight: '700', fontSize: 12, letterSpacing: 1 },
  heading: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  sub: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  toggle: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 20,
  },
  toggleBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  toggleText: { fontSize: 14, fontWeight: '700' },
  list: { marginBottom: 20 },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 1,
  },
  num: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  numText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  habitIcon: { fontSize: 20, marginRight: 10 },
  habitName: { fontSize: 15, fontWeight: '600', flex: 1 },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    gap: 10,
  },
  customIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  customInput: {
    flex: 1,
    fontSize: 15,
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  removeBtn: { padding: 6 },
  removeBtnText: { fontSize: 14 },
  addHabitBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  addHabitText: { fontSize: 15, fontWeight: '600' },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    gap: 10,
  },
  rewardIcon: { fontSize: 24 },
  rewardText: { fontSize: 14, fontWeight: '600', flex: 1 },
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipText: { fontSize: 15 },
});
