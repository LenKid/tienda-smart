import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calcularPrediccion,
  listarProductosUrgentes,
} from '../utils/prediccion.ts';

const hoy = '2026-11-22';

test('calcularPrediccion: calcula promedio diario, días restantes y compra sugerida', () => {
  const leche = {
    id: 1,
    codigo: 'ML-001',
    nombre: 'Bolsa de leche',
    precio_venta: 3200,
    stock_actual: 18,
    stock_minimo: 5,
  };

  // 14 unidades vendidas en los últimos 7 días => promedioDiario = 2
  const ventas = [
    { id: 1, fecha: hoy, id_producto: 1, cantidad: 5, total_venta: 16000 },
    { id: 2, fecha: hoy, id_producto: 1, cantidad: 9, total_venta: 28800 },
    { id: 3, fecha: hoy, id_producto: 2, cantidad: 10, total_venta: 25000 }, // otro producto
  ];

  const pred = calcularPrediccion(leche, ventas);

  assert.equal(pred.promedioDiario, 2);
  assert.equal(pred.diasRestantes, 9); // 18 / 2
  assert.equal(pred.esUrgente, false);
  // Math.ceil(2 * 7 + 5 - 18) = 1
  assert.equal(pred.cantidadSugerida, 1);
});

test('calcularPrediccion: marca urgente si stock_actual <= stock_minimo', () => {
  const azucar = {
    id: 3,
    codigo: 'AZ-001',
    nombre: 'Kg de azúcar',
    precio_venta: 4000,
    stock_actual: 4,
    stock_minimo: 4,
  };

  const pred = calcularPrediccion(azucar, []);

  assert.equal(pred.promedioDiario, 0);
  assert.equal(pred.diasRestantes, Number.POSITIVE_INFINITY);
  assert.equal(pred.esUrgente, true);
  assert.equal(pred.cantidadSugerida, 0);
});

test('calcularPrediccion: marca urgente si diasRestantes <= 3 aunque stock > stock_minimo', () => {
  const pan = {
    id: 4,
    codigo: 'PA-001',
    nombre: 'Pan tajado',
    precio_venta: 5500,
    stock_actual: 6,
    stock_minimo: 3,
  };

  // 14 unidades en 7 días => promedio 2/día => 6 / 2 = 3 días restantes
  const ventas = [
    { id: 1, fecha: hoy, id_producto: 4, cantidad: 14, total_venta: 77000 },
  ];

  const pred = calcularPrediccion(pan, ventas);

  assert.equal(pred.promedioDiario, 2);
  assert.equal(pred.diasRestantes, 3);
  assert.equal(pred.esUrgente, true);
  // Math.ceil(2 * 7 + 3 - 6) = 11
  assert.equal(pred.cantidadSugerida, 11);
});

test('listarProductosUrgentes: filtra solo urgentes y ordena por menor días restantes', () => {
  const productos = [
    { id: 1, codigo: 'ML-001', nombre: 'Bolsa de leche', precio_venta: 3200, stock_actual: 20, stock_minimo: 5 },
    { id: 2, codigo: 'AR-001', nombre: 'Libra de arroz', precio_venta: 2500, stock_actual: 5, stock_minimo: 6 },
    { id: 3, codigo: 'AZ-001', nombre: 'Kg de azúcar', precio_venta: 4000, stock_actual: 4, stock_minimo: 2 },
  ];

  const ventas = [
    { id: 1, fecha: hoy, id_producto: 1, cantidad: 7, total_venta: 22400 },  // 20 días
    { id: 2, fecha: hoy, id_producto: 2, cantidad: 7, total_venta: 17500 },  // 5 días, pero stock <= mínimo
    { id: 3, fecha: hoy, id_producto: 3, cantidad: 14, total_venta: 56000 }, // 2 días restantes
  ];

  const urgentes = listarProductosUrgentes(productos, ventas);

  assert.equal(urgentes.length, 2);
  assert.deepEqual(
    urgentes.map((p) => p.id),
    [3, 2],
  );
});
