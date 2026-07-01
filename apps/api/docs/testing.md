# Testing in @rpg/api

Integration tests exercise Mongo persistence, resolved reads, and HTTP routes
against an in-memory database. Pure lib modules stay co-located without DB
setup.

## Test pyramid

| Kind                | File pattern                | Scope                                                    |
| ------------------- | --------------------------- | -------------------------------------------------------- |
| Service integration | `{feature}.service.test.ts` | Persist + resolve via services; assert sparse Mongo docs |
| Route smoke         | `{feature}.routes.test.ts`  | Auth, status codes, one field changed per endpoint       |
| Pure lib            | `{module}.test.ts`          | No DB — asserts, merge helpers, env parsing              |

Do **not** duplicate combinatorial validation matrices here — those live in
[`@rpg/contracts` testing doc](../../../packages/contracts/docs/testing.md).

## Shared scaffold (`src/test/`)

| Path                             | Purpose                                                                |
| -------------------------------- | ---------------------------------------------------------------------- |
| `setup/integration-db.ts`        | `useIntegrationDb()` — `beforeAll`/`beforeEach`/`afterAll` for Mongo   |
| `setup/integration-app.ts`       | `useIntegrationApp()` — DB + `createApp()` for route tests             |
| `fixtures/users.ts`              | `makeTestUser()`                                                       |
| `fixtures/campaigns.ts`          | `makeTestCampaign()`                                                   |
| `fixtures/starting-wealth.ts`    | Re-exports catalog-aligned wealth helpers (see below)                  |
| `fixtures/character-creation.ts` | `characterCreationScenarios`, `enableExtendedProgressionAt30()`        |
| `helpers/ruleset-patch.ts`       | `readRulesetPatch`, `storedRulesetPatchDoc`, `expectStoredSparseUnset` |
| `helpers/http.ts`                | `authedCampaignContext`, `patchCharacterCreationRoute`, …              |
| `expect-http-error.ts`           | `expectHttpError`, `expectHttpErrorAsync`                              |
| `auth-agent.ts`                  | Register/login helpers for supertest agents                            |

Register hooks at module scope:

```ts
import { useIntegrationDb } from '../../test/setup/integration-db'

useIntegrationDb()
```

Route tests use `useIntegrationApp()` and call `getApp()` inside each test.

DB clearing uses **`beforeEach(clearTestDb)`** via `useIntegrationDb()` — not `afterEach`.

## Catalog-aligned starting wealth

Never hardcode SRD tier ids (`initiate`, `legend`, legacy `level-1`). Import from
`src/test/fixtures/starting-wealth.ts`, which re-exports
[`@rpg/catalog/starting-wealth/test-fixtures`](../../../packages/catalog/src/starting-wealth/test-fixtures.ts):

```ts
import {
  INITIATE_TIER_ID,
  patchInitiateStartingWealthTier,
  withLastTierMaxLevel,
} from '../../../test/fixtures/starting-wealth'
```

Character-creation patch shapes for persist tests → `fixtures/character-creation.ts`
(`characterCreationScenarios`).

## Ruleset-patch tests

| File                            | Role                                              |
| ------------------------------- | ------------------------------------------------- |
| `ruleset-patch.service.test.ts` | Sparse persist, resolved read, revert-to-default  |
| `ruleset-patch.routes.test.ts`  | Thin HTTP smoke (member read, manager patch, 401) |

See also [`src/features/vocabulary/README.md`](../src/features/vocabulary/README.md).

## Scripts

```sh
pnpm --filter @rpg/api test
pnpm --filter @rpg/api typecheck
```

First run downloads a `mongod` binary via `mongodb-memory-server`; no external services required.
