# @rpg/config

Shared tooling configuration for the monorepo: TypeScript bases, ESLint flat
configs, Prettier, and a Vitest fragment. Consumed by every app and package so
linting, type-checking, formatting, and testing behave identically everywhere.

This package ships its plugins as dependencies, so consumers only need to depend
on `@rpg/config` (plus `eslint`, `typescript`, and `prettier` binaries) — flat
config imports the plugin objects directly, avoiding plugin-resolution issues.

## What's inside

| Export                            | Purpose                                         |
| --------------------------------- | ----------------------------------------------- |
| `@rpg/config/tsconfig/base.json`  | Strict TS base (no DOM)                         |
| `@rpg/config/tsconfig/react.json` | Base + DOM libs + `react-jsx`                   |
| `@rpg/config/tsconfig/node.json`  | Base + Node types                               |
| `@rpg/config/eslint/base`         | Flat config: JS + TS + feature-boundary rule    |
| `@rpg/config/eslint/react`        | `eslint/base` + React Hooks + Fast Refresh      |
| `@rpg/config/prettier`            | Prettier options object                         |
| `@rpg/config/vitest/base`         | Vitest config fragment (merge into your config) |

## Usage

### TypeScript

```jsonc
// apps/<app>/tsconfig.json
{
  "extends": "@rpg/config/tsconfig/react.json",
  "include": ["src"],
}
```

### ESLint

```js
// apps/<app>/eslint.config.js
import react from '@rpg/config/eslint/react'

export default [...react]
```

Backend/packages use `@rpg/config/eslint/base`.

### Prettier

```js
// prettier.config.mjs
export { default } from '@rpg/config/prettier'
```

### Vitest

```js
import { defineConfig, mergeConfig } from 'vitest/config'
import base from '@rpg/config/vitest/base'

export default mergeConfig(base, defineConfig({ test: { environment: 'jsdom' } }))
```

## Feature-boundary rule

`eslint/base` configures `eslint-plugin-boundaries` so each `src/features/*`
folder is an element. A feature's internals may only be imported through its
public entry (`index.ts` / `index.tsx`); deep cross-feature imports error.
Imports within the same feature are unrestricted. (Validated once apps with
feature folders exist.)
