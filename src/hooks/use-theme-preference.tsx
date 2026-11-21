import React, { createContext, useContext, useMemo, useState } from 'react';

type ThemePreference = 'light' | 'dark';

type ThemePreferenceContextValue = {
  scheme: ThemePreference;
  toggleTheme: () => void;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const [scheme, setScheme] = useState<ThemePreference>('light');

  const value = useMemo(
    () => ({
      scheme,
      toggleTheme: () => setScheme((current) => (current === 'light' ? 'dark' : 'light')),
    }),
    [scheme],
  );

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const value = useContext(ThemePreferenceContext);
  if (!value) {
    throw new Error('useThemePreference debe usarse dentro de ThemePreferenceProvider.');
  }
  return value;
}
