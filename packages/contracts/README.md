# @rpg/contracts

The single source of truth for domain shapes and API payloads. Each contract is
a [Zod](https://zod.dev) schema; the matching TypeScript type is derived with
`z.infer`, so validation and types can never drift apart.

The API validates requests/responses against these schemas and the apps reuse
them for form validation (react-hook-form + `@hookform/resolvers/zod`).

## Folder layout

Source lives under `src/shared/`, `src/rpg/`, and isolated `dev-bench/`:

| Layer      | Path                  | Purpose                                               |
| ---------- | --------------------- | ----------------------------------------------------- |
| Shared     | `src/shared/`         | Auth, users, roles, routes, uploads, errors, assets   |
| Vocabulary | `src/rpg/vocab/`      | Closed-set game terms + open vocabulary set ids       |
| Primitives | `src/rpg/primitives/` | Shared value types (levels, dice, units, ruleset id)  |
| Content    | `src/rpg/content/`    | Catalog content types (species, weapons, classes, …)  |
| Runtime    | `src/rpg/runtime/`    | Stored character sheets (builder/sheet contracts)     |
| Campaign   | `src/rpg/campaign/`   | Campaign identity, rules, membership, ruleset patches |

`src/platform/index.ts` is a backward-compat shim re-exporting `shared/` +
`rpg/campaign/`. Dependency rules, ESLint enforcement, and where to put new
modules → [docs/structure.md](docs/structure.md).

## Subpath exports

The root import remains the default public API. Layer subpaths are available
when you want an explicit boundary in the import path:

| Import                        | Entry                         |
| ----------------------------- | ----------------------------- |
| `@rpg/contracts`              | `src/index.ts` (shared + rpg) |
| `@rpg/contracts/shared`       | `src/shared/index.ts`         |
| `@rpg/contracts/vocab`        | `src/rpg/vocab/index.ts`      |
| `@rpg/contracts/primitives`   | `src/rpg/primitives/index.ts` |
| `@rpg/contracts/content`      | `src/rpg/content/index.ts`    |
| `@rpg/contracts/runtime`      | `src/rpg/runtime/index.ts`    |
| `@rpg/contracts/rpg/campaign` | `src/rpg/campaign/index.ts`   |
| `@rpg/contracts/platform`     | shim → shared + campaign      |
| `@rpg/contracts/dev-bench`    | `src/dev-bench/index.ts`      |

```ts
import { loginInputSchema, characterSchema } from '@rpg/contracts'
import { getWeaponPropertyLabel } from '@rpg/contracts/vocab'
import { weaponSchema } from '@rpg/contracts/content'
import { characterSchema } from '@rpg/contracts/runtime'
```

## Usage

```ts
import { loginInputSchema, type LoginInput } from '@rpg/contracts'

const result = loginInputSchema.safeParse(body)
if (!result.success) {
  // result.error.issues -> 400
}
const input: LoginInput = result.data
```

## Adding a schema

1. Choose the layer — see [docs/structure.md](docs/structure.md).
2. Add a `z` schema in a focused module (e.g. `rpg/content/species.ts`,
   `rpg/campaign/campaign.ts`, `rpg/vocab/sense.ts`, `rpg/runtime/character/sheet.ts`).
3. Derive and export its type with `z.infer`.
4. Re-export from the layer's `index.ts`.
5. Add a co-located `*.test.ts` asserting valid input parses and invalid input
   is rejected.

For catalog content types, use [docs/content-types.md](../../docs/content-types.md).

## Conventions

- Schemas are the source of truth; never hand-write a type that mirrors a schema.
- Keep schemas presentation-agnostic (no UI concerns).
- Layer imports are enforced by ESLint — see [docs/structure.md](docs/structure.md).
- This package consumes nothing app-specific so anything (API, public, dashboard)
  can depend on it.

## Scripts

| Script           | Description                        |
| ---------------- | ---------------------------------- |
| `pnpm build`     | Emit `dist` (declarations) via tsc |
| `pnpm typecheck` | `tsc --noEmit` (includes tests)    |
| `pnpm lint`      | ESLint (includes layer boundaries) |
| `pnpm test`      | Vitest run                         |
