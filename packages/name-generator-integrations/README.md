# @rpg/name-generator-integrations

Species-agnostic integration layer that resolves slim naming definitions and
campaign species catalog entries into full `NamingConvention` objects.

## Dependency graph

```text
contracts
  ↑
core

contracts
  ↑
data

contracts + core + data
  ↑
integrations  ← this package

integrations
  ↑
dashboard
```

Core and data must not import this package.

## Public API

| Export                          | Role                                                  |
| ------------------------------- | ----------------------------------------------------- |
| `buildNamingCultureContext`     | Species → `NamingCultureContext`                      |
| `resolveSpeciesCultureContexts` | Species + heritage cultures → one context per culture |
| `resolveNamingConvention`       | Definition + context → `NamingConvention`             |
| `resolveCampaignConventions`    | Campaign species + bindings → conventions             |
| `resolveStandaloneConventions`  | `STANDALONE_NAMING_CULTURES` + bindings → conventions |
| `buildSpeciesNamingOptions`     | Derived UI view model for species filter              |

## Convention composition

Dashboard (and tests) compose explicitly — there is no single merged list function:

```ts
const campaignConventions = resolveCampaignConventions({
  species,
  bindings: CULTURE_CONVENTION_BINDINGS,
  heritageCultures: HERITAGE_NAMING_CULTURES,
})
const standaloneConventions = resolveStandaloneConventions({
  cultures: STANDALONE_NAMING_CULTURES,
  bindings: CULTURE_CONVENTION_BINDINGS,
})
const conventions = [...campaignConventions, ...standaloneConventions, ...listStaticConventions()]
```

## Association deduplication

`resolveNamingConvention` injects primary culture and language associations from
context, then merges explicit definition associations by semantic key:

| Key                     | Example           |
| ----------------------- | ----------------- |
| `culture:{cultureId}`   | `culture:elven`   |
| `language:{languageId}` | `language:elvish` |

When strengths conflict, the higher rank wins: `primary` > `secondary` > `influenced`.

## Heritage cultures

`resolveCampaignConventions` resolves one culture context per species plus one
per matching `HERITAGE_NAMING_CULTURES` row (matched on species slug and the
heritage option ids present on the campaign species), so lineages such as
`elven-drow` get their own conventions with their own language associations.
`buildSpeciesNamingOptions` reports the naming-relevant heritages — each with the
culture id it routes to — for the dashboard heritage filter.

## Commands

```bash
pnpm --filter @rpg/name-generator-integrations test
pnpm --filter @rpg/name-generator-integrations typecheck
pnpm --filter @rpg/name-generator-integrations lint
```
