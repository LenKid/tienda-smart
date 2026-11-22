This is an Expo SDK 58 / React Native 0.88 / React 19.3 mobile & web app (`tienda-smart`) using Expo Router, `expo-sqlite`, and strict TypeScript.

## Expo has changed — do not trust your training data

Before writing code that touches an Expo, EAS, or React Native API:

1. Check `expo` major version in `package.json` (currently `~58.0.26`).
2. Fetch matching versioned docs: `https://docs.expo.dev/versions/v58.0.0/`
3. For anything else, fetch `https://docs.expo.dev/llms.txt` and follow its links; never answer from memory.

## Commands

Use `npm` (`package-lock.json` is present; no Bun lockfile).

```bash
npx expo install <package>  # ALWAYS use instead of npm install <pkg> — resolves SDK-compatible versions
npx expo start              # start dev server (--android | --ios | --web)
npm run lint                # expo lint
npx tsc --noEmit            # typecheck (strict mode)
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

- Run `npm run lint` and `npx tsc --noEmit` before declaring any task done.
- There is no test runner/Jest configured in `package.json`; do not invent test commands.
- `npm run reset-project` (`scripts/reset-project.js`) destructively moves/deletes `src/` and `scripts/` — never run it as routine setup.

## Architecture & Conventions

- **Routing (`src/app/`)**: Expo Router file-based screens (`index.tsx` = Venta, `inventario.tsx` = Inventario, `alertas.tsx` = Alertas). `src/app/_layout.tsx` wraps the app in `ThemePreferenceProvider` -> `ThemeProvider` -> `InventoryProvider` -> `AppTabs`.
- **Platform-specific tabs**: `src/components/app-tabs.tsx` (native `expo-router/native-tabs`) and `src/components/app-tabs.web.tsx` (`expo-router/ui`). Keep route names/hrefs aligned across both when changing tabs.
- **Data & domain logic**: `database/db.ts` (`expo-sqlite`, `tienda-smart.db` with `Productos` and `Historial_Ventas`, auto-seeded on first launch) and `utils/prediccion.ts` live at the repo root outside `src/`. Access inventory state and mutations through `useInventory()` (`src/hooks/use-inventory.tsx`).
- **Path aliases (`tsconfig.json`)**: `@/*` -> `src/*`, `@/assets/*` -> `assets/*`, `@/database/*` / `database/*` -> `database/*`, `@/utils/*` / `utils/*` -> `utils/*`.
- **Web SQLite (`metro.config.js`)**: Configures `.wasm` asset extension and `COEP: credentialless` / `COOP: same-origin` headers required by `expo-sqlite` on web — preserve these when editing Metro config.
- **UI & theming**: Use `Colors`, `Spacing`, `BottomTabInset`, `MaxContentWidth` from `src/constants/theme.ts`, `useTheme()` / `useThemePreference()`, and existing wrappers (`ThemedText`, `ThemedView`, `Collapsible`).

## Native & EAS Rules

- `ios/` and `android/` do not exist (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes bundled native modules; adding native libraries requires a development build (`npx expo run:ios|android` or `npx eas-cli@latest build --profile development`).
- Run EAS CLI as `npx eas-cli@latest <command>` for cloud builds/updates (`eas.json` is not yet configured).
