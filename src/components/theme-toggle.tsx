import { Pressable, StyleSheet } from 'react-native';

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
      <ThemedView
        type={scheme === 'dark' ? 'backgroundSelected' : 'backgroundElement'}
        style={[
          styles.thumb,
          scheme === 'dark' ? styles.thumbDark : styles.thumbLight,
        ]}
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
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  thumbLight: {
    backgroundColor: '#208AEF',
  },
  thumbDark: {
    backgroundColor: '#FFFFFF',
  },
});
