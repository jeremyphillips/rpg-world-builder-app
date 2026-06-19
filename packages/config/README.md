# @rpg/config

Shared tooling configuration for the monorepo: TypeScript bases, ESLint flat
configs, Prettier, Vitest, and Storybook factories. Consumed by every app and
package so linting, type-checking, formatting, testing, and Storybook behave
identically everywhere.

This package ships its plugins as dependencies, so consumers only need to depend
on `@rpg/config` (plus `eslint`, `typescript`, and `prettier` binaries) — flat
config imports the plugin objects directly, avoiding plugin-resolution issues.

## What's inside

| Export                               | Purpose                                                   |
| ------------------------------------ | --------------------------------------------------------- |
| `@rpg/config/tsconfig/base.json`     | Strict TS base (no DOM)                                   |
| `@rpg/config/tsconfig/react.json`    | Base + DOM libs + `react-jsx`                             |
| `@rpg/config/tsconfig/node.json`     | Base + Node types                                         |
| `@rpg/config/eslint/base`            | Flat config: JS + TS + feature-boundary rule              |
| `@rpg/config/eslint/react`           | `eslint/base` + React Hooks + Fast Refresh                |
| `@rpg/config/prettier`               | Prettier options object                                   |
| `@rpg/config/vitest/base`            | Vitest config fragment (merge into your config)           |
| `@rpg/config/storybook/main-base`    | Storybook main factory (framework, addons, Tailwind)      |
| `@rpg/config/storybook/preview-base` | Storybook preview factory (theme toolbar, a11y, autodocs) |

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

### Storybook

Thin wrappers in each package's `.storybook/` directory:

```ts
// .storybook/main.ts
import { createStorybookMainConfig } from '@rpg/config/storybook/main-base'

export default createStorybookMainConfig({
  stories: ['../src/**/*.stories.@(ts|tsx)'],
})
```

```tsx
// .storybook/preview.tsx
import { createStorybookPreview } from '@rpg/config/storybook/preview-base'
import '../src/index.css' // or @rpg/ui globals.css

export default createStorybookPreview()
```

Dashboard apps merge a Vite alias in `viteFinal`; `@rpg/ui` adds
`withThemeContext` from `@rpg/ui/storybook/with-theme-context` via the
`decorators` option (keeps `@rpg/config` free of `@rpg/ui` imports).

Peer dependencies: `storybook`, `@storybook/react-vite`, `@storybook/addon-a11y`,
`@storybook/addon-themes`, `@tailwindcss/vite`, `react`, `react-dom`.

## Feature-boundary rule

`eslint/base` configures `eslint-plugin-boundaries` so each `src/features/*`
folder is an element. A feature's internals may only be imported through its
public entry (`index.ts` / `index.tsx`); deep cross-feature imports error.
Imports within the same feature are unrestricted. (Validated once apps with
feature folders exist.)
