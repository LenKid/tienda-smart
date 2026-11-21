import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { InventoryProvider } from '@/hooks/use-inventory';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <InventoryProvider>
        <AnimatedSplashOverlay />
        <View style={styles.app}>
          <AppTabs />
        </View>
      </InventoryProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
