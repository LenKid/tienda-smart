# Resultados de pruebas — TiendaSmart

- **Fecha:** 22/11/2026, 4:39:31 p. m.
- **Node:** 24.15.0
- **Duración total:** 0.4 s

## Resumen

| Total | ✅ Pasaron | ❌ Fallaron |
|---|---|---|
| 14 | 14 | 0 |

**Estado general: TODAS LAS PRUEBAS PASARON ✅**

## casos-ficha5.test.mjs

| Estado | Prueba | Tiempo (ms) |
|---|---|---|
| ✅ | Ficha 5 — Caso 1 (prueba de escritorio): leche, stock 3, mínimo 5, 15 vendidas en 7 días → pedir 17 | 1.0 |
| ✅ | Ficha 5 — Caso 2 (stock suficiente): arroz, stock 40, mínimo 10, 8 vendidas → sin alerta | 0.2 |
| ✅ | Ficha 5 — Caso 3 (producto nuevo sin historial): azúcar, stock 2, mínimo 5 → alerta, pedir 3, sin NaN | 0.1 |
| ✅ | Los 3 casos juntos: solo leche y azúcar son urgentes y la leche va primero (menos días) | 0.7 |
| ✅ | Borde: stock 0 con ventas → urgente, 0 días restantes, pide lo de la semana más el mínimo | 0.2 |
| ✅ | Redondeo: la compra sugerida es entera y exacta (sin "+1" por decimales de punto flotante) | 1.0 |

## prediccion.test.mjs

| Estado | Prueba | Tiempo (ms) |
|---|---|---|
| ✅ | calcularPrediccion: calcula promedio diario, días restantes y compra sugerida | 0.8 |
| ✅ | calcularPrediccion: marca urgente si stock_actual <= stock_minimo | 0.1 |
| ✅ | calcularPrediccion: marca urgente si diasRestantes <= 3 aunque stock > stock_minimo | 0.2 |
| ✅ | listarProductosUrgentes: filtra solo urgentes y ordena por menor días restantes | 0.8 |

## ventas-robustez.test.mjs

| Estado | Prueba | Tiempo (ms) |
|---|---|---|
| ✅ | Ficha 3 — Corrección funcional (10/10): 10 ventas conocidas descuentan stock exacto | 11.6 |
| ✅ | Ficha 3 — Robustez (5/5 bloqueos): rechaza -5, NaN ("cinco"), 0, vacío y exceso de stock sin corromper BD | 1.7 |
| ✅ | Regla de negocio: bloquea venta con más de 3 productos y hace rollback si la segunda línea falla | 0.4 |
| ✅ | restockProduct: suma stock válido y rechaza cantidades inválidas | 0.4 |

