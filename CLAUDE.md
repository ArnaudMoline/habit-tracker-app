# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm start                  # Start Expo dev server (Metro bundler)
npx expo start --tunnel    # Start with tunnel (use when Expo Go can't reach local network)
npx tsc --noEmit           # Type-check without emitting files
npx expo install <pkg>     # Install a package pinned to the SDK 54 compatible version
npx expo install --fix     # Realign all packages to SDK 54 compatible versions
```

On Windows, if `npm` or `npx` are unrecognized in a new PowerShell session, refresh PATH first:
```powershell
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
```

## Architecture

This is a **single-screen, single-file** React Native app. There is no navigation library.

- `index.ts` — Expo entry point; calls `registerRootComponent(App)`
- `App.tsx` — The entire app: state, logic, and UI in one file

### Data model

```ts
interface Habit {
  id: string;           // Date.now().toString()
  name: string;
  completedDates: string[]; // 'YYYY-MM-DD' strings
}
```

All habits are stored as a single JSON array in `AsyncStorage` under the key `habit_tracker_habits`. The store is read once on mount and written on every state change via `useEffect`.

### Streak logic

A streak is "active" if the most recent completion date is today or yesterday (so the streak doesn't reset before the user checks in each day). It walks backwards through sorted completion dates counting consecutive days.

### Stack

| Package | Version |
|---|---|
| Expo SDK | ~54.0.0 |
| React Native | 0.81.5 |
| React | 19.1.0 |
| TypeScript | ~5.9.2 |
| AsyncStorage | 2.2.0 |

Always use `npx expo install` (not plain `npm install`) when adding new packages, so Expo pins the SDK-54-compatible version automatically.
