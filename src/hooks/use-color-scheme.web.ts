import { useThemePreference } from './use-theme-preference';

export function useColorScheme(): 'light' | 'dark' {
  return useThemePreference().scheme;
}
