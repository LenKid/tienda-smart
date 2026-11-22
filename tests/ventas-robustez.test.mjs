import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// mock.module solo existe con --experimental-test-module-mocks.
// Si el archivo se ejecuta suelto (p. ej. con Code Runner), se relanza con las banderas necesarias.
if (typeof mock.module !== 'function') {
  if (process.env.TIENDASMART_RELANZADO) {
    throw new Error('mock.module no está disponible: se necesita Node 22.3 o superior.');
  }
  const banderas = ['--experimental-test-module-mocks'];
  if (Number(process.versions.node.split('.')[0]) < 24) banderas.push('--experimental-strip-types');
  const r = spawnSync(process.execPath, [...banderas, fileURLToPath(import.meta.url)], {
    stdio: 'inherit',
    env: { ...process.env, TIENDASMART_RELANZADO: '1' },
  });
  process.exit(r.status ?? 1);
}

function createInMemorySqliteMock() {
  let productos = [
    { id: 1, codigo: 'ML-001', nombre: 'Bolsa de leche', precio_venta: 3200, stock_actual: 18, stock_minimo: 5 },
    { id: 2, codigo: 'AR-001', nombre: 'Libra de arroz', precio_venta: 2500, stock_actual: 20, stock_minimo: 6 },
    { id: 3, codigo: 'AZ-001', nombre: 'Kg de azúcar', precio_venta: 4000, stock_actual: 12, stock_minimo: 4 },
    { id: 4, codigo: 'PA-001', nombre: 'Pan tajado', precio_venta: 5500, stock_actual: 10, stock_minimo: 3 },
  ];
  let ventas = [];
  let nextSaleId = 1;
  let snapshot = null;

  const db = {
    async execAsync() {},
    async withTransactionAsync(fn) {
      snapshot = {
        productos: structuredClone(productos),
        ventas: structuredClone(ventas),
        nextSaleId,
      };
      try {
        await fn();
        snapshot = null;
      } catch (err) {
        productos = snapshot.productos;
        ventas = snapshot.ventas;
        nextSaleId = snapshot.nextSaleId;
        snapshot = null;
        throw err;
      }
    },
    async getFirstAsync(sql, params = []) {
      if (sql.includes('SELECT COUNT(*) AS count FROM Productos')) {
        return { count: productos.length };
      }
      if (sql.includes('SELECT * FROM Productos WHERE id = ?')) {
        return productos.find((p) => p.id === params[0]) ?? null;
      }
      if (sql.includes('SELECT precio_venta FROM Productos WHERE id = ?')) {
        const p = productos.find((item) => item.id === params[0]);
        return p ? { precio_venta: p.precio_venta } : null;
      }
      return null;
    },
    async getAllAsync(sql, params = []) {
      if (sql.includes('FROM Productos')) {
        return [...productos].sort((a, b) => a.nombre.localeCompare(b.nombre));
      }
      if (sql.includes('FROM Historial_Ventas')) {
        const since = params[0] ?? '0000-00-00';
        return ventas
          .filter((v) => v.fecha >= since)
          .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : b.id - a.id));
      }
      return [];
    },
    async runAsync(sql, params = []) {
      if (sql.includes('INSERT INTO Historial_Ventas')) {
        const [fecha, id_producto, cantidad, total_venta] = params;
        ventas.push({ id: nextSaleId++, fecha, id_producto, cantidad, total_venta });
      } else if (sql.includes('UPDATE Productos SET stock_actual = stock_actual - ?')) {
        const [cantidad, id] = params;
        const p = productos.find((item) => item.id === id);
        if (p) p.stock_actual -= cantidad;
      } else if (sql.includes('UPDATE Productos SET stock_actual = stock_actual + ?')) {
        const [cantidad, id] = params;
        const p = productos.find((item) => item.id === id);
        if (p) p.stock_actual += cantidad;
      }
    },
  };

  return {
    db,
    reset() {
      productos = [
        { id: 1, codigo: 'ML-001', nombre: 'Bolsa de leche', precio_venta: 3200, stock_actual: 18, stock_minimo: 5 },
        { id: 2, codigo: 'AR-001', nombre: 'Libra de arroz', precio_venta: 2500, stock_actual: 20, stock_minimo: 6 },
        { id: 3, codigo: 'AZ-001', nombre: 'Kg de azúcar', precio_venta: 4000, stock_actual: 12, stock_minimo: 4 },
        { id: 4, codigo: 'PA-001', nombre: 'Pan tajado', precio_venta: 5500, stock_actual: 10, stock_minimo: 3 },
      ];
      ventas = [];
      nextSaleId = 1;
    },
    getState() {
      return { productos: structuredClone(productos), ventas: structuredClone(ventas) };
    },
  };
}

const sqliteMock = createInMemorySqliteMock();

mock.module('expo-sqlite', {
  namedExports: {
    openDatabaseAsync: async () => sqliteMock.db,
  },
});

