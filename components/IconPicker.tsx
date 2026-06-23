import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import { HABIT_ICONS } from '../utils';

interface Props {
  visible: boolean;
  selected: string;
  onSelect: (icon: string) => void;
  onClose: () => void;
}

export default function IconPicker({ visible, selected, onSelect, onClose }: Props) {
  const { theme: t } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable
          style={[s.sheet, { backgroundColor: t.surface, borderColor: t.border }]}
          onPress={() => {}}
        >
          <View style={[s.handle, { backgroundColor: t.border }]} />
          <Text style={[s.title, { color: t.text }]}>Choose an icon</Text>

          <ScrollView contentContainerStyle={s.grid} showsVerticalScrollIndicator={false}>
            {HABIT_ICONS.map(icon => (
              <TouchableOpacity
                key={icon}
                style={[
                  s.iconBtn,
                  { borderColor: selected === icon ? t.purple : 'transparent' },
                  selected === icon && { backgroundColor: t.purpleLight },
                ]}
                onPress={() => { onSelect(icon); onClose(); }}
                activeOpacity={0.7}
              >
                <Text style={s.iconText}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
    paddingBottom: 8,
  },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 26 },
});
