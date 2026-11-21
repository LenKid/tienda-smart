import { Pressable, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useThemePreference } from '@/hooks/use-theme-preference';

export function ThemeToggle() {
  const { scheme, toggleTheme } = useThemePreference();

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: scheme === 'dark' }}
      accessibilityLabel="Cambiar tema"
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
      ]}>
      <SymbolView
        name={{
          ios: scheme === 'dark' ? 'moon.fill' : 'sun.max.fill',
          android: scheme === 'dark' ? 'dark_mode' : 'light_mode',
          web: scheme === 'dark' ? 'dark_mode' : 'light_mode',
        }}
        size={20}
        tintColor={scheme === 'dark' ? '#FFFFFF' : '#208AEF'}
      />
      <ThemedText type="smallBold">
        {scheme === 'dark' ? 'Oscuro' : 'Claro'}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 112,
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
});
