import { createContext, useContext } from 'react';

export interface Theme {
  bg: string;
  surface: string;
  card: string;
  text: string;
  subtext: string;
  muted: string;
  border: string;
  purple: string;
  purpleLight: string;
  amber: string;
  green: string;
  greenBg: string;
  red: string;
  isDark: boolean;
}

export const dark: Theme = {
  bg: '#0F0F1A',
  surface: '#1A1A2E',
  card: '#1E1E35',
  text: '#F0F0FF',
  subtext: '#8888AA',
  muted: '#444466',
  border: '#2A2A45',
  purple: '#7C73FF',
  purpleLight: '#252545',
  amber: '#F59E0B',
  green: '#10B981',
  greenBg: '#0A2520',
  red: '#FF6B6B',
  isDark: true,
};

export const light: Theme = {
  bg: '#F5F6FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1A2E',
  subtext: '#666688',
  muted: '#AAAACC',
  border: '#E0E0F0',
  purple: '#6C63FF',
  purpleLight: '#EEF0FF',
  amber: '#F59E0B',
  green: '#10B981',
  greenBg: '#D1FAE5',
  red: '#EF4444',
  isDark: false,
};

interface ThemeCtx {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeCtx>({ theme: dark, toggleTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}
