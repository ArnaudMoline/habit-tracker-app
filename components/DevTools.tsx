import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppData } from '../types';
import { useTheme } from '../theme';
import { today, localDateStr, daysBetween } from '../utils';
import { supabase } from '../lib/supabase';

interface Props {
  visible: boolean;
  onClose: () => void;
  data: AppData;
  onUpdate: (data: AppData) => void;
}

export default function DevTools({ visible, onClose, data, onUpdate }: Props) {
  const { theme: t } = useTheme();

  const challengeDay = data.challengeStartDate
    ? daysBetween(data.challengeStartDate, today()) + 1
    : null;

  function setChallengeDay(offset: number) {
    // Set challengeStartDate so that today appears as the given day
    const d = new Date();
    d.setDate(d.getDate() - (offset - 1));
    onUpdate({ ...data, challengeStartDate: localDateStr(d), challengeAccepted: true });
    onClose();
  }

  function simulateComplete() {
    // Set start date 3 days ago so challenge is finished
    const d = new Date();
    d.setDate(d.getDate() - 3);
    const startStr = localDateStr(d);
    // Mark all challenge habits as completed on all 3 challenge days
    const habits = data.habits.map(h => {
      if (!h.isChallenge) return h;
      const newDates = new Set(h.completedDates);
      for (let i = 0; i < 3; i++) {
        const dd = new Date();
        dd.setDate(dd.getDate() - (3 - i));
        newDates.add(localDateStr(dd));
      }
      return { ...h, completedDates: Array.from(newDates) };
    });
    onUpdate({ ...data, challengeStartDate: startStr, challengeAccepted: true, habits });
    onClose();
  }

  function completeAllToday() {
    const t2 = today();
    const habits = data.habits.map(h => ({
      ...h,
      completedDates: h.completedDates.includes(t2)
        ? h.completedDates
        : [...h.completedDates, t2],
    }));
    onUpdate({ ...data, habits });
    onClose();
  }

  function resetChallenge() {
    onUpdate({ ...data, challengeAccepted: false, challengeStartDate: null });
    onClose();
  }

  function resetAll() {
    Alert.alert(
      'Reset Everything',
      'This will delete all habits and restart onboarding.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            onUpdate({
              onboardingDone: false,
              challengeAccepted: false,
              challengeStartDate: null,
              goalCategory: null,
              motivation: null,
              habits: [],
              darkMode: data.darkMode,
            });
            onClose();
          },
        },
      ],
    );
  }

  const Row = ({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) => (
    <TouchableOpacity
      style={[s.row, { borderBottomColor: t.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[s.rowText, { color: danger ? t.red : t.text }]}>{label}</Text>
      <Text style={{ color: t.muted, fontSize: 16 }}>›</Text>
    </TouchableOpacity>
  );

  const Section = ({ title }: { title: string }) => (
    <Text style={[s.section, { color: t.subtext }]}>{title.toUpperCase()}</Text>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable
          style={[s.sheet, { backgroundColor: t.surface, borderColor: t.border }]}
          onPress={() => {}}
        >
          <View style={[s.handle, { backgroundColor: t.border }]} />
          <Text style={[s.title, { color: t.purple }]}>🔧 Developer Tools</Text>

          {challengeDay !== null && (
            <Text style={[s.info, { color: t.subtext, backgroundColor: t.purpleLight }]}>
              Challenge currently at Day {Math.min(challengeDay, 4)}
              {challengeDay > 3 ? ' (ended)' : ''}
            </Text>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            <Section title="Challenge simulation" />
            <Row label="Set to Day 1 of challenge" onPress={() => setChallengeDay(1)} />
            <Row label="Set to Day 2 of challenge" onPress={() => setChallengeDay(2)} />
            <Row label="Set to Day 3 of challenge" onPress={() => setChallengeDay(3)} />
            <Row label="Simulate challenge complete (all done)" onPress={simulateComplete} />
            <Row label="Reset challenge (show challenge screen)" onPress={resetChallenge} />

            <Section title="Habits" />
            <Row label="Complete all habits for today" onPress={completeAllToday} />

            <Section title="Danger zone" />
            <Row label="Reset everything & restart onboarding" onPress={resetAll} danger />
            <Row
              label="Sign out"
              onPress={() => { supabase.auth.signOut(); onClose(); }}
              danger
            />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 48,
    maxHeight: '80%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  info: {
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  section: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginTop: 20, marginBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: { fontSize: 15, fontWeight: '500' },
});
