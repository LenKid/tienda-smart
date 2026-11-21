import { useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { ThemeToggle } from '@/components/theme-toggle';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useInventory } from '@/hooks/use-inventory';

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export default function InventoryScreen() {
  const { products, addProduct, addStock } = useInventory();
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [modalVisible, setModalVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [minimo, setMinimo] = useState('');
  const [restockId, setRestockId] = useState<number | null>(null);
  const [restockQuantity, setRestockQuantity] = useState('');

  const positiveInteger = (value: string) => /^\d+$/.test(value) && Number(value) > 0;

  const saveProduct = async () => {
    if (!codigo.trim() || !nombre.trim()) {
      Alert.alert('Datos incompletos', 'Escribe el código y el nombre del producto.');
      return;
    }
    if (!positiveInteger(precio) || !positiveInteger(stock) || !positiveInteger(minimo)) {
      Alert.alert('Datos inválidos', 'Precio, stock y mínimo deben ser enteros positivos.');
      return;
    }
    try {
      await addProduct({
        codigo: codigo.trim().toUpperCase(),
        nombre: nombre.trim(),
        precioVenta: Number(precio),
        stockActual: Number(stock),
        stockMinimo: Number(minimo),
      });
      setModalVisible(false);
      setCodigo('');
      setNombre('');
      setPrecio('');
      setStock('');
      setMinimo('');
      Alert.alert('Producto creado', 'El inventario fue actualizado.');
    } catch (caught) {
      Alert.alert('No se pudo crear', caught instanceof Error ? caught.message : 'Error inesperado.');
    }
  };

  const restock = async () => {
    if (restockId === null || !positiveInteger(restockQuantity)) {
      Alert.alert('Cantidad inválida', 'Ingresa un entero positivo.');
      return;
    }
    try {
      await addStock(restockId, Number(restockQuantity));
      setRestockId(null);
      setRestockQuantity('');
      Alert.alert('Stock actualizado', 'La llegada fue registrada.');
    } catch (caught) {
      Alert.alert('No se pudo actualizar', caught instanceof Error ? caught.message : 'Error inesperado.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ViewHeader title="Inventario" />
        <Pressable
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => setModalVisible(true)}>
          <SymbolView
            name={{ ios: 'plus', android: 'add', web: 'add' }}
            size={22}
            tintColor="#FFFFFF"
          />
          <ThemedText type="smallBold" style={styles.addText}>Nuevo producto</ThemedText>
        </Pressable>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.list}>
          {products.map((product) => {
            const low = product.stock_actual <= product.stock_minimo;
            return (
              <ThemedView key={product.id} type="backgroundElement" style={styles.productRow}>
                <ThemedView style={styles.productInfo}>
                  <SymbolView
                    name={{ ios: 'cube.box.fill', android: 'inventory_2', web: 'inventory_2' }}
                    size={20}
                    tintColor={low ? '#DC2626' : theme.text}
                  />
                  <ThemedText type="smallBold">{product.nombre}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">{product.codigo}</ThemedText>
                  <ThemedText type="small">{currency.format(product.precio_venta)}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.stockInfo}>
                  {low && <ThemedText type="smallBold" style={styles.lowBadge}>STOCK BAJO</ThemedText>}
                  <ThemedText type="small">Actual: {product.stock_actual}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">Mínimo: {product.stock_minimo}</ThemedText>
                  <Pressable
                    style={styles.restockButton}
                    onPress={() => setRestockId(product.id)}>
                    <SymbolView
                      name={{ ios: 'shippingbox.fill', android: 'add_box', web: 'add_box' }}
                      size={16}
                      tintColor="#166534"
                    />
                    <ThemedText type="smallBold" style={styles.restockText}>Sumar</ThemedText>
                  </Pressable>
                </ThemedView>
              </ThemedView>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={[styles.modal, { backgroundColor: theme.background }]}>
            <ThemedText type="subtitle">Nuevo producto</ThemedText>
            {[
              ['Código', codigo, setCodigo],
              ['Nombre', nombre, setNombre],
              ['Precio', precio, setPrecio],
              ['Stock inicial', stock, setStock],
              ['Stock mínimo', minimo, setMinimo],
            ].map(([label, value, setter]) => (
              <TextInput
                key={String(label)}
                placeholder={String(label)}
                value={String(value)}
                onChangeText={setter as (text: string) => void}
                keyboardType={String(label).includes('Precio') || String(label).includes('Stock') ? 'number-pad' : 'default'}
                style={[styles.input, { color: theme.text }]}
              />
            ))}
            <Pressable
              style={[styles.saveButton, { backgroundColor: theme.primaryDark }]}
              onPress={saveProduct}>
              <ThemedText type="subtitle" style={styles.addText}>Guardar producto</ThemedText>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <ThemedText>Cancelar</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </Modal>

      <Modal visible={restockId !== null} animationType="fade" transparent>
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={[styles.modal, { backgroundColor: theme.background }]}>
            <ThemedText type="subtitle">Registrar llegada</ThemedText>
            <TextInput
              placeholder="Cantidad recibida"
              value={restockQuantity}
              onChangeText={setRestockQuantity}
              keyboardType="number-pad"
              style={[styles.input, { color: theme.text }]}
            />
            <Pressable
              style={[styles.saveButton, { backgroundColor: theme.primaryDark }]}
              onPress={restock}>
              <ThemedText type="subtitle" style={styles.addText}>Sumar al stock</ThemedText>
            </Pressable>
            <Pressable
              style={styles.cancelButton}
              onPress={() => {
                setRestockId(null);
                setRestockQuantity('');
              }}>
              <ThemedText>Cancelar</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

function ViewHeader({ title }: { title: string }) {
  return (
    <ThemedView style={styles.header}>
      <ThemedText type="title">{title}</ThemedText>
      <ThemeToggle />
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
    paddingBottom: Platform.select({ web: 84 }),
  },
  scroll: { flex: 1, width: '100%', height: '100%' },
  header: {
    paddingTop: Platform.select({ web: 96, default: Spacing.three }),
    paddingBottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  addButton: { minHeight: 56, borderRadius: Spacing.three, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: Spacing.two },
  addText: { color: '#FFFFFF' },
  list: { gap: Spacing.two, paddingVertical: Spacing.three },
  productRow: { flexDirection: 'row', borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.two },
  productInfo: { flex: 1, gap: Spacing.half },
  stockInfo: { width: 132, alignItems: 'flex-end', gap: Spacing.half },
  lowBadge: { color: '#FFFFFF', backgroundColor: '#DC2626', borderRadius: 999, overflow: 'hidden', paddingHorizontal: Spacing.two, paddingVertical: Spacing.half },
  restockButton: { marginTop: Spacing.one, backgroundColor: '#E8F2FF', borderRadius: Spacing.two, paddingHorizontal: Spacing.two, paddingVertical: Spacing.one, flexDirection: 'row', alignItems: 'center', gap: Spacing.half },
  restockText: { color: '#166534' },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)', padding: Spacing.four },
  modal: { borderRadius: Spacing.four, padding: Spacing.four, gap: Spacing.two },
  input: { minHeight: 52, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: Spacing.two, paddingHorizontal: Spacing.three },
  saveButton: { minHeight: 56, borderRadius: Spacing.two, alignItems: 'center', justifyContent: 'center' },
  cancelButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
