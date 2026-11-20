import { Tabs, TabList, TabTrigger, TabSlot, TabListProps } from 'expo-router/ui';
import { View, StyleSheet } from 'react-native';

import { MaxContentWidth, Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/">
            <ThemedView type="backgroundElement" style={styles.tabButtonView}>
              <ThemedText type="small">Venta</ThemedText>
            </ThemedView>
          </TabTrigger>
          <TabTrigger name="inventario" href="/inventario">
            <ThemedView type="backgroundElement" style={styles.tabButtonView}>
              <ThemedText type="small">Inventario</ThemedText>
            </ThemedView>
          </TabTrigger>
          <TabTrigger name="alertas" href="/alertas">
            <ThemedView type="backgroundElement" style={styles.tabButtonView}>
              <ThemedText type="small">Alertas</ThemedText>
            </ThemedView>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={styles.brandText}>Tienda Smart</ThemedText>

        {props.children}

      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  externalPressable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    marginLeft: Spacing.three,
  },
});
