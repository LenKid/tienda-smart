import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useInventory } from '@/hooks/use-inventory';

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export default function SalesScreen() {
  const { products, registerSale } = useInventory();
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [productId, setProductId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [lines, setLines] = useState<Array<{ idProducto: number; cantidad: number }>>([]);

  const selected = products.find((product) => product.id === productId) ?? null;
  const parsedQuantity = /^\d+$/.test(quantity) ? Number(quantity) : 0;
  const total = lines.reduce((sum, line) => {
    const product = products.find((item) => item.id === line.idProducto);
    return sum + (product ? product.precio_venta * line.cantidad : 0);
  }, 0);

  const changeQuantity = (amount: number) => {
    const next = String(Math.max(1, (parsedQuantity || 0) + amount));
    setQuantity(next);
    if (productId !== null) {
      setLines((current) =>
        current.map((line) =>
          line.idProducto === productId
            ? { ...line, cantidad: Number(next) }
            : line,
        ),
      );
    }
  };

  const selectProduct = (id: number) => {
    const existing = lines.find((line) => line.idProducto === id);
    if (!existing && lines.length >= 3) {
      Alert.alert('Máximo tres productos', 'Una venta puede contener hasta tres productos.');
      return;
    }
    if (existing) {
      setProductId(id);
      setQuantity(String(existing.cantidad));
      return;
    }
    setLines((current) => [...current, { idProducto: id, cantidad: 1 }]);
    setProductId(id);
    setQuantity('1');
  };

  const confirmSale = async () => {
    if (!selected && lines.length === 0) {
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
      setQuantity('1');
      setProductId(null);
      setLines([]);
    } catch (caught) {
      Alert.alert('No se pudo registrar', caught instanceof Error ? caught.message : 'Error inesperado.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <ThemedText type="title">Registrar venta</ThemedText>
          <ThemedText themeColor="textSecondary">
            Selecciona un producto y confirma en pocos toques.
          </ThemedText>

          <ThemedText type="subtitle" style={styles.sectionTitle}>Producto</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.products}>
            {products.map((product) => (
              <Pressable
                key={product.id}
                onPress={() => selectProduct(product.id)}
                style={[
                  styles.productCard,
                  {
                    backgroundColor:
                      lines.some((line) => line.idProducto === product.id)
                        ? '#DCFCE7'
                        : theme.backgroundElement,
                  },
                ]}>
                <ThemedText type="smallBold">{product.nombre}</ThemedText>
                <ThemedText type="small">{currency.format(product.precio_venta)}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">Stock: {product.stock_actual}</ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          {selected && (
            <ThemedView type="backgroundElement" style={styles.quantityCard}>
              <ThemedText type="subtitle">{selected.nombre}</ThemedText>
              <ThemedText themeColor="textSecondary">Disponible: {selected.stock_actual}</ThemedText>
              <ThemedView style={styles.stepper}>
                <Pressable style={styles.stepButton} onPress={() => changeQuantity(-1)}>
                  <ThemedText type="title">−</ThemedText>
                </Pressable>
                <TextInput
                  value={quantity}
                  onChangeText={(value) => {
                    setQuantity(value);
                    if (productId !== null) {
                      setLines((current) =>
                        current.map((line) =>
                          line.idProducto === productId
                            ? { ...line, cantidad: /^\d+$/.test(value) ? Number(value) : 0 }
                            : line,
                        ),
                      );
                    }
                  }}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  style={[styles.quantityInput, { color: theme.text }]}
                />
                <Pressable style={styles.stepButton} onPress={() => changeQuantity(1)}>
                  <ThemedText type="title">+</ThemedText>
                </Pressable>
              </ThemedView>
            </ThemedView>
          )}

          <ThemedView style={styles.totalCard}>
            <ThemedText type="small">Total de venta</ThemedText>
            <ThemedText type="title">{currency.format(total)}</ThemedText>
          </ThemedView>

          <Pressable style={styles.confirmButton} onPress={confirmSale}>
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
      default: BottomTabInset + Spacing.three,
    }),
  },
  scroll: { flex: 1, width: '100%', height: '100%' },
  content: {
    gap: Spacing.three,
    paddingTop: Platform.select({ web: 96, default: Spacing.four }),
    paddingBottom: Spacing.four,
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
    backgroundColor: '#208AEF',
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
    borderColor: '#A7F3D0',
    padding: Spacing.three,
  },
  confirmButton: {
    minHeight: 64,
    borderRadius: Spacing.three,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: { color: '#FFFFFF' },
});
