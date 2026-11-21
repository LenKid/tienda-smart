import { Tabs, TabList, TabTrigger, TabSlot, TabListProps } from 'expo-router/ui';
import { Image } from 'expo-image';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { MaxContentWidth, Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function AppTabs() {
  return (
    <Tabs style={styles.tabs}>
      <TabSlot style={styles.tabSlot} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/">
            <ThemedView type="backgroundElement" style={styles.tabButtonView}>
              <SymbolView name={{ ios: 'cart.fill', android: 'shopping_cart', web: 'shopping_cart' }} size={18} />
              <ThemedText type="small">Venta</ThemedText>
            </ThemedView>
          </TabTrigger>
          <TabTrigger name="inventario" href="/inventario">
            <ThemedView type="backgroundElement" style={styles.tabButtonView}>
              <SymbolView name={{ ios: 'cube.box.fill', android: 'inventory_2', web: 'inventory_2' }} size={18} />
              <ThemedText type="small">Inventario</ThemedText>
            </ThemedView>
          </TabTrigger>
          <TabTrigger name="alertas" href="/alertas">
            <ThemedView type="backgroundElement" style={styles.tabButtonView}>
              <SymbolView name={{ ios: 'bell.badge.fill', android: 'notifications', web: 'notifications' }} size={18} />
              <ThemedText type="small">Alertas</ThemedText>
            </ThemedView>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function CustomTabList(props: TabListProps) {
  const { width } = useWindowDimensions();
  const phone = width < 768;

  return (
    <View
      {...props}
      style={[
        styles.tabListContainer,
        phone ? styles.tabListPhone : styles.tabListDesktop,
      ]}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        {!phone && (
          <View style={styles.brand}>
            <Image
              source={require('@/assets/images/tienda-smart-logo.svg')}
              style={styles.brandIcon}
              contentFit="cover"
            />
            <ThemedText type="smallBold" style={styles.brandText}>Tienda Smart</ThemedText>
          </View>
        )}

        {props.children}

      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    width: '100%',
    height: '100%',
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  tabSlot: {
    width: '100%',
    flex: 1,
    height: '100%',
    minHeight: 0,
  },
  tabListContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  tabListDesktop: {
    position: 'absolute',
    top: 12,
  },
  tabListPhone: {
    position: 'absolute',
    bottom: 12,
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
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  brandIcon: {
    width: 32,
    height: 32,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
  externalPressable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    marginLeft: Spacing.three,
  },
});
