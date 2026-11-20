import type { Producto, VentaHistorial } from '@/database/db';

export type PrediccionProducto = {
  promedioDiario: number;
  diasRestantes: number;
  esUrgente: boolean;
  cantidadSugerida: number;
};

export type ProductoUrgente = Producto & PrediccionProducto;

export function calcularPrediccion(
  producto: Producto,
  ventas: VentaHistorial[],
): PrediccionProducto {
  const cantidadVendida = ventas
    .filter((venta) => venta.id_producto === producto.id)
    .reduce((total, venta) => total + venta.cantidad, 0);
  const promedioDiario = cantidadVendida / 7;
  const diasRestantes = promedioDiario > 0
    ? producto.stock_actual / promedioDiario
    : Number.POSITIVE_INFINITY;
  const esUrgente =
    producto.stock_actual <= producto.stock_minimo ||
    (promedioDiario > 0 && diasRestantes <= 3);
  const cantidadSugerida = Math.max(
    0,
    Math.ceil(promedioDiario * 7 + producto.stock_minimo - producto.stock_actual),
  );

  return { promedioDiario, diasRestantes, esUrgente, cantidadSugerida };
}

export function listarProductosUrgentes(
  productos: Producto[],
  ventas: VentaHistorial[],
) {
  return productos
    .map((producto) => ({ ...producto, ...calcularPrediccion(producto, ventas) }))
    .filter((producto) => producto.esUrgente)
    .sort((a, b) => a.diasRestantes - b.diasRestantes);
}
