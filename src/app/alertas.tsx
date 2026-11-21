import { Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useInventory } from '@/hooks/use-inventory';
import { listarProductosUrgentes } from '@/utils/prediccion';
import { ThemeToggle } from '@/components/theme-toggle';

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export default function AlertsScreen() {
  const { products, recentSales } = useInventory();
  const urgent = listarProductosUrgentes(products, recentSales);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedView style={styles.titleRow}>
            <ThemedText type="title">Alertas y predicción</ThemedText>
            <ThemeToggle />
          </ThemedView>
          <ThemedText themeColor="textSecondary">Demanda calculada con los últimos 7 días</ThemedText>
        </ThemedView>
        {urgent.length === 0 ? (
          <ThemedView type="backgroundElement" style={styles.empty}>
            <ThemedText type="subtitle">Sin reabastecimientos urgentes</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              Todos los productos tienen stock suficiente.
            </ThemedText>
          </ThemedView>
        ) : (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.list}>
            {urgent.map((product) => (
              <ThemedView key={product.id} style={styles.alertCard}>
                <ThemedView style={styles.alertHeader}>
                  <ThemedText type="subtitle">{product.nombre}</ThemedText>
                  <ThemedText type="smallBold" style={styles.urgentBadge}>URGENTE</ThemedText>
                </ThemedView>
                <ThemedText>Quedan {product.stock_actual} unidades.</ThemedText>
                <ThemedText themeColor="textSecondary">
                  Venta diaria: {product.promedioDiario.toFixed(1)} ·
                  {' '}Agotamiento: {Number.isFinite(product.diasRestantes) ? `${Math.ceil(product.diasRestantes)} días` : 'sin movimiento'}
                </ThemedText>
                <ThemedText type="smallBold" style={styles.purchase}>
                  Pedir {product.cantidadSugerida} unidades para abastecer la próxima semana
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Valor estimado: {currency.format(product.cantidadSugerida * product.precio_venta)}
                </ThemedText>
              </ThemedView>
            ))}
          </ScrollView>
        )}
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
    paddingBottom: Platform.select({ web: 84, default: BottomTabInset }),
  },
  scroll: { flex: 1, width: '100%', height: '100%' },
  header: {
    paddingTop: Platform.select({ web: 96, default: Spacing.four }),
    paddingBottom: Spacing.three,
    gap: Spacing.one,
  },
  titleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  list: { gap: Spacing.three, paddingBottom: Spacing.four },
  alertCard: { borderWidth: 1, borderColor: '#FECACA', borderRadius: Spacing.three, backgroundColor: '#FFF1F2', padding: Spacing.three, gap: Spacing.one },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  urgentBadge: { color: '#FFFFFF', backgroundColor: '#DC2626', borderRadius: 999, overflow: 'hidden', paddingHorizontal: Spacing.two, paddingVertical: Spacing.half },
  purchase: { color: '#92400E', marginTop: Spacing.one },
  empty: { borderRadius: Spacing.three, padding: Spacing.four, alignItems: 'center', gap: Spacing.two },
  centerText: { textAlign: 'center' },
});
