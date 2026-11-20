# Inventario y Predicción de Demanda Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete local SQLite prototype with three Expo Router tabs for fast sales, inventory management, and demand alerts.

**Architecture:** An inventory provider initializes SQLite, seeds data, and exposes refreshable product/sales operations to three screens. A pure prediction module calculates demand, urgency, and suggested purchase quantities. Native and web tab navigators keep aligned route names.

**Tech Stack:** Expo SDK 58, React Native 0.88, React 19.3, Expo Router, Expo SQLite, TypeScript strict mode.

**Spec:** `docs/superpowers/specs/2026-11-20-inventario-demanda-design.md`

## Global Constraints

- Use `expo-sqlite` only; no backend or external network dependency.
- Create `Productos` and `Historial_Ventas` automatically and enable foreign keys.
- Seed four products and seven days of sales only when the product table is empty.
- Keep exactly three app tabs.
- Validate sales as positive integer text and block insufficient stock.
- Register and decrement stock in one SQLite transaction.
- Run all verification with `npm run lint` and `npx tsc --noEmit`.

## Review Focus

- Invalid quantities: zero, negative, empty, decimal, and text input must show an alert and perform no write.
- Insufficient stock: a sale at or above available stock must be handled only if each quantity is positive and total is within stock.
- Transaction rollback: a database failure must leave stock and history unchanged.
- Seed idempotency: starting multiple times must not duplicate products or sales.
- Prediction boundaries: zero sales must mean no predicted demand, while low stock must remain urgent.
- Tab parity: native and web navigators must expose the same three route names.

---

### Task 1: Create SQLite database layer

**Files:**
- Create: `database/db.ts`
- Modify: `src/app/_layout.tsx`

**Interfaces:**
- Produces: `initializeDatabase()`, `getProducts()`, `getSalesLastSevenDays()`, `createSale()`, `createProduct()`, `restockProduct()`.
- Types: `Producto` and `VentaHistorial` exported from `database/db.ts`.

- [ ] **Step 1: Add SQLite types and initialization**

Create `database/db.ts` with Expo SQLite synchronous access. Initialize `Productos` and `Historial_Ventas`, enable foreign keys, and seed only when the product count is zero.

- [ ] **Step 2: Implement product and stock operations**

Add typed queries for products, sales, product creation, restocking, and atomic sale registration.

- [ ] **Step 3: Add provider initialization**

Wrap the existing tabs in `src/app/_layout.tsx` with a new database provider after the provider is implemented in Task 2.

### Task 2: Create inventory provider

**Files:**
- Create: `src/hooks/use-inventory.tsx`

**Interfaces:**
- Provides: `products`, `recentSales`, `loading`, `error`, `refresh()`, `registerSale()`, `addProduct()`, `addStock()`.
- Sale input: up to three `{ idProducto: number, cantidad: number }` entries.

- [ ] **Step 1: Implement provider state**

Initialize database once, keep product and recent-sale state, and expose refreshable async operations.

- [ ] **Step 2: Export hook**

Expose `useInventory()` and reject invalid sale rows before calling the database layer.

### Task 3: Add prediction utility

**Files:**
- Create: `utils/prediccion.ts`

**Interfaces:**
- `calcularPrediccion(producto, ventas): PrediccionProducto`
- `listarProductosUrgentes(productos, ventas): ProductoUrgente[]`
- Prediction includes `promedioDiario`, `diasRestantes`, `esUrgente`, and `cantidadSugerida`.

- [ ] **Step 1: Implement pure calculations**

Sum seven-day sales per product, divide by seven, estimate remaining days, and mark urgency for minimum stock or three days or fewer.

- [ ] **Step 2: Implement purchase suggestion**

Calculate `ceil(promedioDiario * 7 + stock_minimo - stock_actual)` with a minimum of zero.

### Task 4: Replace navigation with three tabs

**Files:**
- Create: `src/app/index.tsx`
- Create: `src/app/inventario.tsx`
- Create: `src/app/alertas.tsx`
- Modify: `src/app/_layout.tsx`
- Modify: `src/components/app-tabs.tsx`
- Modify: `src/components/app-tabs.web.tsx`

- [ ] **Step 1: Add the three route files**

Create the sales, inventory, and alerts screens with route names `index`, `inventario`, and `alertas`.

- [ ] **Step 2: Update native tabs**

Map each native tab trigger to the corresponding route.

- [ ] **Step 3: Update web tabs**

Map each web tab trigger to `/`, `/inventario`, and `/alertas`.

### Task 5: Build reusable mobile components

**Files:**
- Create: `src/components/inventory/product-card.tsx`
- Create: `src/components/inventory/quantity-stepper.tsx`
- Create: `src/components/inventory/stock-badge.tsx`
- Create: `src/components/inventory/product-modal.tsx`

- [ ] **Step 1: Implement touch-friendly inventory components**

Use `ThemedText`, `ThemedView`, shared theme constants, and `StyleSheet.create`.

- [ ] **Step 2: Implement modal actions**

Support create-product and restock flows with strict numeric validation and clear alerts.

### Task 6: Implement sales and inventory screens

**Files:**
- Modify: `src/app/index.tsx`
- Modify: `src/app/inventario.tsx`

- [ ] **Step 1: Implement fast sales**

Provide up to three product lines, product selection, quantity stepper, live total, and confirm action.

- [ ] **Step 2: Add invalid-input handling**

Reject empty, text, decimal, negative, zero, duplicate, and over-stock rows with an alert.

- [ ] **Step 3: Implement inventory**

Render products, low-stock badges, add-product modal, and restock modal.

### Task 7: Implement alerts screen

**Files:**
- Modify: `src/app/alertas.tsx`

- [ ] **Step 1: Render urgent report**

Show urgent products with stock, average daily sales, estimated remaining days, and exact weekly purchase suggestion.

- [ ] **Step 2: Add stable empty state**

Show a non-urgent state when no product meets the minimum or three-day threshold.

### Task 8: Verify and commit

- [ ] **Step 1: Run lint**

Run `npm run lint`.

Expected: Expo lint completes or the exact existing baseline issue is reported.

- [ ] **Step 2: Run strict type-check**

Run `npx tsc --noEmit`.

Expected: no TypeScript errors introduced by the inventory implementation.

- [ ] **Step 3: Review key flows**

Verify seed, product creation, restock, valid sale, invalid sale, stock decrement, prediction, and urgency manually.

- [ ] **Step 4: Commit implementation**

Commit the inventory prototype with the repository's required co-author trailer.
