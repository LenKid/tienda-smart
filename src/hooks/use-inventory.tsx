import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  createProduct,
  createSale,
  getProducts,
  getSalesLastSevenDays,
  initializeDatabase,
  restockProduct,
  type Producto,
  type VentaHistorial,
  type VentaLinea,
} from '@/database/db';

type InventoryContextValue = {
  products: Producto[];
  recentSales: VentaHistorial[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  registerSale: (lines: VentaLinea[]) => void;
  addProduct: (input: {
    codigo: string;
    nombre: string;
    precioVenta: number;
    stockActual: number;
    stockMinimo: number;
  }) => void;
  addStock: (id: number, cantidad: number) => void;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Producto[]>([]);
  const [recentSales, setRecentSales] = useState<VentaHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setProducts(getProducts());
    setRecentSales(getSalesLastSevenDays());
  }, []);

  useEffect(() => {
    try {
      initializeDatabase();
      refresh();
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo abrir la base de datos.');
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const registerSale = useCallback((lines: VentaLinea[]) => {
    createSale(lines);
    refresh();
  }, [refresh]);

  const addProduct = useCallback((input: Parameters<typeof createProduct>[0]) => {
    createProduct(input);
    refresh();
  }, [refresh]);

  const addStock = useCallback((id: number, cantidad: number) => {
    restockProduct(id, cantidad);
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ products, recentSales, loading, error, refresh, registerSale, addProduct, addStock }),
    [products, recentSales, loading, error, refresh, registerSale, addProduct, addStock],
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const value = useContext(InventoryContext);
  if (!value) throw new Error('useInventory debe usarse dentro de InventoryProvider.');
  return value;
}
