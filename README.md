# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **example** directory and create a blank **src/app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Pseudocódigo de los procesos principales

**PROCESO InicializarAplicacion**

ENTRADA: Ninguna

base_datos ← AbrirSQLite()

base_datos.CrearTabla("Productos")
base_datos.CrearTabla("Historial_Ventas")

SI la tabla Productos está vacía ENTONCES

    Cargar4ProductosEjemplo()
    CargarVentasUltimos7Dias()

FIN SI

SALIDA: Aplicacion_lista


**PROCESO RegistrarVenta**

ENTRADA: lista_productos, lista_cantidades

PARA CADA producto_seleccionado

    SI cantidad no es entero positivo o excede el stock ENTONCES

        MostrarAlerta("Venta inválida")
        DetenerProceso()

    FIN SI

FIN PARA

IniciarTransaccion()

PARA CADA producto_seleccionado

    RegistrarVentaEnHistorial(producto, cantidad)
    RestarCantidadDelStock(producto, cantidad)

FIN PARA

ConfirmarTransaccion()

SALIDA: Venta_registrada, stock_actualizado


**PROCESO CalcularReabastecimiento**

ENTRADA: lista_productos, historial_ventas

PARA CADA producto

    ventas_7_dias ← SumarVentas(producto, últimos 7 días)
    promedio_diario ← ventas_7_dias / 7
    dias_restantes ← stock_actual / promedio_diario

    SI stock_actual ≤ stock_minimo o dias_restantes ≤ 3 ENTONCES

        compra_semanal ← Máximo(0, promedio_diario × 7 + stock_minimo - stock_actual)
        AgregarAListaUrgente(producto, compra_semanal)

    FIN SI

FIN PARA

SALIDA: lista_urgente
