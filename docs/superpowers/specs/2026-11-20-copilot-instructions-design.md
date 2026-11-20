# Copilot Instructions Design

## Goal

Create `.github/copilot-instructions.md` for `tienda-smart`, an Expo 58/React Native 0.88 application, so future Copilot sessions have verified repository-specific build commands, architecture guidance, and conventions.

## File contents

The repository-focused instruction file will contain:

- Expo SDK 58 and package-manager context.
- Verified setup, development, lint, and type-check commands.
- A clear statement that the repository has no configured test runner or single-test command.
- Expo Router structure: route files live under `src/app`, layout files define navigation, and non-route code belongs outside `src/app`.
- The native/web tab split and platform-specific component resolution convention.
- TypeScript alias usage for `@/*` and `@/assets/*`.
- Theme and spacing conventions in `src/constants/theme.ts` and `src/hooks/use-theme.ts`.
- The `expo-sqlite` plugin and `expo-router`/`expo-router/native-tabs` architecture.
- Expo native-generation rules: do not edit generated `ios/` or `android/` directories or assume APIs from older Expo SDKs.
- The reset script's destructive behavior and the need to treat it as a starter-template utility.

## Existing guidance

Incorporate the repository-specific material from `AGENTS.md` and do not duplicate generic guidance already covered clearly there.

## Validation

After creating the instruction file:

- Run the smallest relevant lint/type-check commands.
- Verify that every command in the file exists in `package.json` or is an established Expo CLI command documented by the repository conventions.
- Confirm the file is concise and contains no generic filler or exhaustive directory listing.