const {
  createSale,
  getProducts,
  getSalesLastSevenDays,
  restockProduct,
} = await import('../database/db.ts');

test('Ficha 3 — Corrección funcional (10/10): 10 ventas conocidas descuentan stock exacto', async () => {
  sqliteMock.reset();

  const transacciones = [
    [{ idProducto: 1, cantidad: 2 }],                               // Leche: 18 -> 16
    [{ idProducto: 2, cantidad: 3 }],                               // Arroz: 20 -> 17
    [{ idProducto: 3, cantidad: 1 }],                               // Azúcar: 12 -> 11
    [{ idProducto: 4, cantidad: 2 }],                               // Pan: 10 -> 8
    [{ idProducto: 1, cantidad: 1 }, { idProducto: 2, cantidad: 2 }], // Leche: 15, Arroz: 15
    [{ idProducto: 3, cantidad: 3 }],                               // Azúcar: 11 -> 8
    [{ idProducto: 4, cantidad: 1 }],                               // Pan: 8 -> 7
    [{ idProducto: 1, cantidad: 4 }, { idProducto: 4, cantidad: 2 }], // Leche: 11, Pan: 5
    [{ idProducto: 2, cantidad: 5 }],                               // Arroz: 15 -> 10
    [{ idProducto: 1, cantidad: 1 }, { idProducto: 2, cantidad: 1 }, { idProducto: 3, cantidad: 2 }], // Leche: 10, Arroz: 9, Azúcar: 6
  ];

  for (const tx of transacciones) {
    await createSale(tx);
  }

  const productos = await getProducts();
  const byId = Object.fromEntries(productos.map((p) => [p.id, p]));

  assert.equal(byId[1].stock_actual, 10);
  assert.equal(byId[2].stock_actual, 9);
  assert.equal(byId[3].stock_actual, 6);
  assert.equal(byId[4].stock_actual, 5);

  const historial = await getSalesLastSevenDays();
  assert.equal(historial.length, 14); // 14 líneas en las 10 transacciones
  const totalIngresos = historial.reduce((sum, v) => sum + v.total_venta, 0);
  // (8*3200) + (11*2500) + (6*4000) + (5*5500) = 25600 + 27500 + 24000 + 27500 = 104600
  assert.equal(totalIngresos, 104600);
});

test('Ficha 3 — Robustez (5/5 bloqueos): rechaza -5, NaN ("cinco"), 0, vacío y exceso de stock sin corromper BD', async () => {
  sqliteMock.reset();
  const estadoInicial = sqliteMock.getState();

  const casosInvalidos = [
    { nombre: 'cantidad negativa (-5)', lines: [{ idProducto: 1, cantidad: -5 }] },
    { nombre: 'texto ("cinco" -> NaN)', lines: [{ idProducto: 1, cantidad: Number('cinco') }] },
    { nombre: 'cero (0)', lines: [{ idProducto: 1, cantidad: 0 }] },
    { nombre: 'vacío (sin productos)', lines: [] },
    { nombre: 'exceso de stock (999 > 18)', lines: [{ idProducto: 1, cantidad: 999 }] },
  ];

  for (const caso of casosInvalidos) {
    await assert.rejects(
      () => createSale(caso.lines),
      Error,
      `Debió bloquear el caso: ${caso.nombre}`,
    );
  }

  // Verificar que ninguna operación dejó cambios parciales en Productos o Historial_Ventas
  assert.deepEqual(sqliteMock.getState(), estadoInicial);
});

test('Regla de negocio: bloquea venta con más de 3 productos y hace rollback si la segunda línea falla', async () => {
  sqliteMock.reset();
  const estadoInicial = sqliteMock.getState();

  await assert.rejects(
    () =>
      createSale([
        { idProducto: 1, cantidad: 1 },
        { idProducto: 2, cantidad: 1 },
        { idProducto: 3, cantidad: 1 },
        { idProducto: 4, cantidad: 1 },
      ]),
    /entre 1 y 3 productos/,
  );

  // La línea 1 es válida, pero la línea 2 excede stock => rollback completo
  await assert.rejects(
    () =>
      createSale([
        { idProducto: 1, cantidad: 2 },
        { idProducto: 4, cantidad: 99 },
      ]),
    /Solo quedan 10 unidades/,
  );

  assert.deepEqual(sqliteMock.getState(), estadoInicial);
});

test('restockProduct: suma stock válido y rechaza cantidades inválidas', async () => {
  sqliteMock.reset();

  await restockProduct(1, 7);
  const productos = await getProducts();
  const leche = productos.find((p) => p.id === 1);
  assert.equal(leche?.stock_actual, 25);

  await assert.rejects(() => restockProduct(1, 0), Error);
  await assert.rejects(() => restockProduct(1, -3), Error);
  await assert.rejects(() => restockProduct(1, 1.5), Error);
});
