# Habit Tracker

A mobile habit tracking app built with [Expo](https://expo.dev) and React Native.

## Features

- **Habit tracking** — add habits with a custom emoji icon and mark them done each day
- **Streak counter** — tracks consecutive days; streaks respect your chosen schedule
- **Day scheduling** — set habits to repeat on specific days of the week (or every day)
- **Onboarding** — two-question flow to personalise the experience by goal and motivation
- **3-Day Challenge** — starter challenge after onboarding with suggested or custom habits
- **Dark mode** — dark by default, toggle with ☀️/🌙 in the header
- **Developer tools** — tap the header title 5× to open a panel for simulating challenge states

## Getting Started

### Prerequisites

- Node.js 20+
- [Expo Go](https://expo.dev/go) on your phone (iOS or Android)

### Install

```bash
npm install
```

### Run

```bash
npm start          # Expo dev server (scan QR with Expo Go)
npm run web        # Open in browser
```

> On Windows, if `npm` is not found in a new PowerShell session:
> ```powershell
> $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
> ```

## Stack

| Package | Version |
|---|---|
| Expo SDK | ~54.0.0 |
| React Native | 0.81.5 |
| React | 19.1.0 |
| TypeScript | ~5.9.2 |
| AsyncStorage | 2.2.0 |

## Project Structure

```
App.tsx                  # Root router (onboarding → challenge → home)
types.ts                 # Shared TypeScript interfaces
storage.ts               # AsyncStorage persistence
utils.ts                 # Date helpers, streak logic, emoji list
theme.ts                 # Dark/light theme definitions and ThemeContext
screens/
  OnboardingScreen.tsx   # 4-step onboarding flow
  ChallengeScreen.tsx    # 3-day challenge (suggested or custom)
  HomeScreen.tsx         # Main habit list
components/
  AddHabitModal.tsx      # Add habit with icon picker and day selector
  IconPicker.tsx         # Emoji grid bottom sheet
  DevTools.tsx           # Developer panel (simulate challenge days, reset)
```

## Developer Tools

Tap the **"Habit Tracker"** title **5 times** to open the dev panel. From there you can:

- Fast-forward the challenge to Day 1, 2, or 3
- Simulate a fully completed challenge
- Complete all habits for today
- Reset the challenge or wipe all data and restart onboarding
