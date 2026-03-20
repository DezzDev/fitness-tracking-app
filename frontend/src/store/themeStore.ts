import { create } from 'zustand';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'fitness-tracker-theme';

interface ThemeState {
  theme: Theme;
  initializeTheme: () => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return 'dark';
}

function applyTheme(theme: Theme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),

  initializeTheme: () => {
    applyTheme(get().theme);
  },

  toggleTheme: () => {
    const newTheme: Theme = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    set({ theme: newTheme });
  },

  setTheme: (theme: Theme) => {
    applyTheme(theme);
    set({ theme });
  },
}));
