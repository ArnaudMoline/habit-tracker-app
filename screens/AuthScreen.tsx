import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme';

type Mode = 'login' | 'signup';

export default function AuthScreen() {
  const { theme: t } = useTheme();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  async function handleSubmit() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setMessage({ text: 'Please enter your email and password.', isError: true });
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email: trimmedEmail, password });
        if (error) throw error;
        setMessage({ text: 'Account created! Check your email to confirm.', isError: false });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        if (error) throw error;
        // onAuthStateChange in App.tsx handles the rest
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      setMessage({ text: msg, isError: true });
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(m => (m === 'login' ? 'signup' : 'login'));
    setMessage(null);
  }

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: t.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.content}>
        <Text style={s.logo}>🌱</Text>
        <Text style={[s.heading, { color: t.text }]}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </Text>
        <Text style={[s.sub, { color: t.subtext }]}>
          {mode === 'login'
            ? 'Sign in to sync your habits across devices'
            : 'Start building habits that stick'}
        </Text>

        {message && (
          <View
            style={[
              s.msgBox,
              {
                backgroundColor: message.isError ? t.red + '22' : t.green + '22',
                borderColor: message.isError ? t.red : t.green,
              },
            ]}
          >
            <Text style={[s.msgText, { color: message.isError ? t.red : t.green }]}>
              {message.text}
            </Text>
          </View>
        )}

        <TextInput
          style={[s.input, { color: t.text, borderColor: t.border, backgroundColor: t.card }]}
          placeholder="Email"
          placeholderTextColor={t.muted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="next"
          editable={!loading}
        />
        <TextInput
          style={[s.input, { color: t.text, borderColor: t.border, backgroundColor: t.card }]}
          placeholder="Password (min 6 characters)"
          placeholderTextColor={t.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          editable={!loading}
        />

        <TouchableOpacity
          style={[s.btn, { backgroundColor: loading ? t.muted : t.purple }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.btnText}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={s.switchBtn} onPress={switchMode} disabled={loading}>
          <Text style={[s.switchText, { color: t.subtext }]}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Text style={[s.switchLink, { color: t.purple }]}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    paddingBottom: 48,
  },
  logo: { fontSize: 64, textAlign: 'center', marginBottom: 20 },
  heading: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  msgBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  msgText: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  btn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    minHeight: 52,
    justifyContent: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchBtn: { alignItems: 'center', paddingVertical: 8 },
  switchText: { fontSize: 14 },
  switchLink: { fontWeight: '700' },
});
