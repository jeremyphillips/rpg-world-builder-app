# @rpg/name-generator-data

Fixture naming conventions, lazy-loadable collection assets, and registry
loaders for the experimental name generator foundation.

## Scope

- Slim `NamingConventionDefinition` objects and `CULTURE_CONVENTION_BINDINGS`
- `listStaticConventions()` for unmigrated exceptional conventions only
- `STANDALONE_NAMING_CULTURES` and `HERITAGE_CULTURE_ALIASES`
- Lazy collection loading (`loadNameCollection`) via trusted import map

Resolution of catalog-bound definitions into full `NamingConvention` objects
belongs in `@rpg/name-generator-integrations` — this package never imports it.

## Package boundary

```text
contracts
  ↑
data          (definitions, pools, static conventions, standalone cultures)

contracts + core + data
  ↑
integrations  (buildNamingCultureContext, resolveCampaignConventions, …)
```

## Consumers

| Workspace    | Use                                                                   |
| ------------ | --------------------------------------------------------------------- |
| Dashboard    | Composes `listStaticConventions` + integrations resolution explicitly |
| Integrations | Binds species/standalone cultures to `CULTURE_CONVENTION_BINDINGS`    |
| Tests        | End-to-end convention + collection workflows                          |

## Imports

```ts
import {
  CULTURE_CONVENTION_BINDINGS,
  HERITAGE_CULTURE_ALIASES,
  listStaticConventions,
  loadNameCollection,
  STANDALONE_NAMING_CULTURES,
} from '@rpg/name-generator-data'
import {
  resolveCampaignConventions,
  resolveStandaloneConventions,
} from '@rpg/name-generator-integrations'
```

Dashboard convention composition:

```ts
const campaignConventions = resolveCampaignConventions({
  species,
  bindings: CULTURE_CONVENTION_BINDINGS,
})
const standaloneConventions = resolveStandaloneConventions({
  cultures: STANDALONE_NAMING_CULTURES,
  bindings: CULTURE_CONVENTION_BINDINGS,
})
const conventions = [...campaignConventions, ...standaloneConventions, ...listStaticConventions()]
```

## Static vs resolved conventions

| API                              | Package      | Role                                                                        |
| -------------------------------- | ------------ | --------------------------------------------------------------------------- |
| `CULTURE_CONVENTION_BINDINGS`    | data         | Slim definitions keyed by culture id                                        |
| `listStaticConventions()`        | data         | Unmigrated full conventions (`faction-general`, `draconic-dragon-personal`) |
| `resolveCampaignConventions()`   | integrations | Species catalog → conventions                                               |
| `resolveStandaloneConventions()` | integrations | Standalone cultures (e.g. akan) → conventions                               |

Do not add a `listConventions()` that silently merges static and resolved output.

## Adding a culture-bound convention

1. Add `src/definitions/<culture>/<key>.ts` as a `NamingConventionDefinition`.
2. Register definition objects in `definitions/culture-bindings.ts`.
3. Remove the legacy full convention from `conventions/manifest.ts` once parity tests pass.

Preserve explicit `id`, `label`, and `description` when they differ from generated defaults.

## Adding a static (exceptional) convention

1. Add `src/conventions/<id>.ts` with full `NamingConvention` shape.
2. Register in `conventions/manifest.ts` only when the convention is not culture-bound.

## Commands

```bash
pnpm --filter @rpg/name-generator-data test
pnpm --filter @rpg/name-generator-data typecheck
pnpm --filter @rpg/name-generator-data lint
```
