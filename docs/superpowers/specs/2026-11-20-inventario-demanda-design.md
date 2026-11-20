# Inventario y Predicción de Demanda

## Goal

Crear un prototipo móvil liviano para pequeñas tiendas que permita registrar productos, registrar ventas rápidas, actualizar stock, calcular demanda de siete días y mostrar alertas de reabastecimiento sin backend ni internet.

## Architecture

- Expo Router maneja tres rutas protegidas por un layout tabular.
- Expo SQLite almacena `Productos` y `Historial_Ventas`.
- Un proveedor React inicializa la base al montar la app, ejecuta el seed idempotente y expone productos, ventas recientes y operaciones.
- Las pantallas consumen el proveedor y muestran estados de carga y error.
- `utils/prediccion.js` contiene el cálculo puro de promedio diario, días restantes y urgencia.
- Las ventas se ejecutan dentro de una transacción SQLite que inserta cada línea y descuenta stock una sola vez.

## Database

### Productos

- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `codigo TEXT NOT NULL UNIQUE`
- `nombre TEXT NOT NULL`
- `precio_venta REAL NOT NULL`
- `stock_actual INTEGER NOT NULL`
- `stock_minimo INTEGER NOT NULL`

### Historial_Ventas

- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `fecha TEXT NOT NULL`
- `id_producto INTEGER NOT NULL`
- `cantidad INTEGER NOT NULL`
- `total_venta REAL NOT NULL`
- `FOREIGN KEY (id_producto) REFERENCES Productos(id)`

`PRAGMA foreign_keys = ON` se habilita durante la conexión. Las tablas se crean automáticamente al abrir la app.

## Seed

El seed se ejecuta solo cuando `Productos` está vacío e inserta:

- Bolsa de leche: código `ML-001`, precio 3200, stock 18, mínimo 5.
- Libra de arroz: código `AR-001`, precio 2500, stock 20, mínimo 6.
- Kg de azúcar: código `AZ-001`, precio 4000, stock 12, mínimo 4.
- Pan tajado: código `PA-001`, precio 5500, stock 10, mínimo 3.

También genera ventas distribuidas en los últimos siete días para que la predicción sea visible inmediatamente.

## Screens

### Registrar Venta

- Permite una venta con hasta tres líneas.
- Usa tarjetas horizontales o un selector rápido para elegir productos.
- Cada línea incluye cantidad con botones `−` y `+`, entrada numérica y total calculado.
- Confirmar registra una venta del día actual y descuenta stock.
- Una venta nueva añade una línea a `Historial_Ventas` por cada producto confirmado.

Validaciones:

- La cantidad debe ser texto numérico compuesto únicamente por dígitos enteros.
- Debe ser mayor que cero.
- No puede superar el stock actual.
- Cero, negativos, vacíos y texto producen una alerta sin modificar la base.

### Inventario

- Lista nombre, precio, stock actual, stock mínimo y estado.
- Muestra badge rojo cuando `stock_actual <= stock_minimo`.
- Incluye un formulario/modal para crear productos.
- Permite sumar cantidades de proveedor al stock existente.

### Alertas y Predicción

- Toma ventas de los últimos siete días relativos a la fecha local.
- Calcula `promedio_diario = cantidadVendida / 7`.
- Calcula `dias_restantes = stock_actual / promedio_diario`.
- Marca urgentemente cuando `stock_actual <= stock_minimo` o `dias_restantes <= 3`.
- Sugiere compra semanal con una cantidad suficiente para siete días más el mínimo:
  `max(0, ceil(promedio_diario * 7 + stock_minimo - stock_actual))`

## UX

- Fondo claro, acciones verdes, alertas rojas/ámbar y tipografía legible.
- Controles táctiles altos para operación con una mano.
- Web y móvil mantienen las mismas rutas y componentes.
- No se incluyen autenticación, proveedores externos, pagos ni facturación.

## Testing

No hay test runner configurado. La verificación disponible es `npm run lint`, `npx tsc --noEmit` y revisión manual de las pantallas.
