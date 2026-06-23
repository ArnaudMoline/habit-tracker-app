import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GoalCategory, Motivation } from '../types';
import { useTheme } from '../theme';

interface Props {
  onComplete: (goal: GoalCategory, motivation: Motivation) => void;
}

const GOALS: { id: GoalCategory; icon: string; label: string; desc: string }[] = [
  { id: 'health',       icon: '🥗', label: 'Health',       desc: 'Eat well, sleep better'  },
  { id: 'fitness',      icon: '💪', label: 'Fitness',      desc: 'Move your body daily'    },
  { id: 'productivity', icon: '⚡', label: 'Productivity', desc: 'Get more done'            },
  { id: 'learning',     icon: '📚', label: 'Learning',     desc: 'Grow your mind'          },
  { id: 'mindfulness',  icon: '🧘', label: 'Mindfulness',  desc: 'Find inner calm'         },
];

const MOTIVATIONS: { id: Motivation; icon: string; label: string }[] = [
  { id: 'streaks',        icon: '🔥', label: 'Keeping streaks'    },
  { id: 'progress',       icon: '📈', label: 'Seeing progress'    },
  { id: 'accountability', icon: '🤝', label: 'Accountability'     },
  { id: 'balance',        icon: '⚖️', label: 'Work-life balance'  },
];

export default function OnboardingScreen({ onComplete }: Props) {
  const { theme: t } = useTheme();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<GoalCategory | null>(null);
  const [motivation, setMotivation] = useState<Motivation | null>(null);

  function finish() {
    if (goal && motivation) onComplete(goal, motivation);
  }

  return (
    <View style={[s.root, { backgroundColor: t.bg }]}>
      <View style={s.dots}>
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            style={[
              s.dot,
              { backgroundColor: i <= step ? t.purple : t.border },
              i <= step && { width: 20 },
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View style={s.center}>
            <Text style={s.bigIcon}>🌱</Text>
            <Text style={[s.heading, { color: t.text }]}>Build habits that stick</Text>
            <Text style={[s.sub, { color: t.subtext }]}>
              Two quick questions to personalise your experience.
            </Text>
            <TouchableOpacity style={[s.primaryBtn, { backgroundColor: t.purple }]} onPress={() => setStep(1)}>
              <Text style={s.primaryBtnText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={[s.heading, { color: t.text }]}>What's your main focus?</Text>
            <Text style={[s.sub, { color: t.subtext }]}>We'll tailor your starter habits to your goal.</Text>
            {GOALS.map(g => (
              <TouchableOpacity
                key={g.id}
                style={[
                  s.card,
                  { backgroundColor: t.card, borderColor: goal === g.id ? t.purple : 'transparent' },
                  goal === g.id && { backgroundColor: t.purpleLight },
                ]}
                onPress={() => setGoal(g.id)}
                activeOpacity={0.8}
              >
                <Text style={s.cardIcon}>{g.icon}</Text>
                <View style={s.cardBody}>
                  <Text style={[s.cardLabel, { color: goal === g.id ? t.purple : t.text }]}>{g.label}</Text>
                  <Text style={[s.cardDesc, { color: t.subtext }]}>{g.desc}</Text>
                </View>
                {goal === g.id && <Text style={[s.check, { color: t.purple }]}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[s.primaryBtn, { backgroundColor: goal ? t.purple : t.muted }]}
              onPress={() => setStep(2)}
              disabled={!goal}
            >
              <Text style={s.primaryBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={[s.heading, { color: t.text }]}>What keeps you going?</Text>
            <Text style={[s.sub, { color: t.subtext }]}>This helps us show what matters most to you.</Text>
            {MOTIVATIONS.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[
                  s.card,
                  { backgroundColor: t.card, borderColor: motivation === m.id ? t.purple : 'transparent' },
                  motivation === m.id && { backgroundColor: t.purpleLight },
                ]}
                onPress={() => setMotivation(m.id)}
                activeOpacity={0.8}
              >
                <Text style={s.cardIcon}>{m.icon}</Text>
                <Text style={[s.cardLabel, { color: motivation === m.id ? t.purple : t.text }]}>{m.label}</Text>
                {motivation === m.id && <Text style={[s.check, { color: t.purple }]}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[s.primaryBtn, { backgroundColor: motivation ? t.purple : t.muted }]}
              onPress={() => setStep(3)}
              disabled={!motivation}
            >
              <Text style={s.primaryBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={s.center}>
            <Text style={s.bigIcon}>🎯</Text>
            <Text style={[s.heading, { color: t.text }]}>You're all set!</Text>
            <Text style={[s.sub, { color: t.subtext }]}>
              Next up: a 3-day starter challenge based on your goal.{'\n'}
              Complete it to build your first streak.
            </Text>
            <TouchableOpacity style={[s.primaryBtn, { backgroundColor: t.purple }]} onPress={finish}>
              <Text style={s.primaryBtnText}>Start My Challenge →</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, paddingTop: 56 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  scroll: { padding: 24, paddingBottom: 60 },
  center: { alignItems: 'center', paddingTop: 32 },
  bigIcon: { fontSize: 72, marginBottom: 24 },
  heading: { fontSize: 26, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  sub: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 32 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIcon: { fontSize: 26, marginRight: 14 },
  cardBody: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '700' },
  cardDesc: { fontSize: 13, marginTop: 2 },
  check: { fontSize: 18, fontWeight: '700' },
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
