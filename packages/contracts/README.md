# @rpg/contracts

The single source of truth for domain shapes and API payloads. Each contract is
a [Zod](https://zod.dev) schema; the matching TypeScript type is derived with
`z.infer`, so validation and types can never drift apart.

The API validates requests/responses against these schemas and the apps reuse
them for form validation (react-hook-form + `@hookform/resolvers/zod`).

## What's inside

| Export                                 | Kind   | Notes                                                  |
| -------------------------------------- | ------ | ------------------------------------------------------ |
| `ROLES`, `roleSchema`, `Role`          | enum   | `pc \| dm \| co-dm \| admin \| superadmin \| observer` |
| `userSchema`, `User`                   | object | Canonical user (no password hash)                      |
| `sessionUserSchema`, `SessionUser`     | object | Subset returned by `GET /auth/me`                      |
| `passwordSchema`                       | string | Shared password policy (8–128 chars)                   |
| `loginInputSchema`, `LoginInput`       | object | `POST /auth/login` body                                |
| `registerInputSchema`, `RegisterInput` | object | `POST /auth/register` body                             |

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

1. Add a `z` schema in a focused module under `src/` (e.g. `campaign.ts`).
2. Derive and export its type with `z.infer`.
3. Re-export from `src/index.ts`.
4. Add a co-located `*.test.ts` asserting valid input parses and invalid input
   is rejected.

## Conventions

- Schemas are the source of truth; never hand-write a type that mirrors a schema.
- Keep schemas presentation-agnostic (no UI concerns).
- This package consumes nothing app-specific so anything (API, public, dashboard)
  can depend on it.

## Scripts

| Script           | Description                        |
| ---------------- | ---------------------------------- |
| `pnpm build`     | Emit `dist` (declarations) via tsc |
| `pnpm typecheck` | `tsc --noEmit` (includes tests)    |
| `pnpm lint`      | ESLint                             |
| `pnpm test`      | Vitest run                         |
