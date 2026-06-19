# @rpg/contracts

The single source of truth for domain shapes and API payloads. Each contract is
a [Zod](https://zod.dev) schema; the matching TypeScript type is derived with
`z.infer`, so validation and types can never drift apart.

The API validates requests/responses against these schemas and the apps reuse
them for form validation (react-hook-form + `@hookform/resolvers/zod`).

## Folder layout

Source lives in four layers under `src/`:

| Layer      | Path              | Purpose                                              |
| ---------- | ----------------- | ---------------------------------------------------- |
| Vocabulary | `src/vocab/`      | Closed-set game terms (labels, SRD text, Zod enums)  |
| Primitives | `src/primitives/` | Shared value types (levels, dice, units, ruleset id) |
| Content    | `src/content/`    | Catalog content types (species, weapons, classes, …) |
| Platform   | `src/platform/`   | Auth, users, campaigns, uploads, errors, assets      |

Dependency rules, ESLint enforcement, and where to put new modules →
[docs/structure.md](docs/structure.md).

## Subpath exports

The root import remains the default public API. Layer subpaths are available
when you want an explicit boundary in the import path:

| Import                      | Entry                       |
| --------------------------- | --------------------------- |
| `@rpg/contracts`            | `src/index.ts` (all layers) |
| `@rpg/contracts/vocab`      | `src/vocab/index.ts`        |
| `@rpg/contracts/primitives` | `src/primitives/index.ts`   |
| `@rpg/contracts/content`    | `src/content/index.ts`      |
| `@rpg/contracts/platform`   | `src/platform/index.ts`     |

```ts
import { loginInputSchema, type LoginInput } from '@rpg/contracts'
import { getWeaponPropertyLabel } from '@rpg/contracts/vocab'
import { weaponSchema } from '@rpg/contracts/content'
```

## What's inside (platform highlights)

| Export                                 | Kind   | Notes                                                  |
| -------------------------------------- | ------ | ------------------------------------------------------ |
| `ROLES`, `roleSchema`, `Role`          | enum   | `pc \| dm \| co-dm \| admin \| superadmin \| observer` |
| `userSchema`, `User`                   | object | Canonical user (no password hash)                      |
| `sessionUserSchema`, `SessionUser`     | object | Subset returned by `GET /auth/me`                      |
| `passwordSchema`                       | string | Shared password policy (8–128 chars)                   |
| `loginInputSchema`, `LoginInput`       | object | `POST /auth/login` body                                |
| `registerInputSchema`, `RegisterInput` | object | `POST /auth/register` body                             |

Content types (species, weapons, classes, …) and reference vocabulary (senses,
damage types, weapon properties, …) are exported from the root barrel as well.
See [docs/structure.md](docs/structure.md) for the full taxonomy.

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
2. Add a `z` schema in a focused module (e.g. `content/species.ts`,
   `platform/campaign.ts`, `vocab/sense.ts`).
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
