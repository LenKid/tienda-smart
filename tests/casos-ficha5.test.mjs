import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calcularPrediccion,
  listarProductosUrgentes,
} from '../utils/prediccion.ts';

const hoy = '2026-11-22';
const venta = (id, id_producto, cantidad) => ({
  id,
  fecha: hoy,
  id_producto,
  cantidad,
  total_venta: 0,
});
const aprox = (real, esperado, eps = 1e-9) =>
  assert.ok(Math.abs(real - esperado) < eps, `${real} no es ≈ ${esperado}`);

const leche = { id: 1, codigo: 'ML-001', nombre: 'Bolsa de leche', precio_venta: 3200, stock_actual: 3, stock_minimo: 5 };
const arroz = { id: 2, codigo: 'AR-001', nombre: 'Libra de arroz', precio_venta: 2500, stock_actual: 40, stock_minimo: 10 };
const azucar = { id: 3, codigo: 'AZ-001', nombre: 'Kg de azúcar', precio_venta: 4000, stock_actual: 2, stock_minimo: 5 };

test('Ficha 5 — Caso 1 (prueba de escritorio): leche, stock 3, mínimo 5, 15 vendidas en 7 días → pedir 17', () => {
  const ventas = [venta(1, 1, 4), venta(2, 1, 6), venta(3, 1, 5)];
  const pred = calcularPrediccion(leche, ventas);

  aprox(pred.promedioDiario, 15 / 7);
  aprox(pred.diasRestantes, 3 / (15 / 7)); // ≈ 1,4 días
  assert.equal(pred.esUrgente, true);
  assert.equal(pred.cantidadSugerida, 17); // ceil(15 + 5 − 3)
});

test('Ficha 5 — Caso 2 (stock suficiente): arroz, stock 40, mínimo 10, 8 vendidas → sin alerta', () => {
  const ventas = [venta(1, 2, 2), venta(2, 2, 2), venta(3, 2, 2), venta(4, 2, 2)];
  const pred = calcularPrediccion(arroz, ventas);

  aprox(pred.promedioDiario, 8 / 7);
  aprox(pred.diasRestantes, 35);
  assert.equal(pred.esUrgente, false);
  assert.equal(pred.cantidadSugerida, 0);
});

test('Ficha 5 — Caso 3 (producto nuevo sin historial): azúcar, stock 2, mínimo 5 → alerta, pedir 3, sin NaN', () => {
  const pred = calcularPrediccion(azucar, []);

  assert.equal(pred.promedioDiario, 0);
  assert.equal(pred.diasRestantes, Number.POSITIVE_INFINITY);
  assert.ok(!Number.isNaN(pred.promedioDiario) && !Number.isNaN(pred.cantidadSugerida));
  assert.equal(pred.esUrgente, true);
  assert.equal(pred.cantidadSugerida, 3); // ceil(0 + 5 − 2)
});

test('Los 3 casos juntos: solo leche y azúcar son urgentes y la leche va primero (menos días)', () => {
  const ventas = [
    venta(1, 1, 4), venta(2, 1, 6), venta(3, 1, 5),
    venta(4, 2, 2), venta(5, 2, 2), venta(6, 2, 2), venta(7, 2, 2),
  ];
  const urgentes = listarProductosUrgentes([leche, arroz, azucar], ventas);

  assert.deepEqual(urgentes.map((p) => p.id), [1, 3]);
});

test('Borde: stock 0 con ventas → urgente, 0 días restantes, pide lo de la semana más el mínimo', () => {
  const pan = { id: 4, codigo: 'PA-001', nombre: 'Pan tajado', precio_venta: 5500, stock_actual: 0, stock_minimo: 3 };
  const pred = calcularPrediccion(pan, [venta(1, 4, 14)]);

  assert.equal(pred.esUrgente, true);
  assert.equal(pred.diasRestantes, 0);
  assert.equal(pred.cantidadSugerida, 17); // 14 + 3 − 0
});

test('Redondeo: la compra sugerida es entera y exacta (sin "+1" por decimales de punto flotante)', () => {
  const base = { id: 9, codigo: 'X-001', nombre: 'Producto X', precio_venta: 1000, stock_actual: 0, stock_minimo: 0 };
  const fallos = [];
  for (let n = 1; n <= 500; n++) {
    const pred = calcularPrediccion(base, [venta(1, 9, n)]);
    if (pred.cantidadSugerida !== n) fallos.push(`${n} vendidas → pide ${pred.cantidadSugerida}`);
  }
  assert.deepEqual(fallos, [], `Casos con +1 por redondeo: ${fallos.slice(0, 5).join('; ')}`);
});
