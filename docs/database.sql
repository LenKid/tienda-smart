-- Tabla 1: Productos
CREATE TABLE IF NOT EXISTS Productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    precio_venta REAL NOT NULL,
    stock_actual INTEGER NOT NULL,
    stock_minimo INTEGER NOT NULL
);

-- Tabla 2: Historial_Ventas
CREATE TABLE IF NOT EXISTS Historial_Ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL, -- Formato YYYY-MM-DD
    id_producto INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    total_venta REAL NOT NULL,
    FOREIGN KEY (id_producto) REFERENCES Productos(id)
);