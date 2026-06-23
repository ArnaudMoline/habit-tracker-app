import { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppData, Habit } from '../types';
import { useTheme } from '../theme';
import { today, streak, targetDaysLabel, daysBetween, isTargetDay } from '../utils';
import AddHabitModal from '../components/AddHabitModal';
import DevTools from '../components/DevTools';

interface Props {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

export default function HomeScreen({ data, onUpdate }: Props) {
  const { theme: t, toggleTheme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [devToolsVisible, setDevToolsVisible] = useState(false);
  const [headerTapCount, setHeaderTapCount] = useState(0);

  const todayStr = today();

  const challengeActive =
    data.challengeAccepted &&
    data.challengeStartDate !== null &&
    daysBetween(data.challengeStartDate, todayStr) < 3;

  const challengeDay = data.challengeStartDate
    ? Math.min(daysBetween(data.challengeStartDate, todayStr) + 1, 3)
    : 0;

  const challengeEnded =
    data.challengeAccepted &&
    data.challengeStartDate !== null &&
    daysBetween(data.challengeStartDate, todayStr) >= 3;

  const challengeWon =
    challengeEnded &&
    data.habits.filter(h => h.isChallenge).every(h => {
      const start = data.challengeStartDate!;
      const [sy, sm, sd] = start.split('-').map(Number);
      return [0, 1, 2].every(offset => {
        const d = new Date(sy, sm - 1, sd + offset);
        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return h.completedDates.includes(ds);
      });
    });

  function handleHeaderTap() {
    const next = headerTapCount + 1;
    setHeaderTapCount(next);
    if (next >= 5) {
      setHeaderTapCount(0);
      setDevToolsVisible(true);
    }
  }

  function addHabit(name: string, icon: string, targetDays: number[]) {
    const habit: Habit = { id: Date.now().toString(), name, icon, completedDates: [], targetDays, isChallenge: false };
    onUpdate({ ...data, habits: [habit, ...data.habits] });
  }

  function toggleToday(id: string) {
    const habits = data.habits.map(h => {
      if (h.id !== id) return h;
      const done = h.completedDates.includes(todayStr);
      return { ...h, completedDates: done ? h.completedDates.filter(d => d !== todayStr) : [...h.completedDates, todayStr] };
    });
    onUpdate({ ...data, habits });
  }

  function deleteHabit(id: string) {
    Alert.alert('Delete habit', 'Remove this habit and all its history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onUpdate({ ...data, habits: data.habits.filter(h => h.id !== id) }) },
    ]);
  }

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <View style={[s.root, { backgroundColor: t.bg }]}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[s.header, { backgroundColor: t.surface, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={handleHeaderTap} activeOpacity={1} style={s.headerLeft}>
          <Text style={[s.title, { color: t.purple }]}>Habit Tracker</Text>
          <Text style={[s.dateLabel, { color: t.subtext }]}>{dateLabel}</Text>
        </TouchableOpacity>
        <View style={s.headerRight}>
          <TouchableOpacity
            style={[s.iconButton, { backgroundColor: t.purpleLight }]}
            onPress={toggleTheme}
          >
            <Text style={{ fontSize: 16 }}>{t.isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.addBtn, { backgroundColor: t.purple }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={s.addBtnText}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={data.habits}
        keyExtractor={h => h.id}
        contentContainerStyle={s.list}
        ListHeaderComponent={() => (
          <>
            {challengeWon && (
              <View style={[s.banner, { backgroundColor: t.greenBg, borderColor: t.green }]}>
                <Text style={s.bannerIcon}>🏆</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.bannerTitle, { color: t.green }]}>Challenge complete!</Text>
                  <Text style={[s.bannerSub, { color: t.green + 'AA' }]}>You built your first 3-day streak</Text>
                </View>
              </View>
            )}
            {challengeEnded && !challengeWon && (
              <View style={[s.banner, { backgroundColor: t.purpleLight, borderColor: t.border }]}>
                <Text style={s.bannerIcon}>💪</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.bannerTitle, { color: t.text }]}>Challenge ended</Text>
                  <Text style={[s.bannerSub, { color: t.subtext }]}>Keep going — consistency is everything</Text>
                </View>
              </View>
            )}
            {challengeActive && (
              <View style={[s.challengeBanner, { backgroundColor: t.card, borderColor: t.border }]}>
                <View style={s.challengeRow}>
                  <Text style={[s.challengeTitle, { color: t.text }]}>⚡ 3-Day Challenge</Text>
                  <Text style={[s.challengeDay, { color: t.amber }]}>Day {challengeDay} of 3</Text>
                </View>
                <View style={[s.progressBar, { backgroundColor: t.border }]}>
                  <View style={[s.progressFill, { width: `${(challengeDay / 3) * 100}%` as any, backgroundColor: t.amber }]} />
                </View>
              </View>
            )}
            {data.habits.length === 0 && (
              <View style={s.empty}>
                <Text style={s.emptyIcon}>🌱</Text>
                <Text style={[s.emptyText, { color: t.text }]}>No habits yet.</Text>
                <Text style={[s.emptyHint, { color: t.subtext }]}>Tap ＋ to add your first habit.</Text>
              </View>
            )}
          </>
        )}
        renderItem={({ item }) => {
          const done = item.completedDates.includes(todayStr);
          const s2 = streak(item);
          const applicable = isTargetDay(item, todayStr);
          const daysLabel = targetDaysLabel(item.targetDays);

          return (
            <View style={[
              s.card,
              { backgroundColor: done ? t.purpleLight : t.card, borderColor: done ? t.purple + '55' : t.border },
              !applicable && s.cardMuted,
            ]}>
              <TouchableOpacity
                style={[s.checkbox, { borderColor: t.purple }, done && { backgroundColor: t.purple }]}
                onPress={() => toggleToday(item.id)}
                activeOpacity={0.7}
              >
                {done && <Text style={s.checkText}>✓</Text>}
              </TouchableOpacity>

              <Text style={s.habitIcon}>{item.icon}</Text>

              <View style={s.cardBody}>
                <Text
                  style={[s.habitName, { color: done ? t.purple : t.text }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <View style={s.meta}>
                  {s2 > 0 && <Text style={[s.streakBadge, { color: '#F4845F' }]}>🔥 {s2} day streak</Text>}
                  <Text style={[s.daysLabel, { color: t.muted }]}>{daysLabel}</Text>
                  {item.isChallenge && <Text style={[s.challengeTag, { color: t.amber }]}>⚡ challenge</Text>}
                </View>
              </View>

              <TouchableOpacity onPress={() => deleteHabit(item.id)} style={s.deleteBtn}>
                <Text style={[s.deleteBtnText, { color: t.muted }]}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <AddHabitModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addHabit}
      />

      <DevTools
        visible={devToolsVisible}
        onClose={() => setDevToolsVisible(false)}
        data={data}
        onUpdate={onUpdate}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingTop: 56,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800' },
  dateLabel: { fontSize: 13, marginTop: 2 },
  iconButton: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtn: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 20, lineHeight: 24 },
  list: { padding: 16, paddingBottom: 40 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    gap: 12,
  },
  bannerIcon: { fontSize: 30 },
  bannerTitle: { fontWeight: '700', fontSize: 15 },
  bannerSub: { fontSize: 13, marginTop: 2 },
  challengeBanner: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 1,
  },
  challengeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  challengeTitle: { fontWeight: '700', fontSize: 15 },
  challengeDay: { fontWeight: '600', fontSize: 14 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '600' },
  emptyHint: { fontSize: 14, marginTop: 6 },
  card: {
    borderRadius: 14,
    marginBottom: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
    gap: 10,
  },
  cardMuted: { opacity: 0.4 },
  checkbox: {
    width: 26, height: 26, borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  checkText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  habitIcon: { fontSize: 22, flexShrink: 0 },
  cardBody: { flex: 1, minWidth: 0 },
  habitName: { fontSize: 15, fontWeight: '600' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' },
  streakBadge: { fontSize: 12 },
  daysLabel: { fontSize: 12 },
  challengeTag: { fontSize: 12, fontWeight: '600' },
  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 14 },
});
