import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import { DAY_LABELS, HABIT_ICONS } from '../utils';
import IconPicker from './IconPicker';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, icon: string, targetDays: number[]) => void;
}

const DEFAULT_ICON = '⭐';

export default function AddHabitModal({ visible, onClose, onAdd }: Props) {
  const { theme: t } = useTheme();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [iconPickerVisible, setIconPickerVisible] = useState(false);

  function toggleDay(day: number) {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  }

  function handleAdd() {
    if (!name.trim()) return;
    onAdd(name.trim(), icon, selectedDays);
    reset();
  }

  function reset() {
    setName('');
    setIcon(DEFAULT_ICON);
    setSelectedDays([]);
  }

  function handleClose() {
    reset();
    onClose();
  }

  const repeatLabel =
    selectedDays.length === 0
      ? 'Every day'
      : `${selectedDays.length} day${selectedDays.length > 1 ? 's' : ''} per week`;

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
        <Pressable style={s.backdrop} onPress={handleClose}>
          <Pressable style={[s.box, { backgroundColor: t.surface, borderColor: t.border }]} onPress={() => {}}>
            <Text style={[s.title, { color: t.text }]}>New Habit</Text>

            {/* Icon + name row */}
            <View style={s.nameRow}>
              <TouchableOpacity
                style={[s.iconBtn, { backgroundColor: t.purpleLight, borderColor: t.border }]}
                onPress={() => setIconPickerVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={s.iconBtnText}>{icon}</Text>
              </TouchableOpacity>

              <TextInput
                style={[s.input, { color: t.text, borderColor: t.border, backgroundColor: t.bg, flex: 1 }]}
                placeholder="e.g. Drink 2L of water"
                placeholderTextColor={t.muted}
                value={name}
                onChangeText={setName}
                onSubmitEditing={handleAdd}
                autoFocus
                returnKeyType="done"
                maxLength={60}
              />
            </View>

            {/* Quick icon row */}
            <View style={s.quickIconRow}>
              {HABIT_ICONS.slice(0, 8).map(ic => (
                <TouchableOpacity
                  key={ic}
                  onPress={() => setIcon(ic)}
                  style={[
                    s.quickIcon,
                    { borderColor: icon === ic ? t.purple : 'transparent' },
                    icon === ic && { backgroundColor: t.purpleLight },
                  ]}
                >
                  <Text style={{ fontSize: 20 }}>{ic}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[s.quickIcon, { borderColor: 'transparent' }]}
                onPress={() => setIconPickerVisible(true)}
              >
                <Text style={[s.moreText, { color: t.purple }]}>+{HABIT_ICONS.length - 8}</Text>
              </TouchableOpacity>
            </View>

            {/* Day picker */}
            <Text style={[s.label, { color: t.subtext }]}>REPEAT ON</Text>
            <View style={s.dayRow}>
              {DAY_LABELS.map((d, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    s.dayBtn,
                    { borderColor: selectedDays.includes(i) ? t.purple : t.border },
                    selectedDays.includes(i) && { backgroundColor: t.purple },
                  ]}
                  onPress={() => toggleDay(i)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.dayBtnText, { color: selectedDays.includes(i) ? '#fff' : t.muted }]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[s.repeatLabel, { color: t.muted }]}>{repeatLabel}</Text>

            {/* Actions */}
            <View style={s.actions}>
              <TouchableOpacity style={[s.btn, { backgroundColor: t.purpleLight }]} onPress={handleClose}>
                <Text style={[s.cancelText, { color: t.purple }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btn, { backgroundColor: name.trim() ? t.purple : t.muted }]}
                onPress={handleAdd}
                disabled={!name.trim()}
              >
                <Text style={s.addText}>Add</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <IconPicker
        visible={iconPickerVisible}
        selected={icon}
        onSelect={setIcon}
        onClose={() => setIconPickerVisible(false)}
      />
    </>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    borderRadius: 20,
    padding: 24,
    width: '90%',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { fontSize: 24 },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  quickIconRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
    flexWrap: 'nowrap',
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: { fontSize: 11, fontWeight: '700' },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  dayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtnText: { fontSize: 12, fontWeight: '700' },
  repeatLabel: { fontSize: 12, textAlign: 'center', marginBottom: 20 },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  cancelText: { fontWeight: '700', fontSize: 15 },
  addText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
