import * as SQLite from 'expo-sqlite';

export type Producto = {
  id: number;
  codigo: string;
  nombre: string;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
};

export type VentaHistorial = {
  id: number;
  fecha: string;
  id_producto: number;
  cantidad: number;
  total_venta: number;
};

export type VentaLinea = {
  idProducto: number;
  cantidad: number;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('tienda-smart.db');
  }
  return databasePromise;
}

export function localIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function initializeDatabase() {
  const db = await getDatabase();
  await db.execAsync('PRAGMA foreign_keys = ON');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT UNIQUE NOT NULL,
      nombre TEXT NOT NULL,
      precio_venta REAL NOT NULL,
      stock_actual INTEGER NOT NULL,
      stock_minimo INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS Historial_Ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT NOT NULL,
      id_producto INTEGER NOT NULL,
      cantidad INTEGER NOT NULL,
      total_venta REAL NOT NULL,
      FOREIGN KEY (id_producto) REFERENCES Productos(id)
    );
  `);

  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM Productos',
  );
  if ((result?.count ?? 0) > 0) return;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO Productos (codigo, nombre, precio_venta, stock_actual, stock_minimo)
       VALUES (?, ?, ?, ?, ?)`,
      ['ML-001', 'Bolsa de leche', 3200, 18, 5],
    );
    await db.runAsync(
      `INSERT INTO Productos (codigo, nombre, precio_venta, stock_actual, stock_minimo)
       VALUES (?, ?, ?, ?, ?)`,
      ['AR-001', 'Libra de arroz', 2500, 20, 6],
    );
    await db.runAsync(
      `INSERT INTO Productos (codigo, nombre, precio_venta, stock_actual, stock_minimo)
       VALUES (?, ?, ?, ?, ?)`,
      ['AZ-001', 'Kg de azúcar', 4000, 12, 4],
    );
    await db.runAsync(
      `INSERT INTO Productos (codigo, nombre, precio_venta, stock_actual, stock_minimo)
       VALUES (?, ?, ?, ?, ?)`,
      ['PA-001', 'Pan tajado', 5500, 10, 3],
    );

    const seedSales = [
      [0, 1, 2], [0, 2, 1], [0, 3, 2], [0, 4, 1],
      [1, 1, 3], [1, 2, 2], [1, 3, 1], [1, 4, 2],
      [2, 1, 2], [2, 2, 2], [2, 4, 1],
      [3, 1, 1], [3, 2, 3], [3, 3, 2],
      [4, 1, 2], [4, 3, 1], [4, 4, 3],
      [5, 1, 3], [5, 2, 1], [5, 3, 2],
      [6, 1, 2], [6, 2, 2], [6, 4, 2],
    ] as const;

    for (const [daysAgo, productId, cantidad] of seedSales) {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      const product = await db.getFirstAsync<{ precio_venta: number }>(
        'SELECT precio_venta FROM Productos WHERE id = ?',
        [productId],
      );
      if (!product) continue;
      await db.runAsync(
        `INSERT INTO Historial_Ventas (fecha, id_producto, cantidad, total_venta)
         VALUES (?, ?, ?, ?)`,
        [localIsoDate(date), productId, cantidad, cantidad * product.precio_venta],
      );
    }
  });
}

export async function getProducts() {
  const db = await getDatabase();
  return db.getAllAsync<Producto>('SELECT * FROM Productos ORDER BY nombre ASC');
}

export async function getSalesLastSevenDays() {
  const db = await getDatabase();
  const since = new Date();
  since.setDate(since.getDate() - 6);
  return db.getAllAsync<VentaHistorial>(
    `SELECT * FROM Historial_Ventas
     WHERE fecha >= ?
     ORDER BY fecha DESC, id DESC`,
    [localIsoDate(since)],
  );
}

export async function createProduct(input: {
  codigo: string;
  nombre: string;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
}) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO Productos (codigo, nombre, precio_venta, stock_actual, stock_minimo)
     VALUES (?, ?, ?, ?, ?)`,
    [input.codigo, input.nombre, input.precioVenta, input.stockActual, input.stockMinimo],
  );
}

export async function restockProduct(id: number, cantidad: number) {
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    throw new Error('La cantidad de reposición debe ser un entero positivo.');
  }
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE Productos SET stock_actual = stock_actual + ? WHERE id = ?',
    [cantidad, id],
  );
}

export async function createSale(lines: VentaLinea[]) {
  if (lines.length === 0 || lines.length > 3) {
    throw new Error('Una venta debe contener entre 1 y 3 productos.');
  }

  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const line of lines) {
      if (!Number.isInteger(line.cantidad) || line.cantidad <= 0) {
        throw new Error('Las cantidades deben ser enteros positivos.');
      }

      const product = await db.getFirstAsync<Producto>(
        'SELECT * FROM Productos WHERE id = ?',
        [line.idProducto],
      );
      if (!product) throw new Error('El producto seleccionado ya no existe.');
      if (line.cantidad > product.stock_actual) {
        throw new Error(`Solo quedan ${product.stock_actual} unidades de ${product.nombre}.`);
      }

      const total = line.cantidad * product.precio_venta;
      await db.runAsync(
        `INSERT INTO Historial_Ventas (fecha, id_producto, cantidad, total_venta)
         VALUES (?, ?, ?, ?)`,
        [localIsoDate(), line.idProducto, line.cantidad, total],
      );
      await db.runAsync(
        'UPDATE Productos SET stock_actual = stock_actual - ? WHERE id = ?',
        [line.cantidad, line.idProducto],
      );
    }
  });
}
