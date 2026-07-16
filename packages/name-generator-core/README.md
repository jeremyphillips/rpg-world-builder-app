# @rpg/name-generator-core

Pure name generation and convention recommendation utilities. No I/O, no
manifest ownership, no campaign coupling.

## Consumers

| Workspace                  | Use                                                |
| -------------------------- | -------------------------------------------------- |
| `@rpg/name-generator-data` | Orchestrate load + generate in tests and future UI |
| Dashboard (future)         | Standalone name-generator page                     |

## Imports

```ts
import { recommendConventions, generateNames, generateName } from '@rpg/name-generator-core'
import type { NamingConvention, NameCollection } from '@rpg/contracts/name-generator'
```

Callers load collections via `@rpg/name-generator-data` (phase 3) and pass a
`ReadonlyMap<string, NameCollection>` into `generateNames`.

## Commands

```bash
pnpm --filter @rpg/name-generator-core test
pnpm --filter @rpg/name-generator-core typecheck
pnpm --filter @rpg/name-generator-core lint
```
