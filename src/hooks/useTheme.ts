import { useEffect, useCallback } from 'react';
import { useStore } from '@/store';
import type { Settings } from '@/types';

function applyTheme(theme: Settings['theme']) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(prefersDark ? 'dark' : 'light');
  } else {
    root.classList.add(theme);
  }
}

export function useTheme() {
  const { settings, updateSettings } = useStore();
  const theme = settings.theme;

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
    };

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback(
    (newTheme: Settings['theme']) => {
      updateSettings({ theme: newTheme });
    },
    [updateSettings],
  );

  const resolvedTheme = (() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  })();

  return { theme, resolvedTheme, setTheme, isDark: resolvedTheme === 'dark' };
}
