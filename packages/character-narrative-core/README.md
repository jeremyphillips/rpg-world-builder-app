# @rpg/character-narrative-core

Pure, deterministic composition for character narrative generation.

This package selects compatible authored fragments for personality traits, ideals,
bonds, flaws, and a three-part first-person backstory. It has no React, network,
catalog, or campaign dependencies. The caller supplies a validated collection and
a normalized generation context.

## Responsibilities

- Enforce alignment compatibility before weighting candidates.
- Choose one shared theme and bind references coherently.
- Apply affinity weights for available class, species, organization, and residence data.
- Avoid duplicate fragments and declared conflict tags.
- Interpolate validated narrative tokens.
- Produce reproducible output for the same seed, context, and collection revision.
- Fall back to complete, unrestricted authored fragments when a richer composition is unavailable.

## Public API

```ts
import { generateNarrative } from '@rpg/character-narrative-core'

const result = generateNarrative({
  context,
  collection,
  seed: 42,
})
```

Contracts are imported from the isolated `@rpg/contracts/character-narrative`
subpath. `generateNarrative` returns a discriminated success/failure result with
the rendered narrative, composition plan, seed, collection revision, selected
fragment IDs, and reference diagnostics.

The core does not decide which fields to overwrite. Dashboard form adapters own
the fill-empty policy.

## Commands

```bash
pnpm --filter @rpg/character-narrative-core typecheck
pnpm --filter @rpg/character-narrative-core lint
pnpm --filter @rpg/character-narrative-core test
```
