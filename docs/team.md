# 📱 TiendaSmart — Inventario y Predicción de Demanda para Pequeñas Tiendas

Prototipo móvil liviano desarrollado en **React Native + Expo + SQLite** diseñado para pequeños comercios de barrio (Proyecto académico — **Introducción a la Ingeniería Informática, Grupo G1 Salón 201**). Permite registrar ventas diarias rápidamente, actualizar el inventario en tiempo real y generar alertas automáticas de reabastecimiento basadas en el historial de ventas.

---

## 👥 Equipo y Roles (Ficha 2 — Modelo Incremental)

| Integrante                         | Rol Asignado                                        | Responsabilidades Principales                                                                                                  |
| :--------------------------------- | :-------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| **Janier Jair Hoyos Anacona**      | Analista de Requisitos                              | Definir entradas, salidas, reglas de negocio de la tienda, lógica de predicción y redactar el manual de usuario.               |
| **Kedin Sebastián Valencia Flor**  | Diseñador de Software y Responsable de Calidad (QA) | Diseñar el esquema de BD (`SQLite`), wireframes de interfaz, mantener el repo y ejecutar las pruebas ISO/IEC 25010.            |
| **Jonathan Andrés Tobar Quintero** | Programador                                         | Codificar las pantallas en React Native, conectar `expo-sqlite`, programar el descuento de stock y el algoritmo de predicción. |

---

## 🔄 Paso a Paso por Integrante del Equipo (Modelo Incremental)

Siguiendo la Ficha 2 y los criterios de calidad de la Ficha 3, el trabajo se divide en **dos incrementos** para avanzar en paralelo sin bloqueos:

### 📦 Incremento 1: Base de datos, Inventario y Registro de Ventas

_Objetivo: Tener funcionando el registro de productos y ventas con descuento exacto de inventario._

1. **Janier Jair Hoyos (Analista de Requisitos):**
   - Definir las reglas exactas del negocio: ¿qué pasa si un producto llega a 0?, ¿cómo se calcula el pedido sugerido? (Ej. `Sugerencia = (Promedio_Venta_Diaria * 7) - Stock_Actual + Stock_Minimo`).
   - Redactar los datos de prueba reales (10 transacciones de venta con valores conocidos y los 5 casos de datos erróneos) para que el equipo los use al validar.
2. **Kedin Sebastián Valencia (Diseñador de Software):**
   - Crear el repositorio en GitHub (`TiendaSmart`) y subir el proyecto base de Expo (`npx create-expo-app`).
   - Dibujar los bocetos (wireframes) de las 3 pantallas asegurando que registrar una venta tome **máximo 4 toques**.
   - Definir el esquema exacto de las tablas `Productos` e `Historial_Ventas`.
3. **Jonathan Tobar Quintero (Programador):**
   - Instalar `expo-sqlite` (`npx expo install expo-sqlite`) y programar la creación de las tablas.
   - Codificar la pantalla de **Inventario** (ver y agregar stock) y la pantalla de **Registrar Venta** (descontando el stock en la base de datos y bloqueando números negativos, ceros o texto).

### 📈 Incremento 2: Algoritmo de Predicción y Pruebas de Calidad (ISO/IEC 25010)

_Objetivo: Añadir el módulo de predicción sobre la base ya probada y certificar las métricas de la Ficha 3._

4. **Jonathan Tobar Quintero (Programador):**
   - Programar la función de predicción que lee `Historial_Ventas`, calcula el promedio de consumo diario por producto y genera las alertas de reabastecimiento en la tercera pantalla.
5. **Kedin Sebastián Valencia (Responsable de Calidad - QA):**
   - Ejecutar y documentar las 3 pruebas exigidas en la Ficha 3 sobre la app corriendo en un celular Android:
     - **Corrección funcional:** Ingresar las 10 ventas de prueba de Janier y verificar en pantalla que el saldo final de stock coincida `10/10` con el cálculo hecho en papel.
     - **Usabilidad:** Cronometrar a un compañero (haciendo de tendero) registrando 5 ventas reales de hasta 3 productos; verificar que tarde **menos de 15 segundos** y use **4 clics o menos**.
     - **Robustez:** Intentar ingresar `-5`, `"cinco"`, `0`, dejar vacío y vender más del stock disponible; verificar que la app muestre alerta en los 5 casos sin cerrarse.
6. **Janier Jair Hoyos (Analista - Cierre y Documentación):**
   - Redactar el manual de usuario breve y el reporte de resultados de las pruebas (evidencias/capturas de pantalla) para la entrega final de la fase de Mantenimiento.

---

## 🚀 Cómo iniciar el proyecto en tu computadora

### 1. Clonar e instalar dependencias

```bash
git clone <URL_DEL_REPOSITORIO_GITHUB>
cd TiendaSmart
npm install
```

### 2. Ejecutar el servidor de desarrollo

```bash
npx expo start
```

- **En teléfono físico:** Escanea el código QR usando la app **Expo Go** (Android/iOS). Si hay problemas de red, usa `npx expo start --tunnel`.
- **En emulador / cable USB:** Presiona la tecla `a` en la terminal (requiere tener `platform-tools` / `adb` configurado en el sistema).

### Reglas de Git para el equipo

1. Antes de empezar a trabajar, ejecuta siempre `git pull origin main`.
2. Trabaja en ramas por funcionalidad (ej. `feat/base-datos-ui`, `feat/ventas-inventario`, `feat/prediccion-demanda`).
3. Haz commits claros describiendo qué se avanzó (ej. `feat: descuento automatico de stock al registrar venta`).

---

## 🎯 Alcance del Prototipo (Ficha 1)

### ✅ Lo que SÍ incluye la app:

1. **Gestión de Inventario:** Listado de productos con alertas visuales cuando `stock_actual <= stock_minimo` y opción para registrar llegada de mercancía.
2. **Registro Rápido de Ventas:** Descuento inmediato y exacto del `stock_actual` al confirmar una venta.
3. **Predicción de Demanda y Alertas:** Cálculo del promedio de ventas diarias (últimos 7 días) para estimar días restantes de stock y sugerir la cantidad de compra semanal al administrador.

### ❌ Fuera de alcance (NO programar):

- Facturación electrónica (DIAN).
- Conexión por API con proveedores externos.
- Pasarelas de pago digital o sistemas de login complejos.

---

## 🗄️ Estructura de la Base de Datos (SQLite)

El sistema utiliza almacenamiento local offline mediante `expo-sqlite` con dos tablas principales:

```sql
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
    fecha TEXT NOT NULL, -- Formato YYYY-MM-DD
    id_producto INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    total_venta REAL NOT NULL,
    FOREIGN KEY (id_producto) REFERENCES Productos(id)
);
```

---

## ✅ Criterios de Calidad Obligatorios (Ficha 3 — ISO/IEC 25010)

Antes de dar por terminado el prototipo, todo el código debe superar estas 3 métricas:

1. **Corrección Funcional (10/10):** El 100% de las transacciones de prueba deben descontar el inventario exactamente igual que el cálculo manual sin errores aritméticos.
2. **Usabilidad (< 15s y ≤ 4 toques):** Un usuario debe poder registrar una venta de hasta 3 productos en menos de **15 segundos** y con un máximo de **4 toques** en pantalla.
3. **Robustez (5/5 bloqueos):** La app **nunca** debe cerrarse ni corromper la base de datos si se ingresan cantidades negativas (`-5`), texto (`"cinco"`), cero (`0`), campos vacíos o cantidades mayores al stock disponible; siempre debe mostrar una alerta clara.
