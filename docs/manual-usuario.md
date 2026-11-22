# Manual de Usuario - Tienda Smart

## 1. Objetivo

Tienda Smart es una aplicación móvil para pequeñas tiendas que permite registrar ventas, consultar el inventario, recibir productos y revisar alertas de reabastecimiento sin conexión a internet.

Los datos se guardan automáticamente en una base SQLite local del dispositivo.

## 2. Requisitos

- Dispositivo Android, iOS o navegador compatible.
- Expo Go o la aplicación compilada.
- No requiere cuenta de usuario ni conexión a internet.

## 3. Inicio de la aplicación

1. Abra la aplicación Tienda Smart.
2. Espere a que cargue la base de datos local.
3. Si es la primera apertura, la app precargará automáticamente:
   - Bolsa de leche.
   - Libra de arroz.
   - Kg de azúcar.
   - Pan tajado.
4. Use las pestañas inferiores o superiores para cambiar entre las funciones disponibles.

## 4. Registrar una venta

1. Abra la pestaña **Venta**.
2. Seleccione el producto tocando su tarjeta.
3. Ajuste la cantidad con:
   - El botón **−** para disminuir.
   - El botón **+** para aumentar.
   - El campo numérico para escribir la cantidad.
4. Revise el total mostrado en la pantalla.
5. Toque **Confirmar venta**.

Puede incluir hasta tres productos diferentes en una venta.

Al confirmar:

- La venta se guarda en el historial.
- El stock de cada producto disminuye automáticamente.
- Aparece una confirmación en pantalla.

## 5. Validaciones al vender

La aplicación no registrará una venta cuando:

- La cantidad está vacía.
- Se escribe texto.
- La cantidad es cero.
- La cantidad es negativa.
- Se intenta vender más unidades que las disponibles.

En estos casos mostrará una alerta y conservará el stock sin cambios.

## 6. Consultar el inventario

1. Abra la pestaña **Inventario**.
2. Revise cada producto:
   - Nombre.
   - Código.
   - Precio de venta.
   - Stock actual.
   - Stock mínimo.

Un producto con etiqueta **STOCK BAJO** requiere atención.

## 7. Añadir un producto nuevo

1. En **Inventario**, toque **Nuevo producto**.
2. Complete:
   - Código único.
   - Nombre.
   - Precio de venta.
   - Stock inicial.
   - Stock mínimo.
3. Toque **Guardar producto**.

El código no puede repetirse.

## 8. Registrar llegada de mercancía

1. En **Inventario**, localice el producto recibido.
2. Toque **Sumar**.
3. Escriba la cantidad recibida.
4. Confirme con **Sumar al stock**.

La cantidad recibida se sumará al stock actual.

## 9. Consultar alertas y predicción

1. Abra la pestaña **Alertas**.
2. La app analizará las ventas de los últimos siete días.
3. Un producto aparecerá como urgente si:
   - El stock actual está en o por debajo del stock mínimo.
   - Los días restantes son tres o menos.

Para cada producto urgente se muestra:

- Stock disponible.
- Promedio de ventas diarias.
- Días estimados antes del agotamiento.
- Cantidad sugerida para comprar.

La compra sugerida busca abastecer aproximadamente una semana y mantener el stock mínimo.

## 10. Cambiar el tema

En cualquier pantalla puede tocar el botón **Claro** o **Oscuro** ubicado junto al título.

El cambio modifica inmediatamente los colores de la aplicación.

## 11. Solución rápida de problemas

| Problema | Solución |
|---|---|
| No aparecen los productos | Reinicie la aplicación y espere la carga inicial de SQLite. |
| La venta no se registra | Revise que haya stock suficiente y que la cantidad sea mayor que cero. |
| No se puede crear el producto | Verifique que todos los campos tengan valores válidos y que el código no exista. |
| El stock no se actualiza | Confirme la venta y revise la pestaña Inventario. |

## 12. Información importante

- Los datos se conservan en el dispositivo.
- La aplicación no utiliza backend externo.
- No incluye facturación electrónica, proveedores externos ni pagos.
