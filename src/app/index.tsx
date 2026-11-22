import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useInventory } from '@/hooks/use-inventory';
import { ThemeToggle } from '@/components/theme-toggle';

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const MAX_PRODUCTS = 3;
const isPositiveInteger = (text: string) => /^\d+$/.test(text);

export default function SalesScreen() {
  const { products, registerSale } = useInventory();
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Cada producto es un "toggle": si está en esta lista, está seleccionado.
  // `texto` guarda lo que el usuario escribe (puede estar vacío o ser inválido).
  const [selection, setSelection] = useState<Array<{ idProducto: number; texto: string }>>([]);

  const lines = selection.map((item) => ({
    idProducto: item.idProducto,
    cantidad: isPositiveInteger(item.texto) ? Number(item.texto) : 0,
  }));
  const total = lines.reduce((sum, line) => {
    const product = products.find((item) => item.id === line.idProducto);
    return sum + (product ? product.precio_venta * line.cantidad : 0);
  }, 0);

  const isSelected = (id: number) => selection.some((item) => item.idProducto === id);

  const toggleProduct = (id: number) => {
    if (isSelected(id)) {
      setSelection((current) => current.filter((item) => item.idProducto !== id));
      return;
    }
    if (selection.length >= MAX_PRODUCTS) {
      Alert.alert('Máximo tres productos', 'Una venta puede contener hasta tres productos.');
      return;
    }
    setSelection((current) => [...current, { idProducto: id, texto: '1' }]);
  };

  const changeQuantity = (id: number, amount: number) => {
    setSelection((current) =>
      current.map((item) => {
        if (item.idProducto !== id) return item;
        const actual = isPositiveInteger(item.texto) ? Number(item.texto) : 0;
        return { ...item, texto: String(Math.max(1, actual + amount)) };
      }),
    );
  };

  const typeQuantity = (id: number, texto: string) => {
    setSelection((current) =>
      current.map((item) => (item.idProducto === id ? { ...item, texto } : item)),
    );
  };

  const confirmSale = async () => {
    if (lines.length === 0) {
      Alert.alert('Selecciona un producto', 'Elige el producto que se está vendiendo.');
      return;
    }
    for (const line of lines) {
      if (!Number.isInteger(line.cantidad) || line.cantidad <= 0) {
        Alert.alert('Cantidad inválida', 'Todas las cantidades deben ser enteros positivos.');
        return;
      }
      const product = products.find((item) => item.id === line.idProducto);
      if (!product) {
        Alert.alert('Producto no disponible', 'Selecciona nuevamente los productos.');
        return;
      }
      if (line.cantidad > product.stock_actual) {
        Alert.alert(
          'Stock insuficiente',
          `Solo quedan ${product.stock_actual} unidades de ${product.nombre}.`,
        );
        return;
      }
    }

    try {
      await registerSale(lines);
      Alert.alert('Venta registrada', `Se confirmaron ${lines.length} productos.`);
      setSelection([]);
    } catch (caught) {
      Alert.alert('No se pudo registrar', caught instanceof Error ? caught.message : 'Error inesperado.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <ThemedView style={styles.titleRow}>
            <ThemedText type="title">Registrar venta</ThemedText>
            <ThemeToggle />
          </ThemedView>
          <ThemedText themeColor="textSecondary">
            Toca un producto para agregarlo y tócalo de nuevo para quitarlo.
          </ThemedText>

          <ThemedText type="subtitle" style={styles.sectionTitle}>Producto</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.products}>
            {products.map((product) => {
              const selected = isSelected(product.id);
              return (
                <Pressable
                  key={product.id}
                  onPress={() => toggleProduct(product.id)}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: selected }}
                  style={[
                    styles.productCard,
                    { backgroundColor: selected ? theme.primarySoft : theme.backgroundElement },
                  ]}>
                  <SymbolView
                    name={
                      selected
                        ? { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }
                        : { ios: 'cube.box.fill', android: 'inventory_2', web: 'inventory_2' }
                    }
                    size={22}
                    tintColor={selected ? '#166534' : theme.text}
                  />
                  <ThemedText type="smallBold">{product.nombre}</ThemedText>
                  <ThemedText type="small">{currency.format(product.precio_venta)}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">Stock: {product.stock_actual}</ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          {selection.map((item) => {
            const product = products.find((p) => p.id === item.idProducto);
            if (!product) return null;
            return (
              <ThemedView key={item.idProducto} type="backgroundElement" style={styles.quantityCard}>
                <ThemedText type="subtitle">{product.nombre}</ThemedText>
                <ThemedText themeColor="textSecondary">Disponible: {product.stock_actual}</ThemedText>
                <ThemedView style={styles.stepper}>
                  <Pressable
                    style={[styles.stepButton, { backgroundColor: theme.primary }]}
                    onPress={() => changeQuantity(item.idProducto, -1)}>
                    <SymbolView
                      name={{ ios: 'minus', android: 'remove', web: 'remove' }}
                      size={28}
                      tintColor="#FFFFFF"
                    />
                  </Pressable>
                  <TextInput
                    value={item.texto}
                    onChangeText={(value) => typeQuantity(item.idProducto, value)}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    style={[styles.quantityInput, { color: theme.text }]}
                  />
                  <Pressable
                    style={[styles.stepButton, { backgroundColor: theme.primary }]}
                    onPress={() => changeQuantity(item.idProducto, 1)}>
                    <SymbolView
                      name={{ ios: 'plus', android: 'add', web: 'add' }}
                      size={28}
                      tintColor="#FFFFFF"
                    />
                  </Pressable>
                </ThemedView>
              </ThemedView>
            );
          })}

          <ThemedView style={[styles.totalCard, { borderColor: theme.primary }]}>
            <ThemedView style={styles.totalLabel}>
              <SymbolView
                name={{ ios: 'creditcard.fill', android: 'payments', web: 'payments' }}
                size={18}
                tintColor="#166534"
              />
              <ThemedText type="small">Total de venta</ThemedText>
            </ThemedView>
            <ThemedText type="title">{currency.format(total)}</ThemedText>
          </ThemedView>

          <Pressable
            style={[styles.confirmButton, { backgroundColor: theme.primaryDark }]}
            onPress={confirmSale}>
            <SymbolView
              name={{ ios: 'cart.fill', android: 'shopping_cart_checkout', web: 'shopping_cart_checkout' }}
              size={24}
              tintColor="#FFFFFF"
            />
            <ThemedText type="subtitle" style={styles.confirmText}>Confirmar venta</ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%' },
  safeArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingHorizontal: Spacing.four,
    paddingBottom: Platform.select({
      web: 84,
      default: Spacing.three,
    }),
  },
  scroll: { flex: 1, width: '100%', height: '100%' },
  content: {
    gap: Spacing.three,
    paddingTop: Platform.select({ web: 96, default: Spacing.four }),
    paddingBottom: Spacing.four,
  },
  titleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  sectionTitle: { marginTop: Spacing.two },
  products: { gap: Spacing.two },
  productCard: {
    width: 176,
    minHeight: 112,
    justifyContent: 'center',
    gap: Spacing.half,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  quantityCard: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.two },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  stepButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityInput: {
    minWidth: 96,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
  },
  totalCard: {
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: '#208AEF',
    padding: Spacing.three,
  },
  totalLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  confirmButton: {
    minHeight: 64,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  confirmText: { color: '#FFFFFF' },
});
